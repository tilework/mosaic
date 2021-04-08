const { sources } = require('@plugjs/dev-utils/sources');
const FallbackPlugin = require('@plugjs/webpack-fallback-plugin');

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
