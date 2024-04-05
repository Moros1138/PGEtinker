
export function GenerateSlug()
{
    const arr = new Uint8Array(8);
        
    for(let i = 0; i < 8; i++)
    {
        arr[i] = Math.floor(Math.random() * 256);
    }
    
    let buffer = Buffer.from(arr).toString("base64");
    
    const chars2replace = {'/': '-', '+': '_', '=': ''};
    
    return buffer.replace(/[/+=]/g, match => chars2replace[match]);
}

