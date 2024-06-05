/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override'
import monacoVscodeTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';

export const getUserConfiguration = (theme) =>
{
    theme = (theme === undefined) ? "dark" : theme;
    
    return JSON.stringify({
        "workbench.colorTheme": (theme == "dark") ? "Default Dark Modern" : "Default Light Modern",
        "editor.mouseWheelZoom": "on",
        "editor.wordBasedSuggestions": "off",
        "editor.quickSuggestionDelay": 500,
        "editor.inlayHints.enabled": "off",
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
