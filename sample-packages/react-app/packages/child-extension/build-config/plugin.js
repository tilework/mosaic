module.exports = {
    plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
            // const defaultEntry = webpackConfig.entry;

            // webpackConfig.entry = {
            //     test: defaultEntry
            // };

            return webpackConfig;
        },
        overrideBabelConfig: (config) => {
            return config;
        }
    }
};
