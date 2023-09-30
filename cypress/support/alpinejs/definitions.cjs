import { defineFrameworkDefinition } from "cypress";
import { mount } from "./index.mjs";

module.exports = defineFrameworkDefinition({
  name: "cypress-ct-alpinejs",
  version: "1.0.0",
  dependencies: {
    alpinejs: "^3.0.0",
  },
  mount,
  setup: () => {
    // Any global setup logic for Alpine.js can go here
  },
  teardown: () => {
    // Any global teardown logic for Alpine.js can go here
  },
});
