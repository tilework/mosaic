import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";

const pkg = require('./package.json');

const bundle = config => ({
    ...config,
    input: 'index.js',
});

export default [
    bundle({
        plugins: [
            babel({
                babelHelpers: 'bundled'
            }), 
            terser()
        ],
        output: [
            {
                exports: 'named',
                file: pkg.main,
                format: 'esm',
                name: 'Mosaic',
                sourcemap: false
            }
        ]
    })
];