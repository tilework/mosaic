const path = require('path');
const { getConditionAppliesToFile } = require('../util/rule-set');
const getContextFromConfig = require('./get-context-from-config');
const includePaths = require('../../common/include-paths');

/**
 * The most frequent case - 1 babel rule that processes the application
 * Make sure that all the extensions are processed by it
 * 
 * @param {object} middlewareDecoratorRules 
 * @param {object} webpackConfig 
 */
const processBabelRule = (rule, webpackConfig) => {
    // Modify the exclude rule so that it does not exclude the extensions
    const initialMiddlewareDecoratorExclude = rule.exclude;
    if (initialMiddlewareDecoratorExclude) {
        rule.exclude = (filepath) => {
            // Allow  @namespace in the package, exluding ITS node_modules.
            if (includePaths.some(
                (includePath) => filepath.startsWith(includePath) && !filepath.startsWith(path.join(includePath, 'node_modules'))
            )) {
                return false;
            }
            
            return getConditionAppliesToFile(initialMiddlewareDecoratorExclude, filepath);
        };
    }

    // Ensure all the extensions are included into the transpilation
    // Remember to exclude their node_modules
    const includeMatchers = includePaths.map((one) => new RegExp(`${one}(?![/]node_modules)`));
    if (!rule.include) {
        rule.include = [...includeMatchers];

        const context = getContextFromConfig(webpackConfig, true);
        if (context) {
            rule.include.push(context);
        }
    } else if (Array.isArray(rule.include)) {
        rule.include = [...rule.include, ...includeMatchers];
    } else {
        rule.include = [rule.include, ...includeMatchers];
    }
};

module.exports = processBabelRule;