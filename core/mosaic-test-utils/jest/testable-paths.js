const extensions = require('@tilework/mosaic-dev-utils/extensions');
const { getPackageJson } = require('@tilework/mosaic-dev-utils/package-json');
const { sources } = require('@tilework/mosaic-dev-utils/sources');

const themes = Object.values(sources);

const packageJsons = [
    ...themes.map((theme) => {
        const packageJson = getPackageJson(theme);

        return {
            packageName: packageJson.name,
            packagePath: theme,
            packageJson: packageJson
        };
    }),
    ...extensions
];

const mainPackageJson = getPackageJson(process.cwd());
const { 
    mosaic: { 
        tests: testablePackages = {} 
    } = {} 
} = mainPackageJson;

const testablePackagePaths = packageJsons
    .filter(({ packageName }) => testablePackages[packageName])
    .map(({ packagePath }) => packagePath);

module.exports = testablePackagePaths;