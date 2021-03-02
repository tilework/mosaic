const handleNoContext = () => {
    throw new Error(
        'Unable to resolve an absolute path to the application\'s entry point! ' +
        'Please, provide a `context` field in your webpack configuration.'
    )
}

module.exports = handleNoContext;