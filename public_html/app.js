const unsafeDocument = document;

require.config({ paths: { vs: 'vendor/monaco-editor/dev/vs' } });
require(['vs/editor/editor.main'], async() => {
    
    let monacoEditor;
    let monacoModel;
    let lastPlayerHtml = "player.html";
    
    async function Compile()
    {
        const response = await fetch("/compile", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({code: monacoEditor.getValue() }),
        });
        
        const result = await response.json();
        
        if(typeof result.html === 'undefined')
        {
            console.log(result);
            return;
        }
        
        lastPlayerHtml = result.html;
        unsafeDocument.querySelector('#player-panel iframe').setAttribute("srcdoc", result.html);
    }

    var config = {
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
                <iframe src="${lastPlayerHtml}"></iframe
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
    
    let defaultCode = await fetch("/example.cpp").then((response) => response.text());
    let uri = monaco.Uri.parse("inmemory://pgetinker");
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

    // button handling, using this method in order to account for DOM changes
    unsafeDocument.addEventListener('click', (e) =>
    {
        const id = e.target.closest(`button`) && e.target.closest(`button`).getAttribute('id');
        
        if(id === "compile")
        {
            Compile();
        }
        console.log(id);
    });

});
