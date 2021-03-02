const logger = require('@plugjs/dev-utils/logger');
const injectBabelConfig = require('../../babel');
const getContextFromConfig = require('./get-context-from-config');

const handleNoMiddlewareDecoratorRule = (webpackConfig) => {
    const context = getContextFromConfig(webpackConfig);

    const generatedBabelRule = {
        test: /\.(m|c)?[tj]sx?$/,
        // TODO check whether necessary
        include: [context],
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

    // logger.error(
    //     'A rule to transpile code with "babel-plugin-middleware-decorator" has not been found in your webpack configuration!',
    //     'Without babel transformations, the plugin system cannot provide any additional syntax.',
    //     `${logger.style.code('@namespace')} magic comments will not work in this setup.`,
    //     'Consider introducing Babel to your application in order to use the functionality like it is intended to be used.'
    // );

    // process.exit(1);
}

module.exports = handleNoMiddlewareDecoratorRule;