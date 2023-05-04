import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { __dirname, getHash } from "../lib/utils";
import * as fs from 'fs-extra';
import path from "node:path";
import { StorageLocal } from "../lib/storage/local";

var storage: StorageLocal;
let storagePath: string = path.resolve("./tests", "data");

const testItem = {
    code: `this is a code file`,
    jsPath: '',
    wasmPath: '',
    screenPath: '',
    viewCounter: 0,
};

const testId = getHash(testItem.code);

describe("Storage Tests", () =>
{
    describe("StorageLocal", () =>
    {
        beforeEach(() =>
        {
            storage = new StorageLocal(storagePath);
        });

        afterEach(() =>
        {
            fs.rmSync(storagePath, { recursive: true, force: true} as any);
        });

        it("data directory exists", () =>
        {
            const dataDirectoryExists: boolean = fs.existsSync(storagePath);
            expect(dataDirectoryExists).toBe(true);
        });

        it("stores an item", async () =>
        {
            const returnedItem = await storage.storeItem(testItem);
            expect(testItem).toStrictEqual(returnedItem);

        });

        it("gets an item", async () =>
        {
            await storage.storeItem(testItem);
            const returnedItem = await storage.getItem(testId);
            expect(testItem).toStrictEqual(returnedItem);
        });

        it("increments view counter", async () =>
        {
            await storage.storeItem(testItem);

            for(let i = 0; i < 20; i++)
                await storage.incrementViewCounter(testId);

            const returnedItem = await storage.getItem(testId);

            expect(returnedItem.viewCounter).toBe(20);
        });
    });
});

