import './lib/bootstrap';
import './lib/goldenLayout';
import './lib/monaco';
import './lib/lucide';
import version from "./lib/version";
import agreeDialog from './lib/agreeDialog';
import shareDialog from './lib/shareDialog';
import newsDialog from './lib/newsDialog';
import defaultLayout from './lib/defaultLayout';

class PGEtinker
{
    sharedFlag = false;
    lastPlayerHtml = "";

    layoutInitialized = false;
    compiling = false;

    layoutConfig = null;
    
    maxFileSize = 50000;
    
    theme = "dark";
    consoleShown = false;

    monacoEditor = null;
    monacoModel  = null;
    monacoModelIntellisense = null;

    constructor()
    {
        this.sharedFlag = (window.location.pathname.indexOf("/s/") === 0);
        
        this.layoutConfig = window.localStorage.getItem("pgetinkerLayout");
        this.layoutConfig = (this.layoutConfig !== null) ? JSON.parse(this.layoutConfig) : defaultLayout;
        
        this.theme = window.localStorage.getItem("pgetinkerTheme");
        if(this.theme !== "dark" && this.theme !== "light")
            this.theme = "dark";

        this.consoleShown = window.localStorage.getItem("pgetinkerConsoleShown");
        this.consoleShown = (this.consoleShown === "true") ? true : false;

        // Default Code Button
        document.querySelector("#default-code").addEventListener("click", (event) =>
        {
            event.preventDefault();

            axios.get("/api/default-code").then((response) =>
            {
                this.monacoModel.setValue(response.data.code);
                this.monacoEditor.revealPositionInCenter({
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
            
            if(!this.lastPlayerHtml.includes("Emscripten-Generated Code"))
            {
                alert("You have to build the code before you can download!")
                return;
            }
            
            const a = document.createElement('a');
            
            // create the data url
            a.href = `data:text/html;base64,${btoa(this.lastPlayerHtml)}`;
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
                code: this.monacoEditor.getValue()
            }).then((response) =>
            {
                shareDialog(response.data.shareURL)
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
        document.querySelector("#compile").addEventListener("click", (event) => 
        {
            event.preventDefault();

            if(this.compiling)
                return;

            if(!this.preCompile())
                return;
            
            axios.post("/api/compile", {
                code: this.monacoEditor.getValue()
            }).then((response) =>
            {
                this.compileSuccessHandler(response.data);
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

        document.querySelector("#supporters").addEventListener("click", (event) =>
        {
            event.preventDefault();
            alert("Not Implemented");
        });

        document.querySelector("#news-and-updates").addEventListener("click", (event) =>
        {
            event.preventDefault();
            newsDialog();
        });

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
                    theme: this.theme
                }, "*");
        
                // update player theme
                document.querySelector("#player-panel iframe").contentWindow.postMessage({
                    message: "show-console",
                    value: this.consoleShown
                }, "*");
            }
            
            if(event.data.message === "console-output")
            {
                let elem = document.querySelector('#console-panel');
                elem.innerHTML += event.data.data;
                elem.parentElement.scrollTop = elem.parentElement.scrollHeight;

                let informationStack = this.layout.root.getItemsById('information-stack');
                if(informationStack.length == 0)
                    return;
                
                informationStack = informationStack[0];
                
                let consolePanel = informationStack.getItemsById('console');
                if(consolePanel.length == 0)
                    return;
                
                consolePanel = consolePanel[0];
                
                informationStack.setActiveContentItem(consolePanel);
            }

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

    preCompile()
    {
        if(this.monacoEditor.getValue().length > this.maxFileSize)
        {
            alert("Maximum size exceeded!");
            return false;
        }
        
        this.compiling = true;
    
        this.lastPlayerHtml = "";
        let playerFrame = document.querySelector("#player-panel iframe");
        
        if(playerFrame != null)
            playerFrame.remove();
        
        document.querySelector("#player-panel .compiling").classList.toggle("display-flex", true);
        document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", false);
        
        monaco.editor.removeAllMarkers("owner");
        this.monacoEditor.trigger("", "closeMarkersNavigation");
    
        return true;
    }
    
    compileSuccessHandler(data)
    {
        this.lastPlayerHtml = data.html;
        
        let playerFrame = document.createElement('iframe');
        playerFrame.setAttribute("srcdoc", this.lastPlayerHtml);
        document.querySelector("#player-panel .iframe-container").append(playerFrame);
        
        playerFrame.classList.toggle("display-block", true);
        document.querySelector("#player-panel .compiling").classList.toggle("display-flex", false);
        document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", false);
        
        this.compiling = false;
    }
    
    compileFailHandler(stderr)
    {
        const compilerRegex = /:(\d+):(\d+): (fatal error|error|warning): (.*)/gm;
        const linkerRegex   = /wasm-ld: error: pgetinker.o: (.*): (.*)/gm;
        
        let markers = [];
        
        let matches;
    
        while((matches = compilerRegex.exec(stderr)) !== null)
        {
            markers.push({
                message: matches[4],
                severity: (matches[3] === "warning") ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
                startLineNumber: parseInt(matches[1]),
                startColumn: parseInt(matches[2]),
                endLineNumber: parseInt(matches[1]),
                endColumn: this.monacoModel.getLineLength(parseInt(matches[1])),
                source: "Emscripten Compiler",
            });
        }
        
        while((matches = linkerRegex.exec(stderr)) !== null)
        {
            markers.push({
                message: `${matches[1]} ${matches[2]}`,
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 1,
                endColumn: this.monacoModel.getLineLength(1),
                source: "Emscripten Linker",
            });
        }
    
        // show errors in the editor, if they exist
        if(markers.length > 0)
        {
            monaco.editor.setModelMarkers(this.monacoModel, "owner", markers);
            this.monacoEditor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
            setTimeout(() => { this.monacoEditor.trigger("", "editor.action.marker.next"); }, 50);
        }
    
        document.querySelector("#player-panel .compiling").classList.toggle("display-flex", false);
        document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", true);
        this.compiling = false;
    }
    
    SetupLayout()
    {
        this.layout = new GoldenLayout(this.layoutConfig, document.querySelector("#content"))
    
        this.layout.registerComponent('consoleComponent', function(container)
        {
            container.getElement().html(`
                <div id="console-panel">
                </div>
            `);
        });

        this.layout.registerComponent('infoComponent', function(container)
        {
            container.getElement().html(`
                <div id="info-panel">
                </div>
            `);
        });

        this.layout.registerComponent('playerComponent', function(container)
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
        
        this.layout.registerComponent('editorComponent', function(container)
        {
            container.getElement().html(`
                <div id="editor-panel">
                    <div class="code-editor"></div>
                    <div class="status">Loading</div>
                </div>
            `);
        });
        
        this.layout.on("stateChanged", () =>
        {
            if(this.layoutInitialized)
                window.localStorage.setItem("pgetinkerLayout", JSON.stringify(this.layout.toConfig()));
        });
        
        this.layout.on("initialised", () =>
        {
            this.layoutInitialized = true;
            window.addEventListener("resize", (event) => this.layout.updateSize());
            
            if(this.monacoModel === null)
            {
                this.monacoModel = monaco.editor.createModel("", "cpp", monaco.Uri.parse("inmemory://pgetinker.cpp"));
    
                let codeBox = document.querySelector("#code");
                if(codeBox.value !== "")
                {
                    this.monacoModel.setValue(document.querySelector("#code").value);
                    window.localStorage.setItem("pgetinkerCode", JSON.stringify(document.querySelector("#code").value));
                }
                else
                {
                    let code = window.localStorage.getItem("pgetinkerCode");
                    code = (code !== null) ? JSON.parse(code) : "";
        
                    if(code === "")
                    {
                        axios.get("/api/default-code").then((response) =>
                        {
                            this.monacoModel.setValue(response.data.code);
                        }).catch((reason) => console.log(reason));
                    }
                    else
                    {
                        this.monacoModel.setValue(code);
                    }
                }
            }
    
            if(this.monacoModelIntellisense === null)
            {
                this.monacoModelIntellisense = monaco.editor.createModel("", "cpp", monaco.Uri.parse("inmemory://pgetinker.h"));
                axios.get("/api/model/v0.01").then((response) =>
                {
                    this.monacoModelIntellisense.setValue(response.data);
                });
            }
            
            this.monacoEditor = monaco.editor.create(document.querySelector('#editor-panel .code-editor'), {
                automaticLayout: true,
                model: this.monacoModel,
                theme: `vs-${this.theme}`,
            });
    
            this.monacoEditor.addAction({
                id: 'build-and-run',
                label: 'Build and Run',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                run: () =>
                {
                    document.querySelector("#compile").dispatchEvent(new Event("click"));
                }
            });
    
            this.monacoEditor.onDidChangeCursorPosition(() => this.UpdateStatusBar());
            
            this.monacoEditor.onDidChangeModelContent(() =>
            {
                window.localStorage.setItem("pgetinkerCode", JSON.stringify(this.monacoEditor.getValue()));
                
                if(this.sharedFlag)
                {
                    window.history.replaceState({}, "", "/");
                }
            });
            
            if(this.lastPlayerHtml != "")
            {
                document.querySelector("#player-panel .iframe-container iframe").srcdoc = this.lastPlayerHtml;
                document.querySelector("#player-panel .iframe-container iframe").classList.toggle("display-block", true);
            }
            
            this.UpdateStatusBar();
            this.UpdateTheme();
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
    
    UpdateStatusBar()
    {
        let statusBar = document.querySelector("#editor-panel .status");
    
        let cursor = `Ln ${this.monacoEditor.getPosition().lineNumber}, Col ${this.monacoEditor.getPosition().column}`;
        let fileSize = `${new Intl.NumberFormat().format(this.monacoEditor.getValue().length)} / ${new Intl.NumberFormat().format(this.maxFileSize)}`;
        
        statusBar.classList.toggle('too-fucking-big', false);
        if(this.monacoModel.getValueLength() > this.maxFileSize)
        {
            statusBar.classList.toggle('too-fucking-big', true);
            fileSize += " EXCEEDING MAXIMUM!";
        }
            
        statusBar.innerHTML = `
            <div class="status-left">
                Bytes: <span>${fileSize}</span>
            </div>
            <div class="status-right">
                <span>${cursor}</span>
            </div>
        `;
    }

    UpdateTheme()
    {
        // update overall theme
        document.body.className = this.theme;
    
        // update golden layout theme
        let goldenLayoutDarkThemeStyle = document.querySelector("#goldenlayout-dark-theme");
        let goldenLayoutLightThemeStyle = document.querySelector("#goldenlayout-light-theme");
    
        if(this.theme === "dark")
        {
            goldenLayoutDarkThemeStyle.disabled = false;
            goldenLayoutLightThemeStyle.disabled = true;
        }
    
        if(this.theme === "light")
        {
            goldenLayoutDarkThemeStyle.disabled = true;
            goldenLayoutLightThemeStyle.disabled = false;
        }
    
        // update editor theme
        if(this.monacoEditor !== null)
            this.monacoEditor.updateOptions({ theme: `vs-${this.theme}`});
    
        // update player theme
        let playerFrame = document.querySelector("#player-panel iframe");
        if(playerFrame != null)
        {
            document.querySelector("#player-panel iframe").contentWindow.postMessage({
                message: "set-theme",
                theme: this.theme
            }, "*");
        }
    
        // save theme into localStorage
        window.localStorage.setItem("pgetinkerTheme", this.theme);
    }
}

new PGEtinker();
