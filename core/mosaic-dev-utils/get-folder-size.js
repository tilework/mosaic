/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const fs = require('fs');
const path = require('path');

const getFolderSizeFn = async (dirPath, size = 0) => {
    let result = 0;
    const fFiles = [];

    for (const file of await fs.promises.readdir(dirPath, { withFileTypes: true, encoding: 'utf-8' })) {
        const filePath = path.join(dirPath, file.name);

        if (file.isFile()) {
            fFiles.push(fs.promises.stat(filePath));
        } else if (file.isDirectory()) {
            fFiles.push(await getFolderSizeFn(filePath));
        }
    }

    // Execute all promises and sum size depending on if file
    // or result from previous calculation
    await Promise.all(fFiles).then((values) => {
        result = size + values.reduce((acc, file) => {
            if (Number.isInteger(file)) {
                return acc + file;
            }

            const { size } = file;

            return acc + size;
        }, 0);
    });

    return result;
};

const getFolderSize = async (dirPath) => Math.round(await getFolderSizeFn(dirPath) / 1024 / 1024);

module.exports = getFolderSize;
