const logger = require('@plugjs/dev-utils/logger');

module.exports = function handleNoMiddlewareDecoratorRules() {
    logger.error(
        'A rule to transpile code with "babel-plugin-middleware-decorator" has not been found in your webpack configuration!',
        'Without babel transformations, the plugin system cannot provide any additional syntax.',
        `${logger.style.code('@namespace')} magic comments will not work in this setup.`,
        'Consider introducing Babel to your application in order to use the functionality like it is intended to be used.'
    );
}