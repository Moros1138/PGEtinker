import { __dirname, execute, fileExists, writeSourceFile } from "./utils";

export async function compile(source: string, options?: any) : Promise<any>
{
    let { tmpName } = await writeSourceFile(source);

    const start: number = new Date().getTime();

    const command = [
        'em++',
        '-O1',
        `${tmpName}.cpp`,
        // `${__dirname}/cpp/olcPixelGameEngine.cpp.o`,
        // `${__dirname}/cpp/olcSoundWaveEngine.cpp.o`,
        `-o ${tmpName}.js`,
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

    let results = {
        killed: false,
        stderr: null,
        stdout: null,
        tmpName: null,
        executionTime: 0,
        compiledSuccessfully: false
    };

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

    let compiledSuccessfully: boolean = (fileExists(`${tmpName}.js`) && fileExists(`${tmpName}.wasm`));

    results = {...results, tmpName, executionTime, compiledSuccessfully};

    // TODO: filter results

    return results;
}



