const fs = require('fs');
const path = require('path');

const CONFIG_DEST_NAME = 'next.base.config.js';
const CONFIG_SRC_NAME = 'next.config.js';

const copyConfig = (themeRoot, destRoot) => {
    const configSrcPath = path.resolve(themeRoot, CONFIG_SRC_NAME);
    if (!fs.existsSync(configSrcPath)) {
        return;
    }

    const configDestPath = path.resolve(destRoot, CONFIG_DEST_NAME);
    
    fs.copyFileSync(configSrcPath, configDestPath);
};

module.exports = {
    copyConfig,
    CONFIG_DEST_NAME
};