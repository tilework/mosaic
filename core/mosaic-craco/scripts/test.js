/* eslint-disable jest/no-disabled-tests */
process.env.NODE_ENV = process.env.NODE_ENV || "test";

const { test } = require("../lib/cra");
const { validateCraVersion } = require("../lib/validate-cra-version");

const { overrideJest } = require("../lib/features/jest/override");
const { initialize } = require("./script");

const { craco, context } = initialize();

craco.then(
    (craco) => {
        validateCraVersion(cracoConfig);

        overrideJest(craco, context);
        test(craco);
    }
);
