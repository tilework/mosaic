// @remove-file-on-eject
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const babelJest = require('babel-jest');
const babelConfig = require('@tilework/mosaic-nextjs-scripts/src/babel.config');

module.exports = babelJest.createTransformer(babelConfig);
