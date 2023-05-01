import GoldenLayout from 'golden-layout';

import 'golden-layout/src/css/goldenlayout-base.css';
import './css/app.css';

import pgeTinkerLogo from './assets/PGEtinker-logo.png';
import pgeLogo from './assets/pge-logo.png';
import emscriptenLogo from './assets/emscripten-logo.png';

import * as monaco from 'monaco-editor';

document.querySelector('#app')!.innerHTML = `
    <div id="header">
        <a href="/">
            <img src="${pgeTinkerLogo}" alt="PGEtinker Logo">
        </a>
        <div class="branding">
            <a href="https://github.com/OneLoneCoder/olcPixelGameEngine" target="_blank">
                <img id="olc-brand" src="${pgeLogo}" alt="OneLoneCoder PixelGameEngine Logo">
            </a>
            <a href="https://emscripten.org/" target="_blank">
                <img id="emscripten-brand" src="${emscriptenLogo}" alt="Emscripten Logo">
            </a>
        </div>
    </div>
    <div id="content">
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
                    <!--<li><button type="button" id="refresh-player">Refresh Player</button></li>-->
                </ul>
            </div>
            <div class="code-editor"></div>
            <div class="status">Loading</div>
        </div>

        <div id="player-panel">
            <iframe src="/player/"></iframe>
            <div></div>
        </div>

        <div id="console-panel">
            <div class="entry-container"></div>
            <div class="new-entry-indicator">
                New Entries <i class="fa fa-chevron-down" aria-hidden="true"></i>
            </div>
        </div>

        <div id="info-panel"><div></div></div>
    </div>
    <div id="footer">
        Haven't quite decided what should go here, probably a copyright notice or perhaps a whitty quote.
    </div>
`;

let theme = null;

theme = localStorage.getItem('pgeTinkerTheme');
theme = (theme) ? theme : 'dark';

// sanity check
if(theme != 'dark' && theme != 'light')
    theme = 'dark';

let defaultLayoutConfig = {
    settings: {
        showPopoutIcon: false,
    },
    content: [{
        type: 'column',
        content: [{
            type: 'row',
            content: [{
                type: 'component',
                componentName: 'component',
                componentState: { id: 'editor-panel', className: 'panel'},
                isClosable: false,
                title: 'C++ Editor',
            },{
                type: 'component',
                componentName: 'component',
                componentState: { id: 'player-panel', className: 'panel'},
                isClosable: false,
                title: 'Emscripten Player',
            }]
        },{
            type: 'stack',
            height: 20,
            content: [{
                type: 'component',
                componentName: 'component',
                componentState: { id: 'info-panel', className: 'panel'},
                isClosable: false,
                title: 'Compiler Information',
            },{
                type: 'component',
                componentName: 'component',
                componentState: { id: 'console-panel', className: 'panel'},
                isClosable: false,
                title: 'Console Output',
            }]
        }]
    }]
};

let layoutConfig = defaultLayoutConfig;

if(localStorage.getItem('pgeTinkerSavedLayout') != null)
    layoutConfig = JSON.parse(localStorage.getItem('pgeTinkerSavedLayout') as string);

let layout = new GoldenLayout(layoutConfig, document.querySelector('#content'));

layout.registerComponent('component', function(container: any, state: any)
{
    let child = document.getElementById(state.id);

    if(!child)
    {
        child = document.createElement('div');

        child.id = state.id;
    }

    child.className = state.className;

    container.getElement()[0].appendChild(child);
});

layout.on('initialised', () =>
{
    window.addEventListener('resize', () => layout.updateSize());
});

layout.on('stateChanged', () =>
{
    localStorage.setItem('pgeTinkerSavedLayout', JSON.stringify(layout.toConfig()));
})

layout.init();

document.querySelector('#default-layout')!.addEventListener('click', (event) =>
{
    event.preventDefault();
    localStorage.removeItem('pgeTinkerSavedLayout');
    window.location.reload();
});

monaco.editor.create(document.querySelector('.code-editor')!, {
    value: '',
    language: 'cpp',
    theme: 'vs-dark',
    automaticLayout: true,
});
