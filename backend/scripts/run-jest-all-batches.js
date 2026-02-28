/* eslint-disable no-console */
const { spawnSync } = require('child_process');

function die(message) {
  console.error(message);
  process.exit(1);
}

function runNode(args) {
  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    die(`Failed to run node: ${result.error.message}`);
  }

  return result.status ?? 1;
}

const batchCount = 11;

for (let i = 1; i <= batchCount; i += 1) {
  console.log(`\n[jest-batched] Running batch ${i}/${batchCount}`);
  const code = runNode(['./scripts/run-jest-batch.js', String(i), String(batchCount)]);
  if (code !== 0) {
    process.exit(code);
  }
}

console.log('\n[jest-batched] All batches passed.');
process.exit(0);
