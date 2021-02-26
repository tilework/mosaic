
function getBabelRules(rules) {
    const babelLoaderMatcher = /babel-loader/;

    const isUsableBabel = (usable) => babelLoaderMatcher.test(usable) || babelLoaderMatcher.test(usable.loader);
    const isBabel = (rule) => {
        if (babelLoaderMatcher.test(rule.loader)) {
            return true;
        }
    
        if (!rule.use) {
            return false;
        }
    
        if (Array.isArray(rule.use)) {
            return !!rule.use.find(isUsableBabel);
        }
    
        return isUsableBabel(rule.use);
    };

    const acc = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const rule of rules) {
        if (rule.oneOf) {
            acc.push(...getBabelRules(rule.oneOf));
        } else if (rule.use || rule.loader) {
            if (isBabel(rule)) {
                acc.push(rule);
            }
        }
    }

    return acc;
};

function isMiddlewareDecorator(babelPlugin) {
    const middlewareDecoratorMatcher = /babel-plugin-middleware-decorator/;

    if (Array.isArray(babelPlugin)) {
        return middlewareDecoratorMatcher.test(babelPlugin[0]);
    }

    if (typeof babelPlugin === 'string') {
        return middlewareDecoratorMatcher.test(babelPlugin);
    }

    throw new Error(`Unexpected type of a babel plugin: ${typeof babelPlugin}`);
}


module.exports = function getMiddlewareDecoratorRules(webpackConfig) {
    const babelRules = getBabelRules(webpackConfig.module.rules);
    const middlewareDecoratorRules = babelRules.filter(
        (rule) => {
            if (!rule || !rule.options || !rule.options.plugins) {
                return false;
            }

            return !!rule.options.plugins.find(isMiddlewareDecorator);
        }
    );

    return middlewareDecoratorRules;
}