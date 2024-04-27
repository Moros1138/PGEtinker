const defaultLayout = {
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
        }],
    }],
};

export default defaultLayout;