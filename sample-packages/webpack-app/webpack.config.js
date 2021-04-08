const webpack = require('webpack');
const path = require('path');
const ConfigInjectors = require('@tilework/mosaic-config-injectors');

const config = ConfigInjectors.injectWebpackConfig({
    entry: './src/index.js',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    context: __dirname
}, {
    webpack
});

module.exports = config;