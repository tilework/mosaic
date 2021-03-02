const { getRuleAppliesToFile } = require('../util/rule-set');
const handleExcludedExtensionFile = require('./handle-excluded-extension');
const potentiallyNamespacedFiles = require('./potentially-namespaced-files');

/**
 * Handle multiple Babel rules case
 * How to handle this is ambiguous, we'll leave it to the user himself
 * This case should not be encountered frequently
 */
const handleManyDecoratorRules = () => {
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

module.exports = handleManyDecoratorRules;