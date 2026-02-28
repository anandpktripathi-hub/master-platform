/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const http = require('http');

function die(message) {
  console.error(message);
  process.exit(1);
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.error) {
    die(`[launch-verify] Failed to run ${cmd}: ${result.error.message}`);
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    die(`[launch-verify] Command failed (${result.status}): ${cmd} ${args.join(' ')}`);
  }
}

function runAllowFail(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (result.error) {
    return false;
  }

  return (result.status ?? 1) === 0;
}

function ensureDockerAvailable() {
  const result = spawnSync('docker', ['version'], {
    stdio: 'ignore',
    shell: false,
  });

  if (result.error || (typeof result.status === 'number' && result.status !== 0)) {
    die(
      [
        '[launch-verify] Docker is not available.',
        'Start Docker Desktop (or the Docker engine) and rerun:',
        '  npm run launch:verify',
      ].join('\n'),
    );
  }
}

function httpStatus(url, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      // Drain body quickly
      res.resume();
      resolve(res.statusCode || 0);
    });
    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });
    req.on('error', (err) => reject(err));
  });
}

async function waitForHttp(url, expectedStatus, totalTimeoutMs) {
  const started = Date.now();
  // Poll every 2s
  while (Date.now() - started < totalTimeoutMs) {
    try {
      const status = await httpStatus(url, 4000);
      if (status === expectedStatus) return;
    } catch {
      // ignore while starting
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  die(`[launch-verify] Timed out waiting for ${url} to return ${expectedStatus}`);
}

async function verifyStack({ name, composeFile, projectName, jwtSecret, keepUp }) {
  console.log(`\n[launch-verify] Bringing up: ${name}`);

  const env = { ...process.env };
  if (jwtSecret) {
    env.JWT_SECRET = env.JWT_SECRET || jwtSecret;
  }

  run('docker', ['compose', '-p', projectName, '-f', composeFile, 'up', '-d', '--build'], { env });

  console.log(`[launch-verify] Waiting for backend health...`);
  await waitForHttp('http://localhost:4000/api/v1/health', 200, 180_000);

  console.log(`[launch-verify] Waiting for frontend...`);
  await waitForHttp('http://localhost/', 200, 120_000);

  console.log(`[launch-verify] OK: ${name} reachable (backend+frontend).`);

  if (!keepUp) {
    console.log(`[launch-verify] Tearing down: ${name}`);
    run('docker', ['compose', '-p', projectName, '-f', composeFile, 'down', '-v']);
  }
}

(async function main() {
  const keepProd = process.argv.includes('--keep-prod');
  const keepLocal = process.argv.includes('--keep-local');

  ensureDockerAvailable();

  // Always start from a clean slate to avoid port/project collisions.
  runAllowFail('docker', ['compose', '-p', 'smetasc_local', '-f', 'docker-compose.yml', 'down', '-v']);
  runAllowFail('docker', ['compose', '-p', 'smetasc_prodlocal', '-f', 'docker-compose.prod.localbuild.yml', 'down', '-v']);

  await verifyStack({
    name: 'local (docker-compose.yml)',
    composeFile: 'docker-compose.yml',
    projectName: 'smetasc_local',
    keepUp: keepLocal,
  });

  await verifyStack({
    name: 'prod-localbuild (docker-compose.prod.localbuild.yml)',
    composeFile: 'docker-compose.prod.localbuild.yml',
    projectName: 'smetasc_prodlocal',
    jwtSecret: 'local-prod-secret',
    keepUp: keepProd,
  });

  console.log('\n[launch-verify] Done.');
  if (!keepProd) {
    console.log('[launch-verify] Tip: rerun with --keep-prod to keep the prod-local stack up.');
  }
})().catch((err) => {
  die(`[launch-verify] Unexpected failure: ${err && err.message ? err.message : String(err)}`);
});
