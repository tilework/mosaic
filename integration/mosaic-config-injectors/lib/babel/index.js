const addPlugins = require('./add-plugins');
const addAliases = require('./add-aliases');
const ensureConfig = require('./ensure-config');
const { applyPlugins } = require('../common/apply-plugins');

/** @type {import('@tilework/mosaic-config-injectors').BabelInjectorConfig} */
const defaultOptions = {
    shouldApplyPlugins: true
};

const injectBabelConfig = (babelConfig, options = {}) => {
    const {
        shouldApplyPlugins
    } = Object.assign(defaultOptions, options);

    addPlugins(babelConfig);
    addAliases(babelConfig);

    // (j|t)sconfigs are necessary only when Babel aliases are present
    // In other scenarios, they get generated properly without our help
    // Hence, we keep it here.
    ensureConfig();

    if (shouldApplyPlugins) {
        const finalConfig = applyPlugins(babelConfig, 'babel');

        return finalConfig;
    }

    return babelConfig;
}

module.exports = injectBabelConfig;
