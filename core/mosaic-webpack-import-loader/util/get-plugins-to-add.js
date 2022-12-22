const path = require('path');
const fs = require('fs');
const extensions = require('@tilework/mosaic-dev-utils/extensions');
const { parse } = require("@babel/parser");

const isPluginFile = (entry) => /\.plugin\.[jt]sx?$/.test(entry);
const isDirectory = (entry) => !!fs.lstatSync(entry).isDirectory();

/**
 * Retrieve a list of recursively located *.plugin.js files
 * Concat due to a flat structure
 *
 * @param {String} basepath
 */
const findPluginFiles = (basepath) => (
    fs.readdirSync(basepath).reduce((acc, pathname) => {
        const pluginPath = path.join(basepath, pathname);
        const isPlugin = isPluginFile(pluginPath);
        const isDir = isDirectory(pluginPath);

        // We only care about plugin files or directories
        if (!isDir && !isPlugin) {
            return acc;
        }

        // If is plugin - add it to a list
        if (isPlugin) {
            return [
                ...acc,
                pluginPath
            ];
        }

        return [
            ...acc,
            // recursively walk the child directory
            ...findPluginFiles(pluginPath)
        ];
    }, [])
);

/**
 * Get the list of import declaration strings
 * Relative to filename
 *
 * @param {string} pathname
 * @param {string} filename
 */
const getExtensionPath = (pathname) => {
    if (!fs.existsSync(pathname)) {
        return [];
    }

    return findPluginFiles(pathname).map(
        (pluginFile) => pluginFile
    );
};

let namespaceToPluginFileMap;

function mapNamespacesToPluginFiles(entrypoint) {
    if (!namespaceToPluginFileMap) {
        namespaceToPluginFileMap = {};
    }

    const rootExtensionImports = getExtensionPath(
        path.join(process.cwd(), 'src', 'plugin'),
        entrypoint
    );

    const allPluginFiles = extensions.reduce(
        (acc, { packagePath }) => {
            const pluginDirectory = path.join(
                packagePath,
                'src',
                'plugin'
            );

            if (!fs.existsSync(pluginDirectory)) {
                return acc;
            }

            return acc.concat(getExtensionPath(pluginDirectory));
        },
        rootExtensionImports
    );

    allPluginFiles.forEach((pluginPath) => {
        const file = fs.readFileSync(pluginPath);

        try {
            const parsed = parse(file.toString(), {
                // parse in strict mode and allow module declarations
                sourceType: "module",

                plugins: [
                    // enable jsx and flow syntax
                    "jsx",
                    "typescript"
                ]
            });

            const exportDeclaration = parsed.program.body
                .find((node) => node.type === 'ExportDefaultDeclaration');

            if (!exportDeclaration) {
                return;
            }

            if (
                !exportDeclaration.declaration
                || !exportDeclaration.declaration.properties
            ) {
                return;
            }

            const namespaces = exportDeclaration.declaration.properties
                .map(({ key }) => key.value);

            namespaces.forEach((namespace) => {
                if (!namespaceToPluginFileMap[namespace]) {
                    namespaceToPluginFileMap[namespace] = [];
                }

                namespaceToPluginFileMap[namespace].push(pluginPath);
            });
        } catch (e) {
            console.log('ERROR is dynamic plugins injection.');
            console.log(e);
        }
    });
}

function getPluginImportsForFile(entrypoint, source) {
    if (!namespaceToPluginFileMap) {
        mapNamespacesToPluginFiles(entrypoint);
    }

    if (Object.entries(namespaceToPluginFileMap).length === 0) {
        return '';
    }

    const rawNamespaceMatches = source.match(/@namespace\s+([^\s]+)/gm);

    if (!rawNamespaceMatches) {
        return '';
    }

    const sourceNamespaces = rawNamespaceMatches.map(
        (match) => match.replace(/@namespace\s+/, '')
    );

    if (!sourceNamespaces || !sourceNamespaces.length) {
        return '';
    }

    const matchedPlugins = sourceNamespaces.reduce((allSourcePlugins, currentNamespace) => {
        const pluginsForCurrentNamespace = namespaceToPluginFileMap[currentNamespace];

        if (pluginsForCurrentNamespace) {
            allSourcePlugins.push(...pluginsForCurrentNamespace);
        }

        return allSourcePlugins;
    }, []);

    return matchedPlugins.map((plugin) => `require('${plugin}')`).join(',');
}

module.exports = {
    getPluginsToAdd: mapNamespacesToPluginFiles,
    getPluginImportsForFile
};