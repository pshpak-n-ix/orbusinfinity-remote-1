module.exports = {
  extends: ['react-app', 'react-app/jest', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  rules: {
    // TypeScript strict rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/restrict-template-expressions': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/require-array-sort-compare': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-includes': 'error',

    // Import rules with type import enforcement
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/consistent-type-exports': [
      'error',
      {
        fixMixedExportsWithInlineTypeSpecifier: true,
      },
    ],
    'import/order': 'off', // Disable due to resolver issues
    'import/no-duplicates': 'off', // Disable due to resolver issues
    'import/no-unresolved': 'off', // Disable due to resolver issues
    'import/no-unused-modules': 'off', // Disable due to resolver issues

    // React specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'error',
    'react/no-array-index-key': 'error',
    'react/no-danger': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/no-unsafe': 'error',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'error',
    'react/void-dom-elements-no-children': 'error',
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-closing-bracket-location': 'error',
    'react/jsx-closing-tag-location': 'error',
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'never' },
    ],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/jsx-pascal-case': 'error',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // General code quality rules
    'no-console': 'error',
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': 'error',
    'no-duplicate-imports': 'off', // Handled by import/no-duplicates
    'no-useless-return': 'error',
    'no-useless-concat': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'off', // Handled by @typescript-eslint/no-useless-constructor
    '@typescript-eslint/no-useless-constructor': 'error',
    'no-throw-literal': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'consistent-return': 'error',
    'array-callback-return': 'error',
    'no-unreachable': 'error',
    'no-unreachable-loop': 'error',
    'no-unused-expressions': 'off', // Handled by @typescript-eslint/no-unused-expressions
    '@typescript-eslint/no-unused-expressions': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['.eslintrc.js', 'config/**/*.js', 'craco.config.js'],
      parserOptions: {
        project: false,
      },
    },
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-console': 'off',
      },
    },
  ],
};
