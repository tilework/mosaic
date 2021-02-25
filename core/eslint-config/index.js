module.exports = {
    rules: {
        // Prevent duplicate namespace (for each file separately)
        '@plugjs/no-duplicate-namespace': 'error',
        
        // Use "__construct" instead of "constructor"
        '@plugjs/use-magic-construct': 'error',

        // Force @namespace comments in the code
        '@plugjs/use-namespace': 'error',
    }
};
