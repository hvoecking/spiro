import path from "path";
import { watchAndRun } from "vite-plugin-watch-and-run";

import dotenv from "dotenv";

import SvgSpritePlugin from "vite-plugin-svg-sprite";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
process.env.BROWSER = "Google Chrome";

/** @type {import("vite").UserConfig} */
const config = {
  server: {
    port: process.env.PORT,
  },
  plugins: [
    SvgSpritePlugin({
      input: "assets/icons/*.svg",
      symbolId: "icon-[name]-[hash]",
    }),
    watchAndRun([
      {
        name: "watch-asbuild",
        watchKind: ["add", "change", "unlink"],
        watch: path.resolve("assembly/**/*.ts"),
        run: "npm run _build:as",
        delay: 300,
      },
    ]),
    watchAndRun([
      {
        name: "watch-icons",
        watchKind: ["add", "change", "unlink"],
        watch: path.resolve("assets/icons/*.png"),
        run: "./scripts/icons.sh png",
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
