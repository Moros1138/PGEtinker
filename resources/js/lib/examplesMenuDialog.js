
export default function examplesMenuDialog(state)
{
    return new Promise((resolve) =>
    {
        let dialog = document.createElement('div');
                
        dialog.classList.toggle("dialog", "true");
        dialog.classList.toggle("examples-menu-dialog", "true");
        
        dialog.innerHTML = `
            <div class="window">
                <div class="header">Choose an Example</div>
                <div class="content">
                    <ul class="menu">
                        <li class="item has-submenu" id="examples-menu">
                            <a tabindex="0">Examples</a>
                            <ul class="submenu">
                                <li class="subitem">
                                    <a tabindex="0" data-example="code1">Example 1</a>
                                </li>
                                <li class="subitem"><a data-example="code2">Example 2</a></li>
                                <li class="subitem"><a data-example="code3">Example 3</a></li>
                                <li class="subitem"><a data-example="code4">Example 4</a></li>
                                <li class="subitem"><a data-example="code5">Example 5</a></li>
                                <li class="subitem"><a data-example="code6">Example 6</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div class="footer">
                    <button type="button" class="ok">Close</button>
                </div>                
            </div>`;
        

        dialog.querySelectorAll("#examples-menu a").forEach((item) =>
        {
            item.addEventListener("click", () =>
            {
                let selectedExample = item.getAttribute("data-example");
                if(selectedExample)
                {
                    state.editorPanel.setToExample(selectedExample);
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
