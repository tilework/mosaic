const fs = require('fs');
const path = require('path');

const getFolderSizeFn = async (dirPath) => {
    const fileSizes = await fs.promises.readdir(dirPath, { withFileTypes: true, encoding: 'utf-8' })
        .then((fFiles) => Promise.all(fFiles.map((file) => {
            const filePath = path.join(dirPath, file.name);

            if (file.isFile()) {
                return fs.promises.stat(filePath).then((file) => file.size);
            }

            if (file.isDirectory()) {
                return getFolderSizeFn(filePath);
            }

            return 0;
        })));

    return fileSizes.reduce((acc, size) => {
        if (size.length) {
            return acc + size.reduce((a, b) => a + b);
        }

        return acc + size;
    }, 0);
};

const getFolderSize = async (dirPath) => Math.round(await getFolderSizeFn(dirPath) / 1024 / 1024);

module.exports = getFolderSize;
