module.exports = {
  singleAttributePerLine: true,
  htmlWhitespaceSensitivity: "css",
  printWidth: 88,
  singleQuote: false,
  semi: true,
  tabWidth: 2,
  bracketSameLine: false,
  trailingComma: "all",
  vueIndentScriptAndStyle: true,
  attributeSort: "none",
  tailwindPreserveWhitespace: true,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
};
