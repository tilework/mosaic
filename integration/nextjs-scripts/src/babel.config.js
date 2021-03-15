const ConfigInjectors = require('@plugjs/config-injectors');

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
