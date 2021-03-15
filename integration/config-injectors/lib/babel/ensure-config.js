const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');
const globby = require('globby');

const writeJson = require('@plugjs/dev-utils/write-json');
const extensions = require('@plugjs/dev-utils/extensions');
const { getPackageJson } = require('@plugjs/dev-utils/package-json');

const { aliasMap, aliasPostfixMap } = require('./util/alias');
const includePaths = require('../common/include-paths');

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
        }

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
        const {
            scandipwa: {
                preference = ''
            } = {}
        } = packageJson;
    
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
}

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
}

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
}

const extendConfig = (configPath, additionalConfig) => {
    const config = readJson(configPath);
    const { extends: extendsRelative = './extendconfig.json' } = config;

    // Read the existing config. Get {} if it does not exist.
    const extendsAbsolute = path.resolve(process.cwd(), extendsRelative);
    const extendsConfig = readJson(extendsAbsolute);

    // Generate and save new extends config
    const resultingExtendsConfig = deepmerge(extendsConfig, additionalConfig, {
        arrayMerge: (target, source, options) => {
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
    writeJson(extendsAbsolute, resultingExtendsConfig);

    // Ensure correct "extends" path in the base config
    config.extends = extendsRelative;
    writeJson(configPath, config);
}

const ensureTypescriptFile = () => {
    if (hasFilesOfType('ts', true)) {
        return;
    }

    const filename = 'tsfile.ts';
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, '');

    return filename;
}

const createFromScratch = (generatedJsConfig) => {
    const configPath = path.resolve(
        process.cwd(), 
        hasFilesOfType('ts') ? 'tsconfig.json' : 'jsconfig.json'
    );

    // Without this TSC will fail
    const dummyTsFile = ensureTypescriptFile();

    const initialConfig = {
        include: ["src/**/*", dummyTsFile].filter(Boolean)
    }

    writeJson(configPath, initialConfig);
    extendConfig(configPath, generatedJsConfig);
}

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
}

module.exports = createJsConfig;