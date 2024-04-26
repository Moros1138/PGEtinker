import * as monaco from 'monaco-editor';

import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
    getWorker: function (workerId, label)
    {
        switch (label) {
            case 'json':
                return new jsonWorker();
            case 'css':
            case 'scss':
            case 'less':
                return cssWorker();
            case 'html':
            case 'handlebars':
            case 'razor':
                return htmlWorker();
            case 'typescript':
            case 'javascript':
                return tsWorker();
            default:
                return editorWorker();
        }
    }
};
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true
});

window.monaco = monaco;
