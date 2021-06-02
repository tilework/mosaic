const path = require('path');
const logger = require('@tilework/mosaic-dev-utils/logger');
const { getMosaicConfig } = require('./mosaic-config');

const isTheme = (pathname, quiet = false) => {
    try {
        const { type } = getMosaicConfig(path.join(pathname, 'package.json'));

        const isTheme = type === 'theme';

        if (quiet || isTheme) {
            // Always simply return, if it is quiet, or if the validation passed
            return isTheme;
        }
    } catch (e) {
        // TODO: do nothing for now
    }

    logger.error(
        `Unable to determine if ${ logger.style.file(pathname) } is a Mosaic theme.`,
        '',
        'The folder is considered a theme, if:',
        `- it contains ${ logger.style.misc('package.json') } file`,
        `- a ${ logger.style.misc('package.json') } field ${ logger.style.misc('mosaic.type') } must exist`,
        `- value of field ${ logger.style.misc('mosaic.type') } must be equal to ${ logger.style.misc('theme') }`,
    );

    return false;
};

module.exports = isTheme;
