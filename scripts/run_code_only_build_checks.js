/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outPath = path.join(root, 'reports', '_last_build_checks_code_only.json');

function run(command, args, cwd) {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const res = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  const durationMs = Date.now() - t0;
  const ok = res.status === 0;
  return {
    startedAt,
    cwd: path.relative(root, cwd || root) || '.',
    command: [command, ...args].join(' '),
    ok,
    exitCode: res.status,
    durationMs,
    stdout: (res.stdout || '').slice(-20000),
    stderr: (res.stderr || '').slice(-20000),
  };
}

function main() {
  const checks = [];

  // Backend build
  checks.push({
    name: 'backend-build',
    ...run('npm', ['run', 'build'], path.join(root, 'backend')),
  });

  // Frontend build (if present)
  const frontendPkg = path.join(root, 'frontend', 'package.json');
  if (fs.existsSync(frontendPkg)) {
    checks.push({
      name: 'frontend-build',
      ...run('npm', ['run', 'build'], path.join(root, 'frontend')),
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    checks,
  };

  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${path.relative(root, outPath)}`);

  const failed = checks.filter((c) => !c.ok);
  if (failed.length) {
    console.error('Some build checks failed:');
    for (const f of failed) console.error(`- ${f.name}: exitCode=${f.exitCode}`);
    process.exit(2);
  }
}

main();
