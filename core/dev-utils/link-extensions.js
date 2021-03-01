const path = require('path');

const shouldUseYarn = require('@plugjs/dev-utils/should-use-yarn');
const execCommandAsync = require('@plugjs/dev-utils/exec-command');
const { getPackageJson } = require('@plugjs/dev-utils/package-json');

module.exports = async (cwd = process.cwd()) => {
    const { dependencies } = getPackageJson(cwd);

    if (!dependencies) {
        return;
    }

    const command = shouldUseYarn() ? 'yarnpkg' : 'npm';

    const linkPromises = Object.entries(dependencies).reduce((acc, [name, version]) => {
        if (!version.startsWith('file:')) {
            // skip all non file dependencies
            return acc;
        }

        // to get path from file:/path trim first 5 symbols
        const packagePath = path.join(cwd, version.slice(5));

        // call async IIFE to get the promise
        const linkPromise = (async () => {
            await execCommandAsync(command, ['link'], packagePath);
            await execCommandAsync(command, ['link', name], cwd);
        })();

        // populate the array with new link promise
        return [...acc, linkPromise];
    }, []);

    await Promise.all(linkPromises);
};
