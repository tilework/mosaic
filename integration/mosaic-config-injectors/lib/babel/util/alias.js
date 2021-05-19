/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable fp/no-loops */
const path = require('path');
const { sources, PROJECT } = require('@tilework/mosaic-dev-utils/sources');
const { getParentThemeAliases } = require('@tilework/mosaic-dev-utils/parent-theme');

const aliasPostfixMap = {
    // Leave for people who are willing to use the recommended folder structure
    Style: `.${path.sep}${path.join('src', 'style')}`,
    Component: `.${path.sep}${path.join('src', 'component')}`,
    Route: `.${path.sep}${path.join('src', 'route')}`,
    Store: `.${path.sep}${path.join('src', 'store')}`,
    Util: `.${path.sep}${path.join('src', 'util')}`,
    Query: `.${path.sep}${path.join('src', 'query')}`,
    Type: `.${path.sep}${path.join('src', 'type')}`,

    // Default alias
    ['']: `.${path.sep}src`
};

const sourcePrefixMap = {
    [PROJECT]: '',
    ...getParentThemeAliases()
};

const aliasMap = {};

/**
 * Glue together:
 * - source prefix + alias postfix
 * - source path + alias relative path
 */
for (const source in sourcePrefixMap) {
    const prefix = sourcePrefixMap[source];
    aliasMap[source] = {};

    for (const postfix in aliasPostfixMap) {
        const aliasKey = prefix + postfix;

        // Prevent '' alias - it is breaking absolute imports
        if (!aliasKey) {
            continue;
        }

        const aliasPath = path.join(sources[source], aliasPostfixMap[postfix]);
        aliasMap[source][aliasKey] = aliasPath;
    }
}

/**
 * These aliases are used by Babel
 */
const alias = Object.entries(aliasMap).reduce(
    (acc, [, values]) => ({ ...acc, ...values }), 
    {}
);

module.exports = { alias, aliasMap, aliasPostfixMap };
