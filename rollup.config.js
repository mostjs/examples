import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'

export default {
  plugins: [
    nodeResolve(),
    babel({
      presets: [['@babel/env', { modules: false }]],
      plugins: [['@babel/proposal-pipeline-operator', { proposal: 'minimal' }]]
    }),
    commonjs()
  ],
  output: {
    format: 'iife',
    sourcemap: true
  }
}
