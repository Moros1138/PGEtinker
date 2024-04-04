import "./lib/monaco"
import "./lib/goldenLayout";

import goldenLayoutDarkTheme from "golden-layout/src/css/goldenlayout-dark-theme.css?raw";
import goldenLayoutLightTheme from "golden-layout/src/css/goldenlayout-light-theme.css?raw";
import editorPanelTemplate from "./templates/editor-panel.html?raw";
import playerPanelTemplate from "./templates/player-panel.html?raw";

class App
{
    buttons;
    editor;
    model;
    layout;
    layoutConfig;
    layoutConfigDefault;
    playerLastHtml;
    theme;

    constructor()
    {
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
                    componentState: {},
                    isClosable: false,
                    title: 'C++ Editor',
                },{
                    type: 'component',
                    componentName: 'playerComponent',
                    componentState: {},
                    isClosable: false,
                    title: 'Emscripten Player',
                }]
            }]
        };
        
        this.layoutConfig = ((window.localStorage.getItem("pgetinkerLayout") !== null) ? JSON.parse(window.localStorage.getItem("pgetinkerLayout")) : this.layoutConfigDefault);
        
        this.buttons = [{
            element: () => { return document.querySelector("#default-code"); },
            callback: (event) =>
            {
                event.preventDefault();
            
                fetch("/example.cpp").then((response) => {
                    return response.text();
                }).then((text) => {
                    this.model.setValue(text);
                    this.CloseMarkers();
                });
            },
        },{
            element: () => { return document.querySelector("#toggle-theme"); },
            callback: (event) =>
            {
                event.preventDefault();
                this.ToggleTheme();
            }
        },{
            element: () => { return document.querySelector("#default-layout"); },
            callback: (event) =>
            {
                event.preventDefault();
                this.RestoreDefaultLayout();
            }
        },{
            element: () => { return document.querySelector("#share"); },
            callback: (event) =>
            {
                event.preventDefault();
                this.Share();
            }
        },{
            element: () => { return document.querySelector("#compile"); },
            callback: (event) =>
            {
                event.preventDefault();
                this.Compile();
            }
        }];

        this.playerLastHtml = playerPanelTemplate;

        this.SetupLayout();
        
        let theme = ((window.localStorage.getItem("pgetinkerTheme") !== null) ? window.localStorage.getItem("pgetinkerTheme") : "dark");
        theme = (theme === "dark" || theme === "light") ? theme : "dark";
        
        this.SetTheme(theme);
    }

    SetupLayout()
    {

        function EditorComponent(container, state)
        {
            container.getElement().html(editorPanelTemplate);
        }
        
        function PlayerComponent(container, state)
        {
            container.getElement().html(`<div id="player-panel"><iframe src="/player.html"></iframe><div></div></div>`);
        }


        this.layout = new GoldenLayout(this.layoutConfig, document.querySelector("#content"));

        this.layout.registerComponent('editorComponent', EditorComponent);
        this.layout.registerComponent('playerComponent', PlayerComponent);
        
        this.layout.on("stateChanged", () =>
        {
            console.log("TESTING 1234");
            window.localStorage.setItem("pgetinkerLayout", JSON.stringify(this.layout.toConfig()));
        });

        this.layout.on("initialised", () =>
        {
            window.addEventListener("resize", (e) =>
            {
                this.layout.updateSize();
            });

            if(typeof this.model === "undefined")
            {
                this.model = monaco.editor.createModel("", "cpp", monaco.Uri.parse("inmemory://pgetinker"));
                this.model.setValue("This is a test");
            }

            this.editor = monaco.editor.create(document.querySelector('#editor-panel .code-editor'), {
                automaticLayout: true,
                model: this.model,
                theme: `vs-${this.theme}`
            });
            
            
            this.editor.onDidChangeModelContent(() =>
            {
                window.localStorage.setItem("pgetinkerCode", JSON.stringify(this.editor.getValue()));
            });

            for(let i = 0; i < this.buttons.length; i++)
            {
                this.buttons[i].element().addEventListener("click", this.buttons[i].callback);
            }
            
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
        
        let interval = setInterval(() =>
        {
            if(typeof document.querySelector("#player-panel iframe").contentWindow.document.body.className === "undefined")
                return;
            
            document.querySelector("#player-panel iframe").contentWindow.document.body.className = this.theme;
            clearInterval(interval);
        }, 50);
        
        window.localStorage.setItem("pgetinkerTheme", this.theme);
    }

    BeforeCompile()
    {
        this.playerLastHtml = playerPanelTemplate;
        document.querySelector('#player-panel iframe').srcdoc = this.playerLastHtml;
    
        monaco.editor.removeAllMarkers("owner");
        this.editor.trigger("", "closeMarkersNavigation");
    }

    Compile()
    {
        this.BeforeCompile();

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
                
                // show errors in the editor
                monaco.editor.setModelMarkers(this.model, "owner", markers);
                this.editor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
                
                setTimeout(() => { this.editor.trigger("", "editor.action.marker.next"); }, 50);
                
                return;
            }

            this.playerLastHtml = result.html;
            document.querySelector('#player-panel iframe').srcdoc = this.playerLastHtml;
    
        }).catch((error) =>
        {
            console.log("Awwww fuck!", error);
        })
    }

    Share()
    {
        this.BeforeCompile();

        fetch("/api/share", {
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
                
                // show errors in the editor
                monaco.editor.setModelMarkers(this.model, "owner", markers);
                this.editor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
                
                setTimeout(() => { this.editor.trigger("", "editor.action.marker.next"); }, 50);
                
                return;
            }
            
            alert("TODO: Share Stuff!");
            this.playerLastHtml = result.html;
            document.querySelector('#player-panel iframe').srcdoc = this.playerLastHtml;
    
        }).catch((error) =>
        {
            console.log("Awwww fuck!", error);
        })
    }
}

new App();
