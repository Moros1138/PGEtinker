const defaultLayout = {
    settings: {
        showPopoutIcon: false,
    },
    content: [{
        type: 'column',
        content:[{
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
            }],
        },{
            type: 'stack',
            id: 'information-stack',
            height: 25,
            content: [{
                type: 'component',
                componentName: 'infoComponent',
                componentState: {},
                isClosable: false,
                title: 'Build Information',
                id: 'info',
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

export default defaultLayout;