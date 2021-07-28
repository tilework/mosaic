process.env.NODE_ENV = "production";

// This MUST be imported first
const { initialize } = require("./script");
const { overrideWebpackProd } = require("../lib/features/webpack/override");
const { validateCraVersion } = require("../lib/validate-cra-version");
const { build } = require("../lib/cra");

const { craco, context } = initialize();

craco.then(
    (cracoConfig) => {
        validateCraVersion(cracoConfig);

        overrideWebpackProd(cracoConfig, context);
        build(cracoConfig);
    }
);
