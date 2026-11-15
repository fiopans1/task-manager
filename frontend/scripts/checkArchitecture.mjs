#!/usr/bin/env node
/*
 * Frontend architecture guard.
 *
 * The goal is not to be clever: it is to keep the dependency direction that
 * makes the feature-first layout safe to change. Run it with:
 *
 *   pnpm check:architecture
 *
 * It also runs automatically before `pnpm build`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const violations = [];
const removedDependencies = [
  "bootstrap",
  "bootstrap-icons",
  "react-bootstrap",
  "react-bootstrap-icons",
  "react-icons",
  "@fortawesome",
  "recharts",
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && /\.(js|jsx)$/.test(entry.name) ? [full] : [];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function featureOf(relativePath) {
  const match = relativePath.match(/^src\/features\/([^/]+)\//);
  return match?.[1] ?? null;
}

function importSpecifiers(source) {
  const specifiers = [];
  const pattern = /\bfrom\s+["']([^"']+)["']|\bimport\s+["']([^"']+)["']/g;
  let match;
  while ((match = pattern.exec(source))) {
    specifiers.push(match[1] ?? match[2]);
  }
  return specifiers;
}

function isDeepFeatureImport(specifier) {
  const match = specifier.match(/^@\/features\/([^/]+)\//);
  return match ? { feature: match[1], deep: true } : null;
}

for (const file of walk(src)) {
  const filePath = relative(file);
  const source = fs.readFileSync(file, "utf8");
  const ownerFeature = featureOf(filePath);

  for (const specifier of importSpecifiers(source)) {
    if (removedDependencies.some((dependency) => specifier === dependency || specifier.startsWith(`${dependency}/`))) {
      violations.push(`${filePath}: removed dependency "${specifier}"`);
    }

    const deepFeature = isDeepFeatureImport(specifier);
    if (deepFeature && ownerFeature && deepFeature.feature !== ownerFeature) {
      violations.push(
        `${filePath}: cross-feature deep import "${specifier}" (use @/features/${deepFeature.feature})`,
      );
    }

    if (filePath.startsWith("src/shared/") && /^@\/(features|app)\//.test(specifier)) {
      violations.push(`${filePath}: shared code must not import "${specifier}"`);
    }

    if (
      (filePath.startsWith("src/shared/ui/") || filePath.startsWith("src/shared/patterns/")) &&
      /^@\/(services|redux)\//.test(specifier)
    ) {
      violations.push(`${filePath}: UI patterns must stay presentational ("${specifier}")`);
    }

    if (
      (filePath.startsWith("src/services/") || filePath.startsWith("src/redux/")) &&
      /^@\/(features|app|shared\/ui|shared\/patterns)\//.test(specifier)
    ) {
      violations.push(`${filePath}: infrastructure must not import UI code ("${specifier}")`);
    }

    if (specifier === "sonner" && !filePath.startsWith("src/shared/feedback/")) {
      violations.push(`${filePath}: import sonner only through shared/feedback/Noty.js`);
    }
  }
}

if (violations.length > 0) {
  console.error("Architecture check failed:");
  for (const violation of violations) console.error(`  - ${violation}`);
  process.exit(1);
}

const fileCount = walk(src).length;
console.log(`Architecture OK: ${fileCount} files, dependencies flow app → features → shared/services.`);
