const { getParentThemeSources } = require('@tilework/mosaic-dev-utils/parent-theme');

const PROJECT = 'project';

const sources = {
    [PROJECT]: process.cwd(),
    ...getParentThemeSources()
};

module.exports = {
    sources,
    PROJECT
};
