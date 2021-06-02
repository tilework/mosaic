const logger = require('@tilework/mosaic-dev-utils/logger');

class ExcludedExtensionException extends Error {
    constructor(excludedExtensionFile) {
        super(
            'The following file should be transpiled by Babel, but it is not! ' +
            `Plese make sure that it is transpiled by Babel: ${logger.style.file(excludedExtensionFile)} ` +
            'You will not see this message when all the extension files are transpiled by Babel.'
        );
    }
}

module.exports = ExcludedExtensionException;