export default {
    'Application/getData': {
        function: (args, callback, context) => {
            const data = callback(...args);

            return [
                ...data,
                'Data from the plugin'
            ];
        }
    }
}