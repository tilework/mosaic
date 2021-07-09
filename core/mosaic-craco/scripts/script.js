const { findArgsFromCli } = require("../lib/args");

// Make sure this is called before "paths" is imported.
findArgsFromCli();

const { log } = require("../lib/logger");
const { loadCracoConfigAsync } = require("../lib/config");

const initialize = () => {
    log("Override started with arguments: ", process.argv);
    log("For environment: ", process.env.NODE_ENV);

    const context = {
        env: process.env.NODE_ENV
    };

    const craco = loadCracoConfigAsync(context);

    return {
        craco,
        context
    };
};

module.exports = { initialize };
