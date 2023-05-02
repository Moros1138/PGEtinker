import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTemporaryDirectory, fileExists } from "../lib/utils";
import express, { Request, Response } from "express";
import { screenshot } from "../lib/screenshot";
import path from "path";

// to share the server betwwen the beforeAll and afterAll hooks
var server;

beforeAll(() =>
{
    const app = express();
    app.get('/', (req: Request, res: Response) => res.send("Look ma! I'm road kill!"));
    server = app.listen(3000);
});

afterAll(() =>
{
    server.close();
});

describe('Screenshot Function', () =>
{
    it('screenshot - expects an absolute filePath', async () =>
    {
        try
        {
            await screenshot("http://localhost:3000", 5000, 'screen.png');
        }
        catch(err)
        {
            expect(err.message).toBe("filePath must be absolute path");
        }
    }, 10000);

    it('screenshot - takes a screenshot', async () =>
    {
        const tmpDir = createTemporaryDirectory();
        const filePath = path.resolve(tmpDir, "screen.png");
        await screenshot("http://localhost:3000", 5000, filePath);

        expect(fileExists(filePath)).toBe(true);
    }, 10000);

});
