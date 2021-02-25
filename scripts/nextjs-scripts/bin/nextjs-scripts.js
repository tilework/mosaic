#!/usr/bin/env node
/* eslint-disable @scandipwa/scandipwa-guidelines/export-level-one */

const runNextJS = require('../lib/nextjs');
const logger = require('@plugjs/dev-utils/logger');

// const linkExtensions = require('../lib/link-extensions');

const args = process.argv.slice(2);

const scriptMap = {
    start: runNextJS,
    build: runNextJS,
    dev: runNextJS
    // link: linkExtensions
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
