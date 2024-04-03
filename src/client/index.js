import "./lib/monaco"
import "./lib/goldenLayout";

import goldenLayoutDarkTheme from "golden-layout/src/css/goldenlayout-dark-theme.css?raw";
import goldenLayoutLightTheme from "golden-layout/src/css/goldenlayout-light-theme.css?raw";

class App
{
    editor;
    model;
    layout;
    layoutConfig;
    layoutConfigDefault;
    playerLastHtml;
    self;
    theme;
    ui;

    constructor()
    {
        // because stupidity
        self = this;
        
        // initialize the default layout configuration
        this.layoutConfigDefault = {
            settings: {
                showPopoutIcon: false,
            },
            content: [{
                type: 'row',
                content:[{
                    type: 'component',
                    componentName: 'editorComponent',
                    componentState: function() { return self; },
                    isClosable: false,
                    title: 'C++ Editor',
                },{
                    type: 'component',
                    componentName: 'playerComponent',
                    componentState: function() { return self; },
                    isClosable: false,
                    title: 'Emscripten Player',
                }]
            }]
        };
        
        this.layoutConfig = this.layoutConfigDefault;

        this.playerLastHtml = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Player Frame | PGEtinker</title>
                    <style>
                html,
                body {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    background: #333;
                    color: #fff;
                }
                #app {
                    width: 100%;
                    height: 100%;
                    padding: 1rem;
                }
                .light {
                    background: #fff;
                    color: #000;
                }
                    </style>
                </head>
                <body>
                    <div id="app">    
                        <h1>PGEtinker</h1>
                        <p>Welcome! Play with the code, push buttons</p>
                    </div>
                </body>
                </html>
            `;

        this.SetupLayout();
        
        this.SetTheme("dark");
    }
    
    SetupUI()
    {
    
    }

    SetupLayout()
    {
        this.layout = new GoldenLayout(this.layoutConfig, document.querySelector("#content"));

        this.layout.registerComponent('playerComponent', function(container, state)
        {
            container.getElement().html(`
                <div id="player-panel">
                    <iframe src="/player.html"></iframe>
                    <div></div>
                </div>
            `);
        });
        
        this.layout.registerComponent('editorComponent', function (container, state)
        {
            container.getElement().html(`
                <div id="editor-panel">
                    <div class="menu">
                        <ul class="editor-menu">
                            <li><button type="button" id="default-code">Default Code</button></li>
                            <li class="separator"></li>
                            <li><button type="button" id="toggle-theme">Toggle Theme</button></li>
                            <li><button type="button" id="default-layout">Default Layout</button></li>
                        </ul>
                        <ul class="build-menu">
                            <li><button type="button" id="share">Share</button></li>
                            <li><button type="button" id="compile">Build &amp; Run</button></li>
                        </ul>
                    </div>
                    <div class="code-editor"></div>
                    <div class="status">Loading</div>
                </div>`
            );
            
            container.on("resize", () =>
            {
                if(typeof state.editor === "undefined")
                    return;
        
                state.editor.layout();
            });
        });

        this.layout.on("initialised", () =>
        {
            window.addEventListener("resize", (e) =>
            {
                this.layout.updateSize();
            });

            if(typeof this.model === "undefined")
                this.model = monaco.editor.createModel("", "cpp", monaco.Uri.parse("inmemory://pgetinker"));

            this.editor = monaco.editor.create(document.querySelector('#editor-panel .code-editor'), {
                automaticLayout: true,
                model: this.model,
                theme: `vs-${this.theme}`
            });

            let elem_DefaultCodeButton = document.querySelector("#default-code");
            elem_DefaultCodeButton.addEventListener("click", (event) =>
            {
                event.preventDefault();
                
                fetch("/example.cpp").then((response) => {
                    return response.text();
                }).then((text) => {
                    this.model.setValue(text);
                });
            });

            let elem_ToggleThemeButton = document.querySelector("#toggle-theme");
            elem_ToggleThemeButton.addEventListener("click", (event) =>
            {
                event.preventDefault();
                this.ToggleTheme();
            });
            
            let elem_DefaultLayoutButton = document.querySelector("#default-layout");
            elem_DefaultLayoutButton.addEventListener("click", (event) =>
            {
                event.preventDefault();
                // alert("TODO: " + event.target.innerHTML);
                this.RestoreDefaultLayout();
            });
            
            let elem_ShareButton = document.querySelector("#share");
            elem_ShareButton.addEventListener("click", (event) =>
            {
                event.preventDefault();
                alert("TODO: " + event.target.innerHTML);
            });
            
            let elem_CompileButton = document.querySelector("#compile");
            elem_CompileButton.addEventListener("click", (event) =>
            {
                event.preventDefault();
                this.Compile();
            });
            
            document.querySelector('#player-panel iframe').srcdoc = this.playerLastHtml;
        });
        
        this.layout.init();
    }
    
    RestoreDefaultLayout()
    {
        this.layout.destroy();
        this.layoutConfig = this.layoutConfigDefault;
        this.SetupLayout();
    }

    ToggleTheme()
    {
        if(this.theme === "dark")
            this.SetTheme("light");
        else
            this.SetTheme("dark");
    }

    SetTheme(theme)
    {
        if(typeof theme === "undefined")
            return;
        
        if(theme === "dark")
        {
            this.theme = "dark";
            document.querySelector("#goldenlayout-theme").innerHTML = goldenLayoutDarkTheme;
        }
            
        if(theme === "light")
        {
            this.theme = "light";
            document.querySelector("#goldenlayout-theme").innerHTML = goldenLayoutLightTheme;
        }
            
        if(typeof this.editor !== "undefined")
            this.editor.updateOptions({ theme: `vs-${this.theme}`});

        document.querySelector("body").className = this.theme;
        document.querySelector("#player-panel iframe").contentWindow.document.body.className = this.theme;
    }

    Compile()
    {
        monaco.editor.removeAllMarkers("owner");
    
        fetch("/api/compile", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({code: this.editor.getValue() }),
        }).then((response) =>
        {
            return response.json();
        }).then((result) =>
        {
            if(result.stderr)
            {
                const regex = new RegExp(':(\\d+):(\\d+): (error|warning): (.*)', 'gm')
                
                let markers = [];
                
                let matches;
        
                while((matches = regex.exec(result.stderr)) !== null)
                {
                    markers.push({
                        message: matches[4],
                        severity: (matches[3] === "warning") ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
                        startLineNumber: parseInt(matches[1]),
                        startColumn: parseInt(matches[2]),
                        endLineNumber: parseInt(matches[1]),
                        endColumn: this.model.getLineLength(parseInt(matches[1])),
                        source: "Emscripten",
                    });            
                }
                
                monaco.editor.setModelMarkers(this.model, "owner", markers);
                return;
            }

            self.playerLastHtml = result.html;
            document.querySelector('#player-panel iframe').srcdoc = self.playerLastHtml;
    
        }).catch((error) =>
        {
            console.log("Awwww fuck!");
        })
    }
}

new App();
