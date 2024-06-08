/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
// this is required syntax highlighting
import '@codingame/monaco-vscode-cpp-default-extension';
import { RegisteredFileSystemProvider, registerFileSystemOverlay, RegisteredMemoryFile } from '@codingame/monaco-vscode-files-service-override';
import { MonacoEditorLanguageClientWrapper } from 'monaco-editor-wrapper';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { createUserConfig } from './monacoConfig.js';


export const configureMonacoWorkers = () =>
{
    useWorkerFactory({
        ignoreMapping: true,
        workerLoaders: {
            editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
        }
    });
};

export const runCppWrapper = async (htmlElement) => {
    const pgetinkerCppUri = vscode.Uri.file('/workspace/pgetinker.cpp');

    const fileSystemProvider = new RegisteredFileSystemProvider(false);
    fileSystemProvider.registerFile(new RegisteredMemoryFile(pgetinkerCppUri, ""));

    registerFileSystemOverlay(1, fileSystemProvider);
    
    const userConfig = createUserConfig('/workspace', "", '/workspace/pgetinker.cpp');
    const wrapper = new MonacoEditorLanguageClientWrapper();

    try {
        if (wrapper.isStarted()) {
            console.warn('Editor was already started!');
        } else {
            
            await wrapper.init(userConfig);

            // open files, so the LS can pick it up
            await vscode.workspace.openTextDocument(pgetinkerCppUri);
            
            await wrapper.start(htmlElement);
            
            // reset editor font zoom
            window.addEventListener("keydown", (event) => {
                if (event.ctrlKey && event.key == "0") {
                    vscode.commands.executeCommand("editor.action.fontZoomReset");
                }
            });

            // @ts-ignore
            window.addEventListener("unload", async(event) => {
                await wrapper.dispose();
            });
        }
    } catch (e) {
        console.error(e);
    }
    
    return wrapper;
};


