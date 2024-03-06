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
    BASE_ENVIRONMENTS,
    MISC_ENVIRONMENTS,
].map(getEnvironments).reduce((acc, val) => ({
    ...acc,
    ...val
}), {});

module.exports = {
    getProcessEnv
};
