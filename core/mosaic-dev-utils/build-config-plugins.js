const memoize = require('memoizee');
const path = require('path');
const logger = require('@tilework/mosaic-dev-utils/logger');
const { getExtensionsForCwd } = require('./extensions-core');
const { getMosaicConfig } = require('./mosaic-config');

const getBuildConfigPlugins = memoize((cwd = process.cwd()) => getExtensionsForCwd(cwd).reduce(
    (acc, extension) => {
        const { 
            packageJson,
            packagePath,
            packageName
        } = extension;

        const mosaicConfig = getMosaicConfig(packageJson);
        if (!mosaicConfig) {
            return acc;
        }

        const { 
            build: {
                plugins = []
            } = {}
        } = mosaicConfig;

        if (!plugins.length) {
            return acc;
        }

        const buildConfigurationPlugins = plugins.map((relative) => {
            const expectedPath = path.resolve(packagePath, relative);

            try {
                return require(expectedPath);
            } catch (err) {
                if (err.code === 'MODULE_NOT_FOUND') {
                    logger.error(
                        `Build configuration plugin referenced as ${logger.style.file(relative)} from package ${logger.style.file(packageName)} is not found`,
                        `Looked at: ${logger.style.file(expectedPath)}`
                    );
                }

                process.exit(1);
            }
        });

        acc.push({ 
            packageName,
            plugins: buildConfigurationPlugins
        });

        return acc;
    },
    []
));

module.exports = {
    getBuildConfigPlugins
};