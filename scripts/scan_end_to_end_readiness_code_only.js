/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = process.cwd();

const BACKEND_SRC = path.join(root, 'backend', 'src');
const FRONTEND_SRC = path.join(root, 'frontend', 'src');

const backendModuleScanPath = path.join(root, 'reports', 'backend_module_readiness_code_scan.json');
const frontendRouterPath = path.join(FRONTEND_SRC, 'router.tsx');

const outJsonPath = path.join(root, 'reports', 'launch_publish_earn_scan_code_only.json');
const outMdPath = path.join(root, 'reports', 'LAUNCH_PUBLISH_EARN_STATUS_CODE_ONLY.md');
const outMostIncompleteMdPath = path.join(root, 'reports', 'END_TO_END_MOST_INCOMPLETE_FIRST_CODE_ONLY.md');

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function walkFiles(dir, predicate) {
  const results = [];
  const stack = [dir];

  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === 'dist' || e.name === '.git') continue;
        stack.push(full);
      } else if (e.isFile()) {
        if (!predicate || predicate(full)) results.push(full);
      }
    }
  }

  return results;
}

function normalizePath(...segments) {
  const joined = segments
    .filter((s) => s !== undefined && s !== null)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join('/');

  const cleaned = joined
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/^\//, '')
    .replace(/\/$/, '');

  return '/' + cleaned;
}

function resolveImportToFile(importPath) {
  const base = path.join(FRONTEND_SRC, importPath);
  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return path.relative(root, c).replace(/\\/g, '/');
    }
  }
  return null;
}

function parseFrontendImports(routerTxt) {
  const map = new Map();

  // import X from './pages/X'
  for (const m of routerTxt.matchAll(/import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"];?/g)) {
    const name = m[1];
    const imp = m[2];
    if (!imp.startsWith('.')) continue;
    const resolved = resolveImportToFile(imp);
    if (resolved) map.set(name, resolved);
  }

  // import { A, B as C } from './pages/X'
  for (const m of routerTxt.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g)) {
    const raw = m[1];
    const imp = m[2];
    if (!imp.startsWith('.')) continue;
    const resolved = resolveImportToFile(imp);
    if (!resolved) continue;
    const names = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const as = s.split(/\s+as\s+/i).map((x) => x.trim());
        return as[1] || as[0];
      });
    for (const n of names) map.set(n, resolved);
  }

  // const X = lazy(() => import('./pages/X'))
  for (const m of routerTxt.matchAll(
    /const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)\s*\)\s*\)\s*;?/g,
  )) {
    const name = m[1];
    const imp = m[2];
    if (!imp.startsWith('.')) continue;
    const resolved = resolveImportToFile(imp);
    if (resolved) map.set(name, resolved);
  }

  return map;
}

function splitTopLevelArrayItems(arrayText) {
  const items = [];
  let current = '';
  let depthCurly = 0;
  let depthSquare = 0;
  let inString = null;
  let escape = false;

  for (let i = 0; i < arrayText.length; i += 1) {
    const ch = arrayText[i];

    if (inString) {
      current += ch;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      current += ch;
      continue;
    }

    if (ch === '{') depthCurly += 1;
    if (ch === '}') depthCurly -= 1;
    if (ch === '[') depthSquare += 1;
    if (ch === ']') depthSquare -= 1;

    if (ch === ',' && depthCurly === 0 && depthSquare === 0) {
      const trimmed = current.trim();
      if (trimmed) items.push(trimmed);
      current = '';
      continue;
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed) items.push(trimmed);
  return items;
}

function extractFirstBracketedArrayAfter(text, marker) {
  const idx = text.indexOf(marker);
  if (idx < 0) return null;

  const start = text.indexOf('[', idx);
  if (start < 0) return null;

  let depth = 0;
  let inString = null;
  let escape = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  return null;
}

function pickComponentNameFromElement(elementText) {
  const ignore = new Set(['ProtectedRoute', 'RequireRole', 'Suspense', 'Navigate', 'React', 'Fragment', 'div']);
  const names = [];
  for (const m of (elementText || '').matchAll(/<\s*([A-Z][A-Za-z0-9_]*)\b/g)) {
    const n = m[1];
    if (!ignore.has(n)) names.push(n);
  }
  return names.length ? names[names.length - 1] : null;
}

function parseRouteObjectsRecursive(arrayLiteralText, parentPath) {
  const itemsText = arrayLiteralText.trim().replace(/^\[/, '').replace(/\]$/, '');
  const items = splitTopLevelArrayItems(itemsText);
  const out = [];

  for (const item of items) {
    if (!item.startsWith('{')) continue;

    const pathMatch = item.match(/\bpath\s*:\s*['"]([^'"]+)['"]/);
    const rawPath = pathMatch ? pathMatch[1] : '';
    const fullPath = rawPath
      ? rawPath.startsWith('/')
        ? rawPath
        : normalizePath(parentPath, rawPath)
      : parentPath;

    const elementMatch = item.match(/\belement\s*:\s*([^,\n}]+|<[^]*?>)/s);
    const elementText = elementMatch ? elementMatch[1] : '';
    const componentName = pickComponentNameFromElement(elementText);

    out.push({
      uiRoute: fullPath,
      componentName,
    });

    const childrenArray = extractFirstBracketedArrayAfter(item, 'children');
    if (childrenArray) {
      out.push(...parseRouteObjectsRecursive(childrenArray, fullPath));
    }
  }

  return out;
}

function extractApiCallsFromComponent(componentFileRel) {
  const fileAbs = path.join(root, componentFileRel);
  const txt = safeReadFile(fileAbs);
  if (!txt) return [];

  const calls = [];
  for (const m of txt.matchAll(/\bapi\.(get|post|put|patch|delete)\s*\(\s*([`'\"])\s*(\/[^`'\"\)]+)\s*\2/gi)) {
    const method = m[1].toUpperCase();
    let p = m[3];
    // Normalize template interpolations if present (we won't try to fully resolve them)
    p = p.replace(/\$\{[^}]+\}/g, ':param');
    calls.push({ method, path: p });
  }
  return calls;
}

function compileBackendRouteRegex(routePath) {
  const escaped = routePath
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\:([A-Za-z0-9_]+)/g, '[^/]+');
  return new RegExp(`^${escaped}(?:\\?.*)?$`);
}

function buildBackendRouteMatchers(endpoints) {
  return endpoints.map((r) => ({
    method: r.method,
    path: r.path,
    re: compileBackendRouteRegex(r.path),
  }));
}

function mapApiCallsToBackend(apiCalls, backendMatchers) {
  const mapped = [];
  for (const c of apiCalls) {
    const hit = backendMatchers.some((m) => m.method === c.method && m.re.test(c.path));
    mapped.push({ ...c, mapped: hit });
  }
  return mapped;
}

function buildFrontendRouteRows(routerTxt, importMap, backendMatchers) {
  const routerArray = extractFirstBracketedArrayAfter(routerTxt, 'createBrowserRouter');
  if (!routerArray) return [];

  const routes = parseRouteObjectsRecursive(routerArray, '');
  const rows = [];

  for (const r of routes) {
    if (!r.uiRoute) continue;
    const componentFile = r.componentName ? importMap.get(r.componentName) : null;
    const apiCalls = componentFile ? extractApiCallsFromComponent(componentFile) : [];
    const mappedCalls = mapApiCallsToBackend(apiCalls, backendMatchers);

    const apiCallsStr = mappedCalls.map((c) => `${c.method} ${c.path}`);
    const mappedCount = mappedCalls.filter((c) => c.mapped).length;
    const notes = mappedCalls.length
      ? mappedCount === mappedCalls.length
        ? 'All detected api.* calls map to backend controllers.'
        : `${mappedCount}/${mappedCalls.length} api.* calls map to backend controllers.`
      : 'No direct api.* calls detected in component file.';

    rows.push({
      status: 'In',
      uiRoute: r.uiRoute,
      component: r.componentName || '',
      componentFile: componentFile || '',
      apiCalls: apiCallsStr,
      notes,
    });
  }

  // De-dup by uiRoute
  const uniq = new Map();
  for (const row of rows) {
    if (!uniq.has(row.uiRoute)) uniq.set(row.uiRoute, row);
  }
  return Array.from(uniq.values());
}

function moduleFromControllerPath(controllerPath, knownModuleNames) {
  const rel = path.relative(BACKEND_SRC, controllerPath).replace(/\\/g, '/');
  const inModules = rel.match(/^modules\/([^\/]+)\//);
  if (inModules) return inModules[1];

  const top = rel.split('/').filter(Boolean)[0];
  if (top && knownModuleNames && knownModuleNames.has(top)) return top;

  return '(non-module)';
}

function extractControllerBasePath(txt) {
  // @Controller('x') OR @Controller({ path: 'x' }) OR @Controller()
  const simple = txt.match(/@Controller\(\s*['"`]{1}([^'"`]+)['"`]{1}\s*\)/);
  if (simple) return simple[1];

  const obj = txt.match(/@Controller\(\s*\{[^}]*\bpath\s*:\s*['"`]{1}([^'"`]+)['"`]{1}[^}]*\}\s*\)/s);
  if (obj) return obj[1];

  return '';
}

function extractInjectedServiceProps(txt) {
  // constructor(private readonly foo: FooService, ...)
  const props = new Set();
  const ctor = txt.match(/constructor\s*\(([^)]*)\)/s);
  if (!ctor) return props;

  const params = ctor[1];
  for (const m of params.matchAll(/\b(private|public|protected)\s+readonly\s+([A-Za-z0-9_]+)\s*:\s*([A-Za-z0-9_]+Service)\b/g)) {
    props.add(m[2]);
  }

  return props;
}

function extractRoutesFromController(txt, controllerFilePath, knownModuleNames) {
  const base = extractControllerBasePath(txt);
  const moduleName = moduleFromControllerPath(controllerFilePath, knownModuleNames);

  const fileHasGuards = /@UseGuards\(|@Roles\(|@Permissions\(|@RequirePermissions\(/.test(txt);
  const fileHasSwagger = /@ApiTags\(|@ApiOperation\(|@ApiResponse\(|@ApiBearerAuth\(|@ApiParam\(|@ApiQuery\(/.test(txt);

  const injectedServiceProps = extractInjectedServiceProps(txt);

  const methodDecoratorRe = /@(Get|Post|Put|Patch|Delete)\(\s*(?:['"`]{1}([^'"`]+)['"`]{1})?\s*\)/g;
  const matches = [];
  for (const m of txt.matchAll(methodDecoratorRe)) {
    matches.push({
      httpMethod: m[1].toUpperCase(),
      subPath: (m[2] || '').trim(),
      index: m.index || 0,
    });
  }

  const routes = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const slice = txt.slice(current.index, next ? next.index : txt.length);

    const hasDto = /\b[A-Za-z0-9_]+Dto\b/.test(slice) || /from\s+['"`][^'"`]*\/dto\b/.test(txt);
    const hasTryCatch = /\btry\s*\{/.test(slice);

    let hasServiceCall = false;
    for (const prop of injectedServiceProps) {
      if (new RegExp(`\\bthis\\.${prop}\\.`, 'm').test(slice)) {
        hasServiceCall = true;
        break;
      }
    }
    if (!hasServiceCall) {
      hasServiceCall = /\bthis\.[A-Za-z0-9_]*Service\./.test(slice);
    }

    const hasGuards = fileHasGuards || /@UseGuards\(|@Roles\(|@Permissions\(|@RequirePermissions\(/.test(slice);
    const hasSwagger = fileHasSwagger || /@ApiTags\(|@ApiOperation\(|@ApiResponse\(|@ApiBearerAuth\(|@ApiParam\(|@ApiQuery\(/.test(slice);

    const evidence = {
      'service-call': hasServiceCall,
      dto: hasDto,
      'guards/roles': hasGuards,
      swagger: hasSwagger,
      'try/catch': hasTryCatch,
    };

    // Score model: 30% baseline for having the route, plus 70% split across evidence flags.
    const baseline = 30;
    const totalEvidence = Object.keys(evidence).length;
    const presentEvidence = Object.values(evidence).filter(Boolean).length;
    const score = Math.min(100, baseline + Math.round((presentEvidence / totalEvidence) * (100 - baseline)));

    routes.push({
      module: moduleName,
      method: current.httpMethod,
      path: normalizePath(base, current.subPath),
      routePct: score,
      evidence,
      missingEvidence: Object.entries(evidence)
        .filter(([, v]) => !v)
        .map(([k]) => k),
      controllerFile: path.relative(root, controllerFilePath).replace(/\\/g, '/'),
    });
  }

  return routes;
}

function scanBackendEndpoints(knownModuleNames) {
  const controllerFiles = walkFiles(BACKEND_SRC, (p) => p.endsWith('.controller.ts'));

  const routes = [];
  for (const fp of controllerFiles) {
    const txt = safeReadFile(fp);
    if (!txt) continue;
    routes.push(...extractRoutesFromController(txt, fp, knownModuleNames));
  }

  // De-duplicate (some controllers might yield same path + method)
  const uniq = new Map();
  for (const r of routes) {
    const key = `${r.method} ${r.path} @ ${r.controllerFile}`;
    if (!uniq.has(key)) uniq.set(key, r);
  }

  const finalRoutes = Array.from(uniq.values());

  const moduleAgg = {};
  const controllerAgg = {};
  for (const r of finalRoutes) {
    moduleAgg[r.module] = moduleAgg[r.module] || { module: r.module, routes: [], avgRoutePct: 0 };
    moduleAgg[r.module].routes.push(r);

    const controllerKey = r.controllerFile;
    controllerAgg[controllerKey] =
      controllerAgg[controllerKey] || { module: r.module, controllerFile: controllerKey, routes: [], avgRoutePct: 0 };
    controllerAgg[controllerKey].routes.push(r);
  }

  const moduleAggList = Object.values(moduleAgg).map((m) => {
    const avg = m.routes.length
      ? Math.round(m.routes.reduce((s, r) => s + (r.routePct || 0), 0) / m.routes.length)
      : 0;
    return { module: m.module, routeCount: m.routes.length, avgRoutePct: avg };
  });

  const controllerAggList = Object.values(controllerAgg)
    .map((c) => {
      const avg = c.routes.length
        ? Math.round(c.routes.reduce((s, r) => s + (r.routePct || 0), 0) / c.routes.length)
        : 0;
      return { module: c.module, controllerFile: c.controllerFile, routeCount: c.routes.length, avgRoutePct: avg };
    })
    .sort((a, b) => (a.avgRoutePct - b.avgRoutePct) || a.controllerFile.localeCompare(b.controllerFile));

  return { routes: finalRoutes, modules: moduleAggList, controllers: controllerAggList };
}

function scanFrontendPages(routeRows) {
  const allPageCandidates = new Set();
  for (const fp of walkFiles(path.join(FRONTEND_SRC, 'pages'), (p) => p.endsWith('.tsx'))) {
    allPageCandidates.add(path.relative(root, fp).replace(/\\/g, '/'));
  }
  for (const fp of walkFiles(path.join(FRONTEND_SRC, 'billing'), (p) => p.endsWith('.tsx'))) {
    allPageCandidates.add(path.relative(root, fp).replace(/\\/g, '/'));
  }
  for (const r of routeRows) {
    if (r.componentFile) allPageCandidates.add(r.componentFile);
  }

  const allPages = Array.from(allPageCandidates).map((rel) => path.join(root, rel));

  const byComponentFile = new Map();
  for (const r of routeRows) {
    if (!r.componentFile) continue;
    const normalized = r.componentFile.replace(/\\/g, '/');
    const existing = byComponentFile.get(normalized);

    const visible = r.status === 'In';
    const workable = (r.apiCalls || []).length > 0 && /map to backend controllers/i.test(r.notes || '');

    // Visibility is required; API mapping increases confidence of workability.
    const pagePct = (visible ? 50 : 0) + (workable ? 50 : 0);

    const record = {
      componentFile: normalized,
      visible,
      workable,
      pagePct,
      routes: [{ uiRoute: r.uiRoute, apiCalls: r.apiCalls, notes: r.notes }],
    };

    if (!existing || record.pagePct > existing.pagePct) {
      byComponentFile.set(normalized, record);
    } else if (existing) {
      existing.routes.push({ uiRoute: r.uiRoute, apiCalls: r.apiCalls, notes: r.notes });
    }
  }

  const pageRows = [];
  for (const fp of allPages) {
    const rel = path.relative(root, fp).replace(/\\/g, '/');
    const key = rel;

    const fromMap = byComponentFile.get(key);
    if (fromMap) {
      pageRows.push({
        page: path.basename(fp),
        file: key,
        pagePct: fromMap.pagePct,
        visible: fromMap.visible,
        workable: fromMap.workable,
        uiRoutes: fromMap.routes.map((x) => x.uiRoute).filter(Boolean),
      });
    } else {
      pageRows.push({
        page: path.basename(fp),
        file: key,
        pagePct: 0,
        visible: false,
        workable: false,
        uiRoutes: [],
      });
    }
  }

  const visibleCount = pageRows.filter((p) => p.visible).length;
  const workableCount = pageRows.filter((p) => p.workable).length;

  const routedSet = new Set(routeRows.map((r) => (r.componentFile || '').replace(/\\/g, '/')).filter(Boolean));
  const routedPages = pageRows.filter((p) => routedSet.has(p.file));
  const routedVisibleCount = routedPages.filter((p) => p.visible).length;
  const routedWorkableCount = routedPages.filter((p) => p.workable).length;

  return {
    pages: pageRows,
    totals: {
      total: pageRows.length,
      visible: visibleCount,
      workable: workableCount,
      visiblePct: pct(visibleCount, pageRows.length),
      workablePct: pct(workableCount, pageRows.length),
      avgPagePct: pageRows.length ? Math.round(pageRows.reduce((s, p) => s + p.pagePct, 0) / pageRows.length) : 0,
      routedTotal: routedPages.length,
      routedVisible: routedVisibleCount,
      routedWorkable: routedWorkableCount,
      routedVisiblePct: pct(routedVisibleCount, routedPages.length),
      routedWorkablePct: pct(routedWorkableCount, routedPages.length),
      routedAvgPagePct: routedPages.length
        ? Math.round(routedPages.reduce((s, p) => s + p.pagePct, 0) / routedPages.length)
        : 0,
    },
  };
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function buildPackagingChecklist() {
  const items = [
    'docker-compose.yml',
    'docker-compose.prod.yml',
    'Dockerfile',
    'backend/Dockerfile',
    'frontend/Dockerfile',
    'START-BACKEND.bat',
    'START-FRONTEND.bat',
    'START-BOTH.bat',
    '.env.example',
  ];

  const result = items.map((p) => ({ path: p, present: exists(p) }));
  const present = result.filter((r) => r.present).length;

  return {
    items: result,
    present,
    total: result.length,
    pct: pct(present, result.length),
  };
}

function computeEarningReadiness(endpoints) {
  const routeSet = new Set(endpoints.map((r) => `${r.method} ${r.path}`));

  const has = (method, pathPrefix) => {
    for (const key of routeSet) {
      if (!key.startsWith(method)) continue;
      const p = key.slice(method.length + 1);
      if (p.startsWith(pathPrefix)) return true;
    }
    return false;
  };

  const stage = (name, checks) => {
    const total = checks.length;
    const done = checks.filter((c) => c.ok).length;
    return {
      name,
      pct: pct(done, total),
      checks,
    };
  };

  // Minimal code-only checks for a real earning loop.
  const stages = [];

  stages.push(
    stage('Checkout / Payment Initiation', [
      { key: 'stripe-checkout', ok: exists('backend/src/billing/stripe') || /stripe/i.test(safeReadFile(path.join(root, 'backend', 'package.json'))), note: 'Stripe checkout code present' },
      { key: 'paypal-capture-endpoint', ok: has('POST', '/payments/webhook/paypal/capture'), note: 'PayPal capture route exists' },
    ]),
  );

  stages.push(
    stage('Webhooks / Payment Confirmation', [
      { key: 'stripe-webhook', ok: endpoints.some((r) => /webhook/i.test(r.path) && /stripe/i.test(r.controllerFile)), note: 'Stripe webhook-like endpoint present (heuristic)' },
      { key: 'paypal-webhook', ok: endpoints.some((r) => /webhook/i.test(r.path) && /paypal/i.test(r.path)), note: 'PayPal webhook/capture endpoint present' },
    ]),
  );

  stages.push(
    stage('Entitlement / Usage Gates', [
      { key: 'packages-me', ok: has('GET', '/packages/me'), note: 'Tenant package endpoint exists' },
      { key: 'packages-usage', ok: has('GET', '/packages/me/usage'), note: 'Usage/quota endpoint exists' },
      { key: 'rbac', ok: exists('backend/src/modules/rbac'), note: 'RBAC module present' },
      { key: 'feature-registry', ok: exists('backend/src/feature-registry'), note: 'Feature registry present' },
    ]),
  );

  stages.push(
    stage('Invoicing / Receipts', [
      { key: 'invoices-list', ok: has('GET', '/accounting/invoices'), note: 'Invoices list endpoint exists' },
      { key: 'invoice-pdf', ok: endpoints.some((r) => r.method === 'GET' && /\/accounting\/invoices\/.+\/pdf$/.test(r.path)), note: 'Invoice PDF endpoint exists' },
    ]),
  );

  stages.push(
    stage('Admin Controls', [
      { key: 'admin-tenants', ok: endpoints.some((r) => /\/admin\//.test(r.path) && /tenants|tenant/.test(r.path)), note: 'Admin tenant endpoints present (heuristic)' },
      { key: 'admin-payments', ok: endpoints.some((r) => /\/admin\//.test(r.path) && /payments/.test(r.path)), note: 'Admin payment endpoints present (heuristic)' },
      { key: 'admin-analytics', ok: endpoints.some((r) => /\/admin\//.test(r.path) && /analytics/.test(r.path)), note: 'Admin analytics endpoints present (heuristic)' },
    ]),
  );

  const avg = stages.length ? Math.round(stages.reduce((s, st) => s + st.pct, 0) / stages.length) : 0;
  return { stages, pct: avg };
}

function writeMarkdown(scan) {
  const lines = [];

  lines.push('# Launch / Publish / Earn Readiness (Code-Only)');
  lines.push('');
  lines.push(`Generated: ${scan.generatedAt}`);
  lines.push('');
  lines.push('This is code-only and evidence-based; it cannot guarantee production behavior, but it reliably shows what exists, what is wired, and what looks incomplete.');
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push(`- Backend modules (structural): ${scan.backendModules.total} total | ${scan.backendModules.complete} @ 100% | avg ${scan.backendModules.avgPct}%`);
  lines.push(`- Backend endpoints (quality evidence): ${scan.backendEndpoints.total} routes | avg ${scan.backendEndpoints.avgRoutePct}% | min ${scan.backendEndpoints.minRoutePct}%`);
  lines.push(
    `- Frontend route-exposed pages: ${scan.frontendPages.totals.routedTotal} | visible ${scan.frontendPages.totals.routedVisiblePct}% | workable (mapped API) ${scan.frontendPages.totals.routedWorkablePct}% | avg ${scan.frontendPages.totals.routedAvgPagePct}%`,
  );
  lines.push(
    `- Frontend all UI TSX (pages + billing dirs): ${scan.frontendPages.totals.total} | visible ${scan.frontendPages.totals.visiblePct}% | workable (mapped API) ${scan.frontendPages.totals.workablePct}% | avg ${scan.frontendPages.totals.avgPagePct}%`,
  );
  lines.push(`- Packaging/infra presence: ${scan.packaging.pct}% (${scan.packaging.present}/${scan.packaging.total})`);
  lines.push(`- Earning readiness (practical loop heuristic): ${scan.earningReadiness.pct}%`);
  lines.push('');

  lines.push('## Earning Readiness Stages');
  lines.push('');
  for (const st of scan.earningReadiness.stages) {
    lines.push(`### ${st.name} — ${st.pct}%`);
    lines.push('');
    for (const c of st.checks) {
      lines.push(`- ${c.ok ? 'done' : 'missing'}: ${c.key}${c.note ? ` — ${c.note}` : ''}`);
    }
    lines.push('');
  }

  lines.push('## Backend Modules (Structural + Endpoints Quality)');
  lines.push('');
  lines.push('| Module | Structural % | Avg Route % | Overall % | Routes | Missing (structural) |');
  lines.push('|---|---:|---:|---:|---:|---|');
  for (const m of scan.backendModules.byModule) {
    lines.push(`| ${m.name} | ${m.structuralPct}% | ${m.avgRoutePct}% | ${m.overallPct}% | ${m.routeCount} | ${m.missing.length ? m.missing.join(', ') : '—'} |`);
  }
  lines.push('');

  lines.push('## Backend Endpoints (Most Incomplete First)');
  lines.push('');
  lines.push('| Route % | Module | Method | Path | Missing Evidence | Controller File |');
  lines.push('|---:|---|---|---|---|---|');
  for (const r of scan.backendEndpoints.routesSorted) {
    lines.push(`| ${r.routePct}% | ${r.module} | ${r.method} | ${r.path} | ${r.missingEvidence.join(', ') || '—'} | ${r.controllerFile} |`);
  }
  lines.push('');

  lines.push('## Backend Controllers (Most Incomplete First)');
  lines.push('');
  lines.push('| Avg Route % | Module | Routes | Controller File |');
  lines.push('|---:|---|---:|---|');
  for (const c of scan.backendEndpoints.controllersSorted || []) {
    lines.push(`| ${c.avgRoutePct}% | ${c.module} | ${c.routeCount} | ${c.controllerFile} |`);
  }
  lines.push('');

  lines.push('## Frontend Pages (Most Incomplete First)');
  lines.push('');
  lines.push('| Page % | Visible | Workable (Mapped API) | Page | File | UI Routes |');
  lines.push('|---:|---|---|---|---|---|');
  for (const p of scan.frontendPages.pagesSorted) {
    const routes = (p.uiRoutes || []).slice(0, 4).join(' | ');
    lines.push(`| ${p.pagePct}% | ${p.visible ? 'Yes' : 'No'} | ${p.workable ? 'Yes' : 'No'} | ${p.page} | ${p.file} | ${routes || '—'} |`);
  }
  lines.push('');

  lines.push('## Packaging / Infra (presence)');
  lines.push('');
  for (const item of scan.packaging.items) {
    lines.push(`- ${item.present ? 'yes' : 'no'}: ${item.path}`);
  }
  lines.push('');

  fs.writeFileSync(outMdPath, lines.join('\n'));
}

function writeMostIncompleteMarkdown(scan) {
  const lines = [];

  lines.push('# Most Incomplete First (Code-Only)');
  lines.push('');
  lines.push(`Generated: ${scan.generatedAt}`);
  lines.push('');

  lines.push('## Backend Modules (Overall %)');
  lines.push('');
  lines.push('| Module | Overall % | Structural % | Avg Route % | Routes | Missing (structural) |');
  lines.push('|---|---:|---:|---:|---:|---|');
  for (const m of scan.backendModules.byModuleSortedMostIncomplete) {
    lines.push(`| ${m.name} | ${m.overallPct}% | ${m.structuralPct}% | ${m.avgRoutePct}% | ${m.routeCount} | ${m.missing.length ? m.missing.join(', ') : '—'} |`);
  }
  lines.push('');

  lines.push('## Backend Endpoints (Route %)');
  lines.push('');

  lines.push('## Backend Controllers (Avg Route %)');
  lines.push('');
  lines.push('| Avg Route % | Module | Routes | Controller File |');
  lines.push('|---:|---|---:|---|');
  for (const c of scan.backendEndpoints.controllersSorted || []) {
    lines.push(`| ${c.avgRoutePct}% | ${c.module} | ${c.routeCount} | ${c.controllerFile} |`);
  }
  lines.push('');
  lines.push('| Route % | Module | Method | Path | Missing Evidence | Controller File |');
  lines.push('|---:|---|---|---|---|---|');
  for (const r of scan.backendEndpoints.routesSorted) {
    lines.push(`| ${r.routePct}% | ${r.module} | ${r.method} | ${r.path} | ${r.missingEvidence.join(', ') || '—'} | ${r.controllerFile} |`);
  }
  lines.push('');

  lines.push('## Frontend Pages (Page %)');
  lines.push('');
  lines.push('| Page % | Visible | Workable | Page | File |');
  lines.push('|---:|---|---|---|---|');
  for (const p of scan.frontendPages.pagesSorted) {
    lines.push(`| ${p.pagePct}% | ${p.visible ? 'Yes' : 'No'} | ${p.workable ? 'Yes' : 'No'} | ${p.page} | ${p.file} |`);
  }
  lines.push('');

  fs.writeFileSync(outMostIncompleteMdPath, lines.join('\n'));
}

function main() {
  const moduleScan = safeReadJson(backendModuleScanPath);
  if (!moduleScan) {
    console.error(`Missing ${backendModuleScanPath}. Run: node scripts/scan_backend_module_readiness.js`);
    process.exit(1);
  }

  const knownModuleNames = new Set((moduleScan.results || []).map((r) => r.name));
  const backendEndpoints = scanBackendEndpoints(knownModuleNames);

  const backendMatchers = buildBackendRouteMatchers(backendEndpoints.routes);
  const routerTxt = safeReadFile(frontendRouterPath);
  const importMap = parseFrontendImports(routerTxt);
  const routeRows = buildFrontendRouteRows(routerTxt, importMap, backendMatchers);
  const frontendPages = scanFrontendPages(routeRows);
  const packaging = buildPackagingChecklist();

  const modules = (moduleScan.results || []).map((r) => {
    const moduleEndpointsAgg = backendEndpoints.modules.find((m) => m.module === r.name);
    const avgRoutePct = moduleEndpointsAgg ? moduleEndpointsAgg.avgRoutePct : 0;

    // Overall weights: endpoints quality matters more for "real world".
    const overallPct = Math.round((r.pct * 0.4) + (avgRoutePct * 0.6));

    return {
      name: r.name,
      structuralPct: r.pct || 0,
      avgRoutePct,
      overallPct,
      routeCount: moduleEndpointsAgg ? moduleEndpointsAgg.routeCount : 0,
      missing: r.missing || [],
    };
  });

  const backendModulesSummary = {
    total: moduleScan.count || modules.length,
    complete: modules.filter((m) => m.structuralPct === 100).length,
    avgPct: modules.length ? Math.round(modules.reduce((s, m) => s + m.structuralPct, 0) / modules.length) : 0,
    byModule: modules.slice().sort((a, b) => a.name.localeCompare(b.name)),
  };

  const routesSorted = backendEndpoints.routes.slice().sort((a, b) => (a.routePct - b.routePct) || a.path.localeCompare(b.path));
  const avgRoutePct = routesSorted.length ? Math.round(routesSorted.reduce((s, r) => s + r.routePct, 0) / routesSorted.length) : 0;
  const minRoutePct = routesSorted.length ? Math.min(...routesSorted.map((r) => r.routePct)) : 0;

  const backendEndpointsSummary = {
    total: backendEndpoints.routes.length,
    avgRoutePct,
    minRoutePct,
    routesSorted,
    controllersSorted: backendEndpoints.controllers,
  };

  const pagesSorted = frontendPages.pages.slice().sort((a, b) => (a.pagePct - b.pagePct) || a.file.localeCompare(b.file));

  const earningReadiness = computeEarningReadiness(backendEndpoints.routes);

  const scan = {
    generatedAt: new Date().toISOString(),
    backendModules: {
      ...backendModulesSummary,
      byModuleSortedMostIncomplete: modules.slice().sort((a, b) => (a.overallPct - b.overallPct) || a.name.localeCompare(b.name)),
    },
    backendEndpoints: backendEndpointsSummary,
    frontendRoutes: {
      totalRoutes: routeRows.length,
      inRoutes: routeRows.filter((r) => r.status === 'In').length,
      inPct: pct(routeRows.filter((r) => r.status === 'In').length, routeRows.length),
      routesWithApiCalls: routeRows.filter((r) => (r.apiCalls || []).length > 0).length,
      routesWithMappedApiCalls: routeRows.filter((r) => /map to backend controllers/i.test(r.notes || '')).length,
    },
    frontendPages: {
      ...frontendPages,
      pagesSorted,
    },
    packaging,
    earningReadiness,
  };

  fs.writeFileSync(outJsonPath, JSON.stringify(scan, null, 2));
  writeMarkdown(scan);
  writeMostIncompleteMarkdown(scan);

  console.log(`Wrote ${path.relative(root, outJsonPath)}`);
  console.log(`Wrote ${path.relative(root, outMdPath)}`);
  console.log(`Wrote ${path.relative(root, outMostIncompleteMdPath)}`);
}

main();
