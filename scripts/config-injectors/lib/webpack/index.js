const injectLoader = require('./inject-loader');
const provideGlobals = require('./provide-globals');
const supportLegacy = require('./support-legacy');
const enforceIncludeExtensions = require('./enforce-include-extensions');

const getOptionalWebpack = () => {
    try {
        return require('webpack');
    } catch {
        return null;
    }
};

/** @type {import('@plugjs/plugjs').WebpackInjectorConfig} */
const defaultOptions = {
    provideGlobals: true,
    supportLegacy: false,
    disableExcludeWarning: false,
    webpack: getOptionalWebpack()
};

/**
 * Inject webpack configuration with necessary things for the e11y package
 *
 * @param {any} webpackConfig
 * @param {import('@plugjs/plugjs').WebpackInjectorConfig} providedOptions
 */
const injectWebpackConfig = (
    webpackConfig,
    providedOptions = {}
) => {
    const {
        supportLegacy: isSupportLegacy,
        provideGlobals: isProvideGlobals,
        disableExcludeWarning: isDisableExcludeWarning,
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
