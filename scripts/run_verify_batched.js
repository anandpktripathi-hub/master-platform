/* eslint-disable no-console */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NPX = 'npx';
const NPM = 'npm';

function run(command, args, options = {}) {
  const pretty = [command, ...args].join(' ');
  console.log(`\n==> ${pretty}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function capture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    shell: true,
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return (result.stdout || '').toString();
}

function listJestTests(cwd) {
  // Use --listTests so we can run exact file subsets.
  const jestArgs = ['jest', '--listTests'];
  const jestConfigCjs = path.join(cwd, 'jest.config.cjs');
  if (fs.existsSync(jestConfigCjs)) {
    jestArgs.push('--config', 'jest.config.cjs');
  }

  const out = capture(NPX, jestArgs, { cwd });
  return out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function runJestInBatches({ cwd, batchSize, label }) {
  const tests = listJestTests(cwd);

  if (tests.length === 0) {
    console.log(`\n==> ${label}: No Jest tests found (skipping).`);
    return;
  }

  const totalBatches = Math.ceil(tests.length / batchSize);
  console.log(`\n==> ${label}: ${tests.length} test files; ${totalBatches} batches of ${batchSize} (last may be smaller).`);

  for (let i = 0; i < totalBatches; i += 1) {
    const start = i * batchSize;
    const batch = tests.slice(start, start + batchSize);
    console.log(`\n==> ${label}: Running batch ${i + 1}/${totalBatches} (${batch.length} files)`);

    // --runInBand keeps concurrency at 1, reducing open-file pressure on Windows.
    // --detectOpenHandles helps catch hanging resources if it happens.
    const batchByPath = batch
      .map((testPath) => path.relative(cwd, testPath))
      .map((p) => p.split(path.sep).join('/'));

    const jestArgs = ['jest', '--runInBand', '--detectOpenHandles', '--runTestsByPath', ...batchByPath];
    const jestConfigCjs = path.join(cwd, 'jest.config.cjs');
    if (fs.existsSync(jestConfigCjs)) {
      jestArgs.splice(1, 0, '--config', 'jest.config.cjs');
    }

    run(NPX, jestArgs, { cwd });
  }
}

function main() {
  const root = process.cwd();
  const backendDir = path.join(root, 'backend');
  const frontendDir = path.join(root, 'frontend');
  const batchSize = Number.parseInt(process.env.VERIFY_BATCH_SIZE || '9', 10);

  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    console.error('VERIFY_BATCH_SIZE must be a positive integer');
    process.exit(1);
  }

  // Backend: typecheck + build + tests (batched)
  run(NPM, ['run', 'build:typecheck', '--if-present'], { cwd: backendDir });
  run(NPM, ['run', 'build'], { cwd: backendDir });
  runJestInBatches({ cwd: backendDir, batchSize, label: 'backend' });

  // Frontend: build + tests (batched)
  run(NPM, ['run', 'build'], { cwd: frontendDir });
  runJestInBatches({ cwd: frontendDir, batchSize, label: 'frontend' });

  console.log('\n✅ verify (batched) complete');
}

main();
