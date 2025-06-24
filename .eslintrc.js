module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
    },
    plugins: ['@typescript-eslint', 'import'],
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-type-checked',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
    ],
    env: {
        node: true,
        es2022: true,
    },
    rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'import/order': ['error', { 'newlines-between': 'always' }],
    },
    settings: {
        'import/resolver': {
            typescript: {
                project: ['./tsconfig.json', './packages/*/tsconfig.json'],
            },
        },
    },
};