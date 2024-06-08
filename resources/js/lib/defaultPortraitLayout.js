const defaultPortraitLayout = {
    settings: {
        showPopoutIcon: false,
    },
    content: [{
        type: 'column',
        content:[{
            type: 'stack',
            content:[{
                type: 'component',
                componentName: 'editorComponent',
                componentState: {},
                isClosable: false,
                title: 'C++ Editor',
                id: 'editor',
            },{
                type: 'component',
                componentName: 'playerComponent',
                componentState: {},
                isClosable: false,
                title: 'Emscripten Player',
                id: 'player',
            }],
        },{
            type: 'stack',
            id: 'information-stack',
            height: 25,
            content: [{
                type: 'component',
                componentName: 'problemsComponent',
                componentState: {},
                isClosable: false,
                title: 'Problems',
                id: 'problems',
            },{
                type: 'component',
                componentName: 'compilerOutputComponent',
                componentState: {},
                isClosable: false,
                title: 'Compiler Output',
                id: 'compiler-output',
            },{
                type: 'component',
                componentName: 'consoleComponent',
                componentState: {},
                isClosable: false,
                title: 'Console',
                id: 'console',
            }]
        }],
    }],
};

export default defaultPortraitLayout;