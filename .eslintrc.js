  
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  plugins: [
    "jest"
  ],
  rules: {
    "quotes": [2, "single"],
    "indent": ["error", 2],
    "semi": ["error", "never"],
    "no-console": "off",
    "no-control-regex": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-reserved-component-names": "off"
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  }
}