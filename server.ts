import { createServer as createViteServer, resolveConfig } from 'vite'
import express, { NextFunction, Request, Response } from 'express';

import morgan from 'morgan';

import * as fs from "fs-extra";
import path from "node:path";

import app from './lib/expressApp';
import { __dirname } from './lib/utils';

const mode = process.env.NODE_ENV || "production";
const port = parseInt(process.env.PORT || "3000");

let manifest: any = null;

let head: string[] = [];
let body: string[] = [];

app.use(morgan('dev'));

if(mode === "development")
{
    const vite = await createViteServer({
        mode: mode,
        server: {
            middlewareMode: true,
        },
        appType: "custom",
    });

    app.use(vite.middlewares)

    head.push('<script type="module" src="@vite/client"></script>');
    body.push('<script type="module" src="./src/jquery.js"></script>');
    body.push('<script type="module" src="./src/main.ts"></script>');
}

if(mode === "production")
{
    app.use(express.static(path.resolve("./", "dist")));

    manifest = fs.readJSONSync("./dist/manifest.json");

    head.push(`<link rel="stylesheet" href="${manifest["src/main.ts"].css}">`);

    body.push(`<script type="module" src="${manifest["src/jquery.js"].file})"></script>`);
    body.push(`<script type="module" src="${manifest["src/main.ts"].file})"></script>`);

    manifest["src/main.ts"].dynamicImports.forEach((item) =>
    {
        body.push(`<script type="module" src="${manifest[item].file}></script>`);
    });
}

app.set("views", "./views");

app.set("view engine", "hbs");

app.get("/player/:id?", (req: Request, res: Response) => {

    if(!req.params.id)
    {
        res.render("player-intro", {
            env: {
                APP_URL: "http://localhost:3000",
            },
        });

        return;
    }

    res.render("player", {
        slug: req.params.id,
        env: {
            APP_URL: "http://localhost:3000",
        },
    });
});

app.get("/", (req: Request, res: Response) =>
{
    res.render("index", {
        title: "PGEtinker",
        head: head.join("\n"),
        body: body.join("\n"),
        env: {
            APP_URL: "http://localhost:3000",
        },
    });
});

app.listen(port, () =>
{
    console.log(`http://localhost:${port} - in ${mode} mode.`);
});
