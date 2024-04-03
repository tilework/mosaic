const BASE_ENVIRONMENTS = [
    'GRAPHQL_ENDPOINT',
    'PUBLIC_URL',
    'WDS_SOCKET_HOST',
    'WDS_SOCKET_PORT',
    'NODE_ENV'
];

/**
 * @param {string[]} variables
 * @returns {Record<string, string>}
 */
const getEnvVariables = (variables) => {
    if (!variables?.length) {
        return {};
    }

    return variables.reduce((acc, val) => {
        if (val in process.env) {
            return {
                ...acc,
                [`process.env.${val}`]: JSON.stringify(process.env[val])
            };
        }

        return acc;
    }, {});
};

/**
 * @returns {Record<string, string>}
 */
const getProcessEnv = () => [
    BASE_ENVIRONMENTS
].map(getEnvVariables).reduce((acc, val) => ({
    ...acc,
    ...val
}), {});

module.exports = {
    getProcessEnv
};
