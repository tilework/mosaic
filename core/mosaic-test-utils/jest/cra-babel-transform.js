// @remove-file-on-eject
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const babelJest = require('babel-jest');
const injectBabelConfig = require('@tilework/mosaic-config-injectors/lib/babel');

const hasJsxRuntime = (() => {
    if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
        return false;
    }

    try {
        require.resolve('react/jsx-runtime');
        return true;
    } catch (e) {
        return false;
    }
})();

module.exports = babelJest.createTransformer(injectBabelConfig({
    presets: [
        [
            require.resolve('babel-preset-react-app'),
            {
                runtime: hasJsxRuntime ? 'automatic' : 'classic'
            }
        ]
    ],
    babelrc: false,
    configFile: false
}));
