const { alias } = require('./util/alias');

const addAliases = (babelConfig) => {
    if (!babelConfig.plugins) {
        babelConfig.plugins = [];
    }

    babelConfig.plugins.push([
        require.resolve('babel-plugin-module-resolver'), 
        {
            root: 'src',
            loglevel: 'silent',
            alias
        }
    ]);

    return babelConfig;
};

module.exports = addAliases;