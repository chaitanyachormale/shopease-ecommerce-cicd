/**
 * ShopEase Build & Packaging Script
 * Assembles a verified static distribution build into the 'dist/' folder.
 * Generates an asset manifest with file integrity hashes and size metrics.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "dist");
const ASSETS_TO_COPY = [
  "index.html",
  "style.css",
  "script.js"
];

const DIRS_TO_COPY = [
  "src",
  "assets"
];

console.log("\n=======================================================");
console.log("  ShopEase Static Application Build Process");
console.log("=======================================================\n");

// 1. Clean previous build directory
if (fs.existsSync(DIST_DIR)) {
  console.log(`[1/4] Cleaning existing distribution directory: ${DIST_DIR}`);
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}

fs.mkdirSync(DIST_DIR, { recursive: true });
console.log(`[2/4] Initialized clean dist directory.`);

// Helper function to copy directories recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Copy static files
console.log(`[3/4] Packaging static assets into dist/...`);
for (const file of ASSETS_TO_COPY) {
  const src = path.resolve(__dirname, file);
  const dest = path.resolve(DIST_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  -> Copied file: ${file}`);
  } else {
    console.error(`  ❌ Error: Required build asset missing: ${file}`);
    process.exit(1);
  }
}

// 3. Copy directories
for (const dir of DIRS_TO_COPY) {
  const src = path.resolve(__dirname, dir);
  const dest = path.resolve(DIST_DIR, dir);
  if (fs.existsSync(src)) {
    copyDirSync(src, dest);
    console.log(`  -> Copied directory: ${dir}/`);
  }
}

// 4. Generate Build Manifest & Integrity Hashes
console.log(`[4/4] Generating production build manifest & checksums...`);

function collectFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      collectFiles(full, fileList);
    } else if (item.name !== "build-manifest.json") {
      fileList.push(full);
    }
  }
  return fileList;
}

const packagedFiles = collectFiles(DIST_DIR);
let totalBytes = 0;
const manifestFiles = [];

for (const filePath of packagedFiles) {
  const relative = path.relative(DIST_DIR, filePath).replace(/\\/g, "/");
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  const size = fs.statSync(filePath).size;
  totalBytes += size;

  manifestFiles.push({
    file: relative,
    sizeBytes: size,
    sha256: hash
  });
}

const manifest = {
  application: "ShopEase E-Commerce",
  version: "1.0.0",
  buildTimestamp: new Date().toISOString(),
  target: "dist/",
  totalFiles: manifestFiles.length,
  totalSizeBytes: totalBytes,
  totalSizeFormatted: `${(totalBytes / 1024).toFixed(2)} KB`,
  buildStatus: "SUCCESS",
  files: manifestFiles
};

const manifestPath = path.resolve(DIST_DIR, "build-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

console.log("\n=======================================================");
console.log("  BUILD SUMMARY");
console.log("=======================================================");
console.log(`  Status:      ${manifest.buildStatus}`);
console.log(`  Timestamp:   ${manifest.buildTimestamp}`);
console.log(`  Total Files: ${manifest.totalFiles}`);
console.log(`  Total Size:  ${manifest.totalSizeFormatted}`);
console.log(`  Manifest:    dist/build-manifest.json`);
console.log("=======================================================");
console.log("✅ Build completed successfully! Distribution bundle is ready.\n");
