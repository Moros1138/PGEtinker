
export default class ConsolePanel
{
    consoleShown = false;
    consolePanelExist = false;
    consoleAutoScrollEnabled = true;
    
    state;
   
    constructor(state)
    {
        this.state = state;
        console.log("Console panel", "constructor");

        this.consoleShown = window.localStorage.getItem("pgetinkerConsoleShown");
        this.consoleShown = (this.consoleShown === "true") ? true : false;

        window.addEventListener("message", (event) =>
        {
            if(typeof event.data !== "object")
                return;
                
            if(typeof event.data.message !== "string")
                return;

            if(event.data.message === "console-output")
            {
                if(!this.state.infoPanel.exists())
                    return;

                
                let consoleContainer = document.querySelector("#console-panel");
                consoleContainer.innerHTML += `<div>${event.data.data}</div>`;
                
                // auto scroll
                if(this.consoleAutoScrollEnabled)
                    consoleContainer.scrollTop = consoleContainer.scrollHeight;

                let consolePanel = this.state.layout.root.getItemsById('console')[0];
                if(consolePanel.parent.isStack)
                {
                    consolePanel.parent.setActiveContentItem(consolePanel);
                }
            }
        });
    }
    
    clear()
    {
        document.querySelector("#console-panel").innerHTML = "";
    }

    exists()
    {
        return this.consolePanelExist;
    }

    onInit()
    {
        this.consolePanelExist = (this.state.layout.root.getItemsById('console').length > 0);

        let consoleContainer = document.querySelector("#console-panel");
            
        document.querySelector("#console-auto-scroll").addEventListener("click", () =>
        {
            this.consoleAutoScrollEnabled = true;
            document.querySelector("#console-auto-scroll").classList.toggle("hidden", this.consoleAutoScrollEnabled);
        });

        consoleContainer.addEventListener("wheel", (event) =>
        {
            let nearBottom = ((consoleContainer.scrollHeight - consoleContainer.clientHeight) <= (consoleContainer.scrollTop + 1));

            if(nearBottom)
            {
                // up
                if(event.deltaY < 0)
                {
                    this.consoleAutoScrollEnabled = false;
                    consoleContainer.scrollTop = consoleContainer.scrollHeight - 20;
                    document.querySelector("#console-auto-scroll").classList.toggle("hidden", this.consoleAutoScrollEnabled);
                }
            }
        });
    }

    register()
    {
        this.state.layout.registerComponent('consoleComponent', function(container)
        {
            container.getElement().html(`
                <div id="console-panel"></div>
                <button id="console-auto-scroll" class="hidden">AutoScroll</button>
            `);
        });
    }

    shown()
    {
        return this.consoleShown;
    }

}