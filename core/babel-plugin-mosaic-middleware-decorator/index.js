const path = require("path");
const {
    getParentThemePaths,
} = require("@tilework/mosaic-dev-utils/parent-theme");
const { getMosaicConfig } = require("@tilework/mosaic-dev-utils/mosaic-config");
const extensions = require("@tilework/mosaic-dev-utils/extensions");

const { sourceDirectories = [] } = getMosaicConfig(process.cwd());

const allowedPaths = [
    ...getParentThemePaths(),
    process.cwd(),
    ...extensions.map(({ packageName }) => {
        const isWin =
            process &&
            (process.platform === "win32" ||
                /^(msys|cygwin)$/.test(process.env.OSTYPE));

        if (!isWin) {
            return packageName;
        }

        return packageName.replace("/", "\\");
    }),
    ...extensions.map(({ packagePath }) => packagePath),
].reduce(
    (acc, pathname) => [
        ...acc,
        ...sourceDirectories.map((directory) => path.join(pathname, directory)),
    ],
    []
);

const namespaceExtractor = /@namespace +(?<namespace>[^ ]+)/;

const extractNamespaceFromComments = (comments = []) =>
    comments.reduce((acquired, testable) => {
        if (acquired) {
            return acquired;
        }
        const { groups: { namespace } = {} } =
            testable.value.match(namespaceExtractor) || {};
        return namespace;
    }, "");

const isParentExportDefaultDeclaration = (path) => {
    const {
        parent: { type },
    } = path;

    return type === "ExportDefaultDeclaration";
};

const isParentExportNamedDeclaration = (path) => {
    const {
        parent: { type },
    } = path;

    return type === "ExportNamedDeclaration";
};

/**
 * Gets leading comments directly from the path.node
 * Or from the parent, if path.parent is exdf or named exp.
 */
const getLeadingCommentsPath = (path) => {
    if (path.node.leadingComments) {
        return path;
    }
    if (
        isParentExportNamedDeclaration(path) ||
        isParentExportDefaultDeclaration(path)
    ) {
        return path.parentPath;
    }

    return path;
};

const getLeadingComments = (path) => {
    const {
        node: { leadingComments },
    } = getLeadingCommentsPath(path);

    return leadingComments;
};

const getNamespaceFromPath = (path) => {
    const leadingComments = getLeadingComments(path);
    if (!leadingComments) {
        return null;
    }

    return extractNamespaceFromComments(leadingComments);
};

/**
 * This removes the defined namespace from the comments belonging to the path
 * Or to the path's parents, if it's exdf or named exp.
 */
const removeNamespaceFromPath = (path, namespace) => {
    const leadingCommentsPath = getLeadingCommentsPath(path);

    leadingCommentsPath.node.leadingComments.forEach((comment) => {
        comment.value = comment.value.replace(
            new RegExp(`@namespace +${namespace}`),
            `#namespace ${namespace}`
        );
    });
};

/**
 * If a constructor exists for the class {path}
 * This adds a super() call on top of it
 */
const addSuperToConstructor = (path, types) => {
    const constructor = path
        .get("body")
        .get("body")
        .find((member) => {
            // Search for a constructor
            const isConstructor = member.get("key").node.name === "constructor";
            if (!isConstructor) {
                return false;
            }

            // Handle TS overloads: ensure that the retrieved thing indeed is a method
            const isMethod = member.get("type").node === "ClassMethod";
            if (!isMethod) {
                return false;
            }

            return true;
        });

    if (!constructor) {
        return;
    }

    const superCall = types.expressionStatement(
        types.callExpression(types.super(), [])
    );

    try {
        constructor.get("body").unshiftContainer("body", superCall);
    } catch {
        console.log(constructor);
        process.exit(0);
    }
};

/**
 * Checks the filename in order to verify that it belongs to an extension
 */
const isMustProcessNamespace = (state) => {
    const { filename } = state.file.opts;

    for (let i = 0; i < allowedPaths.length; i++) {
        const allowedPath = allowedPaths[i];

        if (filename.includes(allowedPath)) {
            return true;
        }
    }

    return false;
};

module.exports = (options) => {
    const { types } = options;

    return {
        name: "middleware-decorators",
        visitor: {
            // Transform leading comments of anonymous arrow functions
            ArrowFunctionExpression: (path, state) => {
                if (!isMustProcessNamespace(state)) {
                    return;
                }

                const namespace = getNamespaceFromPath(path);

                if (!namespace) {
                    return;
                }

                removeNamespaceFromPath(path, namespace);

                path.replaceWith(
                    types.callExpression(
                        types.memberExpression(
                            types.identifier("Mosaic"),
                            types.identifier("middleware")
                        ),
                        [path.node, types.stringLiteral(namespace)]
                    )
                );
            },

            VariableDeclaration: (path, state) => {
                if (!isMustProcessNamespace(state)) {
                    return;
                }

                const namespace = getNamespaceFromPath(path);
                if (!namespace) {
                    return;
                }

                removeNamespaceFromPath(path, namespace);

                const declarator = path.get("declarations")[0];
                const init = declarator.get("init");

                init.replaceWith(
                    types.callExpression(
                        types.memberExpression(
                            types.identifier("Mosaic"),
                            types.identifier("middleware")
                        ),
                        [init.node, types.stringLiteral(namespace)]
                    )
                );
            },

            FunctionDeclaration: (path, state) => {
                if (!isMustProcessNamespace(state)) {
                    return;
                }

                const namespace = getNamespaceFromPath(path);
                if (!namespace) {
                    return;
                }

                removeNamespaceFromPath(path, namespace);

                const {
                    node: {
                        id: { name },
                        params,
                        body,
                    },
                } = path;

                const functionExpression = types.functionExpression(
                    types.identifier(name),
                    params,
                    body
                );

                const middlewaredFunctionExpression = types.callExpression(
                    types.memberExpression(
                        types.identifier("Mosaic"),
                        types.identifier("middleware")
                    ),
                    [functionExpression, types.stringLiteral(namespace)]
                );

                const declarator = types.variableDeclarator(
                    types.identifier(name),
                    middlewaredFunctionExpression
                );

                const declaration = types.variableDeclaration("let", [declarator]);

                const isDefaultExport = isParentExportDefaultDeclaration(path);

                // Handle regular case
                if (!isDefaultExport) {
                    path.replaceWith(declaration);
                    return;
                }

                // Handle default export
                const { parentPath } = path;

                const exportDefaultDeclaration = types.exportDefaultDeclaration(
                    types.identifier(name)
                );

                parentPath.insertAfter(exportDefaultDeclaration);
                parentPath.replaceWith(declaration);
            },

            // TODO make this work with class expressions ?
            ClassDeclaration: (path, state) => {
                if (!isMustProcessNamespace(state)) {
                    return;
                }

                const namespace = getNamespaceFromPath(path);
                if (!namespace) {
                    return;
                }

                // Consume the used namespace: prevent middleware(middleware(...))
                removeNamespaceFromPath(path, namespace);

                // Extract all the contents of a class
                const superClass = path.get("superClass");
                const id = path.get("id");
                const body = path.get("body");
                const decorators = path.get("decorators");
                const initialImplements = path.get("implements");
                const mixins = path.get("mixins");
                const superTypeParameters = path.get("superTypeParameters");
                const typeParameters = path.get("typeParameters");

                // Mosaic.Extensible(SuperClass || undefined)
                const superExpression = types.callExpression(
                    types.memberExpression(
                        types.identifier("Mosaic"),
                        types.identifier("Extensible")
                    ),
                    [(superClass && superClass.node) || types.identifier("")]
                );

                // If the middlewarable class did not have a base class before
                // We should add a super() call to its constructor
                if (!superClass.node) {
                    addSuperToConstructor(path, types);
                }

                // Set the new base class
                superClass.replaceWith(superExpression);

                const {
                    node: { name },
                } = path.get("id");

                // Generate the middlewarable class as an expression,
                // To be able to operate with it as with a variable, not as with a declaration
                // ClassExpression != ClassDeclaration
                // This class deliberately does not have a name in the moment of declaration
                // Having a name there will cause calls to the class from within itself not respect middleware
                const classExpression = types.classExpression(
                    types.identifier(`${id.node.name}_`),
                    superClass.node,
                    body.node,
                    decorators.node
                );

                // Return all the stuff that's been on the initial class
                if (Array.isArray(initialImplements)) {
                    classExpression.implements = initialImplements.map((x) => x.node);
                }

                if (Array.isArray(decorators)) {
                    classExpression.decorators = decorators.map((x) => x.node);
                }

                classExpression.mixins = mixins.node;
                classExpression.superTypeParameters = superTypeParameters.node;
                classExpression.typeParameters = typeParameters.node;

                // Generate the final middleware expression
                // Mosaic.middleware(class {}, 'namespace')
                const wrappedInMiddeware = types.callExpression(
                    types.memberExpression(
                        types.identifier("Mosaic"),
                        types.identifier("middleware")
                    ),
                    [classExpression, types.stringLiteral(namespace.trim())]
                );

                // SomeClass = Mosaic...<generated above thing>
                const declarator = types.variableDeclarator(
                    types.identifier(name),
                    wrappedInMiddeware
                );

                // const SomeClass = ...
                const newDeclaration = types.variableDeclaration("const", [declarator]);

                // If the class was export default'ed initially
                // We need to remove the initial exdf, because `export default const x = ...` is not valid
                // And generate a new exdf with just the class' name
                if (isParentExportDefaultDeclaration(path)) {
                    const newExportDefaultDeclaration = types.exportDefaultDeclaration(
                        types.identifier(name)
                    );

                    path.insertAfter(newExportDefaultDeclaration);
                    path.parentPath.replaceWith(newDeclaration);
                } else {
                    // In all the other cases - just replace the generated thing
                    // With a new declaration
                    path.replaceWith(newDeclaration);
                }
            },
        },
    };
};
