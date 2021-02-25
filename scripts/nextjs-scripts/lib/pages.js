/* eslint-disable no-continue */
/* eslint-disable @scandipwa/scandipwa-guidelines/export-level-one */
const { getParentThemePaths } = require('@plugjs/dev-utils/parent-theme');
const extensions = require('@plugjs/dev-utils/extensions');
const { getPackageJson } = require('@plugjs/dev-utils/package-json');
const logger = require('@plugjs/dev-utils/logger');
const createFilesystem = require('@plugjs/dev-utils/create-filesystem');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const getDefinedPages = async (rootDir) => {
    // TODO: use Fallback plugin here!!!
    const themePaths = getParentThemePaths(rootDir);
    const extensionsPaths = extensions.map(({ packagePath }) => packagePath);

    const validTypes = [
        // https://nextjs.org/docs/basic-features/pages#server-side-rendering
        'server',
        // https://nextjs.org/docs/basic-features/pages#static-generation-without-data
        'static-no-data',
        // https://nextjs.org/docs/basic-features/pages#static-generation-with-data
        'static-with-data'
    ];

    const pages = [
        rootDir,
        ...themePaths,
        ...extensionsPaths
    ].reduce(
        // we only allow pages inside of the src folder!
        (acc, pathname) => {
            const { scandipwa: { nextPages = {} } = {} } = getPackageJson(pathname);

            // eslint-disable-next-line fp/no-let
            for (let i = 0; i < Object.entries(nextPages).length; i++) {
                const [page, type] = Object.entries(nextPages)[i];

                if (validTypes.indexOf(type) === -1) {
                    logger.error(
                        `The declared page ${ logger.style.file(page) } type ${ logger.style.code(type) } is invalid.`,
                        'At the moment, we only support:',
                        `    - ${ logger.style.code('static-no-data') } (Static Generation without data, ${ logger.style.link('https://nextjs.org/docs/basic-features/pages#static-generation-without-data') })`,
                        `    - ${ logger.style.code('static-with-data') } (Static Generation with data, ${ logger.style.link('https://nextjs.org/docs/basic-features/pages#static-generation-with-data') })`,
                        `    - ${ logger.style.code('server') } (Server-side Rendering, ${ logger.style.link('https://nextjs.org/docs/basic-features/pages#server-side-rendering') })`
                    );

                    process.exit();
                }

                if (acc[page]) {
                    logger.warn(`The page ${ logger.style.file(page) } has two or more declarations.`);

                    if (acc[page] !== type) {
                        logger.error(
                            'The declared page types do not match. Recieved following types:',
                            `    - ${ type }`,
                            `    - ${ acc[page] }`,
                            `Please define ${ logger.style.misc('one and only one') } type per page.`
                        );

                        process.exit();
                    }

                    continue;
                }

                acc[page] = type;
            }

            return acc;
        },
        {}
    );

    return pages;
};

const createMockPages = (pages, projectRoot) => createFilesystem(
    path.join(projectRoot, 'pages'),
    path.join(__dirname, 'template'),
    (
        filesystem,
        templatePath,
        destinationPath
    ) => {
        // clear pages directory
        glob.sync('pages/**/*.js', {
            cwd: projectRoot,
            absolute: true
        }).forEach(
            (file) => fs.unlinkSync(file)
        );

        // regenerate it using the template
        Object.entries(pages).forEach(([page, type]) => {
            const namespaces = {
                namespace: `Pages/${page}/Page`,
                static_namespace: `Pages/${page}/getStaticProps`,
                server_namespace: `Pages/${page}/getServerSideProps`
            };

            filesystem.copyTpl(
                templatePath(`${type}.js`),
                destinationPath(`${page}.js`),
                {
                    emptyPageArgs: JSON.stringify({
                        type,
                        page,
                        namespaces
                    }),
                    ...namespaces
                }
            );
        });
    }
);

// const getPageRoutesFileSystem = async () => {
//     const possiblePaths = [
//         rootDir,
//         ...themePaths,
//         ...extensionsPaths
//     ].map(
//         // we only allow pages inside of the src folder!
//         (pathname) => path.join(pathname, 'src')
//     );

//     const pagePathsPromise = possiblePaths.map(
//         (source) => new Promise((resolve, reject) => {
//             glob('pages/**/*', { cwd: source, absolute: true }, (err, files) => {
//                 if (err) {
//                     reject(err);
//                 }

//                 resolve(files);
//             });
//         })
//     );

//     const pagePaths = (await Promise.all(pagePathsPromise)).reduce(
//         (acc, sourcePagePaths) => {
//             // eslint-disable-next-line fp/no-let
//             for (let i = 0; i < sourcePagePaths.length; i++) {
//                 const sourcePagePath = sourcePagePaths[i];
//                 const match = sourcePagePath.match(/[/\\]pages[/\\](.*)\.\D{2,3}/);

//                 if (!match) {
//                     continue;
//                 }

//                 const [, pageRoute] = match;

//                 // ignore invalid paths
//                 if (!pageRoute) {
//                     continue;
//                 }

//                 if (!acc[pageRoute]) {
//                     acc[pageRoute] = sourcePagePath;
//                     continue;
//                 }

//                 logger.warn(
//                     `The page ${ logger.style.file(pageRoute) } has two or more sources:`,
//                     `    1) ${ logger.style.file(acc[pageRoute]) }`,
//                     `    2) ${ logger.style.file(sourcePagePath) }`,
//                     // TODO: remove when Fallback Plugin is added
//                     'Using the 1) impleemntation.'
//                 );
//             }

//             return acc;
//         },
//         {}
//     );

//     return pagePaths;
// }

module.exports = {
    getDefinedPages,
    createMockPages
    // getPageRoutesFileSystem
};
