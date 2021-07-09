process.env.NODE_ENV = "production";

const { overrideWebpackProd } = require("../lib/features/webpack/override");
const { validateCraVersion } = require("../lib/validate-cra-version");
const { build } = require("../lib/cra");
const { initialize } = require("./script");

const { craco, context } = initialize();

craco.then(
    (cracoConfig) => {
        validateCraVersion(cracoConfig);

        overrideWebpackProd(cracoConfig, context);
        build(cracoConfig);
    }
);
