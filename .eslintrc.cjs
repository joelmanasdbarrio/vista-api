module.exports = {
  extends: ['./node_modules/ts-standard/eslintrc.json'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    // Disable rules that might interfere with TypeScript type checking
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    // Keep essential formatting rules
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
    '@typescript-eslint/comma-dangle': ['error', 'never'],
    '@typescript-eslint/space-before-function-paren': ['error', 'always']
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'drizzle/',
    '*.js'
  ]
}
