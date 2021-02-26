function calculateConditionalCondition(condition, filepath) {
    const { 
        and, 
        or, 
        not
    } = condition;

    const andIsOK = !Array.isArray(and) 
        || and.every((subcondition) => getConditionAppliesToFile(subcondition, filepath));

    const orIsOk = !Array.isArray(or) 
        || or.some((subcondition) => getConditionAppliesToFile(subcondition, filepath));

    const notIsOk = !Array.isArray(not) 
        || !not.some((subcondition) => getConditionAppliesToFile(subcondition, filepath));

    return andIsOK && orIsOk && notIsOk;
}

function getConditionAppliesToFile(condition, filepath) {
    // Handle null-ish condition passed
    if (!condition) {
        return false;
    }

    // Find a path starts with this condition
    if (typeof condition === 'string') {
        return filepath.startsWith(condition);
    }

    // Find a path that when passed to the condition returns true
    if (typeof condition === 'function') {
        return condition(filepath);
    }

    // Find a path that complies to the RegExp given
    if (condition instanceof RegExp) {
        return condition.test(filepath);
    }

    // Find a condition that evaluates to something at the other conditions
    if (Array.isArray(condition)) {
        return condition.find(getConditionAppliesToFile);
    }

    // If condition is an { and, or, not } object -> calculate it
    if (typeof condition === 'object') {
        return calculateConditionalCondition(condition, filepath);
    }

    return false;
};

function getRuleAppliesToFile(rule, filepath) {
    const {
        test,
        include,
        exclude,
        resource
    } = rule;

    // TODO figure out the `issuer` rule

    const includeRulesOK = [test, include, resource]
        .filter(Boolean)
        .every((condition) => getConditionAppliesToFile(condition, filepath));

    const excludeRuleOK = !exclude || !getConditionAppliesToFile(exclude, filepath);

    return includeRulesOK && excludeRuleOK;
}

module.exports = {
    getRuleAppliesToFile,
    getConditionAppliesToFile
}