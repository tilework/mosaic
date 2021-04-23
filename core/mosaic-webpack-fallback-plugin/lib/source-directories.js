const path = require('path');
const { getMosaicConfig } = require('@tilework/mosaic-dev-utils/mosaic-config');
/**
 * Get sourceDirectories field from packageJson.
 *
 * Fallback to 'src' and 'pub' if no field is found.
 * @param {string} cwd
 * @returns {string[]}
 */
const prepareSourceDirectories = (cwd = process.cwd()) => {
    const { sourceDirectories: projectSourceDirectories = [] } = getMosaicConfig(cwd);

    return projectSourceDirectories.map(dir => path.resolve(cwd, dir));
};

module.exports = {
    prepareSourceDirectories
};
