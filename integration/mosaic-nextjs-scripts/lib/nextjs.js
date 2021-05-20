const spawn = require('cross-spawn');
const path = require('path');
const kill = require('tree-kill');
const logger = require('@tilework/mosaic-dev-utils/logger');
const debounce = require('debounce');
const chokidar = require('chokidar');
const getDefinedPages = require('./pages/defined-pages');
const createMockPages = require('./pages/mock-pages');
const copyPages = require('./pages/copy-pages');
const getDirFromArgs = require('./args/get-dir-from-args');
const copyPublic = require('./public');
const configManager = require('./config');


module.exports = async (script, restArgs) => {
    const { dir, args } = getDirFromArgs(restArgs);
    const isProd = script === 'build';

    // eslint-disable-next-line fp/no-let
    let child = null;

    const realDir = path.resolve(__dirname, '..', 'src');

    // Create pages from extensions and themes
    const pages = await getDefinedPages(dir);
    await createMockPages(pages, realDir);
    await copyPages(dir, realDir);

    // Handle the `public` directory
    copyPublic(dir, realDir);

    // Handle the configurations (remove old, copy new)
    configManager.handleConfig(dir, realDir, configManager.configMap.next);
    configManager.handleConfig(dir, realDir, configManager.configMap.babel);

    // Copy .env files

    const spawnUndead = (/** isRestarted = false */) => {
        child = spawn(
            require.resolve('next/dist/bin/next'),
            [script, realDir, ...args],
            {
                stdio: ['inherit', 'inherit', 'inherit'],
                env: {
                    ...process.env
                    // TODO: add other env vars?
                }
            }
        );

        child.on('error', (e) => {
            logger.error(e);
            process.exit();
        });

        child.on('close', (code) => {
            if (code !== null || isProd) {
                // if the process exits "voluntarily" stop the parent as well
                // See more in answer here: https://stackoverflow.com/a/39169784
                process.exit();
            }
        });
    };

    process.on('exit', () => {
        if (child) {
            kill(child.pid, 'SIGTERM');
        }
    });

    const TIMEOUT_BETWEEN_KILL_TRIGGERS = 500;

    const killChild = debounce(() => {
        kill(child.pid, 'SIGTERM', (err) => {
            if (err) {
                logger.log(err);
            }

            spawnUndead(true);
        });
    }, TIMEOUT_BETWEEN_KILL_TRIGGERS);

    spawnUndead();

    if (isProd) {
        return;
    }

    chokidar
        .watch([
            'src/**/*'
        ], {
        // should we ignore node_modules ?
            ignored: '**/node_modules/**',
            cwd: process.cwd(),
            ignoreInitial: true
        })
        .on('add', killChild)
        .on('unlink', killChild)
        .on('addDir', killChild)
        .on('unlinkDir', killChild);
};
