const path = require('path');
const includePaths = require('../../common/get-include-paths')();
const potentiallyNamespacedFiles = require('./potentially-namespaced-files');
const { getConditionAppliesToFile, getRuleAppliesToFile } = require('../util/rule-set');
const handleExcludedExtensionFile = require('./handle-excluded-extension');
const getContextFromConfig = require('./get-context-from-config');

/**
 * The most frequent case - 1 babel rule that processes the application
 * Make sure that all the extensions are processed by it
 * 
 * @param {object} middlewareDecoratorRules 
 * @param {object} webpackConfig 
 */
const handleOneDecoratorRule = (middlewareDecoratorRule, webpackConfig) => {

    // Modify exclude rule so that it does not exclude the extensions
    // Only if it already exists
    const initialMiddlewareDecoratorExclude = middlewareDecoratorRule.exclude;
    if (initialMiddlewareDecoratorExclude) {
        middlewareDecoratorRule.exclude = (filepath) => {
            // Allow  @namespace only in `src` directory
            if (includePaths.find(
                (one) => filepath.startsWith(one) && !filepath.startsWith(path.join(one, 'node_modules'))
            )) {
                return false;
            }
            
            return getConditionAppliesToFile(initialMiddlewareDecoratorExclude, filepath);
        }
    }

    if (!middlewareDecoratorRule.include) {
        middlewareDecoratorRule.include = [];
        
        const context = getContextFromConfig(webpackConfig, true);
        if (context) {
            middlewareDecoratorRule.include.push(context);
        }
    } else if (!Array.isArray(middlewareDecoratorRule.include)) {
        middlewareDecoratorRule.include = [middlewareDecoratorRule.include];
    }

    // Ensure all the extensions are included into the transpilation
    middlewareDecoratorRule.include.push(
        ...includePaths.map((filepath) => new RegExp(filepath))
    );

    // Ensure that everything is working after modifications
    const excludedExtensionFile = potentiallyNamespacedFiles.find(
        (includePath) => !getRuleAppliesToFile(middlewareDecoratorRule, includePath)
    );

    if (excludedExtensionFile) {
        handleExcludedExtensionFile(excludedExtensionFile)
    }
}

module.exports = handleOneDecoratorRule;