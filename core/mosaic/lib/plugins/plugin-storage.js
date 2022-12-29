import getGlobalContext from '../context/get-global-context';
import generateConfig from './generate-config';

class PluginStorage {
    constructor() {
        // Plugins' storage, ex: window.plugins
        this.plugins = [];
    }

    exposePlugins() {
        // Expose this.plugins to the global context
        // For debugging convenience; this is not used in the code
        getGlobalContext().plugins = this.plugins;
    }

    addPlugins(importArray) {
        const newPlugins = generateConfig(importArray);

        if (!this.plugins) {
            this.plugins = {};
        }

        // vvv deep merge plugins
        Object.entries(newPlugins).forEach(([namespace, pConf]) => {
            if (!this.plugins[namespace]) {
                this.plugins[namespace] = {};
            }

            Object.entries(pConf).forEach(([handlerType, cpConf]) => {
                // vvv handles reduced plugins case
                if (Array.isArray(cpConf)) {
                    if (!this.plugins[namespace][handlerType]) {
                        this.plugins[namespace][handlerType] = [];
                    }

                    this.plugins[namespace][handlerType].push(...cpConf);
                    return;
                }

                // vvv handles regular plugin case
                if (!this.plugins[namespace][handlerType]) {
                    this.plugins[namespace][handlerType] = {};
                }

                Object.entries(cpConf).forEach(([memberName, ccpConf]) => {
                    if (!this.plugins[namespace][handlerType][memberName]) {
                        this.plugins[namespace][handlerType][memberName] = [];
                    }

                    this.plugins[namespace][handlerType][memberName].push(...ccpConf);
                });
            });
        });

        this.exposePlugins();
    }

    setPlugins(importArray) {
        this.plugins = generateConfig(importArray);
        this.exposePlugins();
    }
}

export default new PluginStorage();
