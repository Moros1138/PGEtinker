import { createServer as createViteServer } from 'vite'
import express, { Request, Response } from 'express';

import morgan from 'morgan';

import * as fs from "fs-extra";
import path from "node:path";

import app from './app';
import { config } from '../config';

let manifest: any | null = null;

let head: string[] = [];
let body: string[] = [];

app.use(morgan('dev'));

if(config.mode === "development")
{
    const vite = await createViteServer({
        mode: "development",
        server: {
            middlewareMode: true,
        },
        appType: "custom",
    });

    app.use(vite.middlewares)

    head.push('<script type="module" src="/@vite/client"></script>');
    body.push('<script type="module" src="/src/frontend/jquery.js"></script>');
    body.push('<script type="module" src="/src/frontend/index.ts"></script>');
}

if(config.mode === "production")
{
    app.use(express.static(path.resolve("./", "dist")));

    manifest = fs.readJSONSync("./dist/manifest.json");

    head.push(`<link rel="stylesheet" href="/${manifest["src/frontend/index.ts"].css}">`);

    body.push(`<script type="module" src="/${manifest["src/frontend/jquery.js"].file}"></script>`);
    body.push(`<script type="module" src="/${manifest["src/frontend/index.ts"].file}"></script>`);

    manifest["src/frontend/index.ts"].dynamicImports.forEach((item: any) =>
    {
        body.push(`<script type="module" src="/${manifest[item].file}></script>`);
    });
}

app.set("views", "./views");

app.set("view engine", "hbs");

app.get("/player/:id?", (req: Request, res: Response) => {

    if(!req.params.id)
    {
        res.render("player-intro", {
            env: {
                APP_URL: config.appUrl,
            },
        });

        return;
    }

    res.render("player", {
        pgetinker: `/data/${req.params.id}/pgetinker.js`,
        env: {
            APP_URL: config.appUrl,
        },
    });
});

app.get("/embed/:id", (_req: Request, res: Response) =>
{
    res.render("index", {
        title: "PGEtinker",
        head: head.join("\n"),
        body: body.join("\n"),
        env: {
            APP_URL: config.appUrl,
        },
    });
});

app.get("/s/:id", (_req: Request, res: Response) =>
{
    res.render("index", {
        title: "PGEtinker",
        head: head.join("\n"),
        body: body.join("\n"),
        env: {
            APP_URL: config.appUrl,
        },
    });
});

app.get("/", (_req: Request, res: Response) =>
{
    res.render("index", {
        title: "PGEtinker",
        head: head.join("\n"),
        body: body.join("\n"),
        env: {
            APP_URL: config.appUrl,
        },
    });
});

let server = app.listen(config.port, () =>
{
    console.log(`${config.appUrl} - in ${config.mode} mode.`);
});

process.on("SIGINT", () =>
{
    server.close();
    process.exit(0);
});
