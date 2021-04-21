const resolveFileExtensions = (webpackConfig) => {
    if (!webpackConfig.resolve) {
        webpackConfig.resolve = {};
    }

    if (!webpackConfig.resolve.extensions) {
        webpackConfig.resolve.extensions = [];
    }

    const additionalExtensions = ['.js', '.jsx', '.ts', '.tsx'].filter(
        (ext) => !webpackConfig.resolve.extensions.includes(ext)
    );

    webpackConfig.resolve.extensions.push(...additionalExtensions);

    return webpackConfig;
};

module.exports = resolveFileExtensions;