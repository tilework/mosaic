class NoContextException extends Error {
    constructor() {
        super(
            'Please, provide a `context` field in your webpack configuration. ' +
            'It is necessary to determine the files to transplie, potential @namespace users.'
        );
    }
}

module.exports = NoContextException;