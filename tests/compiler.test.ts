import { afterAll, expect, test } from "vitest";
import { compile } from "../lib/compiler";
import { exec } from "node:child_process";
import { __dirname } from "../lib/utils";
import * as fs from 'fs-extra';
import path from "node:path";

// set our temp path in our tests directory
const tempPath = path.resolve("./", "tests", "tmp");

// clean up after the tests have completed
afterAll(() => { fs.rmdirSync(tempPath, {force: true, recursive: true} as any); });

// example (Hello, World), no errors
const workingSource    = '#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n';

// example (Hello, World), with broken printf call
const brokenSource     = '#include <stdio.h>\nint main(int argc, char* argv[])\n{\nprinf("Hello, World\\n");\nreturn 0;\n}\n';

// example (olcExampleProgram), no errors
const pgeExampleSource = fs.readFileSync(path.resolve(__dirname, 'third_party', 'olcPixelGameEngine', 'olcExampleProgram.cpp')).toString('utf8');

// example (Hello, World), with hacky #include directives
const hackSource       = '#include <stdio.h>\n#include "/etc/hostname"\n#include "/etc/passwd"\nint main(int argc, char* argv[])\n{\nprintf("Hello, World\\n");\nreturn 0;\n}\n';

test("emscripten is installed in the current environment", async () =>
{
    let results: any = await new Promise((resolve, reject) =>
    {
        exec("emcc -v", { timeout: 10000 }, (error, stdout, stderr) =>
        {
            const killed: boolean = (error?.killed) ? true : false;
            resolve({ stdout, stderr, killed });
        });
    });

    expect(results.stderr).toMatch(/Emscripten/i);
});


test("success: example (Hello, World), no errors", async () =>
{
    const result = await compile(workingSource, path.join(tempPath, "hello1"));
    expect(result.success).toBe(true);
});

test("fail: example (Hello, World), with broken printf call", async () =>
{
    const result = await compile(brokenSource, path.join(tempPath, "hello2"));
    expect(result.success).toBe(false);
});

test("success: example (olcExampleProgram), no errors", async () =>
{
    const results = await compile(pgeExampleSource, path.join(tempPath, 'pge1'));
    expect(results.success).toBe(true);
}, 10000);

test("fail: example (Hello, World), with hacky #include directives", async () =>
{
    const result = await compile(hackSource, path.join(tempPath, "hack1"));
    expect(result.stderr).toMatch(/no absolute or relative includes please/);
});
