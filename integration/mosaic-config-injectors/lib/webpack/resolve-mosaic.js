const logger = require('@tilework/mosaic-dev-utils/logger');

const resolveMosaic = () => {
    // Get the one from CWD
    try {
        return require.resolve('@tilework/mosaic', { paths: [process.cwd()] });
    } catch (err) {
        logger.error(
            `${logger.style.misc('@tilework/mosaic')} cannot be resolved from the CWD. Please install ${logger.style.misc('@tilework/mosaic')} into the main theme.`,
            `This way all of your packages are going to use the same version of ${logger.style.misc('@tilework/mosaic')}`
        );

        process.exit(0);
    }
};

module.exports = resolveMosaic;