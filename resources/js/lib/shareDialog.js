export default function shareDialog(shareUrl, shareThumbUrl)
{
    return new Promise((resolve) =>
    {
        let dialog = document.createElement('div');
                
        dialog.classList.toggle("dialog", "true");
        dialog.classList.toggle("share-dialog", "true");
        dialog.innerHTML = `
            <div class="window">
                <div class="header">Share Your Masterpiece!</div>
                <div class="content">
                    <img src="${shareThumbUrl}">
                    <div class="input-group">
                        <label>Share URL:</label>
                        <input type="text" id="share-url" value="${shareUrl}" readonly>
                        <button class="copy-url" type="button">Copy</button>
                    </div>
                </div>
                <div class="footer">
                    <button class="ok">Close</button>
                </div>
            </div>`;
        
        dialog.querySelector("button.copy-url").addEventListener("click", (event) =>
        {
            navigator.clipboard.writeText(shareUrl).catch((reason) => console.log(reason));
        });

        dialog.querySelector("button.ok").addEventListener("click", (event) =>
        {
            dialog.remove();
            resolve();
        });
        
        document.body.appendChild(dialog);
    });
}
