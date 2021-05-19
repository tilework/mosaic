const fs = require('fs');
const path = require('path');
const injectBabelConfig = require('@tilework/mosaic-config-injectors/lib/babel');
const { BABEL_CONFIG_DEST_NAME } = require('../lib/config');

const defaultBabelConfig = {
    presets: [
        ['next/babel']
    ]
};

const baseConfigPath = path.resolve(__dirname, BABEL_CONFIG_DEST_NAME);
const baseConfig = fs.existsSync(baseConfigPath) 
    ? require(baseConfigPath)
    : defaultBabelConfig;

module.exports = injectBabelConfig(baseConfig);
