const logger = require('@tilework/mosaic-dev-utils/logger');
const resolveMosaic = require('./resolve-mosaic');

const additionalProvideDefinitions = {
    Mosaic: [resolveMosaic(), 'default']
};

/**
 * Provide Mosaic globally
 *
 * @param {object} webpackConfig
 * @param {object} webpack
 */
const provideGlobals = (webpackConfig, webpack) => {
    if (!webpackConfig.plugins) {
        webpackConfig.plugins = [];
    }

    const providePlugin = webpackConfig.plugins.find(
        (one) => {
            if (webpack && one instanceof webpack.ProvidePlugin) {
                return true;
            } 

            if (Object.getPrototypeOf(one).constructor.name === 'ProvidePlugin') {
                return true;
            }

            return false;
        }
    );

    // Handle plugin already defined
    if (providePlugin) {
        Object.assign(providePlugin.definitions, additionalProvideDefinitions);

    // Handle not defined -> define
    } else {
        if (!webpack) {
            logger.error(
                'Webpack injection has been triggered, but webpack cannot be found',
                'Please provide webpack in the injector\'s options'
            );

            process.exit(1);
        }

        webpackConfig.plugins.push(
            new webpack.ProvidePlugin(additionalProvideDefinitions)
        );
    }

    return webpackConfig;
};

module.exports = provideGlobals;
