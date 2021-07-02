import getWrapperFromPlugin from '../plugins/get-wrapper-from-plugin';

export default function generateMiddlewaredFunction(origMember = () => {}, sortedPlugins, origContext) {
    return (...args) => {
        const newMember = sortedPlugins.reduce(
            // A function is always generateed
            (acc, plugin) => () => {
                const wrapper = getWrapperFromPlugin(plugin, origMember.name);

                // Provide different arguments due to API difference
                // Between property and function call interception
                return typeof origMember === 'object'
                    ? wrapper(
                        // This reduce always generates a function
                        // Hence, if we operate with a prop -> call the function to get it
                        typeof acc === 'function' ? acc() : acc,
                        origContext
                    )
                    : wrapper(
                        args,
                        acc.bind(origContext),
                        origContext
                    );
            },
            origMember
        );

        return newMember();
    };
}
