const injectBabelConfig = require('../../babel');

const handleNoMiddlewareDecoratorRule = (webpackConfig) => {
    const generatedBabelRule = {
        test: /\.(m|c)?[tj]sx?$/,
        use: {
            loader: require.resolve('babel-loader'),
            options: injectBabelConfig({})
        }
    }

    if (!webpackConfig.module) {
        webpackConfig.module = {};
    }

    if (!webpackConfig.module.rules) {
        webpackConfig.module.rules = [];
    }

    webpackConfig.module.rules.push(generatedBabelRule);
    return webpackConfig;
}

module.exports = handleNoMiddlewareDecoratorRule;