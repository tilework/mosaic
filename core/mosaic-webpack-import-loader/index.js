const { getPluginImportsForFile } = require('./util/get-plugins-to-add');

/**
 * This injects plugins into the application
 * Mosaic must be globally provided for this
 */
module.exports = function injectImports(source) {
    const options = this.query;

    const pluginImports = getPluginImportsForFile(options.entrypoint, source);

    if (!pluginImports) {
        return source;
    }

    return [
        `Mosaic.addPlugins([${pluginImports}]);\n`,
        source
    ].join('');
};
