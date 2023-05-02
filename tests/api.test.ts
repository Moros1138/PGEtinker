import { describe, it } from "vitest";
import supertest from "supertest";
import { app } from "../lib/expressApp";

describe("PGEtinker API", () =>
{
    it("GET /api/default-code - gets default code", async () =>
    {
        await supertest(app).get('/api/default-code')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(/OLC_PGE_APPLICATION/i)
            .expect(200);
    });

    it.todo("compiles a test program");
    it.todo("shares a test program");
    it.todo("gets header files for monaco model");
});
