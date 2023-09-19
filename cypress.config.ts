import { devServer } from "@cypress/vite-dev-server";
import { defineConfig } from "cypress";

import vtieConfig from "./vite.config";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: "cypress-ct-alpinejs",
        viteConfig: vtieConfig,
      });
    },
  },
});
