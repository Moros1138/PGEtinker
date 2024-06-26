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

if(!getStorageValue("agreed-to-terms"))
{
    agreeDialog()
        .then(() =>
        {
            setStorageValue("agreed-to-terms", true);
            preloader();
        })
        .catch(() =>
        {
            removeStorageKey("code");
            removeStorageKey("theme");
            removeStorageKey("layout");
            removeStorageKey("version");
            window.location.pathname = "/disagree";
        });
}
else
{
    preloader();
}
