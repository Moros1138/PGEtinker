const prefix = "pgetinker_";
const store = window.localStorage;

export function conformStorage()
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
}

export function getStorageValue(key)
{
    if(typeof key !== "string")
    {
        console.error("setStorageValue key must be string");
        return;
    }

    let value = store.getItem(prefix + key);
    
    try
    {
        return JSON.parse(value);
    }
    catch(e)
    {
        if(typeof value === "string")
            return value;
    }

    return null;
}

export function setStorageValue(key, value)
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

export function removeStorageKey(key)
{
    if(typeof key === "string")
    {
        store.removeItem(prefix + key);
    }
    
    return undefined;
}

