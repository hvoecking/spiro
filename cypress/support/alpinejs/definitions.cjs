const { defineFrameworkDefinition } = require("cypress");

module.exports = defineFrameworkDefinition({
  name: "cypress-ct-alpinejs",
  version: "1.0.0",
  dependencies: {
    alpinejs: "^3.0.0",
  },
  mount: require("./index.mjs").mount,
  setup: () => {
    // Any global setup logic for Alpine.js can go here
  },
  teardown: () => {
    // Any global teardown logic for Alpine.js can go here
  },
});
