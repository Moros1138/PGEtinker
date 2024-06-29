
export default function examplesMenuDialog(state)
{
    return new Promise((resolve) =>
    {
        // exmaples menu template
        const examplesMenu = document.querySelector('#examples').content.cloneNode(true);

        let dialog = document.createElement('div');
                
        dialog.classList.toggle("dialog", "true");
        dialog.classList.toggle("examples-menu-dialog", "true");
        
        dialog.innerHTML = `
            <div class="window">
                <div class="header">Choose an Example</div>
                <div class="content">
                    <ul class="menu">
                    </ul>
                </div>
                <div class="footer">
                    <button type="button" class="ok">Close</button>
                </div>                
            </div>`;
        
        dialog.querySelector('.menu').append(examplesMenu);

        dialog.querySelectorAll("#examples-menu a").forEach((item) =>
        {
            item.addEventListener("click", () =>
            {
                let selectedId = item.getAttribute("data-code-id");
                let selectedName = item.innerText;
                
                if(selectedId)
                {
                    state.editorPanel.setToExample(selectedId, selectedName);
                    dialog.remove();
                    resolve();
                }
            });
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
