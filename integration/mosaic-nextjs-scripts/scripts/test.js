/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';
const jest = require('jest');
const { execSync } = require('child_process');

// TODO remove react-scripts
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig');
const path = require('path');
const paths = require('react-scripts/config/paths');
const { middlewareJestConfig, ENV_TYPES } = require('@tilework/mosaic-test-utils/jest/middleware-jest-config');
const resolve = require('resolve');
const getDirFromArgs = require('../lib/args/get-dir-from-args');
const getPackagePath = require('@tilework/mosaic-dev-utils/package-path');
const getDefinedPages = require('../lib/pages/defined-pages');
const createMockPages = require('../lib/pages/mock-pages');

const reactScriptsAbsolute = getPackagePath('react-scripts');

const initEnv = () => {
    // Do this as the first thing so that any code reading it knows the right env.
    process.env.BABEL_ENV = 'test';
    process.env.NODE_ENV = 'test';
    process.env.PUBLIC_URL = '';
};

const handleGhostPages = async () => {
    const { dir } = getDirFromArgs(process.argv);

    // Create pages from extensions and themes
    const pages = await getDefinedPages(dir);
    await createMockPages(pages, path.resolve(__dirname, '..', 'src'));
};

const preventUnhandleRejections = () => {
    process.on('unhandledRejection', err => {
        throw err;
    });    
};

const isInGitRepository = () => {
    try {
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
};

const isInMercurialRepository = () => {
    try {
        execSync('hg --cwd . root', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
};

const generateConfiguration = () => {
    const reactScriptsConfig = createJestConfig(
        relativePath => path.resolve(reactScriptsAbsolute, relativePath),
        path.resolve(paths.appSrc, '..'),
        false
    );

    const finalConfig = middlewareJestConfig(reactScriptsConfig, ENV_TYPES.next);

    return JSON.stringify(finalConfig);
};

// This is a very dirty workaround for https://github.com/facebook/jest/issues/5913.
// We're trying to resolve the environment ourselves because Jest does it incorrectly.
// TODO: remove this as soon as it's fixed in Jest.
function resolveJestDefaultEnvironment(name) {
    const jestDir = path.dirname(
        resolve.sync('jest', {
            basedir: __dirname
        })
    );
    const jestCLIDir = path.dirname(
        resolve.sync('jest-cli', {
            basedir: jestDir
        })
    );
    const jestConfigDir = path.dirname(
        resolve.sync('jest-config', {
            basedir: jestCLIDir
        })
    );
    return resolve.sync(name, {
        basedir: jestConfigDir
    });
}

let env = 'jsdom';
const getCleanArguments = (argv) => {
    let cleanArgv = [];
    let next;
    do {
        next = argv.shift();
        if (next === '--env') {
            env = argv.shift();
        } else if (next.indexOf('--env=') === 0) {
            env = next.substring('--env='.length);
        } else {
            cleanArgv.push(next);
        }
    } while (argv.length > 0);

    return cleanArgv;
};

const getResolvedEnv = () => {
    let resolvedEnv;
    try {
        resolvedEnv = resolveJestDefaultEnvironment(`jest-environment-${env}`);
    } catch (e) {
        // ignore
    }
    if (!resolvedEnv) {
        try {
            resolvedEnv = resolveJestDefaultEnvironment(env);
        } catch (e) {
            // ignore
        }
    }

    return resolvedEnv || env;
};

const compileArguments = () => {
    let argv = process.argv.slice(2);

    // Watch unless on CI or explicitly running all tests
    if (
        !process.env.CI &&
        argv.indexOf('--watchAll') === -1 &&
        argv.indexOf('--watchAll=false') === -1
    ) {
        // https://github.com/facebook/create-react-app/issues/5210
        const hasSourceControl = isInGitRepository() || isInMercurialRepository();
        argv.push(hasSourceControl ? '--watch' : '--watchAll');
    }

    argv.push('--config', generateConfiguration());
    argv = getCleanArguments(argv);
    argv.push('--env', getResolvedEnv());

    return argv;
};

const runTests = async () => {
    initEnv();
    handleGhostPages();
    preventUnhandleRejections();

    const argv = compileArguments();

    jest.run(argv);
};

module.exports = runTests;
