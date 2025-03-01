import { devServer } from "@cypress/vite-dev-server";
import { defineConfig } from "cypress";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Import Vite config using dynamic import
const getViteConfig = async () => {
  const viteConfig = await import(resolve(__dirname, "./vite.config.ts"));
  return viteConfig.default;
};

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
    async devServer(devServerConfig) {
      const viteConfig = await getViteConfig();
      return devServer({
        ...devServerConfig,
        framework: "cypress-ct-alpine-js",
        viteConfig,
      });
    },
  },
});
