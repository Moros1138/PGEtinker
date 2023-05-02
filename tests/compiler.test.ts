import { describe, expect, it } from "vitest";
import { compile } from "../lib/compiler";
import { __dirname, execute, readFile, writeSourceFile } from "../lib/utils";
import path from "path";

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

    it('compile "Hello, World" C source file', async () =>
    {
        const result = await compile('#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n');

        expect(result.compiledSuccessfully).toBe(true);
    });

    it('compile olcExampleProgram.cpp', async () =>
    {
        // read olcExampleProgram.cpp
        let source: string = readFile(path.resolve(__dirname, 'third_party', 'olcPixelGameEngine', 'olcExampleProgram.cpp'));

        const result = await compile(source);

        expect(result.compiledSuccessfully).toBe(true);
    }, 10000);
});
