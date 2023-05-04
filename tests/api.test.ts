import { test } from "vitest";
import supertest from "supertest";
import { app } from "../lib/expressApp";

test("GET /api/default-code - gets default code", async () =>
{
    await supertest(app).get("/api/default-code")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(/OLC_PGE_APPLICATION/i)
        .expect(200);
});

test("GET /api/monaco-model/olcPixelGameEngine.h - gets header files for monaco model", async () =>
{
    await supertest(app).get("/api/monaco-model/olcPixelGameEngine.h")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(/olcPixelGameEngine.h/i)
        .expect(/OLC_PGE_APPLICATION/i)
        .expect(200);
});

test("GET /api/monaco-model/totally-does-not-exist - responds 404", async () =>
{
    await supertest(app).get("/api/monaco-model/totally-does-not-exist")
        .expect(404);
});

test("POST /api/compile - hello world, no errors", async () =>
{
    await supertest(app)
        .post("/api/compile")
        .send({code: '#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n'})
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect((res) =>
        {
            if(res.body.stdout !== "") throw new Error("stdout should be empty");
            if(res.body.stderr !== "") throw new Error("stderr should be empty");
            if(res.body.compiledSuccessfully !== true) throw new Error("compilation failed");
        })
        .expect(200);
});

test("POST /api/compile - hello world, with errors", async () =>
{
    await supertest(app)
        .post("/api/compile")
        .send({code: '#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprinf("Hello, World\\n");\nreturn 0;\n}\n'})
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect((res) =>
        {
            if(res.body.stdout !== "") throw new Error("stdout should be empty");
            if(res.body.stderr === "") throw new Error("stderr should NOT be empty");
            if(res.body.compiledSuccessfully === true) throw new Error("compilation should have failed");
        })
        .expect(200);
});

test.todo("shares a test program");
