import './lib/bootstrap';
import './lib/goldenLayout';
// import './lib/monaco';
import './lib/lucide';
import version from "./lib/version";
import agreeDialog from './lib/agreeDialog';
import shareDialog from './lib/shareDialog';
import newsDialog from './lib/newsDialog';
import defaultLayout from './lib/defaultLayout';
import supportersDialog from './lib/supportersDialog';

import ConsolePanel from './components/ConsolePanel';
import EditorPanel from './components/EditorPanel';
import InfoPanel from './components/InfoPanel';
import PlayerPanel from './components/PlayerPanel';

class PGEtinker
{
    consolePanel;
    editorPanel;
    infoPanel;
    playerPanel;

    layoutInitialized = false;
    compiling = false;

    layoutConfig = null;
    
    theme = "dark";

    constructor()
    {
        this.consolePanel = new ConsolePanel(this);
        this.editorPanel  = new EditorPanel(this);
        this.infoPanel    = new InfoPanel(this);
        this.playerPanel  = new PlayerPanel(this);

        this.layoutConfig = window.localStorage.getItem("pgetinkerLayout");
        this.layoutConfig = (this.layoutConfig !== null) ? JSON.parse(this.layoutConfig) : defaultLayout;
        
        this.theme = window.localStorage.getItem("pgetinkerTheme");
        if(this.theme !== "dark" && this.theme !== "light")
            this.theme = "dark";

        // Default Code Button
        document.querySelector("#default-code").addEventListener("click", (event) =>
        {
            event.preventDefault();

            axios.get("/api/default-code").then((response) =>
            {
                this.editorPanel.setValue(response.data.code);
                this.editorPanel.reveal({
                    column: 1,
                    lineNumber: 1,
                });
            }).catch((reason) => console.log(reason));
        });

        // Toggle Theme Button
        document.querySelector("#toggle-theme").addEventListener("click", (event) =>
        {
            event.preventDefault();

            if(this.theme === "dark")
                this.theme = "light";
            else
                this.theme = "dark";
                
            this.UpdateTheme();
        });

        // Default Layout
        document.querySelector("#default-layout").addEventListener("click", (event) => 
        {
            event.preventDefault();

            this.layout.destroy();
            this.layoutConfig = defaultLayout;
            
            this.SetupLayout();
        });

        // Download Button
        document.querySelector("#download").addEventListener("click", (event) => 
        {
            event.preventDefault();
            
            if(!this.playerPanel.getHtml().includes("Emscripten-Generated Code"))
            {
                alert("You have to build the code before you can download!")
                return;
            }
            
            const a = document.createElement('a');
            
            // create the data url
            a.href = `data:text/html;base64,${btoa(this.playerPanel.getHtml())}`;
            a.download = "pgetinker.html";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
        
        // Share Button
        document.querySelector("#share").addEventListener("click", (event) => 
        {
            event.preventDefault();

            if(this.compiling)
                return;

            if(!this.preCompile())
                return;

            axios.post("/api/share", {
                code: this.editorPanel.getValue()
            }).then((response) =>
            {
                shareDialog(response.data.shareURL, response.data.shareThumbURL)
                    .finally(() =>
                    {
                        this.compileSuccessHandler(response.data);
                    });
            
            }).catch((error) =>
            {
                if(error.response)
                {
                    if(error.response.status)
                    {
                        if(error.response.status == 503)
                        {
                            this.compileFailHandler("pgetinker.cpp:1:1: error: PGEtinker service has gone offline. try again later.\n");
                            return;
                        }
                    }

                    if(error.response.data.stderr)
                    {
                        this.compileFailHandler(error.response.data.stderr);
                        return;
                    }
                }
                this.compileFailHandler("pgetinker.cpp:1:1: error: compilation failed in a way that's not being handled. please make a bug report.\n");
            });
        });

        // Compile Button
        document.querySelector("#start-stop").addEventListener("click", (event) => 
        {
            event.preventDefault();
            let startStopElem = document.querySelector("#start-stop");
            let playIconElem = startStopElem.querySelector(".lucide-circle-play");
            let stopIconElem = startStopElem.querySelector(".lucide-circle-stop");
            let spanElem     = startStopElem.querySelector("span");

            if(spanElem.innerHTML == "Run")
            {
                this.setActiveTab("Emscripten Player");
                
                playIconElem.classList.toggle("hidden", true);
                stopIconElem.classList.toggle("hidden", false);
                spanElem.innerHTML = "Stop";
                this.compile().catch(() =>
                {
                    playIconElem.classList.toggle("hidden", false);
                    stopIconElem.classList.toggle("hidden", true);
                    spanElem.innerHTML = "Run";
                });
                return;
            }

            if(spanElem.innerHTML == "Stop")
            {
                this.setActiveTab("C++ Editor");

                this.playerPanel.stop();
                playIconElem.classList.toggle("hidden", false);
                stopIconElem.classList.toggle("hidden", true);
                spanElem.innerHTML = "Run";
            }
        });

        document.querySelector("#supporters").addEventListener("click", (event) =>
        {
            event.preventDefault();
            supportersDialog();
        });

        document.querySelector("#news-and-updates").addEventListener("click", (event) =>
        {
            event.preventDefault();
            newsDialog();
        });

        let agreedToTerms = window.localStorage.getItem("pgetinkerAgreedToTerms");
        agreedToTerms = (agreedToTerms == null) ? false : JSON.parse(agreedToTerms);
        
        if(!agreedToTerms)
        {
            agreeDialog()
                .then(() =>
                {
                    window.localStorage.setItem("pgetinkerAgreedToTerms", JSON.stringify(true));
                    this.SetupLayout();
                })
                .catch(() =>
                {
                    window.localStorage.removeItem("pgetinkerCode");
                    window.localStorage.removeItem("pgetinkerTheme");
                    window.localStorage.removeItem("pgetinkerLayout");
                    window.localStorage.removeItem("pgetinkerVersion");
                    window.location.pathname = "/disagree";
                });
        }
        else
        {
            this.SetupLayout();
        }
    }

    setActiveTab(title)
    {
        try
        {
            let panel = this.layout.root.getItemsByFilter((item) =>
            {
                return (item.config.title == title);
            })[0];
            
            if(panel.parent.isStack)
            {
                panel.parent.setActiveContentItem(panel);
            }
        }
        catch(e)
        {
            console.log(`Failed to setActiveTab("${title}")`);
        }
    }

    preCompile()
    {
        if(this.editorPanel.exceedsMaxSize())
        {
            alert("Maximum size exceeded!");
            return false;
        }
        
        this.infoPanel.focus();
        this.infoPanel.clear();
        this.consolePanel.clear();

        this.editorPanel.clearMarkers();
        this.playerPanel.setCompiling();
        
        this.compiling = true;
        return true;
    }
    
    compile()
    {
        if(this.compiling)
            return new Promise((_, reject) => reject());

        if(!this.preCompile())
            return new Promise((_, reject) => reject());
        
        return new Promise((resolve, reject) =>
        {
            axios.post("/api/compile", {
                code: this.editorPanel.getValue()
            }).then((response) =>
            {
                this.compileSuccessHandler(response.data);
                resolve();
            }).catch((error) =>
            {
                
                if(error.response)
                {
                    if(error.response.status)
                    {
                        if(error.response.status == 503)
                        {
                            this.compileFailHandler("pgetinker.cpp:1:1: error: PGEtinker service has gone offline. try again later.\n");
                            reject();
                            return;
                        }
                    }
                    
                    if(error.response.data.stderr)
                    {
                        this.compileFailHandler(error.response.data.stderr);
                        reject();
                        return;
                    }
                }
                this.compileFailHandler("pgetinker.cpp:1:1: error: compilation failed in a way that's not being handled. please make a bug report.\n");
                reject();
            });
        });
        
    }
    
    compileSuccessHandler(data)
    {
        this.playerPanel.setHtml(data.html);
        this.compiling = false;
    }
    
    compileFailHandler(stderr)
    {
        this.infoPanel.setContent(stderr);
        this.editorPanel.extractAndSetMarkers(stderr);

        this.playerPanel.setCompilingFailed();
        this.compiling = false;
    }
    
    async SetupLayout()
    {
        document.querySelector("#pgetinker-loading").classList.toggle("display-flex", true);

        await this.editorPanel.onPreInit();
        
        this.layout = new GoldenLayout(this.layoutConfig, document.querySelector("#content"))
        
        this.consolePanel.register();
        this.editorPanel.register();
        this.infoPanel.register();
        this.playerPanel.register();

        this.layout.on("stateChanged", () =>
        {
            if(this.layoutInitialized)
                window.localStorage.setItem("pgetinkerLayout", JSON.stringify(this.layout.toConfig()));
        });
        
        this.layout.on("initialised", async() =>
        {
            this.layoutInitialized = true;
            window.addEventListener("resize", (event) => this.layout.updateSize());
            
            this.consolePanel.onInit();
            await this.editorPanel.onInit();
            this.infoPanel.onInit();
            this.playerPanel.onInit();
            
            await this.UpdateTheme();
            
            setTimeout(() =>
            {
                document.querySelector("#pgetinker-loading").classList.toggle("display-flex", false);
            }, 500)
        });
    
        this.layout.init();

        let pgetinkerVersion = window.localStorage.getItem("pgetinkerVersion");
        pgetinkerVersion = (pgetinkerVersion != "string") ? pgetinkerVersion : "";
        
        if(version !== pgetinkerVersion)
        {
            newsDialog()
                .finally(() =>
                {
                    window.localStorage.setItem("pgetinkerVersion", version);
                });
        }
        
    }
    
    async UpdateTheme()
    {
        // save theme into localStorage
        window.localStorage.setItem("pgetinkerTheme", this.theme);

        let light = (this.theme === "light");

        // update editor theme
        await this.editorPanel.setTheme(this.theme);
        
        setTimeout(() =>
        {
            document.body.classList.toggle("dark", !light);
            document.body.classList.toggle("light", light);
    
            // update golden layout theme
            let goldenLayoutDarkThemeStyle = document.querySelector("#goldenlayout-dark-theme");
            let goldenLayoutLightThemeStyle = document.querySelector("#goldenlayout-light-theme");
        
            goldenLayoutDarkThemeStyle.disabled = light;
            goldenLayoutLightThemeStyle.disabled = !light;
        
            // update player theme
            this.playerPanel.setTheme(this.theme);

        }, 200);

    }
}

new PGEtinker();




