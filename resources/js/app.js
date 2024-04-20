import './lib/bootstrap';
import './lib/goldenLayout';
import './lib/monaco';

let sharedFlag = (window.location.pathname.indexOf("/s/") === 0);

let lastPlayerHtml = "";

let layout = null;

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

let monacoEditor = null;
let monacoModel  = null;

function SetupLayout()
{
    layout = new GoldenLayout(layoutConfig, document.querySelector("#content"))

    layout.registerComponent('playerComponent', function(container)
    {   
        container.getElement().html(`
            <div id="player-panel">
                <iframe sandbox="allow-scripts" srcdoc=""></iframe>
                <div></div>
            </div>
        `);
    });        
    
    layout.registerComponent('editorComponent', function(container)
    {
        container.getElement().html(`
            <div id="editor-panel">
                <div class="menu">
                    <ul class="editor-menu">
                        <li><button type="button" id="default-code">Default Code</button></li>
                        <li class="separator"></li>
                        <li><button type="button" id="toggle-theme">Toggle Theme</button></li>
                        <li><button type="button" id="default-layout">Default Layout</button></li>
                        <li><button type="button" id="toggle-console">Toggle Console</button></li>
                    </ul>
                    <ul class="build-menu">
                        <li><button type="button" id="download">Download HTML</button></li>
                        <li><button type="button" id="share">Share</button></li>
                        <li><button type="button" id="compile">Build &amp; Run</button></li>
                    </ul>
                </div>
                <div class="code-editor"></div>
                <div class="status">Loading</div>
            </div>
        `);
    });
    
    layout.on("stateChanged", () =>
    {
        window.localStorage.setItem("pgetinkerLayout", JSON.stringify(layout.toConfig()));
    });
    
    layout.on("initialised", () =>
    {
        window.addEventListener("resize", (event) => layout.updateSize());

        if(monacoModel === null)
        {
            monacoModel = monaco.editor.createModel("", "cpp", monaco.Uri.parse("inmemory://pgetinker"));

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

        monacoEditor = monaco.editor.create(document.querySelector('#editor-panel .code-editor'), {
            automaticLayout: true,
            model: monacoModel,
            theme: `vs-${theme}`,
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
            
            compiling = true;

            document.querySelector('#player-panel div').className = "compiling";

            lastPlayerHtml = "";
            document.querySelector("#player-panel iframe").setAttribute("srcdoc", lastPlayerHtml);
            
            monaco.editor.removeAllMarkers("owner");
            monacoEditor.trigger("", "closeMarkersNavigation");

            axios.post("/api/share", {
                code: monacoEditor.getValue()
            }).then((response) =>
            {
                lastPlayerHtml = response.data.html;
                
                document.querySelector("#player-panel iframe").setAttribute("srcdoc", lastPlayerHtml);

                let shareDialog = document.createElement('div');
                shareDialog.setAttribute("class", "dialog");
                shareDialog.innerHTML = `
                    <div class="window">
                        <div class="header">Share Your Masterpiece!</div>
                        <div class="content">
                            <div class="input-group">
                                <label>Share URL:</label>
                                <input type="text" id="share-url" value="${response.data.shareURL}" readonly>
                                <button type="button">Copy</button>
                            </div>
                        </div>
                    </div>`;
                
                shareDialog.querySelector("button").addEventListener("click", (event) =>
                {
                    navigator.clipboard.writeText(response.data.shareURL).catch((reason) => console.log(reason));
                    shareDialog.remove();
                });

                document.body.appendChild(shareDialog);

                document.querySelector('#player-panel div').className = "";
                compiling = false;
            }).catch((error) =>
            {
                if(error.response)
                {
                    if(error.response.data.stderr)
                    {
                        const regex = new RegExp(':(\\d+):(\\d+): (error|warning): (.*)', 'gm')
                
                        let markers = [];
                        
                        let matches;
                
                        while((matches = regex.exec(error.response.data.stderr)) !== null)
                        {
                            markers.push({
                                message: matches[4],
                                severity: (matches[3] === "warning") ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
                                startLineNumber: parseInt(matches[1]),
                                startColumn: parseInt(matches[2]),
                                endLineNumber: parseInt(matches[1]),
                                endColumn: monacoModel.getLineLength(parseInt(matches[1])),
                                source: "Emscripten",
                            });            
                        }
                        
                        // show errors in the editor
                        monaco.editor.setModelMarkers(monacoModel, "owner", markers);
                        monacoEditor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
                        
                        setTimeout(() => { monacoEditor.trigger("", "editor.action.marker.next"); }, 50);
                        
                        document.querySelector('#player-panel div').className = "fail";
                        compiling = false;
                    }
                }
            });
        });

        // Compile Button
        document.querySelector("#compile").addEventListener("click", (event) => 
        {
            if(compiling)
                return;
            
            compiling = true;

            event.preventDefault();
            lastPlayerHtml = "";
            document.querySelector("#player-panel iframe").setAttribute("srcdoc", lastPlayerHtml);
            
            document.querySelector('#player-panel div').className = "compiling";

            monaco.editor.removeAllMarkers("owner");
            monacoEditor.trigger("", "closeMarkersNavigation");

            axios.post("/api/compile", {
                code: monacoEditor.getValue()
            }).then((response) =>
            {
                lastPlayerHtml = response.data.html;
                document.querySelector("#player-panel iframe").setAttribute("srcdoc", lastPlayerHtml);
                
                document.querySelector('#player-panel div').className = "";
                compiling = false;
            }).catch((error) =>
            {
                if(error.response)
                {
                    if(error.response.data.stderr)
                    {
                        const regex = new RegExp(':(\\d+):(\\d+): (error|warning): (.*)', 'gm')
                
                        let markers = [];
                        
                        let matches;
                
                        while((matches = regex.exec(error.response.data.stderr)) !== null)
                        {
                            markers.push({
                                message: matches[4],
                                severity: (matches[3] === "warning") ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
                                startLineNumber: parseInt(matches[1]),
                                startColumn: parseInt(matches[2]),
                                endLineNumber: parseInt(matches[1]),
                                endColumn: monacoModel.getLineLength(parseInt(matches[1])),
                                source: "Emscripten",
                            });            
                        }
                        
                        // show errors in the editor
                        monaco.editor.setModelMarkers(monacoModel, "owner", markers);
                        monacoEditor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
                        
                        setTimeout(() => { monacoEditor.trigger("", "editor.action.marker.next"); }, 50);
                        document.querySelector('#player-panel div').className = "fail";
                        compiling = false;
                    }
                }
            });
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
    
    statusBar.innerHTML = `
        <div class="status-left">
            <span>${fileSize}</span>
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
    }
});

let agreedToTerms = window.localStorage.getItem("pgetinkerAgreedToTerms");
agreedToTerms = (agreedToTerms == null) ? false : JSON.parse(agreedToTerms);



if(agreedToTerms)
{
    SetupLayout();
}
else
{
    let agreeDialog = document.createElement('div');
    agreeDialog.setAttribute("class", "dialog first-time");
    agreeDialog.innerHTML = `
        <div class="window">
            <div class="header">Welome to PGEtinker!</div>
            <div class="content">
                <h1>Hello and Welcome</h1>
                <p>
                    It would appear to be the first time you've
                    visited this site, at least from this browser.
                    In order for PGEtinker to function we require
                    your permission to do some things.
                </p>
                <h3>Terms, in Plain English</h3>
                <p>
                    You agree that PGEtinker has permission to:
                </p>
                <ul>
                    <li>
                        Store information in your browser to be used within
                        the confines of the PGEtinker online application.
                        It's for stuff like persiting your layout, your
                        theme, and other options so when you come back
                        it's the way you left it.
                    </li>
                    <li>
                        Compile and display the code you provide.
                    </li>    
                    <li>
                        Retain and review the code you have provided
                        for the purposes of diagnosing problems with the
                        PGEtinker online application.
                    </li>    
                    <li>
                        Share your code worldwide. This only applies if you
                        use the "Share" functionality.
                    </li>    
                </ul>
            </div>
            <div class="footer">
                <button type="button" class="cancel">I Disagree</button>
                <button type="button" class="ok">I Agree</button>
            </div>
        </div>`;
    
    agreeDialog.querySelector("button.cancel").addEventListener("click", (event) =>
    {
        window.localStorage.removeItem("pgetinkerCode");
        window.localStorage.removeItem("pgetinkerTheme");
        window.localStorage.removeItem("pgetinkerLayout");
        document.querySelectorAll("*").forEach((elem) => elem.remove());
    });

    agreeDialog.querySelector("button.ok").addEventListener("click", (event) =>
    {
        SetupLayout();

        window.localStorage.setItem("pgetinkerAgreedToTerms", JSON.stringify(true));
        agreeDialog.remove();
    });
    
    document.body.appendChild(agreeDialog);
}

