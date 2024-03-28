import type { BaseContext, CracoConfig } from '@craco/types';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

import { findArgsFromCli } from '../lib/args';

// Make sure this is called before "paths" is imported.
findArgsFromCli();

import { loadCracoConfigAsync } from '../lib/config';
import { getCraPaths, test } from '../lib/cra';
import { overrideJest } from '../lib/features/jest/override';
import { overridePaths } from '../lib/features/paths/override';
import { log } from '../lib/logger';
import { validateCraVersion } from '../lib/validate-cra-version';

log('Override started with arguments: ', process.argv);
log('For environment: ', process.env.NODE_ENV);

const context: BaseContext = {
  env: process.env.NODE_ENV,
};

loadCracoConfigAsync(context).then((cracoConfig: CracoConfig) => {
  validateCraVersion(cracoConfig);

  context.paths = getCraPaths(cracoConfig);
  context.paths = overridePaths(cracoConfig, context);

  overrideJest(cracoConfig, context);
  test(cracoConfig);
});
