import { describe, expect, it } from "vitest";
import { __dirname, execute, readFile, writeSourceFile } from "../lib/utils";
describe('Compiler and Support Functions', () =>
{
    it('writeSourceFile creates temporary folder', async () =>
    {
        const result = await writeSourceFile('some source');

        expect(result).toHaveProperty('tmpObject');
        expect(result).toHaveProperty('tmpName');

        expect(result.tmpObject).toHaveProperty('name');
        expect(result.tmpObject).toHaveProperty('removeCallback');
    });

    it('emscripten is installed in the current environment', async () =>
    {
        const result = await execute('emcc -v');

        expect(result).toHaveProperty('stdout');
        expect(result).toHaveProperty('stderr');

        expect(result.stderr).toMatch(/Emscripten/i);
    });

});
