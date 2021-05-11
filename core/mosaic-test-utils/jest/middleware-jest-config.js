const path = require('path');
const testablePaths = require('./testable-paths');

const ENV_TYPES = {
    cra: 'cra',
    next: 'next'
};

const provideProperBabelTransform = (jestConfig, envType) => {
    if (!envType) {
        throw new Error('Internal error: env type has not been specified!');
    }

    const jsTransformKey = Object.keys(jestConfig.transform).find(
        (key) => new RegExp(key).test('sample.js')
    );

    if (!jsTransformKey) {
        throw new Error('Internal error: unable to locate JS transform');
    }

    jestConfig.transform[jsTransformKey] = require.resolve(`./${envType}-babel-transform`);

    const nodeModulesIgnoreIndex = jestConfig.transformIgnorePatterns.findIndex(
        (key) => key.includes('node_modules')
    );

    if (nodeModulesIgnoreIndex !== -1) {
        jestConfig.transformIgnorePatterns[nodeModulesIgnoreIndex] = '[/\\\\]node_modules[/\\\\](?!@tilework[/\\\\]mosaic-test-utils).+\\.(js|jsx|mjs|cjs|ts|tsx)$';
    }
};

const provideGlobals = (jestConfig) => {
    jestConfig.setupFiles.push(require.resolve('./provide-globals'));
    jestConfig.setupFilesAfterEnv.push(require.resolve('./cleanup'));
};

const includeExternals = (jestConfig) => {
    const modulesRelativePaths = testablePaths.map(
        (packagePath) => path.relative(process.cwd(), packagePath)
    );

    jestConfig.rootDir = process.cwd();
    jestConfig.roots = [
        '<rootDir>',
        ...modulesRelativePaths.map((moduleRelative) => ['<rootDir>', moduleRelative].join(path.sep))
    ];

    // Ensure src and lib dirs are searched in each module
    jestConfig.testMatch = jestConfig.testMatch.flatMap(
        (match) => {
            const relativeMatch = match.replace(/\<rootDir\>\/?/, '**/');
            const libMatch = relativeMatch.replace(/^\*\*\/src\//, '**/lib/');

            return [relativeMatch, libMatch];
        }
    );
};

const setupJestExtensions = (jestConfig) => {
    jestConfig.setupFilesAfterEnv.push(require.resolve('./next-jest-extensions'));
};

const provideAdditionalGlobals = (jestConfig) => {
    jestConfig.setupFilesAfterEnv.push(require.resolve('./provide-nextjs-globals'));
};

const envSpecificSteps = {
    [ENV_TYPES.cra]: [],
    [ENV_TYPES.next]: [setupJestExtensions, provideAdditionalGlobals]
};

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
