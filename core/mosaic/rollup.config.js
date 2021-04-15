import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";

const pkg = require('./package.json');

const bundle = config => ({
    ...config,
    input: 'index.js',
    external: id => !/^[./]/.test(id) || /@babel\/runtime/.test(id)
});

export default [
    bundle({
        plugins: [
            nodeResolve(), 
            babel(), 
            terser()
        ],
        output: [
            {
                file: pkg.main,
                format: 'umd',
                name: 'Mosaic',
                sourcemap: false
            }
        ]
    })
];