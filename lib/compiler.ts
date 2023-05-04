import path from "node:path";
import { logger } from "./logger";
import { __dirname, execute } from "./utils";
import * as fs from 'fs-extra';


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

interface CompileResults {
    killed: boolean;
    stderr: string;
    stdout: string;
    tmpName: string;
    executionTime: number;
    compiledSuccessfully: boolean;
};

export async function compile(source: string, outputPath?: string) : Promise<CompileResults>
{

    let results: CompileResults = {
        killed: false,
        stderr: '',
        stdout: '',
        tmpName: '',
        executionTime: 0,
        compiledSuccessfully: false
    };

    // check if the source contains attempts at hacking
    let check = checkSource(source);

    if(check)
    {
        results.stderr = check;
        return results;
    }

    let tempPath: string = '';

    if(outputPath !== undefined)
    {
        tempPath = outputPath;
        fs.mkdirSync(tempPath);
    }
    else
    {
        tempPath = fs.mkdtempSync(path.join(__dirname, 'tmp', './'))
    }

    const sourcePath   = path.join(tempPath, 'pgetinker.cpp');
    const jsPath       = path.join(tempPath, 'pgetinker.js');
    const wasmPath     = path.join(tempPath, 'pgetinker.wasm');

    fs.writeFileSync(sourcePath, source);

    const start: number = new Date().getTime();

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

    try
    {
        results = {...results, ...await execute(command, { timeout: 10000 })};
    }
    catch(error)
    {
        results = {...results, ...error};
    }

    let end : number = new Date().getTime();

    let executionTime = end - start;

    let compiledSuccessfully: boolean = (fs.existsSync(jsPath) && fs.existsSync(wasmPath));

    results = {...results, executionTime, compiledSuccessfully};

    // filter results
    ["stderr", "stdout"].forEach((key) =>
    {
        results[key] = results[key].replaceAll(tempPath, "");
        results[key] = results[key].replaceAll(__dirname, "");
        results[key] = results[key].replaceAll("/third_party", "");
    });

    return results;
}
