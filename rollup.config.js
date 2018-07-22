import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  plugins: [
    nodeResolve(),
    babel({
      presets: [['env', { modules: false }]],
      plugins: ['transform-pipeline-operator']
    })
  ],
  output: {
    format: 'iife',
    sourcemap: true
  }
}
