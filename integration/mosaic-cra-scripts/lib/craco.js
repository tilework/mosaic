const spawn = require('cross-spawn');
const path = require('path');
const debounce = require('debounce');
const chokidar = require('chokidar');
const kill = require('tree-kill');
const paths = require('react-scripts/config/paths');
const logger = require('@tilework/mosaic-dev-utils/logger');
const { before } = require('./build-plugins');
const googleAnalytics = require('@tilework/mosaic-dev-utils/analytics');
const getFolderSize = require('@tilework/mosaic-dev-utils/get-folder-size');
const { getExtensionsPath } = require('@tilework/mosaic-dev-utils/extensions-core');

const args = process.argv.slice(2);
const buildJsPath = '/static/js';

module.exports = (script) => {
    before.forEach((beforeRun) => beforeRun(script));

    const timeStamp = Date.now();
    const isProd = script === 'build';
    const TIMEOUT_BETWEEN_KILL_TRIGGERS = 500;
    const isStartBrowser = !args.includes('-n');

    if (args.length === 0) {
        logger.error(`Please specify command (one of: ${ logger.style.misc('start') }, ${ logger.style.misc('build') }).`);
        process.exit(1);
    }

    // eslint-disable-next-line fp/no-let
    let child = null;

    /**
     * Added path to hard-coded CRACO configuration file
     */
    const spawnUndead = (isRestarted = false) => {
        /**
         * Send:
         * - SIGKILL to kill child and parent immediately
         * - SIGINT to restart, in case for example
         * - anything else to kill parent immediately
         */
        child = spawn(
            require.resolve('@tilework/mosaic-craco/dist/bin/craco'),
            [
                ...args,
                '--config', path.join(__dirname, '../craco.config.js')
            ],
            {
                stdio: ['inherit', 'inherit', 'inherit'],
                env: {
                    ...process.env,
                    // after restart do not launch new browser, and by default
                    // start new session based on env variable value
                    // in case if argument -n was provided also don't start browser
                    BROWSER: isRestarted || !isStartBrowser ? 'none' : (process.env.BROWSER || ''),

                    // TODO solve the dependency mismatches smarter
                    SKIP_PREFLIGHT_CHECK: true,

                    // TODO: resolve the plugins not toggling fast-refresh!
                    FAST_REFRESH: true,
                    FORCE_COLOR: true,
                    ...(isProd ? { GENERATE_SOURCEMAP: false } : {})
                }
            }
        );

        // TODO: can we auto-connect hot-reload back?
        // TODO: remove production build reference to React

        child.on('error', (e) => {
            logger.log('error', e);
            googleAnalytics.printAboutAnalytics();
            googleAnalytics.trackError(e);
            process.exit();
        });

        child.on('close', async (code) => {
            if (code !== null || isProd) {
                // if the process exits "voluntarily" stop the parent as well
                // See more in answer here: https://stackoverflow.com/a/39169784
                try {
                    const bundleSize = await getFolderSize(paths.appBuild + buildJsPath);

                    googleAnalytics.printAboutAnalytics();
                    await googleAnalytics.trackEvent('Theme build', 'Bundle size', bundleSize, 'Bundle');
                    await googleAnalytics.trackTiming('Theme build time', Date.now() - timeStamp);
                    process.exit();

                // eslint-disable-next-line no-empty
                } catch (e) {
                    process.exit();
                }
            }
        });
    };

    process.on('exit', () => {
        if (child) {
            kill(child.pid, 'SIGTERM');
        }
    });

    spawnUndead();

    if (!isProd) {
        const killChild = debounce(() => {
            kill(child.pid, 'SIGTERM', (err) => {
                if (err) {
                    logger.log(err);
                }

                spawnUndead(true);
            });
        }, TIMEOUT_BETWEEN_KILL_TRIGGERS);

        chokidar
            .watch([
                'src/**/*',
                ...getExtensionsPath(true)
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
    }
};
