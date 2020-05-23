module.exports = {
  extends: ['airbnb-base', 'prettier'],
  globals: {},
  rules: {
    indent: 2,
    semi: ['error', 'always'],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'linebreak-style': ['error', 'unix'],
    quotes: [2, 'single'],
    camelcase: 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    'max-len': [
      'error',
      {
        code: 100,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@packages', './packages'],
          ['@helpers', './helpers'],
          ['@config', './config'],
        ],
        extensions: ['.js', '.json'],
      },
    },
  },
};
