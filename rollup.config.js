import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import alias from 'rollup-plugin-alias';

export default {
  input: 'src/index.js',
  output: {
    file: 'build/index.js',
    format: 'iife',
    name: 'Collector'
  },
  plugins: [
    alias({
      deps: require.resolve('./src/web-crypto.js'),
      'aws-sigv4': require.resolve('aws-sigv4/src/index.js'),
    }),

    nodeResolve({
      jsnext: true,
      main: true
    }),

    commonjs({
      include: 'node_modules/**',
      namedExports: {
        '@protobufjs/base64': ['encode', 'decode']
      }
    }),
  ]
};
