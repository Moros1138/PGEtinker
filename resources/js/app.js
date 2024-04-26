import './lib/bootstrap';
import './lib/goldenLayout';
import './lib/monaco';
import './lib/lucide';
import version from "./lib/version";
import agreeDialog from './lib/agreeDialog';
import shareDialog from './lib/shareDialog';

let sharedFlag = (window.location.pathname.indexOf("/s/") === 0);

let lastPlayerHtml = "";

let layout = null;
let layoutInitialized = false;
let compiling = false;

let layoutDefaultConfig = {
    settings: {
        showPopoutIcon: false,
    },
    content: [{
        type: 'row',
        content:[{
            type: 'component',
            componentName: 'editorComponent',
            componentState: {},
            isClosable: false,
            title: 'C++ Editor',
        },{
            type: 'component',
            componentName: 'playerComponent',
            componentState: {},
            isClosable: false,
            title: 'Emscripten Player',
        }],
    }],
};

let layoutConfig = window.localStorage.getItem("pgetinkerLayout");
layoutConfig = (layoutConfig !== null) ? JSON.parse(layoutConfig) : layoutDefaultConfig;

let maxFileSize = 50000;

let theme = window.localStorage.getItem("pgetinkerTheme");
if(theme !== "dark" && theme !== "light")
    theme = "dark";

let consoleShown = window.localStorage.getItem("pgetinkerConsoleShown");
consoleShown = (consoleShown === "true") ? true : false;

let monacoEditor = null;
let monacoModel  = null;
let monacoModelIntellisense = null;

function preCompile()
{
    if(monacoEditor.getValue().length > maxFileSize)
    {
        alert("Maximum size exceeded!");
        return false;
    }
    
    compiling = true;

    lastPlayerHtml = "";
    let playerFrame = document.querySelector("#player-panel iframe");
    
    if(playerFrame != null)
        playerFrame.remove();
    
    document.querySelector("#player-panel .compiling").classList.toggle("display-flex", true);
    document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", false);
    
    monaco.editor.removeAllMarkers("owner");
    monacoEditor.trigger("", "closeMarkersNavigation");

    return true;
}

function compileSuccessHandler(data)
{
    lastPlayerHtml = data.html;
    
    let playerFrame = document.createElement('iframe');
    playerFrame.setAttribute("srcdoc", lastPlayerHtml);
    document.querySelector("#player-panel .iframe-container").append(playerFrame);
    
    playerFrame.classList.toggle("display-block", true);
    document.querySelector("#player-panel .compiling").classList.toggle("display-flex", false);
    document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", false);
    
    compiling = false;
}

function compileFailHandler(stderr)
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
            endColumn: monacoModel.getLineLength(parseInt(matches[1])),
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
            endColumn: monacoModel.getLineLength(1),
            source: "Emscripten Linker",
        });
    }

    // show errors in the editor, if they exist
    if(markers.length > 0)
    {
        monaco.editor.setModelMarkers(monacoModel, "owner", markers);
        monacoEditor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
        setTimeout(() => { monacoEditor.trigger("", "editor.action.marker.next"); }, 50);
    }

    document.querySelector("#player-panel .compiling").classList.toggle("display-flex", false);
    document.querySelector("#player-panel .compiling-failed").classList.toggle("display-flex", true);
    compiling = false;
}

function SetupLayout()
{
    layout = new GoldenLayout(layoutConfig, document.querySelector("#content"))

    layout.registerComponent('playerComponent', function(container)
    {   
        container.getElement().html(`
            <div id="player-panel">
                <div class="iframe-container">
                    <iframe sandbox="allow-scripts" srcdoc=""></iframe>
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
    
    layout.registerComponent('editorComponent', function(container)
    {
        container.getElement().html(`
            <div id="editor-panel">
                <div class="code-editor"></div>
                <div class="status">Loading</div>
            </div>
        `);
    });
    
    layout.on("stateChanged", () =>
    {
        if(layoutInitialized)
            window.localStorage.setItem("pgetinkerLayout", JSON.stringify(layout.toConfig()));
    });
    
    layout.on("initialised", () =>
    {
        layoutInitialized = true;
        window.addEventListener("resize", (event) => layout.updateSize());

        if(monacoModel === null)
        {
            monacoModel = monaco.editor.createModel("", "cpp", monaco.Uri.parse("inmemory://pgetinker.cpp"));

            let codeBox = document.querySelector("#code");
            if(codeBox.value !== "")
            {
                monacoModel.setValue(document.querySelector("#code").value);
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
                        monacoModel.setValue(response.data.code);
                    }).catch((reason) => console.log(reason));
                }
                else
                {
                    monacoModel.setValue(code);
                }
            }
        }

        if(monacoModelIntellisense === null)
        {
            monacoModelIntellisense = monaco.editor.createModel("", "cpp", monaco.Uri.parse("inmemory://pgetinker.h"));
            axios.get("/api/model/v0.01").then((response) =>
            {
                monacoModelIntellisense.setValue(response.data);
            });
        }
        
        monacoEditor = monaco.editor.create(document.querySelector('#editor-panel .code-editor'), {
            automaticLayout: true,
            model: monacoModel,
            theme: `vs-${theme}`,
        });

        monacoEditor.addAction({
            id: 'build-and-run',
            label: 'Build and Run',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () =>
            {
                document.querySelector("#compile").dispatchEvent(new Event("click"));
            }
        });

        monacoEditor.onDidChangeCursorPosition(() => UpdateStatusBar());
        
        monacoEditor.onDidChangeModelContent(() =>
        {
            window.localStorage.setItem("pgetinkerCode", JSON.stringify(monacoEditor.getValue()));
            
            if(sharedFlag)
            {
                window.history.replaceState({}, "", "/");
            }
        });
        
        UpdateStatusBar();
        
        document.querySelector("#player-panel iframe").setAttribute("srcdoc", lastPlayerHtml);

        // Default Code Button
        document.querySelector("#default-code").addEventListener("click", (event) =>
        {
            event.preventDefault();

            axios.get("/api/default-code").then((response) =>
            {
                monacoModel.setValue(response.data.code);
            }).catch((reason) => console.log(reason));
        });
        
        // Toggle Theme Button
        document.querySelector("#toggle-theme").addEventListener("click", (event) =>
        {
            event.preventDefault();

            if(theme === "dark")
                theme = "light";
            else
                theme = "dark";
                
            UpdateTheme();
        });

        // Default Layout
        document.querySelector("#default-layout").addEventListener("click", (event) => 
        {
            event.preventDefault();

            layout.destroy();
            layoutConfig = layoutDefaultConfig;
            
            SetupLayout();
        });
        
        // Toggle Console Button
        document.querySelector("#toggle-console").addEventListener("click", (event) => 
        {
            event.preventDefault();
            
            consoleShown = !consoleShown;
            window.localStorage.setItem("pgetinkerConsoleShown", consoleShown);

            document.querySelector("#player-panel iframe").contentWindow.postMessage({
                message: "toggle-console",
            }, "*");   
        });

        // Download Button
        document.querySelector("#download").addEventListener("click", (event) => 
        {
            event.preventDefault();
            
            if(!lastPlayerHtml.includes("Emscripten-Generated Code"))
            {
                alert("You have to build the code before you can download!")
                return;
            }
            
            const a = document.createElement('a');
            
            // create the data url
            a.href = `data:text/html;base64,${btoa(lastPlayerHtml)}`;
            a.download = "pgetinker.html";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
        
        // Share Button
        document.querySelector("#share").addEventListener("click", (event) => 
        {
            event.preventDefault();

            if(compiling)
                return;

            if(!preCompile())
                return;

            axios.post("/api/share", {
                code: monacoEditor.getValue()
            }).then((response) =>
            {
                shareDialog(response.data.shareURL)
                    .finally(() =>
                    {
                        compileSuccessHandler(response.data);
                    });
            
            }).catch((error) =>
            {
                if(error.response)
                {
                    if(error.response.status)
                    {
                        if(error.response.status == 503)
                        {
                            compileFailHandler("pgetinker.cpp:1:1: error: PGEtinker service has gone offline. try again later.\n");
                            return;
                        }
                    }

                    if(error.response.data.stderr)
                    {
                        compileFailHandler(error.response.data.stderr);
                        return;
                    }
                }
                compileFailHandler("pgetinker.cpp:1:1: error: compilation failed in a way that's not being handled. please make a bug report.\n");
            });
        });

        // Compile Button
        document.querySelector("#compile").addEventListener("click", (event) => 
        {
            event.preventDefault();

            if(compiling)
                return;

            if(!preCompile())
                return;
            
            axios.post("/api/compile", {
                code: monacoEditor.getValue()
            }).then((response) =>
            {
                compileSuccessHandler(response.data);
            }).catch((error) =>
            {
                
                if(error.response)
                {
                    if(error.response.status)
                    {
                        if(error.response.status == 503)
                        {
                            compileFailHandler("pgetinker.cpp:1:1: error: PGEtinker service has gone offline. try again later.\n");
                            return;
                        }
                    }
                    
                    if(error.response.data.stderr)
                    {
                        compileFailHandler(error.response.data.stderr);
                        return;
                    }
                }
                compileFailHandler("pgetinker.cpp:1:1: error: compilation failed in a way that's not being handled. please make a bug report.\n");
            });
        });
        
        document.querySelector("#supporters").addEventListener("click", (event) =>
        {
            event.preventDefault();
            alert("Not Implemented");
        });
        
        UpdateTheme();
    });

    layout.init();
}

function UpdateTheme()
{
    // update overall theme
    document.body.className = theme;

    // update golden layout theme
    let goldenLayoutDarkThemeStyle = document.querySelector("#goldenlayout-dark-theme");
    let goldenLayoutLightThemeStyle = document.querySelector("#goldenlayout-light-theme");

    if(theme === "dark")
    {
        goldenLayoutDarkThemeStyle.disabled = false;
        goldenLayoutLightThemeStyle.disabled = true;
    }

    if(theme === "light")
    {
        goldenLayoutDarkThemeStyle.disabled = true;
        goldenLayoutLightThemeStyle.disabled = false;
    }

    // update editor theme
    if(monacoEditor !== null)
        monacoEditor.updateOptions({ theme: `vs-${theme}`});

    // update player theme
    document.querySelector("#player-panel iframe").contentWindow.postMessage({
        message: "set-theme",
        theme: theme
    }, "*");

    // save theme into localStorage
    window.localStorage.setItem("pgetinkerTheme", theme);
}

function UpdateStatusBar()
{
    let statusBar = document.querySelector("#editor-panel .status");

    let cursor = `Ln ${monacoEditor.getPosition().lineNumber}, Col ${monacoEditor.getPosition().column}`;
    let fileSize = `${new Intl.NumberFormat().format(monacoEditor.getValue().length)} / ${new Intl.NumberFormat().format(maxFileSize)}`;
    
    statusBar.classList.toggle('too-fucking-big', false);
    if(monacoModel.getValueLength() > maxFileSize)
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
            theme: theme
        }, "*");

        // update player theme
        document.querySelector("#player-panel iframe").contentWindow.postMessage({
            message: "show-console",
            value: consoleShown
        }, "*");
    }
});

let pgetinkerVersion = window.localStorage.getItem("pgetinkerVersion");
pgetinkerVersion = (pgetinkerVersion != "string") ? pgetinkerVersion : "";

console.log((version != pgetinkerVersion));

let agreedToTerms = window.localStorage.getItem("pgetinkerAgreedToTerms");
agreedToTerms = (agreedToTerms == null) ? false : JSON.parse(agreedToTerms);

if(!agreedToTerms)
{
    agreeDialog()
        .then(() =>
        {
            SetupLayout();
            window.localStorage.setItem("pgetinkerAgreedToTerms", JSON.stringify(true));
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
    SetupLayout();
}
    
