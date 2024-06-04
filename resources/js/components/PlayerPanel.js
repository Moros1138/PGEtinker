
export default class PlayerPanel
{
    state;
    lastPlayerHtml = "";
    running = false;

    constructor(state)
    {
        this.state = state;
        console.log("Player panel", "constructor");
        window.addEventListener("message", (event) =>
        {
            if(typeof event.data !== "object")
                return;
                
            if(typeof event.data.message !== "string")
                return;

            if(event.data.message === "player-ready")
            {
                // update player theme
                document.querySelector("#player-panel iframe").contentWindow.postMessage({
                    message: "set-theme",
                    theme: this.state.theme
                }, "*");
            }

            if(event.data.message === "player-runtime-error")
            {
                alert("A runtime error has occured, check the web developer console for more details.");
            }
    
        });
    }
    
    getHtml()
    {
        return this.lastPlayerHtml;
    }

    isRunning()
    {
        return this.running;
    }

    onInit()
    {
        if(this.lastPlayerHtml != "")
        {
            let playerFrame = document.createElement('iframe');
            playerFrame.setAttribute("srcdoc", this.lastPlayerHtml);
            playerFrame.setAttribute("sandbox", "allow-scripts");
            document.querySelector("#player-panel .iframe-container").append(playerFrame);
            
            playerFrame.classList.toggle("display-block", true);
            document.querySelector("#player-panel .compiling").classList.toggle("display-flex", false);
            document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", false);
        }
    }

    register()
    {
        this.state.layout.registerComponent('playerComponent', function(container)
        {   
            container.getElement().html(`
                <div id="player-panel">
                    <div class="iframe-container">
                    </div>
                    <div class="compiling">
                        <div class="lds-ring">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        <p>
                            Compiling
                        </p>
                    </div>
                    <div class="compiling-failed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-frown"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                        <p>
                            Compile Failed.
                        </p>
                    </div>
                </div>
            `);
        });
    }
    
    setCompiling()
    {
        this.lastPlayerHtml = "";
        this.stop();

        document.querySelector("#player-panel .compiling").classList.toggle("display-flex", true);
        document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", false);
    }
    
    setCompilingFailed()
    {
        document.querySelector("#player-panel .compiling").classList.toggle("display-flex", false);
        document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", true);
    }
    
    setHtml(html)
    {
        this.lastPlayerHtml = html;
        this.start();
    }

    setTheme(theme)
    {
        let iframe = document.querySelector("#player-panel iframe");
        if(iframe != null)
        {
            iframe.contentWindow.postMessage({
                message: "set-theme",
                theme: theme
            }, "*");
        }
    }

    start()
    {
        let playerFrame = document.createElement('iframe');
        playerFrame.setAttribute("srcdoc", this.lastPlayerHtml);
        playerFrame.setAttribute("sandbox", "allow-scripts");
        document.querySelector("#player-panel .iframe-container").append(playerFrame);
        
        playerFrame.classList.toggle("display-block", true);
        document.querySelector("#player-panel .compiling").classList.toggle("display-flex", false);
        document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", false);
        
        this.running = true;
    }

    stop()
    {
        let playerFrame = document.querySelector("#player-panel iframe");
        
        if(playerFrame != null)
            playerFrame.remove();

        this.running = false;
    }
}
