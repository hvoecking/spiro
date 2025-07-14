import { devServer } from "@cypress/vite-dev-server";
import { defineConfig } from "cypress";

import viteConfig from "./vite.config.ts";

import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default defineConfig({
  // A bug in cypress causes reloads with incomplete DOM which causes an infinite loop
  // of exceptions. Therefore, we set this to 0 to avoid the reloads.
  e2e: {
    setupNodeEvents() {
      // implement node event listeners here, use "on" and "config" arguments if needed
    },
  },
  env: {
    PORT: process.env.PORT,
  },
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        // Using standard framework configuration
        framework: "cypress-ct-alpine-js",
        viteConfig: viteConfig,
      });
    },
  },
});
