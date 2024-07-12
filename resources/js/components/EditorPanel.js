import examples from "../lib/exampleCodes";
import { getUserConfiguration } from "../lib/monacoConfig";
import { configureMonacoWorkers, runCppWrapper } from "../lib/monacoWrapper";
import { getStorageValue, setStorageValue } from "../lib/storage";
import * as vscode from "vscode";
import { createToast, ToastType } from '../lib/createToast';

export default class EditorPanel
{
    state;
    autoConnect = true;
    code = "";

    monacoWrapper = null;

    maxFileSize = 50000;
    
    reconnectInterval = null;

    sharedFlag = false;
    staging = false;
    
    constructor(state)
    {
        this.state = state;
        this.sharedFlag = (
            window.location.pathname.indexOf("/s/") === 0 ||
            window.location.pathname.indexOf("/staging/s/") === 0
        );
        
        this.staging = (window.location.pathname.indexOf("/staging/s/") === 0);
        
        // reset editor font zoom
        window.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key == "0") {
                vscode.commands.executeCommand("editor.action.fontZoomReset");
            }
        });
        
        configureMonacoWorkers();
    }
    
    getValue()
    {
        return this.monacoWrapper.getEditor().getValue();
    }
    
    setValue(value)
    {
        this.monacoWrapper.getEditor().setValue(value);
    }
    
    setToExample(codeId, codeName)
    {
        const codeIds = Object.keys(examples);
        for(let i = 0; i < codeIds.length; i++)
        {
            if(codeIds[i] === codeId)
            {
                this.state.editorPanel.setValue(examples[codeId]);
                this.state.editorPanel.reveal({ column: 1, lineNumber: 1 });
                
                if(this.state.playerPanel.running)
                {
                    document.querySelector("#start-stop").dispatchEvent(new Event("click"));                    
                }
                
                createToast(`Set Code to ${codeName}`, ToastType.Info);
                return;
            }
        }
    }

    async onPreInit()
    {
        this.monacoWrapper = await runCppWrapper();
    }

    async onDestroy()
    {
        clearInterval(this.reconnectInterval);
        await this.monacoWrapper.dispose();
    }

    async onInit()
    {
        if(!this.monacoWrapper)
        {
            setTimeout(() => this.onInit(), 500);
            return;
        }
        
        try
        {
            await this.monacoWrapper.start(document.querySelector('.code-editor'));
        }
        catch(e)
        {
            // if we fail to connect/start the language client, let's skip the further reconenction attempts
            this.autoConnect = false;
        }
            
        let code = "";
        if(this.sharedFlag)
        {
            code = document.querySelector('#code').value;
        }
        else if(getStorageValue("code"))
        {
            code = getStorageValue("code");
        }
        else
        {
            code = examples.code1;
        }

        /**
         * don't stop... networking...
         * hold on to that linkaaaage
         * 
         * sockets.... streaming dataaaaa aahh ahhh
         */
        const reconnectHandler = async() =>
        {
            // language client is already started, let's not try, this time
            if(this.monacoWrapper.getLanguageClientWrapper().isStarted())
            {
                return;
            }
            
            clearInterval(this.reconnectInterval);
            
            try
            {
                await axios.get('/sanctum/csrf-cookie');
                await this.monacoWrapper.getLanguageClientWrapper().start();
            }
            catch(e)
            {
                // fail
            }
            
            this.reconnectInterval = setInterval(reconnectHandler, 5000);
        }
        
        if(this.autoConnect)
        {
            this.reconnectInterval = setInterval(reconnectHandler, 5000);
            reconnectHandler();
        }

        this.monacoWrapper.getEditor().setValue(code);

        this.monacoWrapper.getEditor().onDidChangeCursorPosition(() => this.updateStatusBar());
    
        this.monacoWrapper.getEditor().onDidChangeModelContent(() =>
        {
            setStorageValue("code", this.monacoWrapper.getEditor().getValue());
            
            if(this.sharedFlag)
            {
                this.sharedFlag = false;
                document.querySelector("#code").innerHTML = "";

                if(this.staging)
                {
                    window.history.replaceState({}, "", "/staging/");
                    return;
                }
                window.history.replaceState({}, "", "/");
            }
        });
        
        this.monacoWrapper.getEditor().updateOptions({
            glyphMargin: false,
        });
        
        /**
         * TODO: magic numbers are bad, mkay?
         * But I'm using them until they break!
         */
        this.monacoWrapper.getEditor().addAction({
            id: 'editor.action.build-and-run',
            label: 'Build and Run',
            keybindings: [
                2051, // monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
                2097, // monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
            ],
            run: () =>
            {
                let startStopButton = document.querySelector("#start-stop");
                
                startStopButton.dispatchEvent(new Event("click"));
                
                // if we had to stop it first, click again!
                if(startStopButton.querySelector("span").innerHTML == "Run")
                    startStopButton.dispatchEvent(new Event("click"));
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
    
    exceedsMaxSize()
    {
        if(this.monacoWrapper == null)
            return false;

        return (this.monacoWrapper.getEditor().getValue().length > this.maxFileSize);
    }   
    
    focus()
    {
        if(this.monacoWrapper == null)
            return;

        this.monacoWrapper.getEditor().focus();
    }

    reveal(position)
    {
        if(this.monacoWrapper == null)
            return;

        this.monacoWrapper.getEditor().setPosition(position);
        this.focus();
        this.monacoWrapper.getEditor().revealPositionInCenter(position);
    }
    
    async updateConfiguration()
    {
        if(this.monacoWrapper == null)
            return;

        
        await this.monacoWrapper
            .getMonacoEditorApp()
            .updateUserConfiguration(getUserConfiguration());
    }

    updateStatusBar()
    {
        if(this.monacoWrapper == null)
            return;

        let statusBar = document.querySelector("#editor-panel .status");
    
        let cursor = `Ln ${this.monacoWrapper.getEditor().getPosition().lineNumber}, Col ${this.monacoWrapper.getEditor().getPosition().column}`;
        let fileSize = `${new Intl.NumberFormat().format(this.monacoWrapper.getEditor().getValue().length)} / ${new Intl.NumberFormat().format(this.maxFileSize)}`;
            
        statusBar.classList.toggle('too-fucking-big', false);
        if(this.monacoWrapper.getEditor().getValue().length > this.maxFileSize)
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