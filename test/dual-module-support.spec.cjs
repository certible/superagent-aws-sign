const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { describe, it, expect } = require('@jest/globals');

describe('Dual Module Support', () => {
  const projectRoot = path.resolve(__dirname, '..');

  it('should support CommonJS require', () => {
    const AwsSignRequestCJS = require('../index.cjs');

    expect(AwsSignRequestCJS).toBeDefined();
    expect(typeof AwsSignRequestCJS).toBe('function');
    expect(AwsSignRequestCJS.name).toBe('AwsSignRequest');

    const instance = new AwsSignRequestCJS();
    expect(instance).toBeInstanceOf(AwsSignRequestCJS);
    expect(instance.defaultService).toBe('execute-api');
    expect(typeof instance.setCredentials).toBe('function');
    expect(typeof instance.setRegion).toBe('function');
    expect(typeof instance.add).toBe('function');
  });

  it('should support ES module import', (done) => {
    // Create a temporary test script to test ES module import
    const testScript = `
import AwsSignRequest from './index.mjs';

// Test basic functionality
if (!AwsSignRequest) {
  process.exit(1);
}

if (typeof AwsSignRequest !== 'function') {
  process.exit(2);
}

if (AwsSignRequest.name !== 'AwsSignRequest') {
  process.exit(3);
}

// Test instantiation
const instance = new AwsSignRequest();
if (!(instance instanceof AwsSignRequest)) {
  process.exit(4);
}

if (instance.defaultService !== 'execute-api') {
  process.exit(5);
}

if (typeof instance.setCredentials !== 'function') {
  process.exit(6);
}

console.log('ES Module test passed');
process.exit(0);
    `;

    const testFile = path.join(projectRoot, 'temp-esm-test.mjs');
    fs.writeFileSync(testFile, testScript.trim());

    // Run the test script
    const child = spawn('node', [testFile], {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(testFile);
      }
      catch {
        // Ignore cleanup errors
      }

      if (code !== 0) {
        const errorMessages = {
          1: 'AwsSignRequest is not defined',
          2: 'AwsSignRequest is not a function',
          3: 'AwsSignRequest class name is incorrect',
          4: 'Instance is not an instance of AwsSignRequest',
          5: 'Default service is not set correctly',
          6: 'setCredentials method is not a function',
        };

        const errorMessage = errorMessages[code] || `Unknown error (exit code: ${code})`;
        done(new Error(`ES Module test failed: ${errorMessage}. stderr: ${stderr}`));
      }
      else {
        expect(stdout).toContain('ES Module test passed');
        done();
      }
    });

    child.on('error', (err) => {
      try {
        fs.unlinkSync(testFile);
      }
      catch {
        // Ignore cleanup errors
      }
      done(err);
    });
  }, 10000);

  it('should have proper package.json exports configuration', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

    expect(packageJson.type).toBe('module');
    expect(packageJson.main).toBe('index.cjs');
    expect(packageJson.module).toBe('index.mjs');

    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['.']).toBeDefined();
    expect(packageJson.exports['.'].import).toBe('./index.mjs');
    expect(packageJson.exports['.'].require).toBe('./index.cjs');
    expect(packageJson.exports['.'].types).toBe('./index.d.ts');
    expect(packageJson.exports['.'].default).toBe('./index.mjs');
  });

  it('should have all required distribution files', () => {
    const requiredFiles = ['index.cjs', 'index.mjs', 'index.d.ts'];

    for (const file of requiredFiles) {
      const filePath = path.join(projectRoot, file);
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf8');
      expect(content.length).toBeGreaterThan(0);

      expect(content).toContain('AwsSignRequest');
    }
  });
});
