
export default class ConsolePanel
{
    consoleAutoScrollEnabled = true;
     
    state;
    firstRun;

    constructor(state)
    {
        this.state = state;
        this.firstRun = true;

        console.log("Console panel", "constructor");

        window.addEventListener("message", (event) =>
        {
            if(typeof event.data !== "object")
                return;
                
            if(typeof event.data.message !== "string")
                return;

            if(event.data.message === "console-output")
            {
                this.getElement().innerHTML += `<div>${event.data.data}</div>`;
                
                // auto scroll
                if(this.consoleAutoScrollEnabled)
                    this.getElement().scrollTop = this.getElement().scrollHeight;

                if(this.firstRun)
                {
                    this.state.setActiveTab("console");
                    this.firstRun = false;
                }
            }
        });
    }
    
    clear()
    {
        this.getElement().innerHTML = "";
    }

    getElement()
    {
        return document.querySelector('#console-panel');
    }

    onInit()
    {
        document.querySelector("#console-auto-scroll").addEventListener("click", () =>
        {
            this.consoleAutoScrollEnabled = true;
            document.querySelector("#console-auto-scroll").classList.toggle("hidden", this.consoleAutoScrollEnabled);
        });

        this.getElement().addEventListener("wheel", (event) =>
        {
            let nearBottom = ((this.getElement().scrollHeight - this.getElement().clientHeight) <= (this.getElement().scrollTop + 1));

            if(nearBottom)
            {
                // up
                if(event.deltaY < 0)
                {
                    this.consoleAutoScrollEnabled = false;
                    this.getElement().scrollTop = this.getElement().scrollHeight - 20;
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

    setFirstRun()
    {
        this.firstRun = true;
    }
}