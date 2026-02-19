/* eslint-disable no-console */
// Minimal backend smoke test (no repo scanning, no extra deps).
// Usage:
//   node scripts/smoke-backend.js http://localhost:4000/api/v1

const base = (process.argv[2] || 'http://localhost:4000/api/v1').replace(/\/+$/g, '');

async function hit(method, path, options = {}) {
  const url = base + path;
  const started = Date.now();
  let res;
  let bodyText = '';
  try {
    res = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    bodyText = await res.text();
  } catch (err) {
    return {
      ok: false,
      method,
      path,
      url,
      ms: Date.now() - started,
      error: String(err && err.message ? err.message : err),
    };
  }

  const preview = bodyText.slice(0, 240).replace(/\s+/g, ' ').trim();
  return {
    ok: res.ok,
    method,
    path,
    url,
    status: res.status,
    ms: Date.now() - started,
    preview,
  };
}

async function main() {
  const checks = [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/metrics' },
    { method: 'GET', path: '/metrics/prometheus' },
    // Readiness/detailed checks are useful operational signal.
    { method: 'GET', path: '/health/ready' },
    { method: 'GET', path: '/health/detailed' },
    // Public catalog endpoint used by signup
    { method: 'GET', path: '/packages?limit=1' },
    // Protected endpoint should respond 401/403 (still proves routing works)
    { method: 'GET', path: '/me/profile' },
  ];

  console.log(`SMOKE_BASE ${base}`);
  const results = [];
  for (const c of checks) {
    results.push(await hit(c.method, c.path, c.options));
  }

  const failures = [];
  for (const r of results) {
    const status = r.status ?? 'ERR';
    console.log(`${r.method} ${r.path} -> ${status} (${r.ms}ms) ${r.preview || r.error || ''}`);

    // Treat health + readiness + metrics as hard requirements.
    if (r.path === '/health' || r.path === '/health/ready' || r.path.startsWith('/metrics')) {
      if (!r.ok) failures.push(r);
    }
  }

  if (failures.length) {
    console.error(`SMOKE_FAIL ${failures.length} hard checks failed`);
    process.exitCode = 1;
  } else {
    console.log('SMOKE_OK');
  }
}

main();
