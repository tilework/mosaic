const path = require('path');
const execCommandAsync = require('@tilework/mosaic-dev-utils/exec-command');
const { getPackageJson } = require('@tilework/mosaic-dev-utils/package-json');
const shouldUseYarn = require('@tilework/mosaic-dev-utils/should-use-yarn');

const SLICEABLE = 'file:'.length;

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
        const packagePath = path.join(cwd, version.slice(SLICEABLE));

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
