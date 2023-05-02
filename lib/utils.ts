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

/**
 * creates a temporary directory and returns the full path
 * @returns string
 */
export const createTemporaryDirectory = () : string =>
{
    const tempObject = tmp.dirSync({
        mode: 0o750,
        template: 'XXXXXX',
        tmpdir: path.resolve(__dirname, 'tmp'),
    });

    return tempObject.name;
};

export const readFile  = (filePath: string) : string =>
{
    return fs.readFileSync(filePath).toString();
};

export const writeFile = (filePath: string, data: string) =>
{
    fs.writeFileSync(filePath, data, { mode: 0o644 });
};

export const writeSourceFile = (text: string) : Promise<any> =>
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            const tmpName = `${createTemporaryDirectory()}/pgetinker`;

            writeFile(`${tmpName}.cpp`, text);

            resolve({ tmpName });

        }
        catch(e)
        {
            reject(e);
        }
    });
}
