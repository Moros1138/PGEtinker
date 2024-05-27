
export default class InfoPanel
{
    state;
    
    informationPanelExist = false;

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
        if(this.exists())
        {
            let infoPanel = this.state.layout.root.getItemsById('info')[0];
            if(infoPanel.parent.isStack)
            {
                infoPanel.parent.setActiveContentItem(infoPanel);
            }
        }
    }

    onInit()
    {
        this.informationPanelExist = (this.state.layout.root.getItemsById('info').length > 0);
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

