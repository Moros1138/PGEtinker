import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
    getWorker: function (workerId, label)
    {
        return editorWorker();
    }
};
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true
});

export default class EditorPanel
{
    state;
    
    monacoEditor = null;
    monacoModel  = null;
    monacoModelIntellisense = null;

    maxFileSize = 50000;
    
    sharedFlag = false;

    constructor(state)
    {
        this.state = state;
        this.sharedFlag = (window.location.pathname.indexOf("/s/") === 0);
        console.log("Editor panel", "constructor");
    }
    
    clearMarkers()
    {
        monaco.editor.removeAllMarkers("owner");
        this.monacoEditor.trigger("", "closeMarkersNavigation");
    }

    exceedsMaxSize()
    {
        return this.monacoEditor.getValue().length > this.maxFileSize;
    }
    
    extractAndSetMarkers(data)
    {
        const compilerRegex = /pgetinker.cpp:(\d+):(\d+): (fatal error|error|warning|note): (.*)/gm;
        const linkerRegex   = /wasm-ld: error: pgetinker.o: (.*): (.*)/gm;
        
        let markers = [];
        
        let matches;
        
        while((matches = compilerRegex.exec(data)) !== null)
        {
            let severity = monaco.MarkerSeverity.Error;
            
            if(matches[3] == "warning")
                severity = monaco.MarkerSeverity.Warning;
            
            if(matches[3] == "note")
                severity = monaco.MarkerSeverity.Info;

            markers.push({
                message: matches[4],
                severity: severity,
                startLineNumber: parseInt(matches[1]),
                startColumn: parseInt(matches[2]),
                endLineNumber: parseInt(matches[1]),
                endColumn: this.monacoModel.getLineLength(parseInt(matches[1])),
                source: "Emscripten Compiler",
            });
        }
        
        while((matches = linkerRegex.exec(data)) !== null)
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
            this.setMarkers(markers);
        }
    }

    getValue()
    {
        return this.monacoEditor.getValue();
    }
    setValue(value)
    {
        this.monacoModel.setValue(value);

    }
    onInit()
    {
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
            axios.get("/api/model/v0.02").then((response) =>
            {
                this.monacoModelIntellisense.setValue(response.data);
            });
        }
        
        this.monacoEditor = monaco.editor.create(document.querySelector('#editor-panel .code-editor'), {
            automaticLayout: true,
            model: this.monacoModel,
            fontSize: 14,
            mouseWheelZoom: true,
            theme: `vs-${this.state.theme}`,
        });

        this.monacoEditor.addAction({
            id: 'build-and-run',
            label: 'Build and Run',
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
            ],
            run: () =>
            {
                document.querySelector("#compile").dispatchEvent(new Event("click"));
            }
        });

        this.monacoEditor.addAction({
            id: 'reset-editor-zoom',
            label: 'Reset Editor Zoom',
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0,
            ],
            run: () =>
            {
                this.monacoEditor.trigger("", "editor.action.fontZoomReset");
            }
        })

        this.monacoEditor.onDidChangeCursorPosition(() => this.updateStatusBar());
    
        this.monacoEditor.onDidChangeModelContent(() =>
        {
            window.localStorage.setItem("pgetinkerCode", JSON.stringify(this.monacoEditor.getValue()));
            
            if(this.sharedFlag)
            {
                window.history.replaceState({}, "", "/");
            }
        });
        
        this.updateStatusBar();
    }

    register()
    {
        this.state.layout.registerComponent('editorComponent', function(container)
        {
            container.getElement().html(`
                <div id="editor-panel">
                    <div class="code-editor"></div>
                    <div class="status">Loading</div>
                </div>
            `);
        });
    }
    
    reveal(position)
    {
        this.monacoEditor.revealPositionInCenter(position);
    }

    setMarkers(markers)
    {
        // set model markers
        monaco.editor.setModelMarkers(this.monacoModel, "owner", markers);
        // move to first marker
        this.monacoEditor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
        // trigger activate nearest marker
        setTimeout(() => { this.monacoEditor.trigger("", "editor.action.marker.next"); }, 50);
    }

    setTheme(theme)
    {
        if(this.monacoEditor !== null)
            this.monacoEditor.updateOptions({ theme: `vs-${theme}`});
    }

    updateStatusBar()
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

}