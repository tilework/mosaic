const extensions = require('@plugjs/dev-utils/extensions');
const getPackagePath = require('@plugjs/dev-utils/package-path');
const path = require('path');

const ENV_TYPES = {
    cra: 'cra',
    next: 'next'
}

const provideProperBabelTransform = (jestConfig, envType) => {
    if (!envType) {
        throw new Error('Internal error: env type has not been specified!');
    }

    const jsTransformKey = Object.keys(jestConfig.transform).find(
        (key) => new RegExp(key).test('sample.js')
    );

    if (!jsTransformKey) {
        throw new Error('Internal error: unable to locate JS transform')
    }

    jestConfig.transform[jsTransformKey] = require.resolve(`./${envType}-babel-transform`);
}

const provideGlobals = (jestConfig) => {
    jestConfig.setupFiles.push(require.resolve('./provideGlobals'));
}

const includeExternals = (jestConfig) => {
    const modulesRelativePaths = extensions.map(
        ({ packagePath }) => path.relative(process.cwd(), packagePath)
    );

    jestConfig.rootDir = process.cwd();
    jestConfig.roots = [
        '<rootDir>',
        ...modulesRelativePaths.map((moduleRelative) => ['<rootDir>', moduleRelative].join(path.sep))
    ];
    jestConfig.testMatch = jestConfig.testMatch.map(
        (match) => match.replace(/\<rootDir\>\/?/, '**/')
    );
}

const setupJestExtensions = (jestConfig) => {
    jestConfig.setupFilesAfterEnv.push(require.resolve('./next-jest-extensions'));
}

const envSpecificSteps = {
    [ENV_TYPES.cra]: [],
    [ENV_TYPES.next]: [setupJestExtensions]
}

const middlewareJestConfig = (jestConfig, envType) => {
    provideProperBabelTransform(jestConfig, envType);
    provideGlobals(jestConfig);
    includeExternals(jestConfig);


    const finalConfig = envSpecificSteps[envType].reduce(
        (config, fn) => fn(config) || config,
        jestConfig
    );

    return finalConfig;
};

module.exports = { middlewareJestConfig, ENV_TYPES };
