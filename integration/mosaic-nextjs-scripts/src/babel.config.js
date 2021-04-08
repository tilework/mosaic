const ConfigInjectors = require('@tilework/mosaic-config-injectors');

module.exports = ConfigInjectors.injectBabelConfig({
    presets: [
        [
            'next/babel',
            {
                'preset-react': {
                    runtime: 'classic'
                }
            }
        ]
    ]
});
