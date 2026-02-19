/*
  Dev launcher.

  Goal:
  - Make `npm run start:dev` work even when Docker isn't running and MongoDB isn't installed.
  - Prefer an external MongoDB if reachable.
  - Otherwise, fall back to an ephemeral in-memory MongoDB (mongodb-memory-server).

  Controls:
  - Set DEV_REQUIRE_EXTERNAL_MONGO=1 to force an external Mongo and fail if unreachable.
  - Set DATABASE_URI/DATABASE_URL to override default MongoDB URI.
*/

const net = require('net');
const { spawn } = require('child_process');

function parsePort(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n < 65536 ? n : fallback;
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    // Bind to both IPv4+IPv6 stacks if possible (default host).
    server.listen({ port });
  });
}

async function pickDevPort() {
  const desired = parsePort(process.env.PORT, 4000);

  // If the desired port is free, keep it.
  if (await isPortAvailable(desired)) return desired;

  // Otherwise, probe a small range to avoid hard failure.
  for (let port = desired + 1; port <= desired + 20; port += 1) {
    if (await isPortAvailable(port)) {
      console.warn(
        `\n[start-dev] Port ${desired} is already in use; using ${port} instead.`,
      );
      console.warn(
        `[start-dev] If you want to keep ${desired}, stop the process currently using it.\n`,
      );
      return port;
    }
  }

  console.error(
    `\n[start-dev] Port ${desired} is in use and no free port was found in range ${desired + 1}-${desired + 20}.`,
  );
  console.error('[start-dev] Stop the process using the port, or set PORT to a free value.');
  process.exit(1);
}

function getMongoUri() {
  return (
    process.env.DATABASE_URI ||
    process.env.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/smetasc-saas'
  );
}

function parseFirstHostPort(mongoUri) {
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

async function startInMemoryMongo() {
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = require('mongodb-memory-server'));
  } catch (err) {
    console.error('\n[start-dev] MongoDB is not reachable and mongodb-memory-server is not installed.');
    console.error('[start-dev] Install it in backend/:');
    console.error('  npm i -D mongodb-memory-server');
    console.error('\n[start-dev] Or start MongoDB via Docker Desktop from repo root:');
    console.error('  docker compose up -d mongodb');
    console.error('');
    throw err;
  }

  const server = await MongoMemoryServer.create({
    instance: {
      dbName: 'smetasc-saas',
    },
  });

  const uri = server.getUri('smetasc-saas');
  return { server, uri };
}

async function main() {
  const requireExternal = String(process.env.DEV_REQUIRE_EXTERNAL_MONGO || '') === '1';

  // Avoid crashing on EADDRINUSE in dev by selecting a free port.
  // NOTE: this only affects the dev launcher (start:dev).
  const devPort = await pickDevPort();
  process.env.PORT = String(devPort);

  const mongoUri = getMongoUri();
  const target = parseFirstHostPort(mongoUri);
  const reachable = await canConnectTcp({ host: target.host, port: target.port, timeoutMs: 800 });

  /** @type {{ stop: () => Promise<void> } | null} */
  let inMemoryHandle = null;

  if (reachable) {
    console.log(`[start-dev] Using external MongoDB at ${target.host}:${target.port}`);
    process.env.DATABASE_URI = mongoUri;
  } else if (requireExternal) {
    console.error('\n[start-dev] MongoDB is not reachable (external Mongo is required).');
    console.error(`[start-dev] Tried: ${target.host}:${target.port}`);
    console.error(`[start-dev] From env: DATABASE_URI/DATABASE_URL = ${mongoUri}`);
    console.error('\nFix options:');
    console.error('  1) Start MongoDB locally (mongod) on port 27017');
    console.error('  2) Or start via Docker Desktop, then run from repo root:');
    console.error('       docker compose up -d mongodb');
    console.error('  3) Or set DATABASE_URI to your Mongo connection string');
    console.error('');
    process.exit(1);
  } else {
    console.warn('\n[start-dev] MongoDB is not reachable; starting an in-memory MongoDB for dev.');
    console.warn(`[start-dev] Tried: ${target.host}:${target.port}`);

    const { server, uri } = await startInMemoryMongo();
    inMemoryHandle = {
      stop: async () => {
        try {
          await server.stop();
        } catch {}
      },
    };

    process.env.DATABASE_URI = uri;
    console.log(`[start-dev] In-memory MongoDB started: ${uri}`);
  }

  const nestArgs = ['node_modules/@nestjs/cli/bin/nest.js', 'start', '--watch', '--preserveWatchOutput'];
  const child = spawn(process.execPath, nestArgs, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });

  const shutdown = async (code) => {
    try {
      child.kill('SIGINT');
    } catch {}

    if (inMemoryHandle) {
      await inMemoryHandle.stop();
    }

    process.exit(code);
  };

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));

  child.on('exit', async (code) => {
    if (inMemoryHandle) {
      await inMemoryHandle.stop();
    }
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error('[start-dev] Failed to start dev server:', err);
  process.exit(1);
});
