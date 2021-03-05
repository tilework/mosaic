#!/usr/bin/env node

const linkExtensions = require('@plugjs/dev-utils/link-extensions');
const logger = require('@plugjs/dev-utils/logger');
const runCraco = (...args) => require('../lib/craco')(...args);
const runTests = () => require('react-scripts/scripts/test');

const args = process.argv.slice(2);

const scriptToRun = args[0];
const pureArgs = args.slice(1);

const scriptMap = {
    build: runCraco,
    start: runCraco,
    link: linkExtensions.bind(null, process.cwd()),
    test: runTests
};

const script = scriptMap[scriptToRun];
if (!script) {
    logger.error(`Script not found: ${scriptToRun}`);
    process.exit(1);
}

script(...pureArgs);
