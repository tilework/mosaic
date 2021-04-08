const getAllExtensionImports = require('./util/get-all-extension-imports');

/**
 * This injects plugins into the application
 * Mosaic must be globally provided for this
 */
module.exports = function injectImports(source) {
    const filename = this._module.resource;
    const injectableCode = `Mosaic.setPlugins([${ getAllExtensionImports(filename) }]);\n`;

    return [
        injectableCode,
        source
    ].join('');
};
