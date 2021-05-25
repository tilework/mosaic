/**
 * This allows importing css, sass and scss modules from node_modules
 */
const allowImportStyles = (webpackConfig) => {
    const { module: { rules = [] } = {} } = webpackConfig;

    const styleRule = rules.find(
        ({ oneOf }) => oneOf && oneOf.some(
            ({ test }) => /(css|s[ac]ss)(?!\w)/.test(test.source)
        )
    );

    if (!styleRule) {
        return;
    }

    const moduleRules = styleRule.oneOf.filter(
        ({ test }) => (
            test 
            && test instanceof RegExp 
            && (test.source === '\\.module\\.css$' || test.source === '\\.module\\.(scss|sass)$')
        )
    );

    moduleRules.forEach((rule) => {
        // TODO only include themes and extensions, but not their node_modules
        delete rule.issuer;
    });

    const globalCssStyleRule = styleRule.oneOf.find(
        ({ test }) => test instanceof RegExp &&  test.source === '(?<!\\.module)\\.css$'
    );

    if (globalCssStyleRule) {
        delete globalCssStyleRule.include;
        delete globalCssStyleRule.issuer;
    }
};

module.exports = allowImportStyles;