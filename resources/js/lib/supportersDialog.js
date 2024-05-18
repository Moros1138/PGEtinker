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

    function renderSupportersDialog(supporters)
    {
        let supportersDialog = document.createElement("div");
    
        supportersDialog.classList.toggle("dialog", true);
        supportersDialog.classList.toggle("supporters", true);

        let entries = [];
            
        if(supporters.length > 0)
        {
            // sort biggest first
            supporters.sort((a, b) => b.amount - a.amount);
            
            supporters.forEach((entry) =>
            {
                entries.push(`<div class="name">◀ ${entry.name} ▶</div>`);
            });
        }
        else
        {
            entries.push(`<div class="name">◀ No Supporters Yet ▶</div>`);
        }
        
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
        });
        
        setTimeout(() => window.addEventListener("click", supportersClickAnywhereHandler), 500);
        document.body.appendChild(supportersDialog);
    }

    return new Promise(() =>
    {
        axios.get("/api/supporters").then((response) =>
        {
            renderSupportersDialog(response.data.supporters);
        }).catch((reason) =>
        {
            renderSupportersDialog(reason.response.data.supporters);
        });
        
    });

}