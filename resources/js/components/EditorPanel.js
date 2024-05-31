




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

        // this.monacoEditor.onDidChangeCursorPosition(() => this.updateStatusBar());
    
        // this.monacoEditor.onDidChangeModelContent(() =>
        // {
        //     window.localStorage.setItem("pgetinkerCode", JSON.stringify(this.monacoEditor.getValue()));
            
        //     if(this.sharedFlag)
        //     {
        //         window.history.replaceState({}, "", "/");
        //     }
        // });
        
        // this.updateStatusBar();
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
        // this.monacoEditor.revealPositionInCenter(position);
    }

    setMarkers(markers)
    {
        // // set model markers
        // monaco.editor.setModelMarkers(this.monacoModel, "owner", markers);
        // // move to first marker
        // this.monacoEditor.setPosition({lineNumber: markers[0].startLineNumber, column: markers[0].startColumn });
        // // trigger activate nearest marker
        // setTimeout(() => { this.monacoEditor.trigger("", "editor.action.marker.next"); }, 50);
    }

    setTheme(theme)
    {
        // if(this.monacoEditor !== null)
        //     this.monacoEditor.updateOptions({ theme: `vs-${theme}`});
    }

    updateStatusBar()
    {
        // let statusBar = document.querySelector("#editor-panel .status");
    
        // let cursor = `Ln ${this.monacoEditor.getPosition().lineNumber}, Col ${this.monacoEditor.getPosition().column}`;
        // let fileSize = `${new Intl.NumberFormat().format(this.monacoEditor.getValue().length)} / ${new Intl.NumberFormat().format(this.maxFileSize)}`;
            
        // statusBar.classList.toggle('too-fucking-big', false);
        // if(this.monacoModel.getValueLength() > this.maxFileSize)
        // {
        //     statusBar.classList.toggle('too-fucking-big', true);
        //     fileSize += " EXCEEDING MAXIMUM!";
        // }
                
        // statusBar.innerHTML = `
        //     <div class="status-left">
        //         Bytes: <span>${fileSize}</span>
        //     </div>
        //     <div class="status-right">
        //         <span>${cursor}</span>
        //     </div>
        // `;
    }

}