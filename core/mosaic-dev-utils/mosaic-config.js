const { getPackageJson } = require('./package-json')

/**
 * Get mosaic config from package.json file
 * @param {string | object} pathname path to a directory with package.json or package.json object
 * @param {string} context
 * @returns {MosaicConfig}
 */
const getMosaicConfig = (pathname, context = process.cwd()) => {
    const packageJson = typeof pathname === 'string'
        ? getPackageJson(pathname, context)
        : pathname;

    if (packageJson.mosaic) {
        return packageJson.mosaic;
    } else if (packageJson.scandipwa) { // fallback to legacy field
        return packageJson.scandipwa;
    }

    return {};
}

module.exports = {
    getMosaicConfig
};
