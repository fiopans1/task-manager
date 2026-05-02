import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const vitePackagePath = resolve(process.cwd(), "node_modules", "vite", "package.json");

if (existsSync(vitePackagePath)) {
  process.exit(0);
}

console.warn("Vite is not installed yet. Running `pnpm install --frozen-lockfile` first...");

const packageManagerExec = process.env.npm_execpath
  ? [process.execPath, process.env.npm_execpath]
  : ["corepack", "pnpm"];

const result = spawnSync(packageManagerExec[0], [...packageManagerExec.slice(1), "install", "--frozen-lockfile"], {
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
