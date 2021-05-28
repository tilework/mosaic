const logger = require('@tilework/mosaic-dev-utils/logger');

const getMosaicPath = () => {
    // Get the one from CWD
    try {
        return require.resolve('@tilework/mosaic', { paths: [process.cwd()] });
    } catch (err) {
        logger.error(
            `${logger.style.misc('@tilework/mosaic')} cannot be resolved from the CWD. Please install ${logger.style.misc('@tilework/mosaic')} into the main theme.`,
            `This way all of your packages are going to use the same version of ${logger.style.misc('@tilework/mosaic')}`
        );

        process.exit(0);
    }
}

const additionalProvideDefinitions = {
    Mosaic: getMosaicPath()
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
