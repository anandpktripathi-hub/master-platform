/*
  Root dev launcher.

  Goal:
  - Run the *root* Nest app in dev mode (src/main.ts)
  - Avoid emitting build output to dist/ (prevents ENOSPC issues)
  - Pick a free PORT automatically if the desired one is in use

  Controls:
  - PORT: desired port (default 3000)
*/

const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const rootEntryFile = path.join(repoRoot, 'src', 'main.ts');

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

    server.listen({ port });
  });
}

async function pickDevPort() {
  const desired = parsePort(process.env.PORT, 3000);

  if (await isPortAvailable(desired)) return desired;

  for (let port = desired + 1; port <= desired + 20; port += 1) {
    if (await isPortAvailable(port)) {
      console.warn(`\n[root-dev] Port ${desired} is already in use; using ${port} instead.\n`);
      return port;
    }
  }

  console.error(
    `\n[root-dev] Port ${desired} is in use and no free port was found in range ${desired + 1}-${desired + 20}.`,
  );
  console.error('[root-dev] Stop the process using the port, or set PORT to a free value.');
  process.exit(1);
}

async function main() {
  const devPort = await pickDevPort();
  process.env.PORT = String(devPort);
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';

  console.log(`[root-dev] Starting root app on port ${devPort}`);
  console.log(`[root-dev] cwd: ${repoRoot}`);
  console.log(`[root-dev] entry: ${rootEntryFile}`);

  // Run TypeScript directly (no dist emit) using ts-node.
  // Use Node's built-in watch mode to restart on changes.
  const args = [
    '--watch',
    '-r',
    'ts-node/register',
    '-r',
    'tsconfig-paths/register',
    rootEntryFile,
  ];

  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    env: process.env,
    cwd: repoRoot,
    shell: false,
  });

  const shutdown = (code) => {
    try {
      child.kill('SIGINT');
    } catch {}
    process.exit(code);
  };

  process.on('SIGINT', () => shutdown(0));
  process.on('SIGTERM', () => shutdown(0));

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error('[root-dev] Failed to start root dev server:', err);
  process.exit(1);
});
