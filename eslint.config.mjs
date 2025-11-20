import codemaskConfig from 'eslint-config-codemask'

export default [
    ...codemaskConfig,
    {
        ignores: ['src/metadata.ts'],
        rules: {
            '@typescript-eslint/indent': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/strict-boolean-expressions': 'off',
            camelcase: "off"
        }
    },
    {
        files: ['**/*.spec.ts'],
        rules: {
            'no-empty-function': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off'
        }
    },
]
