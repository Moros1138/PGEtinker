import * as fs from "fs-extra"
import { __dirname, getHash, objectToHashableString } from "../utils"
import path from "node:path";
import { logger } from "../logger";
import { StorageBase } from "./base";

export class StorageLocal extends StorageBase
{
    storagePath: string;

    constructor(storagePath: string | null = null)
    {
        super();
        try
        {
            this.storagePath = (!storagePath) ? path.join(__dirname, "lib", "storage", "data") : storagePath;
            fs.ensureDirSync(this.storagePath);
        }
        catch(err)
        {
            logger.error("An error occurred while setting up the local storage system.", err);
            throw err;
        }
    }

    async getItem(id: string) : Promise<any>
    {
        const expectedPath : string = path.join(this.storagePath, id);
        let item : any = null;

        try
        {
            item = await fs.readJSON(expectedPath);
        }
        catch(err)
        {
            logger.error(`An error occured trying to load hash: ${id}`, err);
            throw err;
        }

        return item;
    }

    async storeItem(item: any, force: boolean = false) : Promise<any>
    {
        let hashCode     : string = getHash(item.code);
        const filePath   : string = path.join(this.storagePath, hashCode);

        // short circuit, if hash exists.
        if(fs.existsSync(filePath) && !force)
            return item;

        // ensure viewCounter is set to 0
        if(item.viewCounter === undefined)
            item.viewCounter = 0;

        try
        {
            await fs.writeJson(filePath, item, { encoding: 'utf8' });
        }
        catch(err)
        {
            logger.error(`Caught an exception while trying to store to ${hashCode}`, err);
            throw err;
        }

        return item;
    }

    async incrementViewCounter(id: string): Promise<any>
    {
        try
        {
            let item = await this.getItem(id);
            item.viewCounter++;
            this.storeItem(item, true);
            await new Promise((resolve) => setTimeout(() => resolve(0), 10));
        }
        catch(err)
        {
            logger.error(`Caught exceptions while trying to incremember counter on ${id}`, err);
            throw err;
        }
    }
};
