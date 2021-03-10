const getBabelRules = require('./get-babel-rules');
const addBabelRule = require('./add-babel-rule');
const processBabelRule = require('./process-babel-rule');

/**
 * Ensure extensions' files to be transpiled by babel
 * Ensure the project itself to be transpiled by babel
 *
 * @param {object} webpackConfig
 */
const enforceIncludeExtensions = (webpackConfig) => {
    const babelRules = getBabelRules(webpackConfig.module.rules, webpackConfig.entry);

    if (babelRules.length) {
        // Include the extensions into each rule
        babelRules.forEach((rule) => processBabelRule(rule, webpackConfig));
    } else {
        // Generate a new rule
        addBabelRule(webpackConfig);
    }

    return webpackConfig;
};

module.exports = enforceIncludeExtensions;
