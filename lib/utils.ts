import * as fs from 'node:fs';
export const __dirname: string = process.env.INIT_CWD as string;
export const fileExists = fs.existsSync;
