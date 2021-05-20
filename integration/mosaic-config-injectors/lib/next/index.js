const overrideWebpack = require('./override-webpack');

const injectNextConfig = (config, args) => {
    // If user's configuration is a function - get an object from it
    const configObject = typeof config === 'function'
        ? config(...args)
        : config;

    // Provide weback overrides
    if (configObject.webpack) {
        const { webpack: baseOverride } = configObject;

        // If user override exists - call it first and apply ours then
        configObject.webpack = (configObject, ...args) => overrideWebpack(
            baseOverride(configObject, ...args), 
            ...args
        );
    } else {
        configObject.webpack = overrideWebpack;
    }

    configObject.distDir = 'build';

    return configObject;
};

module.exports = injectNextConfig;