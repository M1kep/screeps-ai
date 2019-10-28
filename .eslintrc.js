module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    'screeps/screeps': true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018
  },
  plugins: [
    '@typescript-eslint',
    'screeps'
  ],
  rules: {
  }
}
