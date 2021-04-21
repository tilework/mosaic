const { getMosaicConfig } = require('@tilework/mosaic-dev-utils/mosaic-config');
/**
 * Get sourceDirectories field from packageJson.
 *
 * Fallback to 'src' and 'pub' if no field is found.
 * @param {string} cwd
 * @returns {string[]}
 */
const prepareSourcesDirectories = (cwd = process.cwd()) => {
    const { sourceDirectories: projectSourceDirectories = [] } = getMosaicConfig(cwd);

    return ['src', 'pub'].concat(projectSourceDirectories);
};

module.exports = {
    prepareSourcesDirectories
};
