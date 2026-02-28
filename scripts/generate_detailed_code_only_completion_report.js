/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = process.cwd();

const scanPath = path.join(root, 'reports', 'launch_publish_earn_scan_code_only.json');
// Intentionally overwrites the user-facing attached report.
const outPath = path.join(root, 'reports', 'DETAILED_CODE_ONLY_COMPLETION_REPORT.md');

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function pct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function escapeMd(text) {
  return String(text || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function mdTable(headers, rows) {
  const lines = [];
  lines.push(`| ${headers.map(escapeMd).join(' | ')} |`);
  lines.push(`|${headers.map(() => '---').join('|')}|`);
  for (const row of rows) {
    lines.push(`| ${row.map(escapeMd).join(' | ')} |`);
  }
  return lines.join('\n');
}

function summarizeRouteEvidence(routes) {
  const dist = {};
  for (const r of routes) {
    dist[r.routePct] = (dist[r.routePct] || 0) + 1;
  }
  return Object.entries(dist)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([k, v]) => `${k}%: ${v}`);
}

function summarizePagePct(pages) {
  const dist = {};
  for (const p of pages) {
    dist[p.pagePct] = (dist[p.pagePct] || 0) + 1;
  }
  return Object.entries(dist)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([k, v]) => `${k}%: ${v}`);
}

function main() {
  const scan = safeReadJson(scanPath);
  if (!scan) {
    console.error(`Missing or invalid scan JSON: ${scanPath}`);
    process.exit(1);
  }

  const lines = [];
  lines.push('# Detailed Code-Only Completion Report (Publish / Launch / Earn)');
  lines.push('');
  lines.push(`Generated: ${scan.generatedAt}`);
  lines.push('');
  lines.push('This report is produced from code only. It does not read or use any `.md` or docs content.');
  lines.push('');

  // Executive summary
  const routes = scan.backendEndpoints.routesSorted || [];
  const controllers = scan.backendEndpoints.controllersSorted || [];
  const pages = scan.frontendPages.pagesSorted || [];

  const r100 = routes.filter((r) => r.routePct === 100).length;
  const p100 = pages.filter((p) => p.pagePct === 100).length;

  lines.push('## Executive Summary');
  lines.push('');
  lines.push('### What is 100% complete (code-only evidence)');
  lines.push('');
  lines.push(`- Backend modules (structural wiring artifacts): ${scan.backendModules.complete}/${scan.backendModules.total} = ${pct(scan.backendModules.complete, scan.backendModules.total)}%`);
  lines.push('  - Meaning: every backend module shows module/controller/service/dto/schema/tests/migrations signals present.');
  lines.push(`- Packaging/infra presence checks: ${scan.packaging.present}/${scan.packaging.total} = ${scan.packaging.pct}%`);
  lines.push(`- Frontend route-exposed pages “visible”: ${scan.frontendPages.totals.routedVisible}/${scan.frontendPages.totals.routedTotal} = ${scan.frontendPages.totals.routedVisiblePct}%`);
  lines.push('  - Meaning: everything referenced by the router is navigable (exists in the router + import resolved).');
  lines.push('');

  lines.push('### What is NOT 100% (and the % completion)');
  lines.push('');
  lines.push(`- Backend endpoints (feature-level, route-by-route evidence): ${routes.length} routes`);
  lines.push(`  - Avg endpoint evidence score: ${scan.backendEndpoints.avgRoutePct}%`);
  lines.push(`  - Min endpoint score: ${scan.backendEndpoints.minRoutePct}%`);
  lines.push(`  - Perfect (100%) endpoints: ${r100}/${routes.length}`);
  lines.push('  - Typical missing evidence: guards/roles, Swagger decorators, DTO usage/validation, try/catch, consistent service-call wiring.');
  lines.push(`- Frontend route-exposed pages “workable (mapped API)”: ${scan.frontendPages.totals.routedWorkablePct}%`);
  lines.push('  - Interpreted as: page has at least one detected `api.*` call that matches a backend controller route.');
  lines.push(`  - Router-exposed pages: ${scan.frontendPages.totals.routedTotal} total, workable ${scan.frontendPages.totals.routedWorkablePct}%, avg page score ${scan.frontendPages.totals.routedAvgPagePct}%.`);
  lines.push(`- Frontend ALL TSX UI files under pages + billing (includes internal components/modals/cards, not just routable pages):`);
  lines.push(`  - Total: ${scan.frontendPages.totals.total}`);
  lines.push(`  - Visible (actually routed): ${scan.frontendPages.totals.visiblePct}%`);
  lines.push(`  - Workable (mapped API): ${scan.frontendPages.totals.workablePct}%`);
  lines.push(`  - Avg: ${scan.frontendPages.totals.avgPagePct}%`);
  lines.push(`  - Perfect (100%) pages: ${p100}/${pages.length}`);
  lines.push(`- Earning readiness (practical real-world loop heuristic): ${scan.earningReadiness.pct}%`);
  lines.push('');

  // Methodology
  lines.push('## Methodology (How Completion % is Computed)');
  lines.push('');
  lines.push('### Backend Modules (Structural)');
  lines.push('- Taken from `reports/backend_module_readiness_code_scan.json`.');
  lines.push('- 100% means: module + controller + service + DTO + schema wiring + tests + migrations signals exist.');
  lines.push('');

  lines.push('### Backend Endpoints (Route-by-route Evidence)');
  lines.push('- Extracts routes from `backend/src/**/*.controller.ts`.');
  lines.push('- Each endpoint gets a baseline score (route exists) plus evidence signals:');
  lines.push('  - `service-call`: controller method calls a injected service (`this.someService.*`)');
  lines.push('  - `dto`: presence of `*Dto` usage/import patterns');
  lines.push('  - `guards/roles`: presence of auth/role decorators (e.g. `@UseGuards`, `@Roles`, `@Permissions`)');
  lines.push('  - `swagger`: presence of swagger decorators (e.g. `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`)');
  lines.push('  - `try/catch`: presence of try/catch inside the handler slice');
  lines.push('- These are code-only heuristics: they measure “production readiness signals”, not actual runtime correctness.');
  lines.push('');

  lines.push('### Frontend Visibility / Workability (Router + API Mapping)');
  lines.push('- Visibility is derived from `frontend/src/router.tsx` by parsing `createBrowserRouter([...])`.');
  lines.push('- A component is “route-exposed” if it is referenced in router `element:` and its import can be resolved to a TS/TSX file.');
  lines.push('- Workability is credited when the component file contains at least one `api.<method>(\"/path\")` call that maps to a backend endpoint.');
  lines.push('- If API calls are in a different layer (custom client, hook, service wrapper, RTK query, etc.), they may not be detected by this heuristic.');
  lines.push('');

  lines.push('### Mapping to your requested hierarchy');
  lines.push('- Modules → backend modules (structural) + frontend route-exposed pages set');
  lines.push('- Sub-modules → backend controllers (controller-level aggregate)');
  lines.push('- Features → backend endpoints + frontend routes');
  lines.push('- Options/Points → evidence checklist items per endpoint + earning-readiness stage checks');
  lines.push('');

  // Earning readiness stages
  lines.push('## Earning Readiness (Practical Loop Heuristic)');
  lines.push('');
  for (const st of scan.earningReadiness.stages || []) {
    lines.push(`### ${st.name} — ${st.pct}%`);
    lines.push('');
    for (const c of st.checks || []) {
      lines.push(`- ${c.ok ? 'done' : 'missing'}: ${c.key}${c.note ? ` — ${c.note}` : ''}`);
    }
    lines.push('');
  }

  // Packaging
  lines.push('## Packaging / Infra Presence (Code/Repo Files)');
  lines.push('');
  lines.push(`Score: ${scan.packaging.pct}% (${scan.packaging.present}/${scan.packaging.total})`);
  lines.push('');
  lines.push('Checklist:');
  for (const item of scan.packaging.items || []) {
    lines.push(`- ${item.present ? 'yes' : 'no'}: ${item.path}`);
  }
  lines.push('');

  // Backend modules overall table
  lines.push('## Backend Modules — Structural + Endpoint Quality (Overall)');
  lines.push('');
  const modulesMostIncomplete = scan.backendModules.byModuleSortedMostIncomplete || [];
  lines.push(mdTable(
    ['Module', 'Overall %', 'Structural %', 'Avg Route %', 'Routes', 'Missing (structural)'],
    modulesMostIncomplete.map((m) => [
      m.name,
      `${m.overallPct}%`,
      `${m.structuralPct}%`,
      `${m.avgRoutePct}%`,
      String(m.routeCount),
      m.missing && m.missing.length ? m.missing.join(', ') : '—',
    ]),
  ));
  lines.push('');

  // Controllers
  lines.push('## Backend Controllers (Sub-modules) — Most Incomplete First');
  lines.push('');
  lines.push(mdTable(
    ['Avg Route %', 'Module', 'Routes', 'Controller File'],
    controllers.map((c) => [
      `${c.avgRoutePct}%`,
      c.module,
      String(c.routeCount),
      c.controllerFile,
    ]),
  ));
  lines.push('');

  // Routes distribution
  lines.push('## Backend Endpoints (Features) — Completion Distribution');
  lines.push('');
  lines.push(`- Total routes: ${routes.length}`);
  lines.push(`- Avg route evidence: ${scan.backendEndpoints.avgRoutePct}%`);
  lines.push(`- Min route evidence: ${scan.backendEndpoints.minRoutePct}%`);
  lines.push(`- Perfect routes (100%): ${r100}/${routes.length}`);
  lines.push('');
  lines.push('Distribution:');
  for (const d of summarizeRouteEvidence(routes)) lines.push(`- ${d}`);
  lines.push('');

  // Routes table (full)
  lines.push('## Backend Endpoints (Features) — Full Route-by-route Table (Most Incomplete First)');
  lines.push('');
  lines.push(mdTable(
    ['Route %', 'Module', 'Method', 'Path', 'Missing Evidence', 'Controller File'],
    routes.map((r) => [
      `${r.routePct}%`,
      r.module,
      r.method,
      r.path,
      r.missingEvidence && r.missingEvidence.length ? r.missingEvidence.join(', ') : '—',
      r.controllerFile,
    ]),
  ));
  lines.push('');

  // Perfect routes
  lines.push('## Backend Endpoints — 100% Evidence Routes');
  lines.push('');
  const perfectRoutes = routes.filter((r) => r.routePct === 100);
  if (!perfectRoutes.length) {
    lines.push('- none');
  } else {
    for (const r of perfectRoutes) {
      lines.push(`- ${r.method} ${r.path} (${r.module}) — ${r.controllerFile}`);
    }
  }
  lines.push('');

  // Frontend route summary
  lines.push('## Frontend Routes (Features) — Router Surface');
  lines.push('');
  lines.push(`- Total router routes discovered: ${scan.frontendRoutes.totalRoutes}`);
  lines.push(`- In-routes: ${scan.frontendRoutes.inRoutes} (${scan.frontendRoutes.inPct}%)`);
  lines.push(`- Routes with detected api.* calls: ${scan.frontendRoutes.routesWithApiCalls}`);
  lines.push(`- Routes where detected api.* calls map to backend endpoints: ${scan.frontendRoutes.routesWithMappedApiCalls}`);
  lines.push('');

  // Frontend pages distribution
  lines.push('## Frontend Pages / UI Components — Completion Distribution');
  lines.push('');
  lines.push('### Route-exposed pages');
  lines.push(`- Total route-exposed: ${scan.frontendPages.totals.routedTotal}`);
  lines.push(`- Visible: ${scan.frontendPages.totals.routedVisible} (${scan.frontendPages.totals.routedVisiblePct}%)`);
  lines.push(`- Workable (mapped API): ${scan.frontendPages.totals.routedWorkable} (${scan.frontendPages.totals.routedWorkablePct}%)`);
  lines.push(`- Avg: ${scan.frontendPages.totals.routedAvgPagePct}%`);
  lines.push('');

  lines.push('### All TSX under pages + billing');
  lines.push(`- Total: ${scan.frontendPages.totals.total}`);
  lines.push(`- Visible (routed): ${scan.frontendPages.totals.visible} (${scan.frontendPages.totals.visiblePct}%)`);
  lines.push(`- Workable (mapped API): ${scan.frontendPages.totals.workable} (${scan.frontendPages.totals.workablePct}%)`);
  lines.push(`- Avg: ${scan.frontendPages.totals.avgPagePct}%`);
  lines.push(`- Perfect (100%): ${p100}/${pages.length}`);
  lines.push('');

  lines.push('Distribution (all TSX set):');
  for (const d of summarizePagePct(pages)) lines.push(`- ${d}`);
  lines.push('');

  // Frontend pages full table
  lines.push('## Frontend Pages / UI Components — Full Table (Most Incomplete First)');
  lines.push('');
  lines.push(mdTable(
    ['Page %', 'Visible', 'Workable (Mapped API)', 'Page', 'File', 'UI Routes'],
    pages.map((p) => [
      `${p.pagePct}%`,
      p.visible ? 'Yes' : 'No',
      p.workable ? 'Yes' : 'No',
      p.page,
      p.file,
      (p.uiRoutes || []).slice(0, 6).join(' | ') || '—',
    ]),
  ));
  lines.push('');

  // Done vs missing narrative
  lines.push('## Done vs Missing (Practical Launch / Earn)');
  lines.push('');
  lines.push('### Done (strong signals found in code)');
  lines.push('- Backend module structure is complete across all modules (structural scan 100%).');
  lines.push('- Router navigation exists for every route-exposed page (visibility 100%).');
  lines.push('- Core earning-loop signals exist (checkout initiation, entitlements, invoicing/PDF endpoints present).');
  lines.push('');

  lines.push('### Missing / Still Incomplete (highest-impact blockers to 100%)');
  lines.push('- Backend endpoints: many routes do not show full “production-grade” evidence signals (guards/roles, swagger, DTO validation, try/catch).');
  lines.push('- Frontend workability: many routed pages have no directly-detected + mappable `api.*` calls in the component file.');
  lines.push('- Earning loop: Stripe webhook confirmation evidence is still missing in the heuristic; admin payments evidence is also missing in the heuristic.');
  lines.push('');

  fs.writeFileSync(outPath, lines.join('\n'));
  console.log(`Wrote ${path.relative(root, outPath)}`);
}

main();
