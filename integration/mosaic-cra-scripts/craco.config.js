/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
const webpack = require('webpack');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const FallbackPlugin = require('@tilework/mosaic-webpack-fallback-plugin');
const { getPackageJson } = require('@tilework/mosaic-dev-utils/package-json');

const injectBabelConfig = require('@tilework/mosaic-config-injectors/lib/babel');
const injectWebpackConfig = require('@tilework/mosaic-config-injectors/lib/webpack');

const {
    ESLINT_MODES,
    whenDev
} = require('@tilework/mosaic-craco');

const { cracoPlugins } = require('./lib/build-plugins');

const isDev = process.env.NODE_ENV === 'development';

const getESLintConfig = () => {
    const usersESLintConfig = getPackageJson(process.cwd()).eslintConfig;
    if (usersESLintConfig) {
        return {
            mode: ESLINT_MODES.extends,
            // Ensure we are extending the scandipwa-eslint config
            configure: usersESLintConfig
        }
    }
    
    return null;
}

module.exports = () => {
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

                return injectBabelConfig(babelLoaderOptions);
            }
        },
        webpack: {
            plugins: [
                new webpack.ProvidePlugin({
                    React: 'react'
                }),

                // Show progress bar when building
                new ProgressBarPlugin()
            ],
            configure: (webpackConfig) => {
                // Remove module scope plugin, it breaks FallbackPlugin and ProvidePlugin
                // TODO make this verbose
                webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
                    (plugin) => plugin.constructor.name !== ModuleScopePlugin.name
                );

                // Allow importing .style, .ts and .tsx files without specifying the extension
                webpackConfig.resolve.extensions.push(...['.scss', '.ts', '.tsx']);

                // Allow having empty entry point
                if (isDev) {
                    webpackConfig.entry[1] = appIndex;
                } else {
                    webpackConfig.entry = appIndex;
                }

                // Disable LICENSE comments extraction in production
                webpackConfig.optimization.minimizer[0].options.extractComments = whenDev(() => true, false);

                return injectWebpackConfig(webpackConfig, { webpack });
            }
        },
        devServer: (devServerConfig, { proxy }) => {
            if (proxy && isDev) {
                // initially added by https://github.com/facebook/create-react-app/issues/1676
                // removing X-Forwarded-* headers so Kubernetes won't panic
                // question is - how do they help and why are they needed?
                // maybe they should be ScandiPWA specific?
                proxy[0].xfwd = false;
            }

            return devServerConfig;
        },
        plugins: cracoPlugins
    };
};
