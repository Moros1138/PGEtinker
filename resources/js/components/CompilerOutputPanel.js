
export default class CompilerOutputPanel
{
    state;
    
    constructor(state)
    {
        this.state = state;
        console.log("CompilerOutputPanel", "constructor");
    }

    clear()
    {
        this.getElement().innerHTML = "";
    }

    focus()
    {
        this.state.setActiveTab('compiler-output');
    }

    getElement()
    {
        return document.querySelector("#compiler-output-panel");
    }

    onInit() {}

    register()
    {
        this.state.layout.registerComponent('compilerOutputComponent', function(container)
        {
            container.getElement().html(`
                <div id="compiler-output-panel">
                </div>
            `);
        });        
    }

    setContent(content)
    {
        const element = this.getElement();
        
        while(element.lastElementChild)
        {
            element.removeChild(element.lastElementChild);
        }
        
        if(typeof content === "string")
        {
            element.innerHTML = `<div>${content}</div>`; 
        }
        else
        {
            element.append(content);
        }
    }
}

