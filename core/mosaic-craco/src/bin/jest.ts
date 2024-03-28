#!/usr/bin/env node

/*
 * Copied (and converted to TS) from https://github.com/timarney/react-app-rewired/blob/master/packages/react-app-rewired/bin/jest.js

 * This file is necessary to allow usage of craco as a drop-in replacement
 * for react-scripts with WebStorms's test runner UI.
 *
 * For more information, see https://github.com/dilanx/craco/pull/41
 */

import spawn from 'cross-spawn';
const args = process.argv.slice(2);

const setupScriptFileIndex =
  args.findIndex((x) => x === '--setupTestFrameworkScriptFile') + 1;
const isIntelliJ =
  setupScriptFileIndex !== -1
    ? false
    : args[setupScriptFileIndex].indexOf('jest-intellij') !== -1;

const result = spawn.sync(
  process.argv[0],
  ([] as any[]).concat(require.resolve('../scripts/test'), args),
  {
    stdio: 'inherit',
    env: Object.assign({}, process.env, isIntelliJ ? { CI: 1 } : null),
  }
);

process.exit(result.signal ? 1 : result.status ?? undefined);
