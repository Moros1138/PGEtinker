import version from "./version";
export default function newsDialog()
{
    function newsClickAnywhereHandler(event)
    {
        let newsDialog = document.querySelector(".dialog.news");
        if(newsDialog == null)
            return;
        
        if(event.target.tagName == 'A')
            return;
        
        newsDialog.dispatchEvent(new Event("close-dialog"));
    }

    return new Promise((resolve) =>
    {
        let newsDialog = document.createElement("div");
    
        newsDialog.classList.toggle("dialog", true);
        newsDialog.classList.toggle("news", true);
        
        axios.get("/api/news").then((response) =>
        {
            
            let entries = [];
            
            response.data.entries.forEach((entry) =>
            {
                entries.push(`<div class="${entry.type}">${entry.message}</div>`);
            });

            newsDialog.innerHTML = `
            <div class="window">
                <div class="header">News and Updates</div>
                <div class="content">
                    <h3>PGEtinker has been updated. Here's what's been done:</h3>
                    <h3>${response.data.date}</h3>
                    <div class="entries">${entries.join("")}</div>
                    
                    <p>
                        For more details visit the <a href="https://github.com/Moros1138/PGEtinker" target="_blank">PGEtinker github repository</a>.
                    </p>
                    <p>
                    Version: ${version.substring(0, 7)}
                    </p>
                </div>
            </div>`;

            newsDialog.addEventListener("close-dialog", (event) =>
            {
                setTimeout(() => window.removeEventListener("click", newsClickAnywhereHandler), 500);
                newsDialog.remove();
                resolve();
            });
            
            setTimeout(() => window.addEventListener("click", newsClickAnywhereHandler), 500);
            document.body.appendChild(newsDialog);
        });
        
    });

}