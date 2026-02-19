/* eslint-disable no-console */
// Authenticated backend smoke test (low I/O, no extra deps).
// Flow:
// 1) Register tenant (auth/tenant-register) -> get JWT + tenant/workspace id
// 2) List workspaces -> switch workspace
// 3) Hit a few tenant-protected endpoints with Authorization + x-workspace-id
//
// Usage:
//   node scripts/smoke-authenticated.js http://localhost:4001/api/v1
//
// Notes:
// - Uses built-in fetch (Node 18+).
// - Creates a new tenant each run to avoid relying on existing fixtures.

const base = (process.argv[2] || 'http://localhost:4001/api/v1').replace(/\/+$/g, '');

function rand(n = 8) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < n; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function isoDate(daysAgo = 365 * 25) {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

async function http(method, path, { headers, body } = {}) {
  const url = base + path;
  const started = Date.now();
  let res;
  let text = '';

  try {
    res = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(headers || {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    text = await res.text();
  } catch (err) {
    return {
      ok: false,
      method,
      path,
      url,
      ms: Date.now() - started,
      status: null,
      error: String(err && err.message ? err.message : err),
      json: null,
      preview: '',
    };
  }

  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  const preview = String(text || '')
    .slice(0, 240)
    .replace(/\s+/g, ' ')
    .trim();

  return {
    ok: res.ok,
    method,
    path,
    url,
    ms: Date.now() - started,
    status: res.status,
    json,
    preview,
  };
}

function pickToken(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return payload.accessToken || payload.token || payload.jwt || payload.access_token || null;
}

function pickWorkspaceId(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const tenant = payload.tenant;
  if (tenant && typeof tenant === 'object') {
    return tenant.id || tenant._id || null;
  }
  const user = payload.user;
  if (user && typeof user === 'object') {
    return user.tenantId || null;
  }
  return null;
}

async function main() {
  const suffix = rand(10);
  const password = `P@ssw0rd_${suffix}`;
  const email = `smoke_${suffix}@example.com`;
  const username = `smoke_${suffix}`;
  const subdomain = `smoke-${suffix}`;

  console.log(`AUTH_SMOKE_BASE ${base}`);
  console.log(`AUTH_SMOKE_ID ${suffix}`);

  const registerBody = {
    personal: {
      firstName: 'Smoke',
      secondName: 'Test',
      lastName: 'User',
      dateOfBirth: isoDate(365 * 25),
      username,
      email,
      phone: '1234567890',
      homeAddress: '123 Smoke Street, Test City',
    },
    company: {
      companyName: `Smoke Company ${suffix}`,
      companyDateOfBirth: isoDate(365 * 5),
      companyEmail: email,
      companyPhone: '1234567890',
      companyAddress: '123 Company Ave, Test City',
      positionInCompany: 'Owner',
    },
    compliance: {
      acceptedTerms: true,
      acceptedPrivacy: true,
    },
    password,
    subdomain,
  };

  const reg = await http('POST', '/auth/tenant-register', { body: registerBody });
  console.log(`POST /auth/tenant-register -> ${reg.status ?? 'ERR'} (${reg.ms}ms) ${reg.preview || reg.error || ''}`);

  let token = reg.ok ? pickToken(reg.json) : null;
  let workspaceId = reg.ok ? pickWorkspaceId(reg.json) : null;

  if (!reg.ok) {
    // If registration failed due to conflict, attempt login with same email/password.
    const msg = (reg.json && (reg.json.message || reg.json.error)) || reg.preview;
    const conflict = String(msg || '').toLowerCase().includes('already') || reg.status === 409;
    if (conflict) {
      const login = await http('POST', '/auth/login', { body: { email, password } });
      console.log(`POST /auth/login -> ${login.status ?? 'ERR'} (${login.ms}ms) ${login.preview || login.error || ''}`);
      token = login.ok ? pickToken(login.json) : null;
      workspaceId = login.ok ? pickWorkspaceId(login.json) : null;
    }
  }

  if (!token) {
    console.error('AUTH_SMOKE_FAIL missing token (registration/login)');
    process.exitCode = 1;
    return;
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Auth-only probe (verifies JWT strategy accepts the token)
  const me = await http('GET', '/me/profile', { headers: authHeaders });
  console.log(`GET /me/profile -> ${me.status ?? 'ERR'} (${me.ms}ms) ${me.preview || me.error || ''}`);
  if (!me.ok) {
    console.error('AUTH_SMOKE_FAIL JWT not accepted for /me/profile');
    process.exitCode = 1;
    return;
  }

  // List workspaces
  const wsList = await http('GET', '/workspaces', { headers: authHeaders });
  console.log(`GET /workspaces -> ${wsList.status ?? 'ERR'} (${wsList.ms}ms) ${wsList.preview || wsList.error || ''}`);

  if (!wsList.ok || !Array.isArray(wsList.json)) {
    console.error('AUTH_SMOKE_FAIL could not list workspaces');
    process.exitCode = 1;
    return;
  }

  const workspaces = wsList.json;
  const preferredId = workspaceId;
  const chosen =
    (preferredId && workspaces.find((w) => w && (w.id === preferredId || w._id === preferredId))) ||
    workspaces.find((w) => w && w.isCurrent) ||
    workspaces[0];

  const chosenId = chosen && (chosen.id || chosen._id);
  if (!chosenId) {
    console.error('AUTH_SMOKE_FAIL no workspaceId found');
    process.exitCode = 1;
    return;
  }

  // Switch workspace (verifies permission model)
  const wsSwitch = await http('POST', '/workspaces/switch', {
    headers: authHeaders,
    body: { workspaceId: String(chosenId) },
  });
  console.log(`POST /workspaces/switch -> ${wsSwitch.status ?? 'ERR'} (${wsSwitch.ms}ms) ${wsSwitch.preview || wsSwitch.error || ''}`);

  if (!wsSwitch.ok) {
    console.error('AUTH_SMOKE_FAIL workspace switch failed');
    process.exitCode = 1;
    return;
  }

  const tenantHeaders = {
    ...authHeaders,
    'x-workspace-id': String(chosenId),
  };

  // Tenant-protected endpoints (JwtAuthGuard + WorkspaceGuard + RolesGuard)
  const protectedChecks = [
    { method: 'GET', path: '/projects/summary' },
    { method: 'GET', path: '/projects' },
    { method: 'GET', path: '/vcards' },
  ];

  const failures = [];
  for (const c of protectedChecks) {
    const r = await http(c.method, c.path, { headers: tenantHeaders });
    console.log(`${c.method} ${c.path} -> ${r.status ?? 'ERR'} (${r.ms}ms) ${r.preview || r.error || ''}`);
    if (!r.ok) failures.push({ ...c, status: r.status, preview: r.preview });
  }

  if (failures.length) {
    console.error(`AUTH_SMOKE_FAIL ${failures.length} protected checks failed`);
    process.exitCode = 1;
    return;
  }

  console.log('AUTH_SMOKE_OK');
}

main();
