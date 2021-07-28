const os = require('os');
const path = require('path');
const fs = require('fs');

const systemConfigPath = path.join(os.homedir(), '.cmarc');

/**
 * @returns {Promise<typeof defaultSystemConfig>}
 */
const getSystemConfig = async () => {
    try {
        await fs.promises.access(systemConfigPath, fs.constants.F_OK);
    } catch (e) {
        return {};
    }

    const userSystemConfig = await fs.promises.readFile(systemConfigPath, 'utf-8');

    try {
        const userSystemConfigParsed = JSON.parse(userSystemConfig);

        return userSystemConfigParsed;
    } catch (e) {
        throw new Error(`System configuration file is not a valid JSON!\n\nFile location: ${systemConfigPath}`);
    }
};

module.exports = {
    getSystemConfig
};