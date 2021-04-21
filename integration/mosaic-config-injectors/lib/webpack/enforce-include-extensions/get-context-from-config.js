const NoContextException = require("../../../exceptions/no-context");

const getContextFromConfig = (webpackConfig, suppressException) => {
    const { context } = webpackConfig;

    if (!context && !suppressException) {
        throw new NoContextException();
    }

    return context;
};

module.exports = getContextFromConfig;