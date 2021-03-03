class NoContextException extends Error {
    constructor() {
        super(
            'Unable to resolve an absolute path to the application\'s entry point! ' +
            'Please, provide a `context` field in your webpack configuration.'
        );
    }
}

module.exports = NoContextException;