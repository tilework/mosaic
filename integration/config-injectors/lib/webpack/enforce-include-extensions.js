const logger = require('@plugjs/dev-utils/logger');
const path = require('path');

const includePaths = require('../common/get-include-paths')();
const getMiddlewareDecoratorRules = require('./util/get-decorator-rules');
const handleNoMiddlewareDecoratorRules = require('./util/handle-no-decorator-rule');
const handleExcludedExtensionFile = require('./util/handle-excluded-extension');
const { getConditionAppliesToFile, getRuleAppliesToFile } = require('./util/rule-set');
const isValidNpmName = require('is-valid-npm-name');

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
        handleNoMiddlewareDecoratorRules();
        process.exit(1);
    }

    if (middlewareDecoratorRules.length === 1) {
        // The most frequent case - 1 babel rule that processes the application
        // Make sure that all the extensions are processed by it
        const [babelRule] = babelRules;
        babelRule.exclude = (filepath) => {
            // Allow  @namespace only in `src` directory
            if (includePaths.find((one) => filepath.startsWith(path.join(one, 'src')))) {
                return false;
            }
            
            return getConditionAppliesToFile(babelRule.exclude, filepath);
        }

        // TODO remove ?
        // Ensure everything working after modifications
        const excludedExtensionFile = potentiallyNamespacedFiles.find(
            (includePath) => !getRuleAppliesToFile(babelRule, includePath)
        );

        if (excludedExtensionFile) {
            handleExcludedExtensionFile(excludedExtensionFile)
            process.exit(1);
        }

        // Ensure include exists
        if (!babelRule.include) {
            babelRule.include = [];
        }

        // Ensure all the extensions are included into the transpilation
        babelRule.include.push(
            ...includePaths.map((filepath) => new RegExp(filepath))
        );
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
            process.exit(1);
        }

        return webpackConfig;
    }

    return webpackConfig;
};

module.exports = enforceIncludeExtensions;
