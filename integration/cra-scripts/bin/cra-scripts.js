#!/usr/bin/env node

const linkExtensions = require('@plugjs/dev-utils/link-extensions');
const runCraco = require('../lib/craco');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex((x) => x === 'build' || x === 'start');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

const scriptMap = {
    build: runCraco,
    start: runCraco,
    link: linkExtensions.bind(null, process.cwd())
};

scriptMap[script]();
