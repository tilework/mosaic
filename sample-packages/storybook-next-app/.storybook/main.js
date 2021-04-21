const { injectWebpackConfig } = require('@tilework/mosaic-config-injectors')
const webpack = require('webpack');

module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: (config) => injectWebpackConfig(config, { webpack })
}