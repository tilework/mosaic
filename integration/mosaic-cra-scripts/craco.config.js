/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
const fs = require('fs');
const webpack = require('webpack');
const sassResourcesLoader = require('craco-sass-resources-loader');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const FallbackPlugin = require('@tilework/mosaic-webpack-fallback-plugin');
const { getPackageJson } = require('@tilework/mosaic-dev-utils/package-json');

const { injectBabelConfig, injectWebpackConfig } = require('@tilework/mosaic-config-injectors');

const {
    ESLINT_MODES,
    whenDev
} = require('@tilework/mosaic-craco');

const when = require('./lib/when');
const { cracoPlugins } = require('./lib/build-plugins');

const isDev = process.env.NODE_ENV === 'development';

const getESLintConfig = () => {
    const usersESLintConfig = getPackageJson(process.cwd()).eslintConfig;
    if (usersESLintConfig) {
        return {
            mode: ESLINT_MODES.extends,
            // Ensure we are extending the mosaic-eslint config
            configure: usersESLintConfig
        };
    }
    
    return null;
};

module.exports = () => {
    const abstractStyle = FallbackPlugin.getFallbackPathname('src/style/abstract/_abstract.scss');
    const appIndex = FallbackPlugin.getFallbackPathname(
        'src/index.js',
        undefined, 
        ['src/index.ts', 'src/index.jsx', 'src/index.tsx']
    );
    const appHtml = FallbackPlugin.getFallbackPathname('public/index.html');

    return {
        paths: {
            // Simply fallback to core, this why it's here
            appIndexJs: appIndex,

            // Assume store-front use normal HTML (defined in /public/index.html)
            appHtml
        },
        // Use ESLint config defined in package.json
        eslint: getESLintConfig(),
        babel: {
            loaderOptions: (babelLoaderOptions) => {
                babelLoaderOptions.presets = [
                    [
                        require.resolve('babel-preset-react-app'),
                        {
                            // for some reason only classic works
                            // the "automatic" does not work
                            runtime: 'classic'
                        }
                    ]
                ];

                // TODO figure out why called twice
                if (!babelLoaderOptions.plugins) {
                    babelLoaderOptions.plugins = [];
                }

                // TODO spwa
                // Allow BEM props
                babelLoaderOptions.plugins.unshift('transform-rebem-jsx');

                return injectBabelConfig(babelLoaderOptions, {
                    shouldApplyPlugins: false
                });
            },
            plugins: [],
            presets: []
        },
        webpack: {
            plugins: [
                new webpack.ProvidePlugin({
                    React: 'react',
                    // TODO spwa
                    PureComponent: ['react', 'PureComponent']
                }),

                // Show progress bar when building
                new ProgressBarPlugin(),

                // TODO spwa
                // Provide BEM specific variables
                new webpack.DefinePlugin({
                    'process.env': {
                        REBEM_MOD_DELIM: JSON.stringify('_'),
                        REBEM_ELEM_DELIM: JSON.stringify('-')
                    }
                }),
            ],
            configure: (webpackConfig) => {
                // Remove module scope plugin, it breaks FallbackPlugin and ProvidePlugin
                // TODO make this verbose
                webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
                    (plugin) => plugin.constructor.name !== ModuleScopePlugin.name
                );

                // Allow importing .style, .ts and .tsx files without specifying the extension
                webpackConfig.resolve.extensions.push(...['.scss', '.ts', '.tsx']);

                webpackConfig.plugins.forEach((plugin) => {
                    if (plugin.constructor.name === 'MiniCssExtractPlugin') {
                        plugin.options.ignoreOrder = true;
                    }
                })

                // Allow having empty entry point
                if (isDev) {
                    webpackConfig.entry[1] = appIndex;
                } else {
                    webpackConfig.entry = appIndex;
                }

                // Disable LICENSE comments extraction in production
                webpackConfig.optimization.minimizer[0].options.extractComments = whenDev(() => true, false);

                return injectWebpackConfig(webpackConfig, { 
                    webpack,
                    shouldApplyPlugins: false
                });
            }
        },
        devServer: (devServerConfig, { proxy }) => {
            if (proxy && isDev) {
                // initially added by https://github.com/facebook/create-react-app/issues/1676
                // removing X-Forwarded-* headers so Kubernetes won't panic
                // question is - how do they help and why are they needed?
                // maybe they should be Mosaic - specific?
                proxy[0].xfwd = false;
            }

            return devServerConfig;
        },
        plugins: [
            // TODO spwa
            ...when(
                // if there is no abstract style, do not inject it
                fs.existsSync(abstractStyle),
                [
                    {
                        // Allow using SCSS mix-ins in any file
                        plugin: sassResourcesLoader,
                        options: {
                            resources: abstractStyle
                        }
                    }
                ],
                []
            ),
            ...cracoPlugins
        ]
    };
};
