const path = require('path');
const isValidNpmName = require('is-valid-npm-name');

const includePaths = require('../../common/get-include-paths')();
const getMiddlewareDecoratorRules = require('./get-decorator-rules');
const { getConditionAppliesToFile, getRuleAppliesToFile } = require('../util/rule-set');
const handleNoMiddlewareDecoratorRules = require('./handle-no-decorator-rule');
const handleExcludedExtensionFile = require('./handle-excluded-extension');
const handleNoContext = require('./handle-no-context');

const potentiallyNamespacedFiles = includePaths
    .filter((includePath) => path.isAbsolute(includePath) || isValidNpmName(includePath))
    .map((includePath) => path.join(includePath, 'src', 'index.js'));

/**
 * Ensure extensions' files to be transpiled by babel
 * Ensure the project itself to be transpiled by babel
 *
 * @param {object} webpackConfig
 */
const enforceIncludeExtensions = (webpackConfig) => {
    // Get all rules that process stuff with the middleware decorator transformer
    const middlewareDecoratorRules = getMiddlewareDecoratorRules(webpackConfig);
    
    // Handle nothing being transpiled by babel
    // Advise against such approach, endorse introducing babel to the app
    if (!middlewareDecoratorRules.length) {
        // TODO add a rule
        handleNoMiddlewareDecoratorRules();
    }

    if (middlewareDecoratorRules.length === 1) {
        // The most frequent case - 1 babel rule that processes the application
        // Make sure that all the extensions are processed by it
        const [middlewareDecoratorRule] = middlewareDecoratorRules;

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

        // Ensure include exists
        if (!middlewareDecoratorRule.include) {
            const { context } = webpackConfig;
            if (!context) {
                handleNoContext();
            }

            middlewareDecoratorRule.include = [context];
        } else if (!Array.isArray(middlewareDecoratorRule.include)) {
            middlewareDecoratorRule.include = [middlewareDecoratorRule.include];
        }

        // Ensure all the extensions are included into the transpilation
        middlewareDecoratorRule.include.push(
            ...includePaths.map((filepath) => new RegExp(filepath))
        );

        // Ensure everything working after modifications
        const excludedExtensionFile = potentiallyNamespacedFiles.find(
            (includePath) => !getRuleAppliesToFile(middlewareDecoratorRule, includePath)
        );

        if (excludedExtensionFile) {
            handleExcludedExtensionFile(excludedExtensionFile)
        }
    }

    // Handle multiple Babel rules case
    // How to handle this is ambiguous, we'll leave it to the user himself
    // This case should not be encountered frequently
    if (middlewareDecoratorRules.length > 1) {
        const excludedExtensionFile = potentiallyNamespacedFiles.find(
            (includePath) => !middlewareDecoratorRules.find(
                (rule) => getRuleAppliesToFile(rule, includePath)
            )
        );

        if (excludedExtensionFile) {
            handleExcludedExtensionFile(excludedExtensionFile);
        }

        return webpackConfig;
    }

    return webpackConfig;
};

module.exports = enforceIncludeExtensions;
