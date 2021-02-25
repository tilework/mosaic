const fs = require('fs');
const glob = require('glob');
const path = require('path');

const syncEnvs = (rootDir, destDir) => {
    glob.sync('.env*', { cwd: destDir, absolute: true }).forEach(
        (file) => fs.unlinkSync(file)
    );

    glob.sync('.env*', { cwd: rootDir }).forEach(
        (file) => fs.copyFileSync(
            path.join(destDir, file),
            path.join(rootDir, file)
        )
    );
};

module.exports = {
    syncEnvs
};
