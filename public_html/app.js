const unsafeDocument = document;

let monacoEditor;
let monacoModel;
let playerLastHtml = "player.html";
let defaultCode;

async function Compile()
{
    monaco.editor.removeAllMarkers("owner");

    const response = await fetch("/compile", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({code: monacoEditor.getValue() }),
    });
    
    const result = await response.json();
    
    if(result.stderr)
    {
        const regex = new RegExp(':(\\d+):(\\d+): (error|warning): (.*)', 'gm')
        
        let markers = [];
        
        let matches;

        while((matches = regex.exec(result.stderr)) !== null)
        {
            const range = {
                startLineNumber: parseInt(matches[1]),
                startColumn: parseInt(matches[2]),
                endLineNumber: parseInt(matches[1]),
                endColumn: monacoModel.getLineLength(parseInt(matches[1])),
            };
    
			markers.push({
				message: matches[4],
				severity: (matches[3] === "warning") ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Error,
				startLineNumber: range.startLineNumber,
				startColumn: range.startColumn,
				endLineNumber: range.endLineNumber,
				endColumn: range.endColumn,
			});            
        }
        
        monaco.editor.setModelMarkers(monacoModel, "owner", markers);
        return;
    }
    
    playerLastHtml = result.html;
    document.querySelector('#player-panel iframe').setAttribute("srcdoc", result.html);
}

let config = {
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

var myLayout = new GoldenLayout( config, document.querySelector('#content') );

myLayout.registerComponent( 'playerComponent', function( container, componentState ){
    container.getElement().html(`
        <div id="player-panel">
            <iframe src="${playerLastHtml}"></iframe
            <div></div>
        </div>
    `);
});

myLayout.registerComponent( 'editorComponent', function( container, componentState ){
    
    container.on('resize', () =>
    {
        if(typeof editor === 'undefined')
            return;

        editor.layout();
    });

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
                    <li><button type="button" id="test-dialog">Test Dialog</button></li>
                    <li><button type="button" id="share">Share</button></li>
                    <li><button type="button" id="compile">Build &amp; Run</button></li>
                </ul>
            </div>
            <div class="code-editor"></div>
            <div class="status">Loading</div>
        </div>`
    );
    
});

myLayout.on('initialised', () => {
    window.addEventListener('resize', (e) =>
    {
        myLayout.updateSize();
    });
});

myLayout.init();

// button handling, using this method in order to account for DOM changes
document.addEventListener('click', (e) =>
{
    const id = e.target.closest(`button`) && e.target.closest(`button`).getAttribute('id');
    
    if(id === "compile")
    {
        Compile();
    }
    
    if(id === "default-code")
    {
        monacoModel.setValue(defaultCode);
    }

    console.log(id);
});

require.config({ paths: { vs: 'vendor/monaco-editor/dev/vs' } });
require(['vs/editor/editor.main'], async() => {
    
    let uri = monaco.Uri.parse("inmemory://pgetinker");
    defaultCode = await fetch("/example.cpp").then((response) => response.text());
    monacoModel = monaco.editor.createModel(defaultCode, "cpp", uri);

    monacoEditor = monaco.editor.create(document.querySelector('#editor-panel .code-editor'), {
        automaticLayout: true,
        model: monacoModel,
        theme: 'vs-dark'
    });

    monacoModel.onDidChangeContent(() =>
    {
        console.log(monacoEditor.getValue().length)
    });
});
