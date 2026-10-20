/**
 * ShopEase Code Quality & Project Integrity Linter
 * Performs comprehensive static checks on project structure, file contents,
 * JSON validity, HTML semantics, CSS rules, and code cleanliness.
 * Exits with code 0 on success, or code 1 if any check fails.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_FILES = [
  "index.html",
  "style.css",
  "script.js",
  "package.json",
  "Jenkinsfile",
  "check-quality.js",
  "build.js",
  "README.md",
  "docs/AGILE_PLAN.md",
  "src/products.js",
  "src/cart.js",
  "src/validator.js",
  "tests/ecommerce.test.js"
];

let passCount = 0;
let failCount = 0;
const errors = [];

function recordPass(message) {
  passCount++;
  console.log(`  [PASS] ${message}`);
}

function recordFail(message) {
  failCount++;
  errors.push(message);
  console.error(`  [FAIL] ${message}`);
}

console.log("\n=======================================================");
console.log("  ShopEase Code Quality & Integrity Check");
console.log("=======================================================\n");

// 1. Verify existence and non-zero size of all required files
console.log("--> Stage 1: File Presence and Size Verification");
for (const relPath of REQUIRED_FILES) {
  const fullPath = path.resolve(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    recordFail(`Required file missing: ${relPath}`);
  } else {
    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      recordFail(`File is empty (0 bytes): ${relPath}`);
    } else {
      recordPass(`Found ${relPath} (${stats.size} bytes)`);
    }
  }
}

// 2. Validate package.json configuration
console.log("\n--> Stage 2: Configuration & Scripts Verification");
try {
  const pkgContent = fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8");
  const pkg = JSON.parse(pkgContent);

  if (!pkg.name || typeof pkg.name !== "string") {
    recordFail("package.json is missing a valid 'name' field.");
  } else {
    recordPass(`Valid package name: ${pkg.name}`);
  }

  const requiredScripts = ["test", "quality", "build"];
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      recordPass(`package.json contains script '${script}': "${pkg.scripts[script]}"`);
    } else {
      recordFail(`package.json is missing required script '${script}'`);
    }
  }
} catch (err) {
  recordFail(`Invalid package.json format: ${err.message}`);
}

// 3. Inspect HTML structure and essential DOM elements
console.log("\n--> Stage 3: HTML Structure & Semantics Check");
try {
  const htmlContent = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");

  if (!htmlContent.includes("<!DOCTYPE html>")) {
    recordFail("index.html is missing valid HTML5 DOCTYPE declaration.");
  } else {
    recordPass("Valid HTML5 DOCTYPE declaration found.");
  }

  if (!htmlContent.includes('meta name="viewport"')) {
    recordFail("index.html missing responsive viewport meta tag.");
  } else {
    recordPass("Responsive viewport meta tag present.");
  }

  const requiredHtmlElements = [
    { id: 'id="cart-count"', desc: "Cart item badge counter" },
    { id: 'id="products-grid"', desc: "Product catalog container" },
    { id: 'id="cart-drawer"', desc: "Shopping cart drawer" },
    { id: 'id="checkout-form"', desc: "Checkout form" },
    { id: 'id="open-cart-btn"', desc: "Cart opener button" }
  ];

  for (const item of requiredHtmlElements) {
    if (htmlContent.includes(item.id)) {
      recordPass(`HTML element verified: ${item.desc} (${item.id})`);
    } else {
      recordFail(`index.html is missing required element: ${item.desc} (${item.id})`);
    }
  }

  if (htmlContent.includes("style.css") && htmlContent.includes("script.js")) {
    recordPass("index.html properly references style.css and script.js.");
  } else {
    recordFail("index.html must reference both style.css and script.js.");
  }
} catch (err) {
  recordFail(`Error reading index.html: ${err.message}`);
}

// 4. Inspect CSS file for responsive styles and design tokens
console.log("\n--> Stage 4: CSS & Responsive Styling Check");
try {
  const cssContent = fs.readFileSync(path.resolve(__dirname, "style.css"), "utf8");

  if (!cssContent.includes("@media")) {
    recordFail("style.css is missing responsive @media queries.");
  } else {
    const mediaCount = (cssContent.match(/@media/g) || []).length;
    recordPass(`Found ${mediaCount} responsive @media query breakpoint(s).`);
  }

  if (cssContent.includes(":root") && cssContent.includes("--primary")) {
    recordPass("CSS custom properties / design tokens are properly defined.");
  } else {
    recordFail("style.css is missing :root CSS variables (e.g., --primary).");
  }
} catch (err) {
  recordFail(`Error reading style.css: ${err.message}`);
}

// 5. Inspect JavaScript files for code hygiene and forbidden artifacts
console.log("\n--> Stage 5: JavaScript Hygiene & Anti-Pattern Check");
const jsFilesToCheck = [
  "script.js",
  "src/products.js",
  "src/cart.js",
  "src/validator.js",
  "tests/ecommerce.test.js"
];

for (const relPath of jsFilesToCheck) {
  const fullPath = path.resolve(__dirname, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const content = fs.readFileSync(fullPath, "utf8");

  // Check for lingering debugger statements
  if (/\bdebugger\b/.test(content)) {
    recordFail(`Found forbidden 'debugger;' statement in ${relPath}`);
  } else {
    recordPass(`Clean from 'debugger' statements: ${relPath}`);
  }

  // Check for unresolved placeholder stubs
  if (/TODO:\s*implement/i.test(content) || /FIXME:\s*unimplemented/i.test(content)) {
    recordFail(`Unimplemented stub found in ${relPath}`);
  } else {
    recordPass(`No unimplemented stubs found in ${relPath}`);
  }
}

// Summary and Process Exit
console.log("\n=======================================================");
console.log(`  Quality Check Results: ${passCount} Passed, ${failCount} Failed`);
console.log("=======================================================\n");

if (failCount > 0) {
  console.error("❌ Quality check FAILED with the following issues:");
  errors.forEach((err, idx) => console.error(`  ${idx + 1}. ${err}`));
  process.exit(1);
} else {
  console.log("✅ All quality checks passed successfully! Project is production ready.\n");
  process.exit(0);
}
