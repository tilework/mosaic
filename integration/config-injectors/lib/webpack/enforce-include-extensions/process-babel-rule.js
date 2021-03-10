const path = require('path');
const includePaths = require('../../common/get-include-paths')();
const { getConditionAppliesToFile, getRuleAppliesToFile } = require('../util/rule-set');
const getContextFromConfig = require('./get-context-from-config');
const ExcludedExtensionException = require('../../../exceptions/excluded-extension');
const isValidNpmName = require('is-valid-npm-name');

const potentiallyNamespacedFiles = includePaths
    // Take only requirables
    .filter((includePath) => path.isAbsolute(includePath) || isValidNpmName(includePath))
    // Generate mockup plugin files
    .map((includePath) => path.join(includePath, 'src', 'plugin', 'some.plugin.tsx'));

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
            if (includePaths.find(
                (one) => filepath.startsWith(one) && !filepath.startsWith(path.join(one, 'node_modules'))
            )) {
                return false;
            }
            
            return getConditionAppliesToFile(initialMiddlewareDecoratorExclude, filepath);
        }
    }

    // Ensure all the extensions are included into the transpilation
    const includeMatchers = includePaths.map((one) => new RegExp(one));
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

    // Ensure that everything is working after modifications
    const excludedExtensionFile = potentiallyNamespacedFiles.find(
        (includePath) => !getRuleAppliesToFile(rule, includePath)
    );

    if (excludedExtensionFile) {
        throw new ExcludedExtensionException(excludedExtensionFile);
    }
}

module.exports = processBabelRule;