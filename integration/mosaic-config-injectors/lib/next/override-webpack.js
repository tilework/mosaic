
const path = require('path');
const injectWebpackConfig = require('../webpack');
const includePaths = require('../../lib/common/include-paths');

const overrideWebpack = (config, { webpack }) => {
    // ===================================
    // EXTENSIBILITY SPECIFIC FEATURES
    // ===================================

    // * Next-specific plugin system stuff

    // * This fixes "Cannot use import statement outside a module"
    // ? is this a breaking change? should we move it to @tilework/mosaic?
    // TODO investigate
    if (Array.isArray(config.externals)) {
        config.externals = config.externals.map((external) => {
            if (typeof external !== 'function') {
                return external;
            }

            return (ctx, req, cb) => {
                return includePaths.filter(Boolean).find((include) => (req.startsWith('.')
                    ? new RegExp(include).test(path.resolve(ctx, req))
                    : new RegExp(include).test(req)))
                    ? cb()
                    : external(ctx, req, cb);
            };
        });
    }

    // ===================================
    // * Inject the prepared config
    injectWebpackConfig(config, {
        webpack,
        entryMatcher: /[\\/]src[\\/]pages[\\/].+\.[jt]sx?/
    });

    // Important: return the modified config
    return config;
};

module.exports = overrideWebpack;

// Add new babel loader => "Identifier 'React' has already been declared"
// Add new babel loader + pass in only expression in plugin => "Cannot use import statement outside a module"
// Default loader + pass in only expression in plugin => "Cannot use import statement outside a module"
// Default loader => "Cannot use import statement outside a module"
