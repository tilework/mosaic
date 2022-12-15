const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');

const writeJson = require('@tilework/mosaic-dev-utils/write-json');
const extensions = require('@tilework/mosaic-dev-utils/extensions');
const { getParentThemePaths } = require('@tilework/mosaic-dev-utils/parent-theme');
const { hasFilesOfType } = require('@tilework/mosaic-dev-utils/files-type');
const { aliasMap, aliasPostfixMap } = require('./util/alias');
const { getMosaicConfig } = require('@tilework/mosaic-dev-utils/mosaic-config');
const { getExtensionsPath } = require('@tilework/mosaic-dev-utils/extensions-core');

// Faultproof
const readJson = (jsonPath) => {
    if (!fs.existsSync(jsonPath)) {
        return {};
    }

    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
};

// Generate aliases for preference first
const generatePreferenceAliases = () => {
    const preferenceAliases = extensions.reduce((acc, extension) => {
        const { packageJson, packagePath } = extension;

        // Take provide field, check if pathname is not available in provisioned names
        const { preference = '' } = getMosaicConfig(packageJson);

        if (!preference) {
            return acc;
        }

        const posixPackagePath = packagePath.split(path.sep).join(path.posix.sep);

        return {
            ...acc,
            [`${preference}/*`]: [path.relative(process.cwd(), posixPackagePath)]
        };
    }, {});

    return preferenceAliases;
};

const generateParentThemeAliases = () => {
    /**
     * These aliases are used in JSConfig by VSCode
     *
     * NOTE: the reduce right is used, so child themes, contain aliases
     * to their child parent themes
     */
    const { parentThemeAliases } = Object.entries(aliasMap).reduceRight(
        (acc, [, aliasPathMap]) => {
            Object.entries(aliasPathMap).forEach(
                ([alias, pathname], i) => {
                    const posixPathname = pathname.split(path.sep).join(path.posix.sep);
                    acc.aliasStack[i].push(
                        // it is required to be relative, otherwise it does not work
                        `${path.relative(process.cwd(), posixPathname)}/*`
                    );

                    acc.parentThemeAliases[`${ alias }/*`] = Array.from(acc.aliasStack[i]);
                }
            );

            return acc;
        },
        {
            aliasStack: Array.from(Object.keys(aliasPostfixMap), () => ([])),
            parentThemeAliases: {}
        }
    );

    return parentThemeAliases;
};

const generateConfig = (parentThemeAliases, preferenceAliases) => ({
    compilerOptions: {
        baseUrl: `.${path.posix.sep}`,
        jsx: 'react',
        paths: {
            ...parentThemeAliases,
            ...preferenceAliases
        }
    }
});

const getExistingConfigPath = () => {
    const jsConfigPath = path.join(process.cwd(), 'jsconfig.json');
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');

    const existingConfigPath = [jsConfigPath, tsConfigPath].find(
        (configPath) => fs.existsSync(configPath)
    );

    return existingConfigPath;
};

const getConfigInclude = (initialInclude = []) => {
    const extendedInclude = ['src/**/*'];

    // Go through themes and include there relative path
    getParentThemePaths().forEach((parentThemePath) => {
        extendedInclude.push(`${path.relative(process.cwd(), parentThemePath)}/src/**/*`);
    });

    // Go through extensions and include there relative path
    getExtensionsPath().forEach((extensionPath) => {
        extendedInclude.push(extensionPath);
    });

    // Filter out include paths that already exists in existing one. Removing duplicates.
    const filteredExtendedInclude = extendedInclude.filter((path) => !initialInclude.includes(path));

    return [
        ...initialInclude,
        ...filteredExtendedInclude
    ];
};

const extendConfig = (existingConfigPath, additionalConfig) => {
    const existingConfig = readJson(existingConfigPath);
    const {
        extends: extendsRelative = './mosaic.jsconfig.json',
        include: initialInclude
    } = existingConfig;

    // Read the existing config. Get {} if it does not exist.
    const extendsAbsolute = path.resolve(process.cwd(), extendsRelative);
    const extendsConfig = readJson(extendsAbsolute);
    // Getting new include for config depending on existing one.
    const additionalInclude = getConfigInclude(initialInclude);

    // Generate and save new extends config
    const resultingExtendsConfig = deepmerge(extendsConfig, additionalConfig, {
        arrayMerge: (target, source) => {
            const destination = target.slice();

            for (const item of source) {
                if (destination.includes(item)) {
                    continue;
                }

                destination.push(item);
            }

            return destination;
        }
    });

    // Handle is extends field has changed
    if (JSON.stringify(extendsConfig) !== JSON.stringify(resultingExtendsConfig)) {
        writeJson(extendsAbsolute, resultingExtendsConfig);
    }

    // Ensure correct "extends" path in the base config
    existingConfig.extends = extendsRelative;
    // Ensure include contains correct paths
    existingConfig.include = additionalInclude;
    writeJson(existingConfigPath, existingConfig);
};

const createFromScratch = (generatedJsConfig) => {
    const isTs = hasFilesOfType('ts');
    const configPath = path.resolve(
        process.cwd(),
        isTs ? 'tsconfig.json' : 'jsconfig.json'
    );

    const initialConfig = { include: getConfigInclude() };

    writeJson(configPath, initialConfig);
    extendConfig(configPath, generatedJsConfig);
};

const createJsConfig = () => {
    const parentThemeAliases = generateParentThemeAliases();
    const preferenceAliases = generatePreferenceAliases();
    const generatedConfig = generateConfig(parentThemeAliases, preferenceAliases);
    const existingConfigPath = getExistingConfigPath();

    if (!existingConfigPath) {
        createFromScratch(generatedConfig);
    } else {
        extendConfig(existingConfigPath, generatedConfig);
    }
};

module.exports = createJsConfig;
