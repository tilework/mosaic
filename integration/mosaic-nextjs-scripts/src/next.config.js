const fs = require('fs');
const path = require('path');
const injectNextConfig = require('@tilework/mosaic-config-injectors/lib/next');
const { NEXT_CONFIG_DEST_NAME } = require('../lib/config');

const baseConfigPath = path.resolve(__dirname, NEXT_CONFIG_DEST_NAME);
const baseConfig = fs.existsSync(baseConfigPath) 
    ? require(baseConfigPath)
    : {};

module.exports = (...args) => injectNextConfig(baseConfig, args);
