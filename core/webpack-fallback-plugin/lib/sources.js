const path = require('path');
const escapeRegex = require('@plugjs/dev-utils/escape-regex');

/**
 * Sources available for ScandiPWA Fallback mechanism
 * @typedef {Object} Sources
 * @property {array} firstEntry - Get the top-level entry (i.e. project)
 * @property {array} lastEntry - Get the least-level entry (i.e. core)
 * @property {array} entries - Array of source entries
 * @property {array} keys - Array of source keys
 * @property {function} regexOf - Function to get regex of project source
 */

/**
 * Prepare object of sources, add helper functions
 * @param {} sources
 * @returns {Sources} sources appended with helper methods
 */
const prepareSources = (sources) => {
    if (sources.isPrepared) {
        return sources;
    }

    Object.defineProperties(sources, {
        firstEntry: {
            enumerable: false,
            get: () => Object.keys(sources)[0]
        },
        lastEntry: {
            enumerable: false,
            get: () => Object.keys(sources)[sources.length - 1]
        },
        entries: {
            enumerable: false,
            get: () => Object.entries(sources)
        },
        keys: {
            enumerable: false,
            get: () => Object.keys(sources)
        },
        values: {
            enumerable: false,
            get: () => Object.values(sources)
        },
        getRegexOf: {
            enumerable: false,
            value: (source) => new RegExp([
                escapeRegex(path.join(sources[source], 'src')),
                escapeRegex(path.join(sources[source], 'public'))
            ].join('|'))
        },
        isPrepared: {
            enumerable: false,
            value: true
        }
    });

    return sources;
};

module.exports = prepareSources;
