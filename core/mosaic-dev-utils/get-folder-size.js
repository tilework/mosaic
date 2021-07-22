const fs = require('fs');
const path = require('path');

const getFolderSizeFn = async (dirPath) => {
    const fFiles = Object.values(await fs.promises.readdir(dirPath, { withFileTypes: true, encoding: 'utf-8' }));
    const fileSizes = await Promise.all(fFiles.map(async (file) => {
        const filePath = path.join(dirPath, file.name);

        if (file.isFile()) {
            const { size } = await fs.promises.stat(filePath);

            return size;
        }

        if (file.isDirectory()) {
            return getFolderSizeFn(filePath);
        }

        return 0;
    }));

    return fileSizes.reduce((acc, size) => {
        if (size.length) {
            return acc + size.reduce((a, b) => a + b);
        }

        return acc + size;
    }, 0);
};

const getFolderSize = async (dirPath) => Math.floor(await getFolderSizeFn(dirPath) / 1024);

module.exports = getFolderSize;
