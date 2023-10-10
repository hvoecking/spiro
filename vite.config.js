import path from "path";
import watchAndRun from "vite-plugin-watch-and-run";

import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

/** @type {import("vite").UserConfig} */
const config = {
  server: {
    port: process.env.PORT,
  },
  plugins: [
    watchAndRun([
      {
        name: "watch-asbuild",
        watchKind: ["add", "change", "unlink"],
        watch: path.resolve("assembly/**/*.ts"),
        run: "npm run asbuild",
        delay: 300,
      },
    ]),
    watchAndRun([
      {
        name: "watch-icons",
        watchKind: ["add", "change", "unlink"],
        watch: path.resolve("assets/icons/*.png"),
        run: "./scripts/icons.sh",
        delay: 300,
      },
    ]),
    watchAndRun([
      {
        name: "watch-icons",
        watchKind: ["add", "change", "unlink"],
        watch: path.resolve("scripts/icons.sh"),
        run: "./scripts/icons.sh",
        delay: 300,
      },
    ]),
  ],
};

export default config;
