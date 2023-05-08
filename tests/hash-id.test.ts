import Hashids from "hashids";
import { expect, test } from "vitest";

test("hashids", () =>
{
    let hashids = new Hashids("");

    for(let i = 0; i < 1000; i++)
    {
        let hash = hashids.encode(i);
        expect(hashids.decode(hash)[0]).toBe(i);
    }
    
});

test("hashids with padding", () =>
{
    let hashids = new Hashids("", 11);

    for(let i = 0; i < 1000; i++)
    {
        let hash = hashids.encode(i);
        expect(hashids.decode(hash)[0]).toBe(i);
    }
});

test("hashids with secret", () =>
{
    let hashids = new Hashids("asecret");

    for(let i = 0; i < 1000; i++)
    {
        let hash = hashids.encode(i);
        expect(hashids.decode(hash)[0]).toBe(i);
    }
});

test("hashids with secret and padding", () =>
{
    let hashids = new Hashids("asecret", 11);

    for(let i = 0; i < 1000; i++)
    {
        let hash = hashids.encode(i);
        expect(hashids.decode(hash)[0]).toBe(i);
    }
});
