import { conformStorage, getStorageValue, setStorageValue, removeStorageKey } from './lib/storage';
import './lib/lucide';

// @ts-ignore
import agreeDialog from './lib/agreeDialog';

conformStorage();

const preloader = () =>
{
    import("./app.ts")
        .then((object) =>
        {
            const PGEtinker = object.default;

            new PGEtinker();
        })
        .catch((reason) =>
        {
            console.log(reason);
        });
};

const tryToAgree = async() =>
{
    if(!getStorageValue("agreed-to-terms"))
    {
        try
        {
            await agreeDialog();
            setStorageValue("agreed-to-terms", true);
            preloader();
        }
        catch(e)
        {
            removeStorageKey("code");
            removeStorageKey("theme");
            removeStorageKey("layout");
            removeStorageKey("version");
            
            window.addEventListener("pageshow", (event) =>
            {
                let historyTraversal = event.persisted ||( typeof window.performance != "undefined" && window.performance.navigation.type === 2);
                if(historyTraversal)
                {
                    // Handle page restore.
                    window.location.reload();
                }
            });

            const link = document.createElement('a');
            link.setAttribute('href', "/disagree")
            link.click();
        }
    }
    else
    {
        preloader();
    }
}

tryToAgree();
