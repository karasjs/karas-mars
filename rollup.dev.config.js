import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';

export default [{
  input: 'src/index.js',
  output: {
    name: 'Mars',
    file: 'index.js',
    globals: {
      karas: 'karas',
    },
    format: 'umd',
    sourcemap: true,
  },
  external: ['karas'],
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      babelHelpers: 'bundled',
    }),
    json(),
  ],
}];
