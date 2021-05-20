const fs = require('fs');
const path = require('path');

const { 
    injectBabelConfig, 
    injectNextConfig 
} = require('@tilework/mosaic-config-injectors');

const configManager = {
    generateBaseConfigName: function (name) {
        return `base.${name}`;
    },

    configMap: {
        babel: {
            filenames: [
                'babel.config.js', 
                'babel.config.cjs', 
                'babel.config.mjs', 
                'babel.config.json',
                '.babelrc.json',
                '.babelrc.js',
                '.babelrc.cjs',
                '.babelrc.mjs',
                '.babelrc'
            ],
            defaultConfig: {
                presets: [
                    ['next/babel']
                ]
            },
            inject: injectBabelConfig
        },
        next: {
            filenames: [
                'next.config.js'
            ],
            defaultConfig: {},
            inject: injectNextConfig
        }
    },

    /**
     * Erases the old copied config and copies a new config from the theme, if it exists
     * @param {object} configMapItem Choose a property from the map above
     */
    handleConfig: function (themeRoot, destRoot, configMapItem) {
        const { filenames } = configMapItem;

        // If any configs exist from the previous launches - erase them
        this.clearConfig(destRoot, filenames);

        // Find config in 
        const {
            srcConfigPath,
            srcConfigFilename
        } = filenames.reduce(
            (acc, srcConfigFilename) => {
                // "early break"
                if (Object.keys(acc).length) {
                    return acc;
                }

                const srcConfigPath = path.resolve(themeRoot, srcConfigFilename);
                if (!fs.existsSync(srcConfigPath)) {
                    return {};
                }

                return {
                    srcConfigPath,
                    srcConfigFilename
                };
            },
            {}
        );

        if (!fs.existsSync(srcConfigPath)) {
            return;
        }

        const destConfigFilename = this.generateBaseConfigName(srcConfigFilename);
        const destConfigPath = path.resolve(destRoot, destConfigFilename);
        
        fs.copyFileSync(srcConfigPath, destConfigPath);
    },


    readConfig: function (filepath) {
        if (!path.isAbsolute(filepath)) {
            throw new Error(
                'Expected an absolute path in the readConfig function!\n' +
                `Received: ${filepath}\n`
            );
        }
        
        if (/\.[cm]?js$/.test(filepath)) {
            return require(filepath);
        }

        if (/\.json$/.test(filepath) || /^\.\w+rc$/.test(filepath)) {
            return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        }

        throw new Error(
            `Unable to read config file, it is recognized neither as JS nor as JSON: ${filepath}`
        );
    },

    produceConfig: function (configMapItem, configDir) {
        const { 
            defaultConfig,
            inject,
            filenames
        } = configMapItem;

        const copiedConfigPath = filenames.reduce(
            (acc, filename) => {
                if (acc) {
                    return acc;
                }

                const configPath = path.resolve(
                    configDir, 
                    this.generateBaseConfigName(filename)
                );

                if (fs.existsSync(configPath)) {
                    return configPath;
                }
            },
            null
        );

        const baseConfig = copiedConfigPath 
            ? this.readConfig(copiedConfigPath)
            : defaultConfig;

        inject(baseConfig);

        return baseConfig;
    },

    clearConfig: function (destRoot, filenames) {
        filenames.forEach((filename) => {
            const configFilePath = path.resolve(
                destRoot, 
                this.generateBaseConfigName(filename)
            );
        
            if (!fs.existsSync(configFilePath)) {
                return;
            }
        
            fs.rmSync(configFilePath);
        });
    }
};

module.exports = configManager;