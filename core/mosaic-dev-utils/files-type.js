const fs = require('fs');
const includePaths = require('./include-paths');
const { getPackageJson } = require('./package-json');
const globby = require('globby');
const path = require('path');

const checkIfFileOfTypeExists = (type, path) => (
    globby.sync(
        [
            `**/*.(${type}|${type}x)`,
            // TODO verify that this works with linked packages
            '!**/node_modules',
            '!**/*.d.ts'
        ],
        { cwd: path }
    ).length
);

const hasFilesOfType = (type, specificPath = null, rootOnly = false) => {
    if (specificPath) {
        return checkIfFileOfTypeExists(type, specificPath);
    }

    return (rootOnly
        ? includePaths.filter(path.isAbsolute)
        : [process.cwd()]
    ).some((includePath) => {
        const getMain = () => {
            const { main } = getPackageJson(includePath);

            if (main) {
                const mainPath = path.resolve(includePath, main);

                // Handle main being file
                if (!fs.lstatSync(mainPath).isDirectory()) {
                    return path.dirname(mainPath);
                }

                // Main is directory -> use it
                return mainPath;
            }

            return includePath;
        };

        const scannable = getMain();

        return checkIfFileOfTypeExists(type, scannable);
    });
};

module.exports = {
    hasFilesOfType,
    checkIfFileOfTypeExists
};
