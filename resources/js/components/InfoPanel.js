
export default class InfoPanel
{
    state;
    
    constructor(state)
    {
        this.state = state;
        console.log("Info panel", "constructor");
        
        window.addEventListener("update-problems-panel", (event) =>
        {
            const diagnostics = event.detail;

            document.querySelector("#info-panel").innerHTML = "";
            const wrapper = document.createElement("div");

            diagnostics.forEach((diagnostic) =>
            {
                const container = document.createElement("p");
                const link      = document.createElement("a");

                link.setAttribute("href", "#");
                link.setAttribute("data-line-number", diagnostic.range.start._line);
                link.setAttribute("data-column", diagnostic.range.start._character);
                link.setAttribute("title", diagnostic.message);
                link.innerHTML = diagnostic.message;

                link.addEventListener("click", (event) =>
                {
                    const currentLink = event.target;
                    const lineNumber = parseInt(currentLink.getAttribute("data-line-number")) + 1;
                    const column     = parseInt(currentLink.getAttribute("data-column")) + 1;
                    this.state.editorPanel.reveal({ lineNumber, column });
                });
                
                container.append(link);
                wrapper.append(container);
            });
            
            document.querySelector("#info-panel").append(wrapper);
        });
    }



    clear()
    {
        document.querySelector("#info-panel").innerHTML = "";
    }

    exists()
    {
        return this.informationPanelExist;
    }

    focus()
    {
        this.state.setActiveTab("Build Information");
    }

    onInit()
    {
    }

    register()
    {
        this.state.layout.registerComponent('infoComponent', function(container)
        {
            container.getElement().html(`
                <div id="info-panel">
                </div>
            `);
        });        
    }

    setContent(content)
    {
        const infoPanel = document.querySelector("#info-panel");
        
        while(infoPanel.lastElementChild)
        {
            infoPanel.removeChild(infoPanel.lastElementChild);
        }
        
        if(typeof content === "string")
        {
            infoPanel.innerHTML = `<div>${content}</div>`; 
        }
        else
        {
            infoPanel.append(content);
        }
            
    }
}

