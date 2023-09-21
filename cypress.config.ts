import { devServer } from "@cypress/vite-dev-server";
import { defineConfig } from "cypress";

import viteConfig from "./vite.config";

export default defineConfig({
  // A bug in cypress causes reloads with incomplete DOM which causes an infinet loop
  // of exceptions. Therefore, we set this to 0 to avoid the reloads.
  numTestsKeptInMemory: 0,
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here, use "on" and "config" arguments if needed
    },
  },
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: "cypress-ct-alpine-js" as "vue",
        viteConfig: viteConfig,
      });
    },
  },
});
