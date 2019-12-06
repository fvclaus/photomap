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
    "$testBody": "readonly",
    "expect": "readonly",
    "it": "readonly",
    "xit": "readonly",
    "spyOn": "readonly",
    "assertTrue": "readonly",
    "assertFalse": "readonly",
    "assertNumber": "readonly",
    "assertString": "readonly",
    "assertObject": "readonly",
    "assertFunction": "readonly",
    "assertSchema": "readonly",
    "assertArray": "readonly",
    "assertInstance": "readonly",
    "$": "readonly",
    "gettext": "readonly",
    "interpolate": "readonly",
    "google": "readonly",
    "ol": "readonly"
  },
  rules: {
    "quotes": ["error", "double"],
    "no-unused-vars": ["error", {
      "vars": "all",
      "args": "all"
    }]
  }
}
