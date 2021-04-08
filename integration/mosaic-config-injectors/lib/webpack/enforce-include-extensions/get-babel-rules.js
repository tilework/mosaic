const { getRuleAppliesToFile } = require("../util/rule-set");

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

/**
 * Extracts all babel-related rules from the given rules array
 * Optionally, retrieves only the rules applicable to the given file
 * 
 * @param {object} rules 
 * @param {string?} filepath
 * @param {boolean?} isOneOf
 */
const getBabelRules = (rules, filepath, isOneOf = false) => {
    const acc = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const rule of rules) {
        // If is oneOf - recursive retrieval with stopper
        if (rule.oneOf) {
            const babelRules = getBabelRules(rule.oneOf, filepath, true);

            // If not oneOf - all rules may apply
            if (!isOneOf) {
                acc.push(...babelRules);

            // If is oneOf - take only the first hit
            } else {
                acc.push(babelRules[0]);
            }
        } else if (rule.use || rule.loader) {
            // Handle simple rule - add to the hitlist
            if (isBabel(rule) && (!filepath || getRuleAppliesToFile(rule, filepath))) {
                acc.push(rule);
            }
        }
    }

    return acc;
};

module.exports = getBabelRules;