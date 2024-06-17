const prefix: string = "pgetinker_";
const store: Storage = window.localStorage;

export function conformStorage(): void
{
    let agree = store.getItem("pgetinkerAgreedToTerms");
    store.removeItem("pgetinkerAgreedToTerms");
    if(agree)
    {
        setStorageValue("agreed-to-terms", true);
    }
    
    let code = store.getItem("pgetinkerCode");
    store.removeItem("pgetinkerCode");
    if(code)
    {
        setStorageValue("code", JSON.parse(code));
    }

    let theme = store.getItem("pgetinkerTheme");
    store.removeItem("pgetinkerTheme");
    if(theme)
    {
        setStorageValue("theme", theme);
    }

    if(getStorageValue("diagnostics.javidMode") == null)
    {
        setStorageValue("diagnostics.javidMode", false);
    }
    
}

export function getStorageValue(key: string): string | null
{
    let value: string | null = store.getItem(prefix + key);

    if(typeof value !== "string")
    {
        return null;
    }
    
    try
    {
        return JSON.parse(value);
    }
    catch(e)
    {
        // it's just a string, return it
    }

    return value;
}

export function setStorageValue(key: string, value: string | any): void
{
    if(typeof value === "string")
    {
        store.setItem(prefix + key, value);
        return;
    }

    try
    {
        store.setItem(prefix + key, JSON.stringify(value));
    }
    catch(error)
    {
        console.error("setStorageValue failed to JSON.stringify value", error);
    }
}

export function removeStorageKey(key: string): void
{
    store.removeItem(prefix + key);
}

