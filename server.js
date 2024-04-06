import fs from "node:fs/promises";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { createHash } from "node:crypto";
import { Sequelize, Model, DataTypes } from "sequelize";
import { Compile, GenerateSlug } from "./src/server/lib/utils.js";
import { join } from "node:path";
import { Code, SetupCodeDatabase } from "./src/server/lib/Code.js";
import { readFileSync } from "node:fs";

// load configuration from .env files
dotenv.config();

// constants

/** @type {string} - the path to the sqlite database file */
const sqliteDatabaseFile = process.env.SQLITE_DBFILE || join(process.cwd(), "cache", "data", "database.sqlite");

/** @type {boolean} - are we in production mode or not */
const isProduction = process.env.NODE_ENV === "production";

/** @type {number} - port the server will listen on */
const port         = process.env.PORT || 5173;

/** @type {string} - the base URL for this application */
const base         = process.env.BASE || "/";

/** @type {string} - the template string used for rendering the final HTML */
const templateHtml = isProduction
    ? await fs.readFile("./dist/client/index.html", "utf-8")
    : "";

/** @type {string} - the manifest file containing the pre-built server-side renderings */
const ssrManifest = isProduction
    ? await fs.readFile("./dist/client/.vite/ssr-manifest.json", "utf-8")
    : undefined;

/** @type {Express} - the express app */
const app = express();

app.set("trust proxy", true);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteDatabaseFile,
    logging: false
});

try
{
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
}
catch (error)
{
    console.error('Unable to connect to the database:', error);
}

SetupCodeDatabase(sequelize);

/** @type {import("vite").ViteDevServer | undefined} - the instance of the vite development server, if not in production */
let vite;

if(!isProduction)
{
    const { createServer } = await import("vite");
    
    vite = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        base
    });
    
    app.use(vite.middlewares);
}
else
{
    const compression = (await import("compression")).default;
    const sirv        = (await import("sirv")).default;

    app.use(compression());
    app.use(base, sirv("./dist/client", { extensions: [] }));
}

app.use(morgan("tiny"));
app.use("/api", express.json());

app.post("/api/compile", (request, response) =>
{
    // bail out if we haven't been provided some code to process
    if(typeof request.body.code === "undefined")
    {
        response.status(400)
                .send({
                    message: "missing required parameters"
                });
        return;
    }
    
    Compile(request.body.code)
        .then((result) =>
        {
            response.status(result.code)
                    .send(result);
        })
        .catch((error) =>
        {
            response.status(error.code)
                    .send(error);
        });
});

app.get("/api/code/:codeSlug", (request, response) =>
{
    if(typeof request.params.codeSlug === "undefined")
    {
        response.status(400)
                .send({
                    status: 400,
                    message: "missing required parameters"
                });
        return;
    }
    
    (async() =>
    {
        const code = await Code.findOne({ where: { slug: request.params.codeSlug }});
        if(code === null)
        {
            response.status(404)
                    .send({
                        status: 404,
                        message: "not found"
                    });
            return;
        }

        response.status(200)
                .send({
                    status: 200,
                    code: code.code
                });
    })();
});

app.post("/api/code", (request, response) =>
{
    // bail out if we haven't been provided some code to process
    if(typeof request.body.code === "undefined")
    {
        response.status(400)
                .send({
                    message: "missing required parameters"
                });
        return;
    }
    
    const hash = createHash("sha256");

    hash.update(request.body.code);
    
    let hashedCode = hash.digest("hex");

    Compile(request.body.code)
        .then((result) =>
        {
            // successfully compiled, let's store the code
            (async() =>
            {
                const [code, created] = await Code.findOrCreate({
                    where: {
                        hashedCode,
                    },
                    defaults: {
                        code: request.body.code,
                        slug: "==not-set==",
                    }
                });
                    
                if(code.slug === "==not-set==")
                {
                    let keepTrying = true;
                    while(keepTrying)
                    {
                        const slug = GenerateSlug();
                        const slugFinder = await Code.findOne({ where: { slug }});
                        if(slugFinder === null)
                        {
                            keepTrying = false;
                            code.slug = slug;
                            code.save();
                        }
                    }
                }
                
                response.status(200)
                        .send({
                            shareURL: `${request.protocol}://${request.headers.host}/s/${code.slug}}`,
                            html: result.html,
                        });
            
            })();
        })
        .catch((error) =>
        {
            response.status(error.code)
                    .send(error);
        });
});

app.get("/goldenlayout-base.css", (request, response) =>
{
    const goldenLayoutBase = readFileSync("node_modules/golden-layout/src/css/goldenlayout-base.css");
    response.status(200).set({"Content-type": "text/css"}).send(goldenLayoutBase);
});

app.get("/goldenlayout-dark.css", async(request, response) =>
{
    const goldenLayoutTheme = readFileSync("node_modules/golden-layout/src/css/goldenlayout-dark-theme.css");
    response.status(200).set({"Content-type": "text/css"}).send(goldenLayoutTheme);
});

app.get("/goldenlayout-light.css", async(request, response) =>
{
    const goldenLayoutTheme = readFileSync("node_modules/golden-layout/src/css/goldenlayout-light-theme.css");
    response.status(200).set({"Content-type": "text/css"}).send(goldenLayoutTheme);
});

app.use("*", async(request, response) =>
{
    try
    {
        /** @type {string} - url, stripped of the base, for uses in path matching */
        const url = request.originalUrl.replace(base, '');
        
        /** @type {string | undefined} - the text template used by the rendering function */
        let template;
        /** @type {function | undefined} - placeholder for the rendering function */
        let render;

        if(!isProduction)
        {
            // in development, always load a fresh copy of the html template.
            template = await fs.readFile("./index.html", "utf-8");
            template = await vite.transformIndexHtml(url, template);
            render = (await vite.ssrLoadModule("/src/server/index.js")).render;
        }
        else
        {
            // in production, always use the cached copy of the html template.
            template = templateHtml;
            render = (await import("./dist/server/index.js")).render;
        }

        const shareSlug = (url.indexOf("s/") === 0) ? url.replace("s/", "") : null;
        let    slugCode = "";

        if(shareSlug)
        {
            const code = await Code.findOne({ where: { slug: shareSlug }});

            if(code === null)
            {
                response.redirect("/");
                return;
            }

            slugCode  = '<script id="slug-code">let slugCode = String.raw`';
            slugCode += String.raw`${code.code}`;
            slugCode += '`;</script>';
        }

        // do the actual rendering
        const rendered = await render(url, ssrManifest);
        
        // apply the rendering to the template
        const html = template
            .replace(`<!--app-head-->`, rendered.head ?? "")
            .replace(`<!--app-html-->`, rendered.html ?? "")
            .replace(`<!--slug-code-->`, slugCode);
        
        // I got something to say. it's better to burn out than fade away!
        response.status(200).set({"Content-Type": "text/html"}).send(html);
    }
    catch(e)
    {
        if(typeof vite !== "undefined")
            vite.ssrFixStacktrace(e);

        console.log(e.stack);
        response.status(500).end(e.stack);
    }
});

app.listen(port, () =>
{
    console.log(`Server started at http://localhost:${port}`);
});
