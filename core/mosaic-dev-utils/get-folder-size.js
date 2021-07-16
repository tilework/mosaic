/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const path = require('path');

const getFolderSizeFn = async (dirPath, size = 0) => {
    let fSize = 0;

    for (const file of await fs.promises.readdir(dirPath, { withFileTypes: true, encoding: 'utf-8' })) {
        const filePath = path.join(dirPath, file.name);

        if (file.isFile()) {
            fSize += (await fs.promises.stat(filePath)).size;
        } else if (file.isDirectory()) {
            fSize += await getFolderSizeFn(filePath);
        }
    }

    return size + fSize;
};
const getFolderSize = (dirPath) => getFolderSizeFn(dirPath) / 1024 / 1024;

module.exports = getFolderSize;
