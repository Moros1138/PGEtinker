export default function supportersDialog()
{
    function renderSupportersDialog(supporters)
    {
        return new Promise((resolve) =>
        {
            let dialog = document.createElement("div");
        
            dialog.classList.toggle("dialog", true);
            dialog.classList.toggle("supporters", true);

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
        
            dialog.innerHTML = `
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
                <div class="footer">
                    <button class="ok">Close</button>
                </div>
            </div>`;

            dialog.querySelector("button.ok").addEventListener("click", (event) =>
            {
                dialog.remove();
                resolve();
            });
            
            document.body.appendChild(dialog);
        });
    }

    return new Promise((resolve) =>
    {
        axios.get('/sanctum/csrf-cookie').then(_ =>
        {
            axios.get("/api/supporters").then((response) =>
            {
                renderSupportersDialog(response.data.supporters).then(() => resolve());
            }).catch((reason) =>
            {
                renderSupportersDialog(reason.response.data.supporters).then(() => resolve());
            });
        });
    });
}
