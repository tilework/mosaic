const path = require('path');
const fs = require('fs');
const getPackagePath = require('@tilework/mosaic-dev-utils/package-path');

const nextScriptsLocation = getPackagePath('@tilework/mosaic-nextjs-scripts');
const pagesLocation = path.resolve(nextScriptsLocation, 'src', 'pages');

const getPageFileByName = (name) => {
    const presumablePageFile = path.join(pagesLocation, `${name}.js`);
    if (fs.existsSync(presumablePageFile)) {
        return presumablePageFile;
    }

    return false;
};

/**
 * Returns object { Page, getServerSideProps } of the specified namespace
 * @param {stringn} namespace 
 */
const getGenerated = (namespace) => {
    // Pages/sample/Page
    const [base, name, item] = namespace.split('/');
    if (base !== 'Pages') {
        throw new Error(
            'This util should be used only to retrieve pages and prop getters!\n' +
            'Your namespace implies that you are willing to get something else.\n' +
            'Unfortunately, this is not possible.'
        );
    }

    const pagePath = getPageFileByName(name);

    if (!pagePath) {
        throw new Error('Unable to resolve page with this namespace');
    }

    const foundModule = require(pagePath);
    // Assume that pages are always default exported
    const exportKey = item === 'Page'
        ? 'default'
        : item;

    const searchResult = foundModule[exportKey];
    if (!searchResult) {
        throw new Error(`Export "${exportKey}" has not been found in the module.`);
    }

    return searchResult;
};

module.exports = getGenerated;