import { exec } from 'child_process';
import * as fs from 'node:fs';

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

