#!/usr/bin/env node

// Delay import in order to prevent fails on dependency tree
// It goes into extensions, if the packages are not linked - throws errors
// Because it cannot resolve local modules that are not yet linked
const runNextJS = (...args) => require('../lib/nextjs')(...args);
const runTests = () => require('../scripts/test')();
const runExport = () => require('../scripts/export')();

const logger = require('@tilework/mosaic-dev-utils/logger');
const linkExtensions = require('@tilework/mosaic-dev-utils/link-extensions');

const args = process.argv.slice(2);

const scriptMap = {
    start: runNextJS,
    build: runNextJS,
    dev: runNextJS,
    link: linkExtensions.bind(null, process.cwd()),
    test: runTests,
    export: runExport
};

const script = args[0];
const scriptToRun = scriptMap[script];

if (!scriptToRun) {
    logger.error(
        `The command ${ logger.style.command(script) } is not supported by ${ logger.style.misc('cra-scripts') }.`
    );

    return;
}

scriptToRun(script, args.slice(1));
