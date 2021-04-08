const extensions = require('@tilework/mosaic-dev-utils/extensions');
const { sources } = require('@tilework/mosaic-dev-utils/sources');

const themes = Object.values(sources);

// const safePath = require('./safe-path');

const includePaths = [
    ...themes,
    ...extensions.map(({ packagePath }) => packagePath),
    
    // TODO this may be necessary for Windows
    // ...extensions.map(({ packageName }) => safePath(packageName)),

    // TODO is this necessary?
    ...extensions.map(({ packageName }) => packageName)
];

module.exports = includePaths;
