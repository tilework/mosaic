const extensions = require('@plugjs/dev-utils/extensions');
const { getPackageJson } = require('@plugjs/dev-utils/package-json');
const { sources } = require('@plugjs/dev-utils/sources');

const themes = Object.values(sources);

const packageJsons = [
    ...themes.map((theme) => {
        const packageJson = getPackageJson(theme);

        return {
            packageName: packageJson.name,
            packagePath: theme,
            packageJson: packageJson
        }
    }),
    ...extensions
];

const mainPackageJson = getPackageJson(process.cwd());
const { 
    scandipwa: { 
        test: testablePackages = {} 
    } = {} 
} = mainPackageJson;

const testablePackagePaths = packageJsons
    .filter(({ packageName }) => testablePackages[packageName])
    .map(({ packagePath }) => packagePath);

module.exports = testablePackagePaths;