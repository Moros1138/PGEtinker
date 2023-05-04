import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { __dirname, getHash } from "../lib/utils";
import * as fs from 'fs-extra';
import path from "node:path";
import { StorageLocal } from "../lib/storage/local";

var storage: StorageLocal;
let storagePath: string = path.resolve("./tests", "data");

// we create unique entires to be used for each test to avoid
// filesystem issues.
const TestItem = (code: string) : any =>
{
    return {
        id: getHash(code),
        item: {
            code: code,
            jsPath: '',
            wasmPath: '',
            screenPath: '',
            viewCounter: 0,
        }
    };
};

beforeAll(() =>
{
    storage = new StorageLocal(storagePath);
});

afterAll(() =>
{
    fs.rmSync(storagePath, { recursive: true, force: true} as any);
});

describe("Storage Tests", () =>
{
    it("data directory exists", () =>
    {
        const dataDirectoryExists: boolean = fs.existsSync(storagePath);

        expect(dataDirectoryExists).toBe(true);
    });

    it("stores an item", async () =>
    {
        const { id, item } = TestItem("stores an item");

        const returnedItem = await storage.storeItem(item);

        expect(item).toStrictEqual(returnedItem);
    });

    it("gets an item", async () =>
    {
        const { id, item } = TestItem("gets an item");

        await storage.storeItem(item);

        const returnedItem = await storage.getItem(id);

        expect(item).toStrictEqual(returnedItem);
    });

    it("increments view counter", async () =>
    {
        const { id, item } = TestItem("increments view counter");
        await storage.storeItem(item);

        for(let i = 0; i < 20; i++)
            await storage.incrementViewCounter(id);

        const returnedItem = await storage.getItem(id);

        expect(returnedItem.viewCounter).toBe(20);
    });
});

