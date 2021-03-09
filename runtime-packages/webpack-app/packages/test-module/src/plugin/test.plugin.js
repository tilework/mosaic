export default {
    Application: {
        function: (args, callback) => {
            console.log('Hello from another plugin!');

            callback(...args);
        }
    }
}