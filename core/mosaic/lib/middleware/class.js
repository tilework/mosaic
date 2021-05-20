import getPluginsForClass from '../plugins/get-plugins-for-class';
import getWrapperFromPlugin from '../plugins/get-wrapper-from-plugin';

export default function generateMiddlewaredClass(Class, namespaces) {
    const namespacePluginsClass = getPluginsForClass(namespaces);

    // Wrap class in its `class` plugins to provide `class` API
    const wrappedClass = namespacePluginsClass.reduce(
        (acc, plugin) => {
            const wrapper = getWrapperFromPlugin(plugin, Class.name);
            const wrappedClass = wrapper(acc);

            if (Object.prototype.isPrototypeOf.call(acc, wrappedClass)) {
                throw new Error(
                    'Subclassing via `class` API is not allowed.\n' + 
                    'Consider using other approach for this, e.g. plugins for members.'
                );
            }

            return wrappedClass;
        },
        Class
    );

    return wrappedClass;
}
