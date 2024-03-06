const PHP_ENVIRONMENTS = [
    'PHP_INI_DIR',
    'PHP_LDFLAGS',
    'PHP_CFLAGS',
    'PHP_VERSION',
    'PHPBREW_ROOT',
    'PHP_ASC_URL',
    'PHP_CPPFLAGS',
    'PHP_URL',
    'PHPBREW_HOME',
    'PHP_ERROR_REPORTING',
    'PHPBREW_PATH',
    'PHPIZE_DEPS',
    'PHP_SHA256',
    'PHP_PATH',
    'PHPBREW_PHP'
];

const COMPOSER_ENVIRONMENTS = [
    'COMPOSER_AUTH',
    'COMPOSER_MEMORY_LIMIT'
];

const BASE_ENVIRONMENTS = [
    'HOME',
    'EXTENSION_PATH',
    'BUILD_MODE',
    'PATH',
    'NODE',
    'BASH_ENV',
    'PWD',
    'INIT_CWD',
    'NEXTJS_PAGES',
    'WDS_SOCKET_PORT',
    'WDS_SOCKET_HOST',
    'BROWSER',
    'PUBLIC_URL',
    'SKIP_PREFLIGHT_CHECK',
    'FAST_REFRESH',
    'FORCE_COLOR',
    'NODE_ENV'
];

const GIT_ENVIRONMENTS = [
    'GIT_COMMITTER_NAME',
    'GIT_AUTHOR_EMAIL',
    'GIT_AUTHOR_NAME',
    'GIT_TERMINAL_PROMPT',
    'GIT_COMMITTER_EMAIL'
];

const MISC_ENVIRONMENTS = [
    'DEBUG',
    'DEBUG_FD',
    'GRAPHQL_ENDPOINT',
    'REBEM_MOD_DELIM',
    'REBEM_ELEM_DELIM'
];

/**
 * @param {string[]} envs
 * @returns {Record<string, string>}
 */
const getEnvironments = (envs) => {
    if (!envs?.length) {
        return {};
    }

    return envs.reduce((acc, val) => {
        if (val in process.env) {
            return {
                ...acc,
                [val]: JSON.stringify(process.env[val])
            };
        }

        return acc;
    }, {});
};

/**
 * @returns {Record<string, string>}
 */
const getProcessEnv = () => [
    PHP_ENVIRONMENTS,
    COMPOSER_ENVIRONMENTS,
    BASE_ENVIRONMENTS,
    GIT_ENVIRONMENTS,
    MISC_ENVIRONMENTS
].map(getEnvironments).reduce((acc, val) => ({
    ...acc,
    ...val
}), {});

module.exports = {
    getProcessEnv
};
