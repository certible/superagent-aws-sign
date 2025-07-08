#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Read the source file
const sourceFile = path.join(__dirname, '../src/index.js');
const targetFile = path.join(__dirname, '../index.mjs');

let content = fs.readFileSync(sourceFile, 'utf8');

/**
 * Converts CommonJS require statements to ES6 import statements.
 * Handles both destructured and default imports.
 */
function convertRequiresToImports(content) {
  // Handle destructured imports, e.g., const { a, b } = require('pkg');
  content = content.replace(
    /const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
    'import {$1} from \'$2\';',
  );

  // Handle default imports, e.g., const x = require('pkg');
  content = content.replace(
    /const\s+([a-zA-Z_$][\w$]*)\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
    'import $1 from \'$2\';',
  );

  return content;
}

content = convertRequiresToImports(content);

// Convert module.exports to ES6 export
content = content.replace(
  /module\.exports = AwsSignRequest;/,
  'export default AwsSignRequest;',
);

// Write the ESM version
fs.writeFileSync(targetFile, content, 'utf8');

console.log('✅ Generated index.mjs (ESM version)');
