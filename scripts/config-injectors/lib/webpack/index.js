const injectLoader = require('./inject-loader');
const provideGlobals = require('./provide-globals');
const supportLegacy = require('./support-legacy');
const enforceIncludeExtensions = require('./enforce-include-extensions');

/** @type {import('@plugjs/config-injectors').WebpackInjectorConfig} */
const defaultOptions = {
    provideGlobals: true,
    supportLegacy: false
};

/**
 * Inject webpack configuration with necessary things for the e11y package
 *
 * @param {any} webpackConfig
 * @param {import('@plugjs/config-injectors').WebpackInjectorConfig} providedOptions
 */
const injectWebpackConfig = (
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

    if (isProvideGlobals) {
        provideGlobals(webpackConfig, webpack);
    }

    if (isSupportLegacy) {
        supportLegacy(webpackConfig);
    }

    return webpackConfig;
};

module.exports = injectWebpackConfig;
