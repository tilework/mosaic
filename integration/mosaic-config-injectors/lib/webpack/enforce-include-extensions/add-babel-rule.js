const injectBabelConfig = require('../../babel');

const addBabelRule = (webpackConfig) => {
    const generatedBabelRule = {
        test: /\.(m|c)?[tj]sx?$/,
        use: {
            loader: require.resolve('babel-loader'),
            options: injectBabelConfig({})
        }
        // TODO include
    };

    if (!webpackConfig.module) {
        webpackConfig.module = {};
    }

    if (!webpackConfig.module.rules) {
        webpackConfig.module.rules = [];
    }

    webpackConfig.module.rules.push(generatedBabelRule);
    return webpackConfig;
};

module.exports = addBabelRule;