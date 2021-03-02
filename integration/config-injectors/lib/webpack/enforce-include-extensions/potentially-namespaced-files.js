const path = require('path');
const includePaths = require('../../common/get-include-paths')();
const isValidNpmName = require('is-valid-npm-name');

const potentiallyNamespacedFiles = includePaths
    .filter((includePath) => path.isAbsolute(includePath) || isValidNpmName(includePath))
    .map((includePath) => path.join(includePath, 'src', 'index.js'));

module.exports = potentiallyNamespacedFiles;