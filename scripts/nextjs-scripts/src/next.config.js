/* eslint-disable arrow-body-style */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable @scandipwa/scandipwa-guidelines/export-level-one */

const path = require('path');
const configInjector = require('@scandipwa/scandipwa-extensibility/build-config/util');
const getIncludePaths = require('@scandipwa/scandipwa-extensibility/build-config/util/common/get-include-paths');

module.exports = () => {
    // const abstractStyle = FallbackPlugin.getFallbackPathname('src/style/abstract/_abstract.scss');

    return {
        webpack: (config, { webpack }) => {
            config.plugins.push(...[
            // In development mode, provide simple translations and React
                new webpack.ProvidePlugin({
                    React: 'react',
                    // legacy support
                    PureComponent: ['react', 'PureComponent']
                }),

                // Provide BEM specific variables
                new webpack.DefinePlugin({
                    'process.env': {
                        REBEM_MOD_DELIM: JSON.stringify('_'),
                        REBEM_ELEM_DELIM: JSON.stringify('-')
                    }
                })

                // new CircularDependencyPlugin()
            ]);

            // ===================================
            // EXTENSIBILITY SPECIFIC FEATURES
            // ===================================

            configInjector.injectWebpackConfig(config, {
                webpack,
                entryMatcher: /[\\/]src[\\/]pages[\\/][^_]/
            });

            // * Next-specific plugin system stuff

            // * This fixes "Cannot use import statement outside a module"
            // ? is this a breaking change? should we move it to @scandipwa/extensibility?
            // TODO investigate
            const extensionPaths = getIncludePaths();
            if (Array.isArray(config.externals)) {
                config.externals = config.externals.map((external) => {
                    if (typeof external !== 'function') {
                        return external;
                    }

                    return (ctx, req, cb) => {
                        return extensionPaths.filter(Boolean).find((include) => (req.startsWith('.')
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

            // Important: return the modified config
            return config;
        },
        webpackDevMiddleware(config) {
            // const ignored = config.watchOptions.ignored.filter(
            //     (regexp) => /[\\/]node_modules[\\/]/.test(regexp)
            // ).concat(excludes);

            // config.watchOptions.ignored = ignored;

            // TODO: add smarted watch options
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
