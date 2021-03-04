const injectLoader = require('./inject-loader');
const provideGlobals = require('./provide-globals');
const supportLegacy = require('./support-legacy');
const enforceIncludeExtensions = require('./enforce-include-extensions');
const resolveFileExtensions = require('./resolve-file-extensions');

/** @type {import('@plugjs/config-injectors').WebpackInjectorConfig} */
const defaultOptions = {
    provideGlobals: true,
    supportLegacy: false
};

const injectWebpackConfigObject = (
    webpackConfig,
    providedOptions = {}
) => {
    const {
        supportLegacy: isSupportLegacy,
        provideGlobals: isProvideGlobals,
        webpack,
        entryMatcher
    } = Object.assign(defaultOptions, providedOptions);

    // TODO handle webpackConfig.resolve.symlinks

    injectLoader(webpackConfig, entryMatcher);
    enforceIncludeExtensions(webpackConfig);
    resolveFileExtensions(webpackConfig);

    if (isProvideGlobals) {
        provideGlobals(webpackConfig, webpack);
    }

    if (isSupportLegacy) {
        supportLegacy(webpackConfig);
    }

    return webpackConfig;
}

/**
 * Inject webpack configuration with necessary things for the e11y package
 *
 * @param {any} webpackConfig
 * @param {import('@plugjs/config-injectors').WebpackInjectorConfig} providedOptions
 */
const injectWebpackConfig = (webpackConfig, providedOptions) => {
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
        )
    }

    // Handle regular configs
    if (typeof webpackConfig === 'object') {
        return injectWebpackConfigObject(webpackConfig, providedOptions)
    } 

    throw new TypeError(`Unexpected type of webpack configuration: ${typeof webpackConfig}!`);
};

module.exports = injectWebpackConfig;
