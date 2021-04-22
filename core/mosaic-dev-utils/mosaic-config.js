const { deepmerge } = require('./deepmerge');
const { getPackageJson } = require('./package-json');

const defaultConfig = {
    sourceDirectories: [
        'src',
        'pub'
    ]
};

const getMosaicConfig = (pathname, context = process.cwd()) => {
    const packageJson = typeof pathname === 'string'
        ? getPackageJson(pathname, context)
        : pathname;

    let mosaicConfig = {};

    if (packageJson.mosaic) {
        mosaicConfig = packageJson.mosaic;
    }

    if (packageJson.scandipwa) { // fallback to legacy field
        mosaicConfig = packageJson.scandipwa;
    }


    return deepmerge(defaultConfig, mosaicConfig);

};

module.exports = {
    getMosaicConfig
};
