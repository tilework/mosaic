const fs = require('fs-extra');
const path = require('path');

const copyPublic = (themeRoot, destination) => {
    const publicSource = path.resolve(themeRoot, 'public');
    const publicDestination = path.resolve(destination, 'public');

    if (!fs.existsSync(publicSource)) {
        return;
    }

    fs.copySync(publicSource, publicDestination, { recursive: true });
};

module.exports = copyPublic;