/**
 * Extracts all babel-related rules from the given rules array
 * 
 * @param {object} rules 
 */
const getBabelRules = (rules) => {
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

module.exports = getBabelRules;