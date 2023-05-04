
export abstract class StorageBase
{
    constructor() {}

    abstract getItem(id: string) : Promise<any>;
    abstract storeItem(item: any) : Promise<any>;
    abstract incrementViewCounter(id: string) : Promise<any>;
};
