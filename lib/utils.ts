import { exec } from 'child_process';
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

export const execute = (command: string, options: any = { timeout: 10000 }) : Promise<any> =>
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
