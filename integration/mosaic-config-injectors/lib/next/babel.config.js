const injectBabelConfig = require('../babel');

module.exports = injectBabelConfig({
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
