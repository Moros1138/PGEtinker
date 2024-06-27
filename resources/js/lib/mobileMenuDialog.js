import settingsDialog from "./settingsDialog";
import newsDialog from "./newsDialog";
import supportersDialog from "./supportersDialog";
import version from "./version";
import examplesMenuDialog from "./examplesMenuDialog";

export default function mobileMenuDialog(state)
{
    return new Promise((resolve) =>
    {
        let dialog = document.createElement('div');
                
        dialog.classList.toggle("dialog", "true");
        dialog.classList.toggle("mobile-menu-dialog", "true");
        
        dialog.innerHTML = `
            <div class="window">
                <div class="header">Menu</div>
                <div class="content">
                    <ul class="menu">
                        <li class="item has-submenu">
                            <a tabindex="0">Menu</a>
                            <ul class="submenu">
                                <li class="subitem">
                                    <a id="settings-menu" tabindex="0">Settings</a>
                                </li>
                                <li class="subitem">
                                    <a id="examples-menu">Load an Example</a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="/wiki/">
                                        <span>Help</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a id="news-and-updates">
                                        <span>What's New</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a id="supporters">
                                        <span>Supporters</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="item has-submenu">
                            <a tabindex="0">
                                <span>Sharing</span>
                            </a>
                            <ul class="submenu">
                                <li class="subitem">
                                    <a id="share">
                                        <span>Share</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a id="download">
                                        <span>Download HTML</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li class="item has-submenu">
                            <a tabindex="0">Links</a>
                            <ul class="submenu">
                                <li class="subitem">
                                    <a target="_blank" href="https://patreon.com/PGEtinker">
                                        <span>Support on Patreon</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="https://www.paypal.com/donate?hosted_button_id=JRELVL6T7NZBE">
                                        <span>Make a Donation on Paypal</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="https://github.com/Moros1138/PGEtinker">
                                        <span>PGEtinker on Github</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=bug&projects=&template=bug_report.md&title=Bug in Version: ${version.substring(0, 7)}">
                                        <span>Report an issue</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=enhancement&projects=&template=feature_request.md&title=">
                                        <span>Request a new feature</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="https://www.youtube.com/channel/UC-yuWVUplUJZvieEligKBkA">
                                        <span>Javidx9 on Youtube</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="https://github.com/OneLoneCoder">
                                        <span>OneLoneCoder on Github</span>
                                    </a>
                                </li>
                                <li class="subitem">
                                    <a target="_blank" href="https://emscripten.org/">
                                        <span>Emscripten</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="footer">
                    <button type="button" class="ok">Close</button>
                </div>                
            </div>`;
        
        dialog.querySelector("#settings-menu").addEventListener("click", (event) =>
        {
            event.preventDefault();
            dialog.remove();
            resolve()

            settingsDialog(state);
        });

        dialog.querySelector("#examples-menu").addEventListener("click", (event) =>
        {
            event.preventDefault();
            dialog.remove();
            resolve();
            examplesMenuDialog(state);
        });
    

        dialog.querySelector("#news-and-updates").addEventListener("click", (event) =>
        {
            event.preventDefault();
            dialog.remove();
            resolve();

            newsDialog();
        });
    
        dialog.querySelector("#supporters").addEventListener("click", (event) =>
        {
            event.preventDefault();
            dialog.remove();
            resolve();
            
            supportersDialog();
        });
            
        dialog.querySelector("#download").addEventListener("click", (event) =>
        {
            event.preventDefault();
            state.download();
            dialog.remove();
            resolve();
        });
    
        dialog.querySelector("#share").addEventListener("click", (event) =>
        {
            event.preventDefault();
            dialog.remove();
            resolve();

            state.share();
        });
    
        dialog.querySelector(".ok").addEventListener("click", (event) =>
        {
            event.preventDefault();
            dialog.remove();
            resolve();
        });
        
        document.body.appendChild(dialog);
    });
}
