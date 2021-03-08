const extensions = require('@plugjs/dev-utils/extensions');
const path = require('path');

const provideProperBabelTransform = (jestConfig) => {
    const jsTransformKey = Object.keys(jestConfig.transform).find(
        (key) => new RegExp(key).test('sample.js')
    );

    jestConfig.transform[jsTransformKey] = require.resolve('./babelTransform');
}

const provideGlobals = (jestConfig) => {
    jestConfig.setupFiles.push(require.resolve('./provideGlobals'));
}

const includeExternals = (jestConfig) => {
    const modulesRelativePaths = extensions.map(
        ({ packagePath }) => path.relative(process.cwd(), packagePath)
    );

    jestConfig.rootDir = process.cwd();
    jestConfig.roots.push(...modulesRelativePaths.map(
        (moduleRelative) => ['<rootDir>', moduleRelative].join(path.sep)
    ));
    jestConfig.testMatch = jestConfig.testMatch.map(
        (match) => match.replace(/\<rootDir\>\/?/, '**/')
    );
}

const middlewareJestConfig = (jestConfig) => {
    provideProperBabelTransform(jestConfig);
    provideGlobals(jestConfig);
    includeExternals(jestConfig);

    return jestConfig;
};

module.exports = middlewareJestConfig;
