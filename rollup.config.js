'use strict'

import clear from 'rollup-plugin-clear'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import screeps from 'rollup-plugin-screeps'
import strip from 'rollup-plugin-strip'

let cfg
const dest = process.env.DEST
if (!dest) {
  console.log('No destination specified - code will be compiled but not uploaded')
} else if ((cfg = require('./screeps.json')[dest]) == null) {
  throw new Error('Invalid upload destination')
}

export default {
  input: 'src/main.ts',
  output: [{
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: true,
    intro: 'const __PROFILER_ENABLED__ = true'
  }],
  plugins: [
    clear({ targets: ['dist'] }),
    strip({
      // set this to `false` if you don't want to
      // remove debugger statements
      debugger: true,

      // defaults to `[ 'console.*', 'assert.*' ]`
      functions: ['console.log', 'assert.*', 'debug', 'alert'],

      // remove one or more labeled blocks by name
      // defaults to `[]`
      labels: ['unittest'],

      // set this to `false` if you're not using sourcemaps –
      // defaults to `true`
      sourceMap: true
    }),
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    screeps({ config: cfg, dryRun: cfg == null })
  ]
}
