import './lib/bootstrap';
import './lib/goldenLayout';
import './lib/lucide';
import version from "./lib/version";
import { conformStorage, getStorageValue, setStorageValue } from './lib/storage';
import agreeDialog from './lib/agreeDialog';
import shareDialog from './lib/shareDialog';
import newsDialog from './lib/newsDialog';
import defaultLandscapeLayout from './lib/defaultLandscapeLayout';
import defaultPortraitLayout from './lib/defaultPortraitLayout';
import supportersDialog from './lib/supportersDialog';

import ConsolePanel from './components/ConsolePanel';
import CompilerOutputPanel from './components/CompilerOutputPanel';
import EditorPanel from './components/EditorPanel';
import PlayerPanel from './components/PlayerPanel';
import ProblemsPanel from './components/ProblemsPanel';
import { removeStorageKey } from './lib/storage';

class PGEtinker
{
    consolePanel;
    editorPanel;
    compilerOutputPanel;
    playerPanel;
    problemsPanel;

    layoutInitialized = false;
    compiling = false;

    layoutConfig = null;
    
    theme = "dark";

    constructor()
    {
        conformStorage();

        this.consolePanel        = new ConsolePanel(this);
        this.compilerOutputPanel = new CompilerOutputPanel(this);
        this.editorPanel         = new EditorPanel(this);
        this.playerPanel         = new PlayerPanel(this);
        this.problemsPanel       = new ProblemsPanel(this);
        
        
        this.layoutConfig = getStorageValue("layout");
        if(this.layoutConfig === null)
        {
            this.layoutConfig = defaultLandscapeLayout;
            
            if(document.body.clientWidth <= 750)
            {
                console.log("chose portrait layout");
                this.layoutConfig = defaultPortraitLayout;
            }
            else
            {
                console.log("chose landscapre layout");
            }
        }
        
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
                this.setActiveTab("player");
                
                this.consolePanel.setFirstRun();
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
                this.setActiveTab("editor");

                this.playerPanel.stop();
                playIconElem.classList.toggle("hidden", false);
                stopIconElem.classList.toggle("hidden", true);
                spanElem.innerHTML = "Run";
            }
            
            startStopElem.blur();
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

        if(!getStorageValue("agreed-to-terms"))
        {
            agreeDialog()
                .then(() =>
                {
                    setStorageValue("agreed-to-terms", true);
                    this.SetupLayout();
                })
                .catch(() =>
                {
                    removeStorageKey("code");
                    removeStorageKey("theme");
                    removeStorageKey("layout");
                    removeStorageKey("version");
                    window.location.pathname = "/disagree";
                });
        }
        else
        {
            this.SetupLayout();
            this.setActiveTab("editor");
            this.setActiveTab("problems");
        }
    }

    setActiveTab(id)
    {
        try
        {
            let panel = this.layout.root.getItemsByFilter((item) =>
            {
                return (item.config.id == id);
            })[0];
            
            if(panel.parent.isStack)
            {
                panel.parent.setActiveContentItem(panel);
            }
        }
        catch(e)
        {
            console.log(`Failed to setActiveTab("${id}")`);
        }
    }

    preCompile()
    {
        if(this.editorPanel.exceedsMaxSize())
        {
            alert("Maximum size exceeded!");
            return false;
        }
        
        this.compilerOutputPanel.focus();
        this.compilerOutputPanel.clear();
        this.consolePanel.clear();

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
        this.compilerOutputPanel.setContent(data.stderr);
        this.playerPanel.setHtml(data.html);
        this.compiling = false;
    }
    
    compileFailHandler(stderr)
    {
        this.setActiveTab("editor");

        this.compilerOutputPanel.setContent(stderr);
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
        this.compilerOutputPanel.register();
        this.playerPanel.register();
        this.problemsPanel.register();

        this.layout.on("stateChanged", () =>
        {
            if(this.layoutInitialized)
            {
                setStorageValue("layout", this.layout.toConfig());
            }
        });
        
        this.layout.on("initialised", async() =>
        {
            this.layoutInitialized = true;
            window.addEventListener("resize", (event) =>
            {
                console.log(document.body.clientWidth);
                this.layout.updateSize();
            });
            
            this.consolePanel.onInit();
            await this.editorPanel.onInit();
            this.compilerOutputPanel.onInit();
            this.playerPanel.onInit();
            this.problemsPanel.onInit();

            await this.UpdateTheme();
            
            setTimeout(() =>
            {
                document.querySelector("#pgetinker-loading").classList.toggle("display-flex", false);
                this.setActiveTab("editor");
            }, 500)
        });
    
        this.layout.init();

        if(version !== getStorageValue("version"))
        {
            newsDialog()
                .finally(() =>
                {
                    setStorageValue("version", version);
                });
        }
        
    }
    
    async UpdateTheme()
    {
        // save theme into localStorage
        setStorageValue("theme", this.theme);

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




