const path = require('path');
const { getPackageJson } = require('@tilework/mosaic-dev-utils/package-json');
const writeJson = require('@tilework/mosaic-dev-utils/write-json');
const logger = require('@tilework/mosaic-dev-utils/logger');

const injectLoader = require('./inject-loader');
const provideGlobals = require('./provide-globals');
const supportLegacy = require('./support-legacy');
const enforceIncludeExtensions = require('./enforce-include-extensions');
const resolveFileExtensions = require('./resolve-file-extensions');
const injectWebpackFallbackPlugin = require('./inject-fallback-plugin');
const allowImportStyles = require('./allow-import-styles');
const { applyPlugins } = require('../common/apply-plugins');

/** @type {import('@tilework/mosaic-config-injectors').WebpackInjectorConfig} */
const defaultOptions = {
    provideGlobals: true,
    supportLegacy: false,
    shouldApplyPlugins: true
};

const injectWebpackConfigObject = (
    webpackConfig,
    providedOptions = {}
) => {
    const {
        supportLegacy: isSupportLegacy,
        provideGlobals: isProvideGlobals,
        webpack,
        entryMatcher,
        shouldApplyPlugins
    } = Object.assign(defaultOptions, providedOptions);

    injectLoader(webpackConfig, entryMatcher);
    enforceIncludeExtensions(webpackConfig);
    resolveFileExtensions(webpackConfig);
    injectWebpackFallbackPlugin(webpackConfig);
    allowImportStyles(webpackConfig);

    if (isProvideGlobals) {
        provideGlobals(webpackConfig, webpack);
    }

    if (isSupportLegacy) {
        supportLegacy(webpackConfig);
    }

    if (shouldApplyPlugins) {
        const finalConfig = applyPlugins(webpackConfig, 'webpack');

        return finalConfig
    }

    return webpackConfig;
};

const ensureMainMosaicConfig = () => {
    const mainPackageJson = getPackageJson(process.cwd());

    if (!mainPackageJson) {
        logger.log(
            `Looked for a package.json at: ${process.cwd()}/`,
            `Unable to find one, error may occur. Make sure to have a package.json with a mosaic field in your CWD.`
        );

        process.exit(1);
    }

    if (
        Object.prototype.hasOwnProperty.call(mainPackageJson, 'mosaic')
        || Object.prototype.hasOwnProperty.call(mainPackageJson, 'scandipwa')
    ) {
        return;
    }

    // Ensure 'mosaic' field in the main package.json
    mainPackageJson.mosaic = {};
    writeJson(
        path.join(process.cwd(), 'package.json'),
        mainPackageJson
    )
};

/**
 * Inject webpack configuration with necessary things for the e11y package
 *
 * @param {any} webpackConfig
 * @param {import('@tilework/mosaic-config-injectors').WebpackInjectorConfig} providedOptions
 */
const injectWebpackConfig = (webpackConfig, providedOptions) => {
    ensureMainMosaicConfig();

    // Handle function configs
    if (typeof webpackConfig === 'function') {
        return (env, argv) => injectWebpackConfigObject(webpackConfig(env, argv), providedOptions);
    } 
    
    // Handle promise configs
    if (webpackConfig instanceof Promise) {
        return webpackConfig.then((config) => injectWebpackConfigObject(config, providedOptions));
    } 
    
    // Handle arrays (multi-compiler mode)
    if (Array.isArray(webpackConfig)) {
        throw new TypeError(
            'Array configurations are not supported! '+
            'You may apply this injector manually to each config item you consider necessary to inject.'
        );
    }

    // Handle regular configs
    if (typeof webpackConfig === 'object') {
        return injectWebpackConfigObject(webpackConfig, providedOptions);
    } 

    throw new TypeError(`Unexpected type of webpack configuration: ${typeof webpackConfig}!`);
};

module.exports = injectWebpackConfig;
