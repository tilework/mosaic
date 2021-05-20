const injectBabelConfig = require('./babel');
const injectWebpackConfig = require('./webpack');
const injectNextConfig = require('./next');

const configInjector = { injectBabelConfig, injectWebpackConfig, injectNextConfig };

module.exports = configInjector;
