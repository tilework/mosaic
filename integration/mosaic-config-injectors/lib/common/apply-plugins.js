const { getBuildConfigPlugins } = require('@tilework/mosaic-dev-utils/build-config-plugins');
const logger = require('@tilework/mosaic-dev-utils/logger');

const getPluginKey = (type) => {
    if (type === 'webpack') {
        return 'overrideWebpackConfig';
    }

    if (type === 'babel') {
        return 'overrideBabelConfig';
    }

    throw new Error('Unexpected plugin type!');
};

const applyPlugins = (initialConfig, pluginType) => {
    let config = initialConfig;
    const pluginKey = getPluginKey(pluginType);

    for (const { packageName, plugins } of getBuildConfigPlugins()) {
        for (const { plugin: { [pluginKey]: plugin } } of plugins) {
            if (!plugin) {
                continue;
            }

            config = plugin(initialConfig);

            if (!config) {
                logger.error(
                    `Build configuration plugin ${logger.style.code(pluginKey)} of package ${logger.style.file(packageName)} is malfunctioning.`,
                    `It did not return a configuration object. Please ensure that it does.`
                );

                process.exit(1);
            }
        }
    }

    return config;
};

module.exports = {
    applyPlugins
};