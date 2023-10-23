import { exec, spawn } from "child_process";
import psTree from "ps-tree";

const vite = exec("npm run _test:vite");

function exit(code) {
  psTree(vite.pid, function (err, children) {
    if (err) return console.error("psTree err: ", err);
    spawn(
      "kill",
      ["-9"].concat(
        children.map(function (p) {
          return p.PID;
        })
      )
    );
    process.exit(code);
  });
}

// Run Cypress tests
const cypress = exec("npm run _test:cypress", (error) => {
  if (error) {
    console.error(`Cypress error: ${error.message}`);
    exit(error.code || 1);
  }

  exit(0);
});

console.warn("vite PID:", vite.pid);
console.warn("cypress PID:", cypress.pid);

// Optionally, forward logs from Vite server to console
vite.stdout.pipe(process.stdout);
vite.stderr.pipe(process.stderr);

cypress.stdout.pipe(process.stdout);
cypress.stderr.pipe(process.stderr);
