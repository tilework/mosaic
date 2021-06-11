const runNextJS = (...args) => require('../lib/nextjs')(...args);
const fse = require('fs-extra');
const path = require('path');

const runExport = (...args) => {
    runNextJS(...args);

    // custom file copy  
    fse.copySync(
        path.join(__dirname, '..', 'src', 'out'),
        path.join(process.cwd()),
        { overwrite: true }
    );
};

module.exports = runExport;
