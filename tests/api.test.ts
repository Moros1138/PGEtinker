import { afterAll, beforeAll, expect, test } from "vitest";
import supertest from "supertest";
import { app } from "../lib/expressApp";
import * as fs from "fs-extra";
import path from "node:path";

// example (Hello, World), no errors
const workingSource    = '#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n';

// example (Hello, World), with broken printf call
const brokenSource     = '#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprinf("Hello, World\\n");\nreturn 0;\n}\n';

let server: any;

test("success: gets default code", async () =>
{
    await supertest(app).get("/api/default-code")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(/OLC_PGE_APPLICATION/i)
        .expect(200);
});

test("success: gets header files for monaco model", async () =>
{
    await supertest(app).get("/api/monaco-model/olcPixelGameEngine.h")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(/olcPixelGameEngine.h/i)
        .expect(/OLC_PGE_APPLICATION/i)
        .expect(200);
});

test("fail: gets header file that does not exist", async () =>
{
    await supertest(app).get("/api/monaco-model/totally-does-not-exist")
        .expect(404);
});

test("success: example (Hello, World), no errors", async () =>
{
    await supertest(app)
        .post("/api/compile")
        .send({code: workingSource})
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect((res) =>
        {
            if(res.body.stdout !== "") throw new Error("stdout should be empty");
            if(res.body.stderr !== "") throw new Error("stderr should be empty");
            if(res.body.success !== true) throw new Error("compilation failed");
        })
        .expect(200);
});

test("fail: example (Hello, World), with broken printf call", async () =>
{
    await supertest(app)
        .post("/api/compile")
        .send({code: brokenSource})
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect((res) =>
        {
            if(res.body.stdout !== "") throw new Error("stdout should be empty");
            if(res.body.stderr === "") throw new Error("stderr should NOT be empty");
            if(res.body.success === true) throw new Error("compilation should have failed");
        })
        .expect(200);
});

test("success: shares a test program", async () =>
{
    let slug: string = '';

    await supertest(app)
        .post("/api/share")
        .send({code: workingSource})
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect((res) =>
        {
            let failed: string[] = [];

            if(res.body.success !== true)
                failed.push("share should have succeeded");

            if(res.body.message !== "")
                failed.push("message should have been empty");

            if(res.body.slug    === "")
                failed.push("slug should not be empty");

            if(res.body["share_url"] === "")
                failed.push("share url should not be empty");

            if(res.body["embed_url"] === "")
                failed.push("embed url should not be empty");

            if(res.body["image_url"] === "")
                failed.push("image url should not be empty");

            if(failed.length > 0) throw new Error(failed.join("\n"));

            slug = res.body.slug;
        })
        .expect(200);

    expect(fs.existsSync(path.resolve("./", "data", slug, "screen.png"))).toBe(true);

    // cleanup
    fs.rmSync(path.resolve("./", "lib", "storage", "data", slug));
    fs.rmdirSync(path.resolve("./", "data", slug), { force: true, recursive: true } as any);

}, 10000);
