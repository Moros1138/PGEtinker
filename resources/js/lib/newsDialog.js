import version from "./version";
export default function newsDialog()
{
    function newsClickAnywhereHandler(event)
    {
        let newsDialog = document.querySelector(".dialog.news");
        if(newsDialog == null)
            return;
        
        newsDialog.dispatchEvent(new Event("close-dialog"));
    }

    return new Promise((resolve) =>
    {
        let newsDialog = document.createElement("div");
    
        newsDialog.classList.toggle("dialog", true);
        newsDialog.classList.toggle("news", true);
        
        newsDialog.innerHTML = `
        <div class="window">
            <div class="header">News and Updates</div>
            <div class="content">
                <h3>PGEtinker has been updated. Here's what's been done:</h3>
                <div class="entries">
                    <div class="added">
                        Amazing and awesome things.
                    </div>
                    <div class="removed">
                        Not so awesome, perhaps unused things.
                    </div>
                    <div class="fixed">
                        The broken thing.
                    </div>
                </div>
                <p>
                    For more details visit the <a href="https://github.com/Moros1138/PGEtinker" target="_blank">PGEtinker github repository</a>.
                </p>
                <p>
                Version: ${version}
                </p>
            </div>
        </div>`;
        
        newsDialog.addEventListener("close-dialog", (event) =>
        {
            setTimeout(() => window.removeEventListener("click", newsClickAnywhereHandler), 1000);
            newsDialog.remove();
            resolve();
        });
        
        setTimeout(() => window.addEventListener("click", newsClickAnywhereHandler), 1000);
        document.body.appendChild(newsDialog);
    });

}