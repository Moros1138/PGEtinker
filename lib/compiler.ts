import path from "node:path";
import { logger } from "./logger";
import { __dirname } from "./utils";
import * as fs from 'fs-extra';
import { exec } from "node:child_process";

function checkSource(source: string) : string | null
{
    const re = /^\s*#\s*i(nclude|mport)(_next)?\s+["<]((\.{1,2}|\/)[^">]*)[">]/;
    const failed: string[] = [];

    let lines: string[] = source.split("\n");
    for(let i = 0; i < lines.length; i++)
    {
        if(re.test(lines[i]))
            failed.push(`<stdin>:${i + 1}:1: no absolute or relative includes please`);
    }

    if (failed.length > 0) return failed.join('\n');
    return null;
}

function prepareCompilerResults(results: any, tempPath: string)
{
    let defaultResults = {
        stdout: '',
        stderr: '',
        killed: false,
        success: false,
        tempPath: '',
    };

    results = {...defaultResults, ...results};

    ["stderr", "stdout"].forEach((key) =>
    {
        results[key] = results[key].replaceAll(tempPath, "");
        results[key] = results[key].replaceAll(__dirname, "");
        results[key] = results[key].replaceAll("/third_party", "");
    });

    return results;
}

export async function compile(source: string, outputPath?: string)
{
    // check the source for hacks and such
    const checkSourceResults = checkSource(source);
    if(checkSourceResults != null)
        return prepareCompilerResults({stderr: checkSourceResults }, '');

    // determine directory
    let tempPath: string = '';

    if(outputPath !== undefined)
    {
        tempPath = outputPath;
        fs.ensureDirSync(tempPath);
    }
    else
    {
        tempPath = fs.mkdtempSync(path.join(__dirname, 'tmp', './'))
    }

    const sourcePath   = path.join(tempPath, 'pgetinker.cpp');
    const jsPath       = path.join(tempPath, 'pgetinker.js');
    const wasmPath     = path.join(tempPath, 'pgetinker.wasm');

    fs.writeFileSync(sourcePath, source);

    const command = [
        'em++',
        '-O1',
        `${sourcePath}`,
        // `${__dirname}/cpp/olcPixelGameEngine.cpp.o`,
        // `${__dirname}/cpp/olcSoundWaveEngine.cpp.o`,
        `-o ${jsPath}`,
        `-I${__dirname}/third_party/olcPixelGameEngine`,
        `-I${__dirname}/third_party/olcPixelGameEngine/extensions`,
        `-I${__dirname}/third_party/olcPixelGameEngine/utilities`,
        `-I${__dirname}/third_party/olcSoundWaveEngine`,
        '-sASYNCIFY',
        '-sALLOW_MEMORY_GROWTH=1',
        '-sMAX_WEBGL_VERSION=2',
        '-sMIN_WEBGL_VERSION=2',
        '-sUSE_LIBPNG=1',
        '-sUSE_SDL_MIXER=2',
        '-sLLD_REPORT_UNDEFINED',
    ].join(' ');

    const start: number = new Date().getTime();

    let results = await new Promise((resolve, reject) =>
    {
        exec(command, { timeout: 10000 }, (error, stdout, stderr) =>
        {
            const killed: boolean = (error?.killed) ? true : false;
            resolve({ stdout, stderr, killed });
        });
    });

    let executionTime = (new Date().getTime()) - start;

    let compileSuccess: boolean = (fs.existsSync(jsPath) && fs.existsSync(wasmPath));

    results = { ...results as any, executionTime, success: compileSuccess, sourcePath, jsPath, wasmPath };

    return prepareCompilerResults(results, tempPath);
}
