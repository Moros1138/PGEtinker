import puppeteer from 'puppeteer';
import { writeFile } from './utils';

export const screenshot = async (url: string, delay: number, filePath: string) : Promise<any> =>
{
    if(Array.from(filePath)[0] !== "/")
        throw new Error("filePath must be absolute path");

    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_EXECUTABLE || undefined,

        // "new" is being pushed but it's performance is much slower
        // @ts-ignore: "old" not defined in spec, but is currently valid
        headless: "old",
        args: [
            '--no-sandbox',
            '--use-gl=egl',
            '--no-zygote',
        ],
    });

    const page = await browser.newPage();
    await page.goto(url);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), delay));
    const screenshot = await page.screenshot({encoding: 'binary'});
    browser.close();

    writeFile(filePath, screenshot);
};
