const configManager = require('../lib/config');

const config = configManager.produceConfig(
    configManager.configMap.babel,
    __dirname
);

module.exports = config;