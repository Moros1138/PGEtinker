import { createServer as createViteServer } from 'vite'
import express from 'express';
import morgan from 'morgan';
import path from "node:path";
import app from './app';
import { config } from '../config';

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
}

if(config.mode === "production")
{
    app.use(express.static(path.resolve("./", "dist")));
}

let server = app.listen(config.port, () =>
{
    console.log(`${config.appUrl} - in ${config.mode} mode.`);
});

process.on("SIGINT", () =>
{
    server.close();
    process.exit(0);
});
