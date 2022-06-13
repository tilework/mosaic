import generateMiddlewaredClass from '../middleware/class';
import getPluginsFromConfig from '../plugins/get-plugins';
import getWrapperFromPlugin from '../plugins/get-wrapper-from-plugin';
import getNamespacesFromMiddlewarable from '../namespace/get-namespaces-from-middlewarable';

function postProcessInstance(instance, constructorArguments) {
    const namespaces = getNamespacesFromMiddlewarable(Object.getPrototypeOf(instance).constructor);

    // Get all member-property plugins
    const namespacesPluginsConstruct = getPluginsFromConfig(namespaces, 'member-property');

    // Handle plugin -> property interactions
    namespacesPluginsConstruct.forEach(
        (namespacePluginsConstruct) => Object.entries(namespacePluginsConstruct).forEach(
            // Apply each plugin to the instance
            ([memberName, memberPluginsConstruct]) => {
                // Retrieve the original member
                const origMember = instance[memberName] || (() => {});

                // Wrap it into the plugins
                const newMember = memberPluginsConstruct.reduce(
                    (acc, plugin) => getWrapperFromPlugin(plugin, origMember.name)(acc, instance),
                    origMember
                );

                // Replace the original member with the new one, wrapped into the plugins
                instance[memberName] = newMember;
            }
        )
    );

    // Handle construct logic
    if (instance.__construct && instance.__isConstructorCalled === undefined) {
        // Call the "magic" __construct member function
        instance.__construct(...constructorArguments);
        instance.__isConstructorCalled = true;
    }

    return instance;
}

export default function generateConstructHandler(namespaces) {
    return (TargetClass, args, newTarget) => {
        // Apply wrapper plugins
        const WrappedClass = generateMiddlewaredClass(
            // Preserve the original prototypes: prevent React's confusion
            class extends TargetClass {
                constructor(...childArgs) {
                    // `super` is not called deliberately
                    const instance = Reflect.construct(TargetClass, args, newTarget);

                    return postProcessInstance(instance, childArgs);
                }
            },
            namespaces
        );

        // Get an instance
        const instance = Reflect.construct(WrappedClass, args);

        // Return the processed instance
        return instance;
    };
}
