const arrowFunctionsTransformer = '@babel/plugin-transform-arrow-functions';
const asyncGeneratorTransformer = '@babel/plugin-transform-async-to-generator';
const middlewareDecorator = '@tilework/babel-plugin-mosaic-middleware-decorator';

const addBabelPlugins = (babelConfig) => {
    if (!babelConfig.plugins) {
        babelConfig.plugins = [];
    }

    const additionalPlugins = [
        // Enable middleware decorators
        // This provides @namespace comments
        require.resolve(middlewareDecorator),

        ...[arrowFunctionsTransformer, asyncGeneratorTransformer]
            .map((plugin) => require.resolve(plugin))
            // If already present in plugin list -> prevent duplicates
            .filter((plugin) => !babelConfig.plugins.includes(plugin))
    ];

    // It's important that these plugins go before all of the other ones
    babelConfig.plugins.unshift(...additionalPlugins);

    return babelConfig;
};

module.exports = addBabelPlugins;
