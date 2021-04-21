module.exports = {
    rules: {
        // Prevent duplicate namespace (for each file separately)
        '@tilework/mosaic-no-duplicate-namespace': 'error',
        
        // Use "__construct" instead of "constructor"
        '@tilework/mosaic-use-magic-construct': 'error',

        // Force @namespace comments in the code
        '@tilework/mosaic-use-namespace': 'error'
    }
};
