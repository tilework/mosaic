const fs = require('fs');
const UnexpectedBabelPluginTypeException = require('../../../../exceptions/unexpected-babel-plugin-type');
const getBabelRules = require('./get-babel-rules');

/**
 * Checks whether the given babel plugin transpiles @namespace magic comments
 * 
 * @param {string|array} babelPlugin 
 */
const isBabelPluginMiddlewareDecorator = (babelPlugin) => {
    const middlewareDecoratorMatcher = /babel-plugin-middleware-decorator/;

    if (Array.isArray(babelPlugin)) {
        return middlewareDecoratorMatcher.test(babelPlugin[0]);
    }

    if (typeof babelPlugin === 'string') {
        return middlewareDecoratorMatcher.test(babelPlugin);
    }

    throw new UnexpectedBabelPluginTypeException(typeof(babelPlugin));
}

/**
 * Checks whether the provided babel config contains a plugin
 * To transpile @namespace magic comments
 * 
 * @param {object} babelConfig 
 */
const isBabelConfigWithMiddlewareDecorator = (babelConfig) => {
    const { plugins = [] } = babelConfig;

    return plugins.some(isBabelPluginMiddlewareDecorator);
}

/**
 * Determines whether 'use' key of webpack config
 * Provides a rule to transpile @namespace magic comments
 * 
 * @param {object} useEntry 
 */
const isUseEntryMiddlewareDecorator = (useEntry) => {
    /**
     * Reads the given Babel config file
     * 
     * @param {string} filename 
     */
    const readBabelConfig = (filename) => {
        // Assume JSON
        if (filename.endsWith('.babelrc')) {
            return JSON.parse(fs.readFileSync(options.configFile));
        } else {
        // Assume JS\JSON
            return require(filename);
        }
    }

    // Handle use: { loader: ... , options: {...} }
    if (typeof useEntry === 'object') {
        const { options } = Array.isArray(useEntry) 
            // When 'use' entry is an array, its second cell contains loader's options
            ? useEntry[1] 
            // Otherwise, the object IS options itself
            : useEntry;

        if (options.configFile) {
            const babelConfig = readBabelConfig(options.configFile);
            return isBabelConfigWithMiddlewareDecorator(babelConfig)
        }

        if (options.plugins) {
            return isBabelConfigWithMiddlewareDecorator(options);
        }

        return false;
    }


    // Currently, babel transforms with webpack rules where 'use' is a function
    // Are not allowed
    if (typeof useEntry === 'function') {
        // TODO notify ?
    }

    return false;
}

/**
 * Checks if the given webpack rule transpiles @namespace magic comments
 * 
 * @param {object} rule 
 */
const isRuleMiddlewareDecorator = (rule) => {
    if (!rule || (!rule.options && !rule.use)) {
        return false;
    }

    if (rule.use) {
        return isUseEntryMiddlewareDecorator(rule.use);
    }

    if (rule.options.plugins) {
        return isBabelConfigWithMiddlewareDecorator(rule.options);
    }
};

module.exports = function getMiddlewareDecoratorRules(webpackConfig) {
    const babelRules = getBabelRules(webpackConfig.module.rules);
    const middlewareDecoratorRules = babelRules.filter(isRuleMiddlewareDecorator);

    return middlewareDecoratorRules;
}