const configManager = require('../lib/config');

const config = configManager.produceConfig(
    configManager.configMap.next,
    __dirname
);

module.exports = config;