module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "quotes": ["warn", "double"],
    "indent": [
      "warn",
      4,
      {
          "SwitchCase": 1,
          "VariableDeclarator": "first",
          "MemberExpression": 1,
          "ArrayExpression": 1,
          "ObjectExpression": 1,
          "ImportDeclaration": 1,
      },
  ],
  },
}
