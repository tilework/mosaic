const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');
const globby = require('globby');

const writeJson = require('@tilework/mosaic-dev-utils/write-json');
const extensions = require('@tilework/mosaic-dev-utils/extensions');
const { getPackageJson } = require('@tilework/mosaic-dev-utils/package-json');

const { aliasMap, aliasPostfixMap } = require('./util/alias');
const includePaths = require('../common/include-paths');
const { getMosaicConfig } = require('@tilework/mosaic-dev-utils/mosaic-config');

const hasFilesOfType = (type, rootOnly = false) => (
    rootOnly
        ? includePaths.filter(path.isAbsolute)
        : [process.cwd()]
).some((includePath) => {
    const getMain = () => {
        const { main } = getPackageJson(includePath);
        if (main) {
            const mainPath = path.resolve(includePath, main);

            // Handle main being file
            if (!fs.lstatSync(mainPath).isDirectory()) {
                return path.dirname(mainPath);
            }

            // Main is directory -> use it
            return mainPath;
        }

        return includePath;
    };

    const scannable = getMain();
    const foundTypescriptFiles = globby.sync(
        [
            `**/*.(${type}|${type}x)`, 
            // TODO verify that this works with linked packages
            '!**/node_modules', 
            '!**/*.d.ts'
        ],
        { cwd: scannable }
    );

    return foundTypescriptFiles.length;
});

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

const generateJsConfig = (parentThemeAliases, preferenceAliases) => ({
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

const extendConfig = (existingConfigPath, additionalConfig) => {
    const existingConfig = readJson(existingConfigPath);
    const { extends: extendsRelative = './mosaic.jsconfig.json' } = existingConfig;

    // Read the existing config. Get {} if it does not exist.
    const extendsAbsolute = path.resolve(process.cwd(), extendsRelative);
    const extendsConfig = readJson(extendsAbsolute);

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

    // Handle nothing has changed
    if (JSON.stringify(extendsConfig) === JSON.stringify(resultingExtendsConfig)) {
        return;
    }

    writeJson(extendsAbsolute, resultingExtendsConfig);

    // Ensure correct "extends" path in the base config
    existingConfig.extends = extendsRelative;
    writeJson(existingConfigPath, existingConfig);
};

const ensureTypescriptFile = () => {
    if (hasFilesOfType('ts', true)) {
        return;
    }

    const filename = 'tsfile.ts';
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, '');

    return filename;
};

const createFromScratch = (generatedJsConfig) => {
    const isTs = hasFilesOfType('ts');
    const configPath = path.resolve(
        process.cwd(), 
        isTs ? 'tsconfig.json' : 'jsconfig.json'
    );

    const initialConfig = { include: ["src/**/*"] };

    // Without this TSC will fail
    if (isTs) {
        const dummyTsFile = ensureTypescriptFile();
        initialConfig.include.push(dummyTsFile);
    }

    writeJson(configPath, initialConfig);
    extendConfig(configPath, generatedJsConfig);
};

const createJsConfig = () => {
    const parentThemeAliases = generateParentThemeAliases();
    const preferenceAliases = generatePreferenceAliases();
    const generatedJsConfig = generateJsConfig(parentThemeAliases, preferenceAliases);
    const existingConfigPath = getExistingConfigPath();

    if (!existingConfigPath) {
        createFromScratch(generatedJsConfig);
    } else {
        extendConfig(existingConfigPath, generatedJsConfig);
    }
};

module.exports = createJsConfig;