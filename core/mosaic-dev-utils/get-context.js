const path = require('path');
const { getMosaicConfig } = require('./mosaic-config');

const EXTENSION_TYPE = 'extension';
const THEME_TYPE = 'theme';
const MAGENTO_TYPE = 'magento';

const MAX_DEPTH = 6;

/**
 * Bubble up from the given directory to find a Mosaic module
 * The module's type should match the expected type(s)
 *
 * @param {string} pathname
 * @param {string|string[]} expectedType
 * @param {number?} depth
 */
const walkDirectoryUp = (pathname, expectedType = false, depth = 0) => {
    if (depth > MAX_DEPTH) {
        return {};
    }

    try {
        const { type } = getMosaicConfig(
            require(path.join(pathname, 'package.json'))
        );

        // Handle type matching
        if (expectedType && (!Array.isArray(expectedType) || expectedType.length)) {
            if (Array.isArray(expectedType) && !expectedType.includes(type)) {
                throw new Error(`Found type does not match the expected ones (${expectedType})`);
            }

            if (expectedType && type !== expectedType) {
                // we throw this to trigger the catch function
                throw new Error(`Found type does not match the expected one (${expectedType})`);
            }
        }

        return { type, pathname };
    } catch (e) {
        return walkDirectoryUp(path.join(pathname, '..'), expectedType, depth + 1);
    }
};

module.exports = {
    walkDirectoryUp,
    contextTypes: {
        EXTENSION_TYPE,
        THEME_TYPE,
        MAGENTO_TYPE
    }
};
