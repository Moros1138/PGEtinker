import express, { Express, Request, Response } from 'express';

export const app : Express = express();

app.use(express.json());

app.get("/api/hello", (_: Request, res: Response) => res.json({ hello: "world" }));
// app.get("/api/does-not-exist", (_: Request, res: Response) => res.json({ hello: "world" }));

export default app;
