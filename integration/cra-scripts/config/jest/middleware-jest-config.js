const provideProperBabelTransform = (jestConfig) => {
    const jsTransformKey = Object.keys(jestConfig.transform).find(
        (key) => new RegExp(key).test('sample.js')
    );

    jestConfig.transform[jsTransformKey] = require.resolve('./babelTransform');
}

const provideGlobals = (jestConfig) => {
    jestConfig.setupFiles.push(require.resolve('./provideGlobals'));
}

const middlewareJestConfig = (jestConfig) => {
    provideProperBabelTransform(jestConfig);
    provideGlobals(jestConfig);

    return jestConfig;
};

module.exports = middlewareJestConfig;
