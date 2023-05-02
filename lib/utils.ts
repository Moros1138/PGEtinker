import { exec } from 'child_process';
import * as fs from 'node:fs';
import path from 'path';
import tmp from 'tmp';

export const __dirname: string = process.env.INIT_CWD as string;

export const fileExists = fs.existsSync;

export const execute = (command: string, options: any = {}) : Promise<any> =>
{
    // i solemnly swear that i am up to no good, promise!
    return new Promise((resolve, reject) =>
    {
        try
        {
            // stop making excuses and execute
            exec(command, options, (error, stdout, stderr) =>
            {
                // reject if killed
                if(error?.killed)
                {
                    reject({ killed: true });
                    return;
                }

                // resolve results
                resolve({stdout: stdout, stderr: stderr});
            });
        }
        catch(e)
        {
            reject(e);
        }
    });
}

export const readFile  = (filePath: string) : string =>
{
    return fs.readFileSync(filePath).toString();
}

export const writeFile = (filePath: string, data: string) : undefined =>
{
    fs.writeFileSync(filePath, data, { mode: 0o644 });
}

export const writeSourceFile = (text: string) : Promise<any> =>
{
    return new Promise((resolve, reject) =>
    {

        // transform the source code
        // text = text.split('\n').filter((item) =>
        // {
        //     if(item.includes('#define'))
        //     {
        //         if(item.includes('OLC_PGE_APPLICATION'))
        //             return false;

        //         if(item.includes('OLC_SOUNDWAVE IMPLEMENTATION'))
        //             return false;
        //     }

        //     return true;
        // }).join('\n');

        // create temporary directory
        try {

            // create a temporary directory
            const tmpObject = tmp.dirSync({
                mode: 0o750,
                template: 'XXXXXX',
                tmpdir: path.resolve(__dirname, 'tmp'),
            });

            // console.log(tmpObject);

            const tmpName = `${tmpObject.name}/pgetinker`;

            writeFile(`${tmpName}.cpp`, text);

            resolve({ tmpObject, tmpName });

        } catch(e) {
            reject(e);
        }
    });
}
