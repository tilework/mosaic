/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

// Ensure environment variables are read.
require('react-scripts/config/env');
// Do the preflight check (only happens before eject).
const verifyPackageTree = require('react-scripts/scripts/utils/verifyPackageTree');
if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
    verifyPackageTree();
}
const verifyTypeScriptSetup = require('react-scripts/scripts/utils/verifyTypeScriptSetup');
verifyTypeScriptSetup();

const jest = require('jest');
let argv = process.argv.slice(2);

// This is not necessary after eject because we embed config into package.json.
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig');
const path = require('path');
const paths = require('react-scripts/config/paths');
const { middlewareJestConfig, ENV_TYPES } = require('@tilework/mosaic-test-utils/jest/middleware-jest-config');
const getPackagePath = require('@scandipwa/common-dev-utils/package-path');
const reactScriptsAbsolute = getPackagePath('react-scripts');

argv.push(
    '--config',
    JSON.stringify(middlewareJestConfig(
        createJestConfig(
            relativePath => path.resolve(reactScriptsAbsolute, relativePath),
            path.resolve(paths.appSrc, '..'),
            false
        ),
        ENV_TYPES.cra
    ))
);

// This is a very dirty workaround for https://github.com/facebook/jest/issues/5913.
// We're trying to resolve the environment ourselves because Jest does it incorrectly.
// TODO: remove this as soon as it's fixed in Jest.
const resolve = require('resolve');
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
let cleanArgv = [];
let env = 'jsdom';
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
argv = cleanArgv;
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
const testEnvironment = resolvedEnv || env;
argv.push('--env', testEnvironment);
jest.run(argv);
