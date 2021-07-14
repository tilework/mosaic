const { getBuildConfigPlugins } = require('@tilework/mosaic-dev-utils/build-config-plugins');
const logger = require('@tilework/mosaic-dev-utils/logger');

const getPluginKey = (type) => {
    if (type === 'webpack') {
        return {
            overrideKey: 'overrideWebpackConfig',
            configName: 'webpackConfig'
        };
    }

    if (type === 'babel') {
        return {
            overrideKey: 'overrideBabelConfig',
            configName: 'babelConfig'
        };
    }

    throw new Error('Unexpected plugin type!');
};

const applyPlugins = (initialConfig, pluginType) => {
    const { 
        overrideKey,
        configName
    } = getPluginKey(pluginType);
    const buildConfigPlugins = getBuildConfigPlugins();
    
    let config = { [configName]: initialConfig };

    for (const { packageName, plugins } of buildConfigPlugins) {
        for (const { plugin: { [overrideKey]: plugin } = {} } of plugins) {
            if (!plugin) {
                continue;
            }

            config = plugin(config);

            if (!config) {
                logger.error(
                    `Build configuration plugin ${logger.style.code(pluginKey)} of package ${logger.style.file(packageName)} is malfunctioning.`,
                    `It did not return a configuration object. Please ensure that it does.`
                );

                process.exit(1);
            }
        }
    }

    return config[configName];
};

module.exports = {
    applyPlugins
};