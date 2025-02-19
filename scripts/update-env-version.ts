import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagePath = path.join(__dirname, "..", "package.json");
const envPath = path.join(__dirname, "..", ".env");

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

// Read the current version from package.json
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")) as PackageJson;
const version = packageJson.version;

let envContent = fs.readFileSync(envPath, "utf8");

// Replace or add the VITE_APP_VERSION line
const versionRegex = /^VITE_APP_VERSION=.*/m;
if (versionRegex.test(envContent)) {
  envContent = envContent.replace(versionRegex, `VITE_APP_VERSION=${version}`);
} else {
  envContent += `\nVITE_APP_VERSION=${version}`;
}

fs.writeFileSync(envPath, envContent);
