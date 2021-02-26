const arrowFunctionsTransformer = '@babel/plugin-transform-arrow-functions';
const asyncGeneratorTransformer = '@babel/plugin-transform-async-to-generator';

const addBabelPlugins = (babelConfig) => {
    if (!babelConfig.plugins) {
        babelConfig.plugins = [];
    }

    const additionalPlugins = [
        // Enable middleware decorators
        // This provides @namespace comments
        require.resolve('@plugjs/babel-plugin-middleware-decorator')
    ].concat(
        ...[arrowFunctionsTransformer, asyncGeneratorTransformer].filter((plugin) => {
            // If already present in plugin list -> prevent duplicates
            if (babelConfig.plugins.indexOf(plugin) >= 0) {
                return false;
            }

            return true;
        })
    );

    // It's important that these plugins go before all of the other ones
    babelConfig.plugins.unshift(...additionalPlugins);

    return babelConfig;
};

module.exports = addBabelPlugins;
