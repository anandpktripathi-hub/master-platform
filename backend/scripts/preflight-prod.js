/* eslint-disable no-console */
// Minimal production preflight (no deps). Designed to fail fast and print actionable fixes.
// Usage:
//   node backend/scripts/preflight-prod.js
//
// Exit codes:
//   0: ok
//   2: missing required env
//   3: dependency not reachable

const net = require('net');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') return null;
  return String(value);
}

function warn(msg) {
  console.log(`[PREFLIGHT][WARN] ${msg}`);
}

function fail(msg) {
  console.error(`[PREFLIGHT][FAIL] ${msg}`);
}

function ok(msg) {
  console.log(`[PREFLIGHT][OK] ${msg}`);
}

function parseMongoHostPort(uri) {
  try {
    // Supports mongodb://host:port/db or mongodb://user:pass@host:port/db
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) return null;
    if (uri.startsWith('mongodb+srv://')) return null; // can't TCP-check SRV here

    const withoutProto = uri.replace(/^mongodb:\/\//, '');
    const atSplit = withoutProto.split('@');
    const hostPartAndRest = (atSplit.length === 2 ? atSplit[1] : atSplit[0]) || '';
    const hostPart = hostPartAndRest.split('/')[0] || '';
    const [host, portRaw] = hostPart.split(':');
    const port = Number(portRaw || 27017);
    if (!host) return null;
    if (!Number.isFinite(port) || port <= 0) return null;
    return { host, port };
  } catch {
    return null;
  }
}

function tcpCheck(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (result) => {
      if (done) return;
      done = true;
      try {
        socket.destroy();
      } catch {
        // ignore
      }
      resolve(result);
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => finish({ ok: true }));
    socket.on('timeout', () => finish({ ok: false, error: 'timeout' }));
    socket.on('error', (err) => finish({ ok: false, error: String(err && err.message ? err.message : err) }));

    socket.connect(port, host);
  });
}

async function main() {
  const nodeEnv = process.env.NODE_ENV || '(unset)';
  console.log(`[PREFLIGHT] NODE_ENV=${nodeEnv}`);

  if (process.env.NODE_ENV !== 'production') {
    warn('NODE_ENV is not "production". This preflight is intended for production runs.');
  }

  const missing = [];

  const jwtSecret = requiredEnv('JWT_SECRET');
  if (!jwtSecret) missing.push('JWT_SECRET');
  else if (jwtSecret === 'your-secret-key') warn('JWT_SECRET is set to the insecure default "your-secret-key".');

  const dbUri = requiredEnv('DATABASE_URI') || requiredEnv('DATABASE_URL');
  if (!dbUri) missing.push('DATABASE_URI');

  if (missing.length) {
    for (const k of missing) fail(`Missing required env var: ${k}`);
    console.error('[PREFLIGHT] Set required env vars and re-run.');
    process.exitCode = 2;
    return;
  }

  ok('Required env vars present');

  // Optional env checks (warn-only)
  if (!requiredEnv('STRIPE_SECRET_KEY')) warn('STRIPE_SECRET_KEY not set (payments disabled).');
  if (!requiredEnv('REDIS_URL')) warn('REDIS_URL not set (Redis usage metering will run in no-op mode).');

  // Dependency reachability
  const mongoHostPort = parseMongoHostPort(dbUri);
  if (mongoHostPort) {
    const r = await tcpCheck(mongoHostPort.host, mongoHostPort.port);
    if (!r.ok) {
      fail(`MongoDB not reachable at ${mongoHostPort.host}:${mongoHostPort.port} (${r.error})`);
      process.exitCode = 3;
      return;
    }
    ok(`MongoDB reachable at ${mongoHostPort.host}:${mongoHostPort.port}`);
  } else {
    warn('MongoDB URI is not a simple mongodb://host:port form; skipping TCP check.');
  }

  ok('Preflight complete');
}

main().catch((err) => {
  fail(`Unhandled error: ${String(err && err.stack ? err.stack : err)}`);
  process.exitCode = 1;
});
