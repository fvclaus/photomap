module.exports = {
  env: {
    browser: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 5,
    sourceType: 'script'
  },
  globals: {
    "define": "readonly",
    "describe": "readonly",
    "expect": "readonly",
    "it": "readonly",
    "assertTrue": "readonly",
    "assertFalse": "readonly",
    "$": "readonly"
  },
  rules: {
    "quotes": ["error", "double"]
  }
}
