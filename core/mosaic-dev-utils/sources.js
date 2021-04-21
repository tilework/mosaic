const { getParentThemeSources } = require('./parent-theme');

const PROJECT = 'project';

const sources = {
    [PROJECT]: process.cwd(),
    ...getParentThemeSources()
};

module.exports = {
    sources,
    PROJECT
};
