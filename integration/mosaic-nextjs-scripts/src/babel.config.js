const configManager = require('../lib/config');

module.exports = configManager.produceConfig(
    configManager.configMap.babel
);