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
    "jasmine": "readonly",
    "define": "readonly",
    "describe": "readonly",
    "beforeEach": "readonly",
    "afterEach": "readonly",
    "afterAll": "readonly",
    "expect": "readonly",
    "it": "readonly",
    "xit": "readonly",
    "assertTrue": "readonly",
    "assertFalse": "readonly",
    "assertNumber": "readonly",
    "assertString": "readonly",
    "$": "readonly"
  },
  rules: {
    "quotes": ["error", "double"]
  }
}
