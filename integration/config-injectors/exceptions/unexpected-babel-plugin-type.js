class UnexpectedBabelPluginTypeException extends Error {
    constructor(type) {
        super(`Unexpected type of a babel plugin: ${type}`);
    }
}

module.exports = UnexpectedBabelPluginTypeException;