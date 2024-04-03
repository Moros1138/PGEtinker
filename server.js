import fs from "node:fs/promises";

import express from "express";
import dotenv from "dotenv";
import ApiHandler from "./src/server/lib/ApiHandler.js";

// load configuration from .env files
dotenv.config();

// constants

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

app.use("/api", express.json());

ApiHandler(app);

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

        // do the actual rendering
        const rendered = await render(url, ssrManifest);
        
        // apply the rendering to the template
        const html = template
            .replace(`<!--app-head-->`, rendered.head ?? "")
            .replace(`<!--app-html-->`, rendered.html ?? "");
        
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
