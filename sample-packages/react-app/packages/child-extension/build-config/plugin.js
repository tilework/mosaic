module.exports = {
    plugin: {
        overrideWebpackConfig: (config) => {
            console.log('plugin 0!');
            
            config.some = 'thing';

            return config;
        },
        overrideBabelConfig: (config) => {
            return config;
        }
    }
};
