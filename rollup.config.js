import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

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
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      babelHelpers: 'bundled',
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'Mars',
    file: 'index.js',
    globals: {
      karas: 'karas',
    },
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      babelHelpers: 'bundled',
    }),
    json(),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'Mars',
    file: 'index.min.js',
    globals: {
      karas: 'karas',
    },
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      babelHelpers: 'bundled',
    }),
    terser({
    }),
    json(),
  ],
}];
