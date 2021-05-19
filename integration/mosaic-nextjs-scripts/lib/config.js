const fs = require('fs');
const path = require('path');

const NEXT_CONFIG_DEST_NAME = 'next.base.config.js';
const BABEL_CONFIG_DEST_NAME = 'babel.base.config.js';

const configMap = {
    babel: {
        src: 'babel.config.js',
        dest: BABEL_CONFIG_DEST_NAME
    },
    next: {
        src: 'next.config.js',
        dest: NEXT_CONFIG_DEST_NAME
    }
};

const copyConfig = (themeRoot, destRoot, { src, dest }) => {
    const configSrcPath = path.resolve(themeRoot, src);
    const configDestPath = path.resolve(destRoot, dest);

    if (!fs.existsSync(configSrcPath)) {
        if (fs.existsSync(configDestPath)) {
            fs.rmSync(configDestPath);
        }

        return;
    }

    
    fs.copyFileSync(configSrcPath, configDestPath);
};

module.exports = {
    copyConfig,
    configMap,
    NEXT_CONFIG_DEST_NAME,
    BABEL_CONFIG_DEST_NAME
};