const getAllExtensionImports = require('./util/get-all-extension-imports');

/**
 * This injects plugins into the application
 * ExtUtils must be globally provided for this
 */
module.exports = function injectImports(source) {
    const filename = this._module.resource;
    const injectableCode = `ExtUtils.setPlugins([${ getAllExtensionImports(filename) }]);\n`;

    return [
        injectableCode,
        source
    ].join('');
};
