import { describe, expect, it } from "vitest";
import { compile } from "../lib/compiler";
import { __dirname, execute, fileExists, readFile, writeSourceFile } from "../lib/utils";
import path from "path";

describe('Compiler and Support Functions', () =>
{
    describe('Support Functions and Emscripten', () =>
    {
        it('writeSourceFile creates temporary folder', async () =>
        {
            const result = await writeSourceFile("some source");
            expect(fileExists(`${result}.cpp`)).toBe(true);
        });

        it("emscripten is installed in the current environment", async () =>
        {
            const result = await execute('emcc -v');

            expect(result).toHaveProperty('stdout');
            expect(result).toHaveProperty('stderr');

            expect(result.stderr).toMatch(/Emscripten/i);
        });
    });

    describe("Compiler Tests", () =>
    {
        it("compile \"Hello, World\" C source file", async () =>
        {
            const result = await compile('#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n');

            expect(result.compiledSuccessfully).toBe(true);
        });

        it("compile olcExampleProgram.cpp", async () =>
        {
            // read olcExampleProgram.cpp
            let source = readFile(path.resolve(__dirname, 'third_party', 'olcPixelGameEngine', 'olcExampleProgram.cpp'));

            const result = await compile(source.toString());

            expect(result.compiledSuccessfully).toBe(true);
        }, 10000);

        it("compile \"Hello, World\" C source file with hacking include attempt", async () =>
        {
            const result = await compile('#include <stdio.h>\n#include "/etc/hostname"\n#include "/etc/passwd"\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n');
            expect(result.stderr).toMatch(/no absolute or relative includes please/);
        });
    });
});
