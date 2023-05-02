import express, { Express, Request, Response } from 'express';
import { __dirname, readFile } from './utils';
import path from 'path';

export const app : Express = express();

app.use(express.json());

{
});

app.get("/api/default-code", (_: Request, res: Response) =>
{
    let defaultCode = readFile(path.resolve(__dirname, "examples", "default.cpp"));
    res.status(200).json({code: defaultCode});
});

export default app;
