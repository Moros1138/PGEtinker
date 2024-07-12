import version from "./version";
export default function newsDialog()
{
    return new Promise((resolve) =>
    {
        let dialog = document.createElement("div");
    
        dialog.classList.toggle("dialog", true);
        dialog.classList.toggle("news", true);
        
        axios.get('/sanctum/csrf-cookie').then(_ =>
        {
            axios.get("/api/news").then((response) =>
            {
                
                let entries = [];
                
                response.data.entries.forEach((entry) =>
                {
                    entries.push(`<div class="${entry.type}">${entry.message}</div>`);
                });
    
                dialog.innerHTML = `
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
    });
       
    });

}