const extensions = require('@plugjs/dev-utils/extensions');
const safePath = require('./safe-path');

const getIncludePaths = () => [
    ...extensions.map(({ packagePath }) => packagePath),
    // TODO figure this out
    // ...extensions.map(({ packageName }) => safePath(packageName)),
    ...extensions.map(({ packageName }) => packageName)
];

module.exports = getIncludePaths;
