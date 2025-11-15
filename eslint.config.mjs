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
    {
        files: ['test-k6/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './test-k6/tsconfig.json',
            },
        },
        rules: {
            '@typescript-eslint/strict-boolean-expressions': 'off',
            '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            camelcase: [
                'warn',
                {
                    allow: ['http_req_duration'],
                },
            ],
        },
    },
]
