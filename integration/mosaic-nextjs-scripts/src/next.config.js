/* eslint-disable arrow-body-style, no-param-reassign, max-len */

const path = require('path');
const ConfigInjectors = require('@tilework/mosaic-config-injectors');
const includePaths = require('@tilework/mosaic-config-injectors/lib/common/include-paths');

module.exports = () => {
    return {
        webpack: (config, { webpack }) => {
            // ===================================
            // EXTENSIBILITY SPECIFIC FEATURES
            // ===================================

            // * Next-specific plugin system stuff

            // * This fixes "Cannot use import statement outside a module"
            // ? is this a breaking change? should we move it to @tilework/mosaic?
            // TODO investigate
            if (Array.isArray(config.externals)) {
                config.externals = config.externals.map((external) => {
                    if (typeof external !== 'function') {
                        return external;
                    }

                    return (ctx, req, cb) => {
                        return includePaths.filter(Boolean).find((include) => (req.startsWith('.')
                            ? new RegExp(include).test(path.resolve(ctx, req))
                            : new RegExp(include).test(req)))
                            ? cb()
                            : external(ctx, req, cb);
                    };
                });
            }

            const babelConfigFile = path.join(__dirname, 'babel.config.js');

            // Use custom babel config file
            config.module.rules.forEach((rule) => {
                if (rule.use) {
                    if (Array.isArray(rule.use)) {
                        const babelLoader = rule.use.find((use) => typeof use === 'object' && use.loader === 'next-babel-loader');

                        if (babelLoader && babelLoader.options) {
                            babelLoader.options.configFile = babelConfigFile;
                        }
                    } else if (rule.use.loader === 'next-babel-loader') {
                        rule.use.options.configFile = babelConfigFile;
                    }
                }
            });
            // ===================================

            // * Inject the prepared config
            ConfigInjectors.injectWebpackConfig(config, {
                webpack,
                entryMatcher: /[\\/]src[\\/]pages[\\/][_].+\.[jt]sx?/
            });

            // Important: return the modified config
            return config;
        },
        webpackDevMiddleware(config) {
            // const ignored = config.watchOptions.ignored.filter(
            //     (regexp) => /[\\/]node_modules[\\/]/.test(regexp)
            // ).concat(excludes);

            // config.watchOptions.ignored = ignored;

            // TODO: add smarter watch options
            // console.log(config);

            return config;
        },
        distDir: 'build'
    };
};

// Add new babel loader => "Identifier 'React' has already been declared"
// Add new babel loader + pass in only expression in plugin => "Cannot use import statement outside a module"
// Default loader + pass in only expression in plugin => "Cannot use import statement outside a module"
// Default loader => "Cannot use import statement outside a module"
