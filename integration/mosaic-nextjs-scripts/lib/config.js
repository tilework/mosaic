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
            copiedConfigPath: null,
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
            copiedConfigPath: null,
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
                if (acc.filename) {
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
        configMapItem.copiedConfigPath = destConfigPath;
    },


    readConfig: function (filepath) {
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

    produceConfig: function (configMapItem) {
        const { 
            defaultConfig,
            copiedConfigPath,
            inject
        } = configMapItem;

        const baseConfig = copiedConfigPath 
            ? this.readConfig(copiedConfigPath)
            : defaultConfig;

        return inject(baseConfig);
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