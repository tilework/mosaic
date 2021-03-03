export default {
    Application: {
        function: (args, callback, context) => {
            console.log('Hello from plugin!');

            callback(...args);
        }
    }
}