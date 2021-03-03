class UnableToResolveEntryException extends Error {
    constructor() {
        super(
            'Unable to resolve entry point(s)! It is possible that your configuration is invalid. '+
            'If you are certain that it is not, please create a github issue about this!'
        );
    }
}

module.exports = UnableToResolveEntryException;