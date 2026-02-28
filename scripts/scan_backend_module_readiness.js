/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const backendSrc = path.join(root, 'backend', 'src');
const modulesDir = path.join(backendSrc, 'modules');
const migrationsDir = path.join(backendSrc, 'migrations');

const outPath = path.join(root, 'reports', 'backend_module_readiness_code_scan.json');

const weights = {
  module: 10,
  controller: 15,
  service: 15,
  dto: 15,
  schema: 15,
  tests: 20,
  migrations: 10,
};

const IGNORE_ROOT_DIRS = new Set([
  'modules',
  'common',
  'database',
  'decorators',
  'guards',
  'middleware',
  'migrations',
  'utils',
  'config',
  'tenants',
  'feature-registry',
]);

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function dirSignal(dir) {
  const entries = safeReaddir(dir);
  let score = entries.length;

  const importantDirs = new Set(['controllers', 'services', 'dto', 'schemas']);
  for (const e of entries) {
    if (e.isDirectory() && importantDirs.has(e.name)) score += 5;
    if (e.isFile() && e.name.endsWith('.spec.ts')) score += 2;
    if (e.isFile() && e.name.endsWith('.schema.ts')) score += 2;
  }

  return score;
}

function listTsFilesShallow(dir) {
  const files = [];
  for (const d of safeReaddir(dir)) {
    if (d.isFile() && d.name.endsWith('.ts')) files.push(d.name);
  }
  return files;
}

function existsFile(dir, filename) {
  return fs.existsSync(path.join(dir, filename));
}

function readIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function detectSchemaWiring(moduleDir) {
  const candidates = [];

  const shallow = listTsFilesShallow(moduleDir);
  for (const name of shallow) {
    if (name.endsWith('.module.ts') || name.endsWith('.service.ts') || name.endsWith('.controller.ts')) {
      candidates.push(path.join(moduleDir, name));
    }
  }

  // Also check nested common patterns
  const nestedDirs = ['services', 'controllers'];
  for (const nd of nestedDirs) {
    const ndPath = path.join(moduleDir, nd);
    if (!fs.existsSync(ndPath)) continue;
    for (const d of safeReaddir(ndPath)) {
      if (!d.isFile() || !d.name.endsWith('.ts')) continue;
      candidates.push(path.join(ndPath, d.name));
    }
  }

  for (const fp of candidates.slice(0, 8)) {
    const txt = readIfExists(fp);
    if (!txt) continue;
    if (
      txt.includes('MongooseModule.forFeature') ||
      txt.includes('@InjectModel') ||
      txt.includes("from '../../database/schemas") ||
      txt.includes("from '../../../database/schemas") ||
      txt.includes("database/schemas")
    ) {
      return true;
    }
  }

  // Fallback: schema files inside module folder
  const hasLocalSchema = shallow.some((f) => f.endsWith('.schema.ts'));
  if (hasLocalSchema) return true;

  const schemasDir = path.join(moduleDir, 'schemas');
  if (fs.existsSync(schemasDir)) {
    const schemaFiles = safeReaddir(schemasDir).filter(
      (d) => d.isFile() && d.name.endsWith('.schema.ts'),
    );
    if (schemaFiles.length) return true;
  }

  return false;
}

function detectDbUsage(moduleDir) {
  const candidates = [];

  const shallow = listTsFilesShallow(moduleDir);
  for (const name of shallow) {
    if (name.endsWith('.module.ts') || name.endsWith('.service.ts') || name.endsWith('.controller.ts')) {
      candidates.push(path.join(moduleDir, name));
    }
  }

  // Also check nested common patterns
  const nestedDirs = ['services', 'controllers'];
  for (const nd of nestedDirs) {
    const ndPath = path.join(moduleDir, nd);
    if (!fs.existsSync(ndPath)) continue;
    for (const d of safeReaddir(ndPath)) {
      if (!d.isFile() || !d.name.endsWith('.ts')) continue;
      candidates.push(path.join(ndPath, d.name));
    }
  }

  for (const fp of candidates.slice(0, 8)) {
    const txt = readIfExists(fp);
    if (!txt) continue;
    if (txt.includes('MongooseModule.forFeature') || txt.includes('@InjectModel')) {
      return true;
    }
  }

  return false;
}

function extractMongooseModelNames(moduleDir) {
  const names = new Set();

  const shallow = listTsFilesShallow(moduleDir);
  const moduleFile = shallow.find((f) => f.endsWith('.module.ts'));
  if (!moduleFile) return names;

  const txt = readIfExists(path.join(moduleDir, moduleFile));
  if (!txt) return names;

  // Common pattern: { name: SomeEntity.name, schema: SomeSchema }
  for (const m of txt.matchAll(/name\s*:\s*([A-Za-z0-9_]+)\.name/g)) {
    names.add(m[1]);
  }

  // Less common: { name: 'ModelName', schema: ... }
  for (const m of txt.matchAll(/name\s*:\s*'([^']+)'/g)) {
    names.add(m[1]);
  }
  for (const m of txt.matchAll(/name\s*:\s*"([^"]+)"/g)) {
    names.add(m[1]);
  }

  return names;
}

function collectMigrationSignals() {
  const fileNames = new Set();
  const modelNames = new Set();

  for (const d of safeReaddir(migrationsDir)) {
    if (!d.isFile() || !d.name.endsWith('.ts')) continue;
    fileNames.add(d.name.toLowerCase());

    const txt = readIfExists(path.join(migrationsDir, d.name));
    if (!txt) continue;

    // Extract mongoose.model('ModelName', ...) occurrences.
    for (const m of txt.matchAll(/mongoose\.model\(\s*'([^']+)'\s*,/g)) {
      modelNames.add(m[1]);
    }
    for (const m of txt.matchAll(/mongoose\.model\(\s*"([^"]+)"\s*,/g)) {
      modelNames.add(m[1]);
    }
  }

  return { fileNames, modelNames };
}

function detectDto(moduleDir) {
  const dtoDir = path.join(moduleDir, 'dto');
  if (!fs.existsSync(dtoDir)) return false;
  const dtoFiles = safeReaddir(dtoDir).filter((d) => d.isFile() && d.name.endsWith('.dto.ts'));
  return dtoFiles.length > 0;
}

function detectTests(moduleDir) {
  const shallowFiles = listTsFilesShallow(moduleDir);

  let hasControllerSpec =
    fs.existsSync(path.join(moduleDir, 'tenant.controller.spec.ts')) ||
    shallowFiles.some((f) => f.endsWith('.controller.spec.ts'));
  let hasServiceSpec =
    fs.existsSync(path.join(moduleDir, 'tenant.service.spec.ts')) ||
    shallowFiles.some((f) => f.endsWith('.service.spec.ts'));

  // Look one level deep for controller/service specs as well.
  for (const sub of ['services', 'controllers']) {
    const subDir = path.join(moduleDir, sub);
    if (!fs.existsSync(subDir)) continue;
    const specFiles = safeReaddir(subDir)
      .filter((d) => d.isFile() && d.name.endsWith('.spec.ts'))
      .map((d) => d.name);

    if (specFiles.some((f) => f.endsWith('.controller.spec.ts'))) {
      hasControllerSpec = true;
    }
    if (specFiles.some((f) => f.endsWith('.service.spec.ts'))) {
      hasServiceSpec = true;
    }
  }

  if (hasControllerSpec && hasServiceSpec) return 'both';

  const hasAnySpec = shallowFiles.some((f) => f.endsWith('.spec.ts'));
  if (hasControllerSpec || hasServiceSpec || hasAnySpec) return 'some';

  // look one level deep for common patterns
  for (const sub of ['services', 'controllers']) {
    const subDir = path.join(moduleDir, sub);
    if (!fs.existsSync(subDir)) continue;
    const has = safeReaddir(subDir).some((d) => d.isFile() && d.name.endsWith('.spec.ts'));
    if (has) return 'some';
  }

  return false;
}

function computePct(present) {
  let score = 0;
  for (const key of Object.keys(weights)) {
    if (key === 'tests') {
      if (present.tests === 'both') score += weights.tests;
      else if (present.tests === 'some') score += Math.round(weights.tests * 0.5);
      continue;
    }
    if (present[key]) score += weights[key];
  }
  return Math.min(100, Math.max(0, score));
}

function hasMigrationForModule(moduleName, moduleDir, migrationSignals) {
  const { fileNames, modelNames } = migrationSignals;

  // Back-compat: filename-based match.
  const n = String(moduleName).toLowerCase();
  for (const f of fileNames) {
    if (f.includes(n) && f.includes('index')) return true;
    if (f.includes(`add-${n}-`)) return true;
  }

  // Preferred: if any migration references at least one Mongoose model the module wires.
  const moduleModels = extractMongooseModelNames(moduleDir);
  for (const modelName of moduleModels) {
    if (modelNames.has(modelName)) return true;
  }

  return false;
}

function collectModuleDirs() {
  const entries = new Map();

  for (const d of safeReaddir(modulesDir)) {
    if (!d.isDirectory()) continue;
    entries.set(d.name, path.join(modulesDir, d.name));
  }

  // Also consider src/<name> directories that look like modules (contain *.module.ts)
  for (const d of safeReaddir(backendSrc)) {
    if (!d.isDirectory()) continue;
    if (IGNORE_ROOT_DIRS.has(d.name)) continue;

    const dirPath = path.join(backendSrc, d.name);
    const shallow = listTsFilesShallow(dirPath);
    const hasModule = shallow.some((f) => f.endsWith('.module.ts'));
    if (!hasModule) continue;

    // If both src/modules/<name> and src/<name> exist, prefer the directory
    // that looks like the real implementation (more folders/tests/dto/etc).
    if (!entries.has(d.name)) {
      entries.set(d.name, dirPath);
    } else {
      const existing = entries.get(d.name);
      const existingScore = dirSignal(existing);
      const newScore = dirSignal(dirPath);
      if (newScore > existingScore) {
        entries.set(d.name, dirPath);
      }
    }
  }

  return entries;
}

function main() {
  const generatedAt = new Date().toISOString();
  const migrationSignals = collectMigrationSignals();
  const moduleDirs = collectModuleDirs();

  const results = [];

  for (const [name, dir] of moduleDirs.entries()) {
    const shallow = listTsFilesShallow(dir);

    const dbUsage = detectDbUsage(dir);

    const present = {
      module: shallow.some((f) => f.endsWith('.module.ts')),
      controller: shallow.some((f) => f.endsWith('.controller.ts')) || fs.existsSync(path.join(dir, 'controllers')),
      service: shallow.some((f) => f.endsWith('.service.ts')) || fs.existsSync(path.join(dir, 'services')),
      dto: detectDto(dir),
      // Schema is only applicable for DB-backed modules; schema-less modules shouldn't be penalized.
      schema: dbUsage ? detectSchemaWiring(dir) : true,
      tests: detectTests(dir),
      migrations: false,
    };

    // Only require index migrations for modules that actually touch the DB.
    // For schema-less modules (pure orchestration / HTTP transforms), migrations are not applicable.
    const migrationsRequired = Boolean(dbUsage);
    present.migrations = migrationsRequired
      ? hasMigrationForModule(name, dir, migrationSignals)
      : true;

    const pct = computePct(present);

    const missing = [];
    for (const key of ['module', 'controller', 'service', 'dto', 'schema', 'migrations']) {
      if (key === 'migrations' && !migrationsRequired) continue;
      if (!present[key]) missing.push(key);
    }
    if (!present.tests) missing.push('tests');

    const sampleFiles = shallow
      .filter((f) => f.endsWith('.ts'))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 6);

    results.push({
      name,
      pct,
      present,
      missing,
      filesCount: shallow.length,
      sampleFiles,
    });
  }

  results.sort((a, b) => a.pct - b.pct || a.name.localeCompare(b.name));

  const report = {
    generatedAt,
    weights,
    count: results.length,
    results,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
}

main();
