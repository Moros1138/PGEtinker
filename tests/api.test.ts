import { describe, it } from "vitest";
import supertest from "supertest";
import { app } from "../lib/expressApp";

describe("PGEtinker API", () =>
{
    it("GET /api/default-code - gets default code", async () =>
    {
        await supertest(app).get("/api/default-code")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(/OLC_PGE_APPLICATION/i)
            .expect(200);
    });

    it.todo("compiles a test program");
    it("GET /api/monaco-model/olcPixelGameEngine.h - gets header files for monaco model", async () =>
    {
        await supertest(app).get("/api/monaco-model/olcPixelGameEngine.h")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(/olcPixelGameEngine.h/i)
            .expect(/OLC_PGE_APPLICATION/i)
            .expect(200);
    });

    it("GET /api/monaco-model/totally-does-not-exist - responds 404", async () =>
    {
        let result = await supertest(app).get("/api/monaco-model/totally-does-not-exist")
            .expect(404);
    });

    it.todo("shares a test program");
});
