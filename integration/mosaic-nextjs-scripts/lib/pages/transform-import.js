const babel = require('@babel/core');
const logger = require('@tilework/mosaic-dev-utils/logger');

function transformImports(code, transformer) {
    const parts = [];

    // Extract all import locations
    babel.transformSync(code, {
        babelrc: false,
        configFile: false,
        presets: ['@babel/preset-react'],
        plugins: [{
            visitor: {
                ImportDeclaration({
                    node: {
                        source: {
                            start,
                            end
                        }
                    }
                }) {
                    parts.push({ start, end });
                },

                CallExpression({ node }) {
                    // Import non-import calls
                    if (node.callee.type !== 'Import' && node.callee.name !== 'require') {
                        return;
                    }

                    // Get the argument
                    const importable = node.arguments[0];

                    // Warn about critical deps
                    if (importable.type !== 'StringLiteral') {
                        const warningCode = logger.style.code(
                            code.substring(node.start, node.end)
                        );

                        logger.warn(
                            `Critical dependency found: "${ warningCode }".`,
                            'It is not recommended to import modules in such a manner, it may not work as expected.'
                        );

                        return;
                    }

                    // Store the importable
                    parts.push({
                        start: importable.start,
                        end: importable.end
                    });
                }
            }
        }]
    });

    // Transform all
    const transformedPieces = parts.reduce(({ lastIndex, result }, part) => {
        const { start, end } = part;
        const importable = code.substring(start + 1, end - 1);
        const transformed = transformer(importable);

        return {
            lastIndex: end,
            result: [
                ...result,
                code.substring(lastIndex, start),
                `"${ transformed }"`
            ]
        };
    }, {
        lastIndex: 0,
        result: []
    });

    return [
        ...transformedPieces.result,
        code.substr(transformedPieces.lastIndex)
    ].join('');
}

module.exports = transformImports;