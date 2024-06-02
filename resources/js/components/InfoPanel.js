
export default class InfoPanel
{
    state;
    
    constructor(state)
    {
        this.state = state;
        console.log("Info panel", "constructor");
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
        let infoPanel = document.querySelector("#info-panel");
        infoPanel.innerHTML = `<div>${content}</div>`;
        infoPanel.scrollTop = infoPanel.scrollHeight;
    }
}

