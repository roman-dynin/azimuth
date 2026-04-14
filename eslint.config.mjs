// @ts-check

import antfu from '@antfu/eslint-config'

import prettier from 'eslint-config-prettier'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(antfu(), prettier, {
  rules: {
    'style/quote-props': 'off',
    'style/brace-style': 'off',
    'style/arrow-parens': 'off',
    'style/operator-linebreak': 'off',
    'style/member-delimiter-style': 'off',
    'antfu/if-newline': 'off',
  },
})
