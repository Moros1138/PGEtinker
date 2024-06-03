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
    });
}

export const createUserConfig = (workspaceRoot, code, codeUri) =>
{
    return {
        languageClientConfig: {
            languageId: 'cpp',
            name: 'Clangd Language Server Example',
            options: {
                $type: 'WebSocket',
                host: 'test.pgetinker.com',
                port: 443,
                path: 'clangd',
                extraParams: {
                    authorization: 'UserAuth'
                },
                secured: true,
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
