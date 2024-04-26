export default function shareDialog(shareUrl)
{
    function shareClickAnywhereHandler(event)
    {
        let shareDialog = document.querySelector(".share-dialog");
        if(shareDialog == null)
            return;
        
        shareDialog.querySelector("button").dispatchEvent(new Event("click"));
    }

    return new Promise((resolve) =>
    {
        let shareDialog = document.createElement('div');
                
        shareDialog.classList.toggle("dialog", "true");
        shareDialog.classList.toggle("share-dialog", "true");
        shareDialog.innerHTML = `
            <div class="window">
                <div class="header">Share Your Masterpiece!</div>
                <div class="content">
                    <div class="input-group">
                        <label>Share URL:</label>
                        <input type="text" id="share-url" value="${shareUrl}" readonly>
                        <button type="button">Copy</button>
                    </div>
                </div>
            </div>`;
        
        shareDialog.querySelector("button").addEventListener("click", (event) =>
        {
            navigator.clipboard.writeText(shareUrl).catch((reason) => console.log(reason));
            shareDialog.remove();
            window.removeEventListener("click", shareClickAnywhereHandler);
            resolve();
        });
        
        document.body.appendChild(shareDialog);

        // you're welcome dandistine
        window.addEventListener("click", shareClickAnywhereHandler);
    });
}
