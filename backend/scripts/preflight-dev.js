/*
  Dev preflight checks.
  Goal: fail fast with a clear message if required services (MongoDB) are not reachable.
*/

const net = require('net');

function getMongoUri() {
  return (
    process.env.DATABASE_URI ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/smetasc-saas'
  );
}

function parseFirstHostPort(mongoUri) {
  // Handles typical single-host URIs:
  // mongodb://host:port/db?x=y
  // mongodb://user:pass@host:port/db
  // If multiple hosts are present (replicaset), we take the first.
  const stripped = mongoUri.replace(/^mongodb(\+srv)?:\/\//i, '');
  const beforeSlash = stripped.split('/')[0] || '';
  const beforeQuery = beforeSlash.split('?')[0] || '';
  const firstHost = beforeQuery.split(',')[0] || '';
  const withoutAuth = firstHost.includes('@') ? firstHost.split('@').pop() : firstHost;

  const [hostRaw, portRaw] = (withoutAuth || '').split(':');
  const host = hostRaw || '127.0.0.1';
  const port = Number(portRaw || 27017);

  return { host, port };
}

function canConnectTcp({ host, port, timeoutMs }) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (ok) => {
      if (done) return;
      done = true;
      try {
        socket.destroy();
      } catch {}
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));

    socket.connect(port, host);
  });
}

async function main() {
  const mongoUri = getMongoUri();
  const target = parseFirstHostPort(mongoUri);

  const ok = await canConnectTcp({ host: target.host, port: target.port, timeoutMs: 1500 });
  if (!ok) {
    console.error('\n[preflight] MongoDB is not reachable.');
    console.error(`[preflight] Tried: ${target.host}:${target.port}`);
    console.error(`[preflight] From env: DATABASE_URI/DATABASE_URL = ${mongoUri}`);
    console.error('\nFix options:');
    console.error('  1) Start MongoDB locally (mongod) on port 27017');
    console.error('  2) Or start via Docker Desktop, then run from repo root:');
    console.error('       docker compose up -d mongodb');
    console.error('  3) Or set DATABASE_URI to your Mongo connection string');
    console.error('');
    process.exit(1);
  }

  // Redis is optional: backend already falls back to no-op client.
}

main().catch((err) => {
  console.error('[preflight] Unexpected error:', err);
  process.exit(1);
});
