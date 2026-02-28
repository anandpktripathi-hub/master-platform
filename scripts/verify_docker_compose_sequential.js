/* eslint-disable no-console */

// Sequential Docker Compose verification (Windows-friendly, low repo I/O).
//
// Examples:
//   npm run docker:verify:local
//   npm run docker:verify:prod
//
// Options:
//   --file <compose.yml>         (default: docker-compose.prod.yml)
//   --mode <build|pull>          (default: pull)
//   --services backend,frontend  (default for build: backend,frontend)
//   --healthUrl <url>            (default: http://localhost:4000/api/v1/health)
//   --frontendUrl <url>          (default: http://localhost)
//   --timeoutSec <n>             (default: 120)
//   --keep                       (don't run `docker compose down`)
//
// Notes:
// - If JWT_SECRET is required by the compose file and not set, we generate a temporary one.
// - We intentionally run build/pull sequentially to reduce Docker Desktop load.

const { spawnSync } = require('child_process');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { URL } = require('url');

function getCmdTimeoutMs() {
  const raw = process.env.DOCKER_CMD_TIMEOUT_SEC || '';
  const asInt = Number.parseInt(raw, 10);
  const sec = Number.isFinite(asInt) && asInt > 0 ? asInt : 1800; // 30m default
  return sec * 1000;
}

function parseArgs(argv) {
  const args = {
    file: 'docker-compose.prod.yml',
    mode: 'pull',
    services: null,
    healthUrl: 'http://localhost:4000/api/v1/health',
    frontendUrl: 'http://localhost',
    timeoutSec: 120,
    keep: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--file') args.file = argv[++i];
    else if (a === '--mode') args.mode = argv[++i];
    else if (a === '--services') args.services = argv[++i];
    else if (a === '--healthUrl') args.healthUrl = argv[++i];
    else if (a === '--frontendUrl') args.frontendUrl = argv[++i];
    else if (a === '--timeoutSec') args.timeoutSec = Number.parseInt(argv[++i], 10);
    else if (a === '--keep') args.keep = true;
  }

  if (!Number.isFinite(args.timeoutSec) || args.timeoutSec <= 0) {
    throw new Error('--timeoutSec must be a positive integer');
  }

  if (args.mode !== 'build' && args.mode !== 'pull') {
    throw new Error('--mode must be one of: build, pull');
  }

  return args;
}

function run(command, args, options = {}) {
  const pretty = [command, ...args].join(' ');
  console.log(`\n==> ${pretty}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    timeout: getCmdTimeoutMs(),
    killSignal: 'SIGKILL',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runStatus(command, args, options = {}) {
  const pretty = [command, ...args].join(' ');
  console.log(`\n==> ${pretty}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    timeout: getCmdTimeoutMs(),
    killSignal: 'SIGKILL',
    ...options,
  });

  return result.status ?? 1;
}

function runCapture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    timeout: getCmdTimeoutMs(),
    killSignal: 'SIGKILL',
    ...options,
  });

  return {
    status: result.status ?? 1,
    stdout: (result.stdout || '').toString(),
    stderr: (result.stderr || '').toString(),
  };
}

function isRegistryDenied(text) {
  const t = String(text || '').toLowerCase();
  return t.includes('denied') || t.includes('unauthorized') || t.includes('authentication required');
}

function runQuiet(command, args, options = {}) {
  const { timeoutMs, ...rest } = options;
  const result = spawnSync(command, args, {
    stdio: ['ignore', 'ignore', 'ignore'],
    shell: false,
    timeout: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 10_000,
    killSignal: 'SIGKILL',
    ...rest,
  });

  return result.status === 0;
}

function runBestEffort(command, args, options = {}) {
  try {
    const result = spawnSync(command, args, {
      stdio: ['ignore', 'ignore', 'ignore'],
      shell: false,
      timeout: 60_000,
      killSignal: 'SIGKILL',
      ...options,
    });
    return result.status === 0;
  } catch (_) {
    return false;
  }
}

function isDockerResponsive() {
  // Use a fast probe that works in most Desktop contexts. `docker info` can legitimately take
  // longer than 10s on Windows/WSL (proxy/network calls), so treat it as a secondary probe.
  if (runQuiet('docker', ['version', '--format', '{{.Server.Version}}'], { timeoutMs: 10_000 })) {
    return true;
  }

  return runQuiet('docker', ['info'], { timeoutMs: 30_000 });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGetStatus(url, timeoutMs = 10_000) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;

    const req = lib.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: `${u.pathname}${u.search}`,
        method: 'GET',
        headers: {
          Accept: '*/*',
          'User-Agent': 'compose-verifier',
        },
      },
      (res) => {
        // Drain to avoid socket leaks
        res.resume();
        resolve({ status: res.statusCode || 0 });
      },
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
    });

    req.on('error', reject);
    req.end();
  });
}

async function waitForHttpOk(url, timeoutMs) {
  const started = Date.now();
  let lastError = null;

  while (Date.now() - started < timeoutMs) {
    try {
      const res = await httpGetStatus(url, 10_000);
      if (res.status >= 200 && res.status < 300) return { ok: true, status: res.status };
      lastError = `HTTP ${res.status}`;
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      // undici/http errors can be terse; include the URL so failures are actionable.
      lastError = `${msg} (${url})`;
    }

    await sleep(2000);
  }

  return { ok: false, error: lastError || 'timeout' };
}

function dumpComposeDebug(composeBase) {
  console.log('\n==> compose debug (ps + recent logs)');

  const ps = runCapture('docker', [...composeBase, 'ps']);
  if (ps.stdout) process.stdout.write(ps.stdout);
  if (ps.stderr) process.stderr.write(ps.stderr);

  const services = ['backend', 'frontend', 'mongodb', 'redis'];
  for (const svc of services) {
    const logs = runCapture('docker', [...composeBase, 'logs', '--no-color', '--tail', '200', svc]);
    if (logs.status === 0 && (logs.stdout || logs.stderr)) {
      console.log(`\n==> logs (${svc})`);
      if (logs.stdout) process.stdout.write(logs.stdout);
      if (logs.stderr) process.stderr.write(logs.stderr);
    }
  }
}

function dockerLoginGhcrBestEffort() {
  const username = process.env.GHCR_USERNAME || process.env.GITHUB_ACTOR;
  const token = process.env.GHCR_TOKEN || process.env.GITHUB_TOKEN;

  if (!username || !token) return false;

  console.log('==> attempting docker login ghcr.io (best-effort)');
  const result = spawnSync('docker', ['login', 'ghcr.io', '-u', username, '--password-stdin'], {
    encoding: 'utf8',
    input: `${token}\n`,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: false,
    timeout: getCmdTimeoutMs(),
    killSignal: 'SIGKILL',
  });

  if (result.status === 0) {
    console.log('==> ghcr.io login ok');
    return true;
  }

  // Avoid echoing anything that could include sensitive context.
  console.warn('==> ghcr.io login failed (continuing; pull may still fail)');
  return false;
}

function ensureJwtSecret() {
  if (process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim().length >= 16) return;
  // Use a random secret for verification runs. Real prod should set this explicitly.
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('base64url');
  console.log('==> JWT_SECRET was not set; generated a temporary value for this verification run.');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  console.log(`VERIFY_COMPOSE_FILE ${opts.file}`);
  console.log(`VERIFY_MODE ${opts.mode}`);

  // Avoid hanging forever if Docker is wedged.
  const dockerOk = isDockerResponsive();
  if (!dockerOk) {
    console.error('Docker is not responding. Start Docker Desktop and retry.');
    process.exit(1);
  }

  ensureJwtSecret();

  const composeBase = ['compose', '-f', opts.file];

  // Best-effort cleanup to avoid failures due to stale/paused state from previous runs.
  // In particular, this prevents: "cannot start a paused container".
  runBestEffort('docker', [...composeBase, 'unpause']);
  runBestEffort('docker', [...composeBase, 'down', '--remove-orphans']);

  // Validate compose file early.
  const cfg = runCapture('docker', [...composeBase, 'config']);
  if (cfg.status !== 0) {
    console.error(cfg.stderr || cfg.stdout || 'docker compose config failed');
    process.exit(cfg.status);
  }
  process.stdout.write(cfg.stdout);

  // If the compose references GHCR and credentials were provided, attempt a non-interactive login.
  if (cfg.stdout.includes('ghcr.io/')) {
    dockerLoginGhcrBestEffort();
  }

  if (opts.mode === 'pull') {
    const pull = runCapture('docker', [...composeBase, 'pull']);
    if (pull.status !== 0) {
      const combined = `${pull.stdout}\n${pull.stderr}`;
      process.stdout.write(pull.stdout);
      process.stderr.write(pull.stderr);

      if (isRegistryDenied(combined)) {
        console.error('\nPULL_DENIED: registry authentication is required for one or more images.');
        console.error('If you are using GitHub Container Registry (ghcr.io):');
        console.error('- Run: docker login ghcr.io');
        console.error('- Use a GitHub token with at least read:packages permission');
        console.error('- Or set BACKEND_IMAGE/FRONTEND_IMAGE to images you can pull');
        console.error('- Or use local build verification instead: npm run docker:verify:local');
      }

      process.exit(pull.status);
    }
    run('docker', [...composeBase, 'up', '-d']);
  } else {
    const services = (opts.services || 'backend,frontend')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let usedLegacyBuild = false;

    for (const svc of services) {
      const status = runStatus('docker', [...composeBase, 'build', svc]);
      if (status !== 0) {
        // Docker Desktop on Windows can hit BuildKit snapshot/cache corruption. Retrying with
        // BuildKit disabled is often enough to unblock local verification.
        console.error(`\nBuild failed for ${svc}. Retrying with DOCKER_BUILDKIT=0 ...`);
        usedLegacyBuild = true;
        const retryStatus = runStatus('docker', [...composeBase, 'build', svc], {
          env: { ...process.env, DOCKER_BUILDKIT: '0' },
        });
        if (retryStatus !== 0) {
          process.exit(retryStatus ?? 1);
        }
      }
    }

    // Avoid triggering a second build during `up` (which can re-hit BuildKit issues).
    // If we had to fall back to legacy build, keep the same env for `up` just in case.
    if (usedLegacyBuild) {
      run('docker', [...composeBase, 'up', '-d'], {
        env: { ...process.env, DOCKER_BUILDKIT: '0' },
      });
    } else {
      run('docker', [...composeBase, 'up', '-d']);
    }
  }

  // Health checks
  console.log(`\n==> waiting for backend health: ${opts.healthUrl}`);
  const health = await waitForHttpOk(opts.healthUrl, opts.timeoutSec * 1000);
  if (!health.ok) {
    console.error(`Backend health check failed: ${health.error || 'unknown error'}`);
    dumpComposeDebug(composeBase);
    if (!opts.keep) {
      run('docker', [...composeBase, 'down', '--remove-orphans']);
    }
    process.exit(1);
  }
  console.log(`Backend health OK (HTTP ${health.status})`);

  if (opts.frontendUrl) {
    console.log(`\n==> waiting for frontend: ${opts.frontendUrl}`);
    const fe = await waitForHttpOk(opts.frontendUrl, opts.timeoutSec * 1000);
    if (!fe.ok) {
      console.error(`Frontend check failed: ${fe.error || 'unknown error'}`);
      dumpComposeDebug(composeBase);
      if (!opts.keep) {
        run('docker', [...composeBase, 'down', '--remove-orphans']);
      }
      process.exit(1);
    }
    console.log(`Frontend OK (HTTP ${fe.status})`);
  }

  if (!opts.keep) {
    run('docker', [...composeBase, 'down', '--remove-orphans']);
  }

  console.log('\n✅ docker compose verification complete');
}

main().catch((err) => {
  console.error(String(err && err.stack ? err.stack : err));
  process.exit(1);
});
