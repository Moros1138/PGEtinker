export default function supportersDialog()
{
    function supportersClickAnywhereHandler(event)
    {
        let supportersDialog = document.querySelector(".dialog.supporters");
        if(supportersDialog == null)
            return;
        
        if(event.target.tagName == 'A')
            return;
        
        supportersDialog.dispatchEvent(new Event("close-dialog"));
    }

    return new Promise((resolve) =>
    {
        let supportersDialog = document.createElement("div");
    
        supportersDialog.classList.toggle("dialog", true);
        supportersDialog.classList.toggle("supporters", true);
        
        axios.get("/api/supporters").then((response) =>
        {
            
            let entries = [];
            
            response.data.supporters.forEach((entry) =>
            {
            });
            
            supportersDialog.innerHTML = `
            <div class="window">
                <div class="header">Patreon Supporters!</div>
                <div class="content">
                    <h3>PGEtinker would not exist without the support of:</h3>
                    <div class="names">
                        ${entries.join('')}
                    </div>
                    <a target="_blank" href="https://patreon.com/PGEtinker">
                        Become a Supporter
                    </a>                    
                </div>
            </div>`;

            supportersDialog.addEventListener("close-dialog", (event) =>
            {
                setTimeout(() => window.removeEventListener("click", supportersClickAnywhereHandler), 500);
                supportersDialog.remove();
                resolve();
            });
            
            setTimeout(() => window.addEventListener("click", supportersClickAnywhereHandler), 500);
            document.body.appendChild(supportersDialog);
        });
        
    });

}