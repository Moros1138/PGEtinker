import { expect, test } from "vitest";
import { compile } from "../lib/compiler";
import { __dirname, execute } from "../lib/utils";
import * as fs from 'fs-extra';
import path from "node:path";

test("emscripten is installed in the current environment", async () =>
{
    const result = await execute('emcc -v');

    expect(result).toHaveProperty('stdout');
    expect(result).toHaveProperty('stderr');

    expect(result.stderr).toMatch(/Emscripten/i);
});

test("compile \"Hello, World\" C source file", async () =>
{
    const result = await compile('#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n');

    expect(result.compiledSuccessfully).toBe(true);
});

test("compile olcExampleProgram.cpp", async () =>
{
    // read olcExampleProgram.cpp
    let source = fs.readFileSync(path.resolve(__dirname, 'third_party', 'olcPixelGameEngine', 'olcExampleProgram.cpp'));

    const result = await compile(source.toString());

    expect(result.compiledSuccessfully).toBe(true);
}, 10000);

test("compile \"Hello, World\" C source file with hacking include attempt", async () =>
{
    const result = await compile('#include <stdio.h>\n#include "/etc/hostname"\n#include "/etc/passwd"\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n');
    expect(result.stderr).toMatch(/no absolute or relative includes please/);
});
