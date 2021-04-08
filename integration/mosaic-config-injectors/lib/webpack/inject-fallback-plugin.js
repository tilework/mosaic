const { sources } = require('@tilework/mosaic-dev-utils/sources');
const FallbackPlugin = require('@tilework/mosaic-webpack-fallback-plugin');

// Inject the actual extensions' imports
const injectWebpackFallbackPlugin = (webpackConfig) => {
    if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
    }

    if (!webpackConfig.resolve.plugins) {
        webpackConfig.resolve.plugins = [];
    }

    webpackConfig.resolve.plugins.push(new FallbackPlugin({ sources }));

    return webpackConfig;
};

module.exports = injectWebpackFallbackPlugin;
