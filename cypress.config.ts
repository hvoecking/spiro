import { devServer } from "@cypress/vite-dev-server";
import { defineConfig } from "cypress";

import viteConfig from "./vite.config";

import * as dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default defineConfig({
  // A bug in cypress causes reloads with incomplete DOM which causes an infinet loop
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
        framework: "cypress-ct-alpine-js" as "vue",
        viteConfig: viteConfig,
      });
    },
  },
});
