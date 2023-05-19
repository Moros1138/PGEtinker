import { afterAll, beforeAll, test, expect } from "vitest";
import express, { Request, Response } from "express";
import { screenshot } from "../src/backend/app";
import path from "node:path";
import * as fs from 'fs-extra';

// to share the server betwwen the beforeAll and afterAll hooks

test('screenshot - expects an absolute filePath', async () =>
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

test('screenshot - takes a screenshot', async () =>
{
    const filePath = path.resolve("./tests", "screen.png");
    await screenshot("http://localhost:3000", 5000, filePath);

    expect(fs.existsSync(filePath)).toBe(true);

    fs.rmSync(filePath);
}, 10000);
