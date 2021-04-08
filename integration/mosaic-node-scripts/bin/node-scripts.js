#!/usr/bin/env node

const linkExtensions = require('@tilework/mosaic-dev-utils/link-extensions');

const args = process.argv.slice(2);

const scriptMap = {
    link: linkExtensions.bind(null, process.cwd())
};

const scriptIndex = args.findIndex((x) => Object.keys(scriptMap).includes(x));
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

scriptMap[script]();
