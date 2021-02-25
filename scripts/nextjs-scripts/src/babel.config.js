module.exports = {
    presets: [
        [
            'next/babel',
            {
                'preset-react': {
                    runtime: 'classic'
                }
            }
        ]
    ],
    plugins: [
        // ===================================
        // Extensibility imports
        '@plugjs/plugjs/build-config/babel-plugin-middleware-decorator',
        '@babel/plugin-transform-arrow-functions',
        '@babel/plugin-transform-async-to-generator'
        // ===================================
    ]
};
