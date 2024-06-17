/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override'
import monacoVscodeTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';
import { getStorageValue, setStorageValue } from './storage';

export const getUserConfiguration = () =>
{
    
    return JSON.stringify({
        "workbench.colorTheme": (getStorageValue("theme") == "dark") ? "Default Dark Modern" : "Default Light Modern",
        "editor.mouseWheelZoom": "on",
        "editor.wordBasedSuggestions": "off",
        "editor.quickSuggestionDelay": 500,
        "editor.inlayHints.enabled": getStorageValue("editor.inlayHints.enabled"),
        "editor.tabSize": 4,
        "editor.indentSize": 4,
        "editor.detectIndentation": false,
    });
}

export const createUserConfig = (workspaceRoot, code, codeUri) =>
{
    let secured = (window.location.protocol.indexOf("https") === 0);
    let staging = (window.location.pathname.indexOf("/staging/") == 0); 
    
    return {
        languageClientConfig: {
            languageId: 'cpp',
            name: 'Clangd Language Server',
            options: {
                $type: 'WebSocket',
                host: window.location.host,
                port: secured ? 443 : 80,
                path: staging ? "staging/clangd" : "clangd",
                extraParams: {
                    authorization: 'UserAuth'
                },
                secured: secured,
                startOptions: {
                    onCall: (languageClient) => {},
                    reportStatus: true,
                }
            },
            clientOptions: {
                documentSelector: ['cpp'],
                workspaceFolder: {
                    index: 0,
                    name: 'workspace',
                    uri: vscode.Uri.parse(workspaceRoot)
                },
                middleware: {
                    handleDiagnostics: (uri, diagnostics, next) =>
                    {
                        // we only care about the main source file, let the rest of the middleware handle this one
                        if(uri.path != "/workspace/pgetinker.cpp")
                            return next(uri, diagnostics);
                        
                        let filteredDiagnostics = [];

                        diagnostics.forEach((diagnostic) =>
                        {
                            // Javid Mode?
                            if(getStorageValue("diagnostics.javidMode"))
                            {
                                if(diagnostic.source === "clang-tidy")
                                {
                                    return;
                                }
                            }

                            filteredDiagnostics.push(diagnostic);
                        });


                        window.dispatchEvent(new CustomEvent("update-problems-panel", { detail: filteredDiagnostics }));
                        return next(uri, filteredDiagnostics);
                    },
                },
                connectionOptions: {
                    maxRestartCount: 5,
                }
            },
        },
        wrapperConfig: {
            serviceConfig: {
                userServices: {
                    ...getEditorServiceOverride(useOpenEditorStub),
                    ...monacoVscodeTextmateServiceOverride(),
                    ...getKeybindingsServiceOverride(),
                },
                debugLogging: true
            },
            editorAppConfig: {
                $type: 'extended',
                codeResources: {
                    main: {
                        text: code,
                        uri: codeUri
                    }
                },
                userConfiguration: {
                    json: getUserConfiguration()
                },
                useDiffEditor: false
            }
        },
        loggerConfig: {
            enabled: true,
            debugEnabled: true
        }
    };
};
