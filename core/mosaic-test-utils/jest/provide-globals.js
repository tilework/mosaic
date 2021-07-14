const resolveMosaic = require('@tilework/mosaic-config-injectors/lib/webpack/resolve-mosaic');
const Mosaic = require(resolveMosaic()).default;

global.Mosaic = Mosaic;