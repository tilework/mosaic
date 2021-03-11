const addPlugins = require('./add-plugins');
const addAliases = require('./add-aliases');
const ensureConfig = require('./ensure-config');

const injectBabelConfig = (babelConfig) => {
    addPlugins(babelConfig);
    addAliases(babelConfig);

    // (j|t)sconfigs are necessary only when Babel aliases are present
    // In other scenarios, they get generated properly without our help
    // Hence, we keep it here.
    ensureConfig();

    return babelConfig;
};

module.exports = injectBabelConfig;
