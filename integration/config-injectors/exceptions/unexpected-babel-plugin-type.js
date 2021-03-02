class UnexpectedBabelPluginTypeException extends Error {
    constructor(type) {
        this.message = `Unexpected type of a babel plugin: ${type}`;
    }
}

module.exports = UnexpectedBabelPluginTypeException;