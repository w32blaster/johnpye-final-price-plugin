// Mock chrome APIs for testing
global.chrome = {
    runtime: {
        onMessage: {
            addListener: () => {}
        }
    }
};