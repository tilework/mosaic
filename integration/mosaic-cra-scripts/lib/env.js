const BASE_ENVIRONMENTS = [
    'GRAPHQL_ENDPOINT',
    'PUBLIC_URL',
    'WDS_SOCKET_HOST',
    'WDS_SOCKET_PORT',
    'NODE_ENV'
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
].map(getEnvironments).reduce((acc, val) => ({
    ...acc,
    ...val
}), {});

module.exports = {
    getProcessEnv
};
