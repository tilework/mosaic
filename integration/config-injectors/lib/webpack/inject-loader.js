const path = require('path');
const handleNoContext = require('./enforce-include-extensions/handle-no-context');

const resolveStringEntry = (entry, context) => {
    if (path.isAbsolute(entry)) {
        return entry;
    }

    if (!context) {
        handleNoContext();
    }
    
    return path.resolve(context, entry);
}

const resolveObjectEntry = (entryObject, context) => {
    return Object.entries(entryObject).map(([entryName, entry]) => {
        if (typeof(entry) === 'string') {
            return resolveStringEntry(entry, context);
        }

        if (typeof(entry) === 'object') {
            if (typeof(entry.import) === 'string') {
                return resolveStringEntry(entry.import, context);
            }
        }

        throw new Error(
            'Unable to resolve entry point(s)! It is possible that your configuration is invalid. ' +
            'If you are certain that it is not, please create a github issue about this!'
        )
    }, []);
}

const getEntryTest = (webpackConfig, entryMatcher) => {
    if (entryMatcher) {
        return entryMatcher;
    }

    const { entry, context } = webpackConfig;

    if (typeof(entry) === 'string') {
        return resolveStringEntry(entry, context);
    }

    if (typeof(entry) === 'object') {
        if (typeof(entry.main) === 'string') {
            return resolveStringEntry(entry.main, context);
        }

        return resolveObjectEntry(entry, context);
    }

    return entry;
}

// Inject the actual extensions' imports
const addImportInjectorLoader = (webpackConfig, entryMatcher) => {
    const test = getEntryTest(webpackConfig, entryMatcher);

    if (!webpackConfig.module) {
        webpackConfig.module = {};
    }

    if (!webpackConfig.module.rules) {
        webpackConfig.module.rules = [];
    }

    webpackConfig.module.rules.push({
        test,
        loader: require.resolve('@plugjs/webpack-plugjs-import-loader')
    });

    return webpackConfig;
};

module.exports = addImportInjectorLoader;
