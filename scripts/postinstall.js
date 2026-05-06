#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SCRIPT_NAME = 'appflow:build';
const SCRIPT_BODY = 'echo "HEY I\'M RUNNING appflow:build script!"';
const LOG_PREFIX = '[appflow:build]';

// npm sets INIT_CWD to the directory where `npm install` was originally invoked.
// When this package is installed as a dependency, that's the consuming project's root.
const consumerRoot = process.env.INIT_CWD;
const packageRoot = path.resolve(__dirname, '..');

if (!consumerRoot) {
  console.log(`${LOG_PREFIX} INIT_CWD not set; skipping.`);
  process.exit(0);
}

// Skip when the package is being installed in its own working tree (development).
if (path.resolve(consumerRoot) === packageRoot) {
  console.log(`${LOG_PREFIX} Self-install detected; skipping.`);
  process.exit(0);
}

const pkgPath = path.join(consumerRoot, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.log(`${LOG_PREFIX} No package.json at ${pkgPath}; skipping.`);
  process.exit(0);
}

let raw;
try {
  raw = fs.readFileSync(pkgPath, 'utf8');
} catch (err) {
  console.warn(`${LOG_PREFIX} Could not read ${pkgPath}: ${err.message}`);
  process.exit(0);
}

let pkg;
try {
  pkg = JSON.parse(raw);
} catch (err) {
  console.warn(`${LOG_PREFIX} Could not parse ${pkgPath}: ${err.message}`);
  process.exit(0);
}

pkg.scripts = pkg.scripts || {};

if (pkg.scripts[SCRIPT_NAME] === SCRIPT_BODY) {
  console.log(`${LOG_PREFIX} Script already present in ${pkgPath}; nothing to do.`);
  process.exit(0);
}

if (pkg.scripts[SCRIPT_NAME] && pkg.scripts[SCRIPT_NAME] !== SCRIPT_BODY) {
  console.log(
    `${LOG_PREFIX} "${SCRIPT_NAME}" already defined with a different value in ${pkgPath}; leaving untouched.`
  );
  process.exit(0);
}

pkg.scripts[SCRIPT_NAME] = SCRIPT_BODY;

// Preserve the file's existing indentation and trailing newline.
const indentMatch = raw.match(/\n([\t ]+)"/);
const indent = indentMatch ? indentMatch[1] : '  ';
const trailingNewline = raw.endsWith('\n') ? '\n' : '';

try {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline);
  console.log(`${LOG_PREFIX} Added "${SCRIPT_NAME}" script to ${pkgPath}.`);
} catch (err) {
  console.warn(`${LOG_PREFIX} Failed to write ${pkgPath}: ${err.message}`);
  // Do not fail the install on write errors.
  process.exit(0);
}
