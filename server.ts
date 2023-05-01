import { createServer as createViteServer, resolveConfig } from 'vite'
import express from 'express';
import morgan from 'morgan';

import path from 'path';

import app from './lib/expressApp';

const mode = process.env.NODE_ENV;

app.use(morgan('dev'));

if(mode === "production")
{
    const config = await resolveConfig({}, "build");
    const distPath = path.resolve(config.root, config.build.outDir);

    app.use(express.static(distPath));
}

if(mode === "development")
{
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'mpa',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares)
}

const port = parseInt(process.env.PORT || "3000");

app.listen(port, () => {
    console.log(`Server at http://localhost:${port}`)
});
