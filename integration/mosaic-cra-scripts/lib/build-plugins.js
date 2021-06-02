const path = require('path');
const extensions = require('@tilework/mosaic-dev-utils/extensions');
const logger = require('@tilework/mosaic-dev-utils/logger');
const { getMosaicConfig } = require('@tilework/mosaic-dev-utils/mosaic-config');

// Generate aliases for preference first
const {
    cracoPlugins,
    before
} = extensions.reduce((acc, extension) => {
    const {
        before: nextBefore,
        cracoPlugins: nextCracoPlugins
    } = acc;

    const { packageJson, packagePath } = extension;

    // Take provide field, check if pathname is not available in provisioned names
    const { name } = packageJson;
    const {
        build: {
            before = '',
            cracoPlugins = []
        } = {}
    } = getMosaicConfig(packageJson);

    if (before) {
        const pathname = path.join(packagePath, before);

        try {
            nextBefore.push(require(pathname));
        } catch (e) {
            logger.logN(e);

            logger.error(
                `Failed to load extension\`s ${ logger.style.misc(name) } before-build script.`,
                `Looked in ${ logger.style.file(pathname) } file.`,
                'See detailed error log above.'
            );

            process.exit();
        }
    }

    for (let i = 0; i < cracoPlugins.length; i++) {
        const pathname = path.join(packagePath, cracoPlugins[i]);

        try {
            nextCracoPlugins.push(require(pathname));
        } catch (e) {
            logger.logN(e);

            logger.error(
                `Failed to load extension\`s ${ logger.style.misc(name) } craco-plugins script.`,
                `Looked in ${ logger.style.file(pathname) } file.`,
                'See detailed error log above.'
            );

            process.exit();
        }
    }

    return {
        before: nextBefore,
        cracoPlugins: nextCracoPlugins
    };
}, {
    before: [],
    cracoPlugins: []
});

module.exports = {
    before,
    cracoPlugins
};
