const getMiddlewareDecoratorRules = require('./rule-helpers/get-decorator-rules');
const handleNoDecoratorRules = require('./handle-no-decorator-rule');
const handleOneDecoratorRule = require('./handle-one-decorator-rule');
const handleManyDecoratorRules = require('./handle-many-decorator-rules');

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
        return handleNoDecoratorRules(webpackConfig);
    }

    if (middlewareDecoratorRules.length === 1) {
        return handleOneDecoratorRule(middlewareDecoratorRules.pop(), webpackConfig);
    }

    if (middlewareDecoratorRules.length > 1) {
        return handleManyDecoratorRules(middlewareDecoratorRules, webpackConfig)
    }

    return webpackConfig;
};

module.exports = enforceIncludeExtensions;
