import { exec } from 'child_process';
import * as fs from 'node:fs';
import path from 'path';
import tmp from 'tmp';
import { createHmac } from "crypto";

export function objectToHashableString(object: any)
{
    return (typeof object === 'string') ? object : JSON.stringify(object);
}

export function getHash(object: any) : string
{
    return createHmac('sha256', 'pgetinker')
                .update(objectToHashableString(object))
                .digest().toString('base64url');
}

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

export const __dirname: string = process.env.INIT_CWD as string;

export const fileExists = fs.existsSync;

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

export const readFile  = (filePath: fs.PathLike) : string | Buffer =>
{
    return fs.readFileSync(filePath).toString();
};

export const writeFile = (filePath: string, data: string | Buffer) =>
{
    fs.writeFileSync(filePath, data, { mode: 0o644 });
};

export const writeSourceFile = (text: string) : Promise<string> =>
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            const tmpName = `${createTemporaryDirectory()}/pgetinker`;

            writeFile(`${tmpName}.cpp`, text);

            resolve(tmpName);

        }
        catch(e)
        {
            reject(e.message);
        }
    });
}
