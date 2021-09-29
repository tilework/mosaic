const { alias } = require('./util/alias');

const hasPlugin = (pluginName) => (plugin) => {
    if (Array.isArray(plugin)) {
        return plugin[0] === pluginName;
    }

    if (typeof plugin === 'string') {
        return plugin === pluginName;
    }
};

const babelPluginModuleResolverResolvedPath = require.resolve('babel-plugin-module-resolver');
const babelPluginModuleResolverWithConfig = [
    babelPluginModuleResolverResolvedPath,
    {
        root: 'src',
        loglevel: 'silent',
        alias
    }
];

const addAliases = (babelConfig) => {
    if (!babelConfig.plugins) {
        babelConfig.plugins = [];
    }

    if (babelConfig.plugins.some(hasPlugin(babelPluginModuleResolverResolvedPath))) {
        const babelPluginModuleResolver = babelConfig.plugins.find(hasPlugin(babelPluginModuleResolverResolvedPath));

        if (Array.isArray(babelPluginModuleResolver)) {
            const options = babelPluginModuleResolver[1];

            options.alias = {
                ...options.alias,
                ...alias
            };
        } else if (typeof babelPluginModuleResolver === 'string') {
            babelConfig.plugins = babelConfig.plugins.filter((plugin => !hasPlugin(babelPluginModuleResolverResolvedPath)(plugin)));

            babelConfig.plugins.push(babelPluginModuleResolverWithConfig);
        }
    } else {
        babelConfig.plugins.push(babelPluginModuleResolverWithConfig);
    }


    return babelConfig;
};

module.exports = addAliases;