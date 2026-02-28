/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function die(message) {
  console.error(message);
  process.exit(1);
}

function parsePositiveInt(value, name) {
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) {
    die(`${name} must be a positive integer`);
  }
  return n;
}

const batchIndex = parsePositiveInt(process.argv[2], 'batchIndex');
const batchCount = parsePositiveInt(process.argv[3], 'batchCount');

if (batchIndex > batchCount) {
  die('batchIndex must be <= batchCount');
}

const backendRoot = process.cwd();
const cacheFile = path.join(backendRoot, '.jest-test-list.txt');

function quoteArg(arg) {
  // Conservative quoting for cmd.exe; also safe for POSIX shells.
  const s = String(arg);
  if (s.length === 0) return '""';
  if (/^[A-Za-z0-9_./\\:-]+$/.test(s)) return s;
  return `"${s.replace(/"/g, '\\"')}"`;
}

function runNpx(args, options = {}) {
  const argList = Array.isArray(args) ? args : [];

  if (process.platform === 'win32') {
    const cmdLine = ['npx', ...argList].map(quoteArg).join(' ');
    const result = spawnSync('cmd.exe', ['/d', '/s', '/c', cmdLine], {
      stdio: 'inherit',
      shell: false,
      ...options,
    });

    if (result.error) {
      die(`Failed to run npx via cmd.exe: ${result.error.message}`);
    }

    return result.status ?? 1;
  }

  const result = spawnSync('npx', argList, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.error) {
    die(`Failed to run npx: ${result.error.message}`);
  }

  return result.status ?? 1;
}

function getTestList() {
  if (fs.existsSync(cacheFile)) {
    const raw = fs.readFileSync(cacheFile, 'utf8');
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let result;
  if (process.platform === 'win32') {
    const cmdLine = ['npx', 'jest', '--listTests'].map(quoteArg).join(' ');
    result = spawnSync('cmd.exe', ['/d', '/s', '/c', cmdLine], {
      encoding: 'utf8',
      shell: false,
    });
  } else {
    result = spawnSync('npx', ['jest', '--listTests'], {
      encoding: 'utf8',
      shell: false,
    });
  }

  if (result.error) {
    die(`Failed to list tests: ${result.error.message}`);
  }

  const stdout = String(result.stdout || '');
  const stderr = String(result.stderr || '');

  if (result.status !== 0) {
    process.stderr.write(stderr);
    die('jest --listTests failed');
  }

  const tests = stdout
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (tests.length === 0) {
    die('No tests found from jest --listTests');
  }

  fs.writeFileSync(cacheFile, tests.join('\n'), 'utf8');
  return tests;
}

const allTests = getTestList();
const batchTests = allTests.filter((_, idx) => idx % batchCount === batchIndex - 1);

console.log(`Jest batch ${batchIndex}/${batchCount}: ${batchTests.length} test files`);

if (batchTests.length === 0) {
  process.exit(0);
}

const jestArgs = [
  'jest',
  '--runInBand',
  '--forceExit',
  '--runTestsByPath',
  ...batchTests,
];
const code = runNpx(jestArgs);
process.exit(code);
