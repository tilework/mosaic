import pluginStorage from './plugin-storage';

/**
 * Query plugins for config
 * Use namespaces and target specifier to get block of all plugins of specifier type
 * Add member name to the params to get plugins for a specific member
 *
 * @param {string[]} namespaces
 * @param {string} targetSpecifier
 * @param {string|undefined} memberName
 * @param {object} plugins
 */
export default (namespaces, targetSpecifier, memberName) => namespaces.reduce(
    (acc, namespace) => {
        const pluginsOfType = pluginStorage.plugins
            && pluginStorage.plugins[namespace]
            && pluginStorage.plugins[namespace][targetSpecifier];

        if (!memberName) {
            // Handle cases with reduced sections (e.g. function plugins)
            if (pluginsOfType) {
                return acc.concat(pluginsOfType);
            }
        } else {
            // Handle member name present (i.e. class plugins)
            const { value } = Object.getOwnPropertyDescriptor(
                pluginsOfType || {},
                memberName
            ) || {};

            if (value) {
                return acc.concat(value);
            }
        }

        return acc;
    }, []
);
