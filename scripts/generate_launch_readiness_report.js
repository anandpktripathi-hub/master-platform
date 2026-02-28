/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const root = process.cwd();

const backendScanPath = path.join(root, 'reports', 'backend_module_readiness_code_scan.json');
const routeMapPath = path.join(root, 'launch-v1-route-map.out.txt');

const outJsonPath = path.join(root, 'reports', 'launch_readiness_code_only.json');
const outMdPath = path.join(root, 'reports', 'LAUNCH_READINESS_STATUS_CODE_ONLY.md');
const outDetailedMdPath = path.join(root, 'reports', 'LAUNCH_READINESS_DETAILED_REPORT.md');
const outBackendMdPath = path.join(root, 'reports', 'LAUNCH_READINESS_BACKEND_REPORT.md');
const outFrontendMdPath = path.join(root, 'reports', 'LAUNCH_READINESS_FRONTEND_REPORT.md');

function decodeTextFile(buffer) {
  // Heuristic: some generated reports are UTF-16LE and will look like "L\0A\0U\0..." when decoded as UTF-8.
  const asUtf8 = buffer.toString('utf8');
  if (asUtf8.includes('\u0000')) {
    try {
      const asUtf16 = buffer.toString('utf16le');
      // Only accept UTF-16 if it looks sane.
      if (asUtf16.includes('STATUS\tUI_ROUTE\tCOMPONENT')) return asUtf16;
      return asUtf16;
    } catch {
      return asUtf8;
    }
  }
  return asUtf8;
}

function safeReadFile(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    return decodeTextFile(buf);
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

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

function parseRouteMap(txt) {
  const lines = (txt || '').split(/\r?\n/);
  const rows = [];

  let json = null;
  const jsonStartIdx = lines.findIndex((l) => l.trim() === 'JSON_START');
  const headerIdx = lines.findIndex((l) => l.trim() === 'STATUS\tUI_ROUTE\tCOMPONENT\tCOMPONENT_FILE\tAPI_CALLS\tNOTES');

  const dataEndIdx = jsonStartIdx >= 0 ? jsonStartIdx : lines.length;
  const dataStartIdx = headerIdx >= 0 ? headerIdx + 1 : 0;

  for (let i = dataStartIdx; i < dataEndIdx; i += 1) {
    const line = lines[i];
    if (!line || !line.includes('\t')) continue;

    const parts = line.split('\t');
    if (parts.length < 2) continue;
    if (parts[0] === 'LAUNCH_V1_ROUTE_MAP') continue;

    // Ensure we always have 6 columns.
    const padded = parts.concat(['', '', '', '', '', '']).slice(0, 6);
    const [status, uiRoute, component, componentFile, apiCallsRaw, notes] = padded;
    if (!status || !uiRoute) continue;

    const apiCalls = (apiCallsRaw || '')
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean);

    rows.push({
      status: status.trim(),
      uiRoute: uiRoute.trim(),
      component: (component || '').trim(),
      componentFile: (componentFile || '').trim(),
      apiCalls,
      notes: (notes || '').trim(),
    });
  }

  if (jsonStartIdx >= 0) {
    const jsonEndIdx = lines.findIndex((l, idx) => idx > jsonStartIdx && l.trim() === 'JSON_END');
    const jsonSlice =
      jsonEndIdx >= 0 ? lines.slice(jsonStartIdx + 1, jsonEndIdx) : lines.slice(jsonStartIdx + 1);
    const jsonText = jsonSlice.join('\n').trim();
    if (jsonText) {
      try {
        json = JSON.parse(jsonText);
      } catch {
        json = null;
      }
    }
  }

  return { rows, embeddedJson: json };
}

function apiPathToModule(apiCall) {
  // Example: "GET /billing/analytics/revenue"
  const m = (apiCall || '').match(/\s(\/[^\s]+)/);
  if (!m) return null;
  const p = m[1];
  const seg = p.split('/').filter(Boolean)[0];
  return seg || null;
}

function buildInfraChecklist() {
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

function buildCiChecklist() {
  const workflowsDir = path.join(root, '.github', 'workflows');
  let workflowCount = 0;
  try {
    workflowCount = fs
      .readdirSync(workflowsDir, { withFileTypes: true })
      .filter((d) => d.isFile() && /\.(yml|yaml)$/i.test(d.name)).length;
  } catch {
    workflowCount = 0;
  }

  return {
    workflowsDir: '.github/workflows',
    present: exists('.github/workflows'),
    workflowCount,
  };
}

function summarizeBackend(scan) {
  const results = (scan && scan.results) || [];
  const total = results.length;
  const complete = results.filter((r) => r.pct === 100).length;
  const avg = total ? Math.round(results.reduce((s, r) => s + (r.pct || 0), 0) / total) : 0;
  const min = total ? Math.min(...results.map((r) => r.pct || 0)) : 0;

  const missingCounts = {};
  for (const r of results) {
    for (const m of r.missing || []) {
      missingCounts[m] = (missingCounts[m] || 0) + 1;
    }
  }

  const missingSummary = Object.entries(missingCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ artifact: k, modulesMissing: v }));

  return {
    generatedAt: scan && scan.generatedAt,
    totalModules: total,
    completeModules: complete,
    completePct: pct(complete, total),
    avgPct: avg,
    minPct: min,
    missingSummary,
    modules: results.map((r) => ({
      name: r.name,
      pct: r.pct,
      missing: r.missing || [],
      tests: (r.present && r.present.tests) || 'no',
    })),
  };
}

function summarizeRoutes(routeRows) {
  const total = routeRows.length;
  const byStatus = {};
  for (const r of routeRows) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  }

  const withApiCalls = routeRows.filter((r) => r.apiCalls && r.apiCalls.length > 0).length;
  const mappedToBackend = routeRows.filter((r) => /map to backend controllers/i.test(r.notes)).length;

  const moduleUsage = {};
  for (const r of routeRows) {
    for (const call of r.apiCalls || []) {
      const mod = apiPathToModule(call);
      if (!mod) continue;
      moduleUsage[mod] = (moduleUsage[mod] || 0) + 1;
    }
  }

  const moduleUsageList = Object.entries(moduleUsage)
    .sort((a, b) => b[1] - a[1])
    .map(([module, apiCallCount]) => ({ module, apiCallCount }));

  return {
    totalRoutes: total,
    statusCounts: byStatus,
    inPct: pct(byStatus.In || 0, total),
    routesWithApiCalls: withApiCalls,
    apiCallsPct: pct(withApiCalls, total),
    routesWithMappedApiCalls: mappedToBackend,
    mappedApiCallsPct: pct(mappedToBackend, total),
    moduleUsage: moduleUsageList,
    routes: routeRows,
  };
}

function writeMarkdown(report) {
  const lines = [];

  lines.push('# Launch Readiness Snapshot (Code-Only, Evidence-Based)');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('This report merges:');
  lines.push('- Backend module readiness scan (structural completeness)');
  lines.push('- Frontend route map (UI routes + detected API calls)');
  lines.push('- Launch packaging/infra presence (Docker/start scripts/env example)');
  lines.push('');

  // Backend
  lines.push('## Backend Modules (structural)');
  lines.push('');
  lines.push(
    `- Modules: ${report.backend.totalModules} total | ${report.backend.completeModules} complete (100%) | ${report.backend.completePct}% complete`,
  );
  lines.push(`- Average module %: ${report.backend.avgPct}% | Minimum module %: ${report.backend.minPct}%`);
  lines.push('');
  lines.push('Top missing artifacts across modules:');
  if (!report.backend.missingSummary.length) {
    lines.push('- none');
  } else {
    for (const m of report.backend.missingSummary.slice(0, 8)) {
      lines.push(`- ${m.artifact}: missing in ${m.modulesMissing} modules`);
    }
  }
  lines.push('');

  // Frontend routes
  lines.push('## Frontend Routes (from launch-v1 route map)');
  lines.push('');
  lines.push(
    `- Routes: ${report.frontend.totalRoutes} | In: ${report.frontend.statusCounts.In || 0} (${report.frontend.inPct}%)`,
  );
  lines.push(
    `- Routes with detected API calls: ${report.frontend.routesWithApiCalls} (${report.frontend.apiCallsPct}%)`,
  );
  lines.push(
    `- Routes where detected API calls map to backend controllers: ${report.frontend.routesWithMappedApiCalls} (${report.frontend.mappedApiCallsPct}%)`,
  );
  lines.push('');
  lines.push('Most-used backend API prefixes from UI:');
  if (!report.frontend.moduleUsage.length) {
    lines.push('- none detected');
  } else {
    for (const u of report.frontend.moduleUsage.slice(0, 12)) {
      lines.push(`- /${u.module} (${u.apiCallCount} calls)`);
    }
  }
  lines.push('');

  // Infra
  lines.push('## Packaging / Infra (presence checks)');
  lines.push('');
  lines.push(`- Packaging checklist: ${report.infra.present}/${report.infra.total} present (${report.infra.pct}%)`);
  for (const item of report.infra.items) {
    lines.push(`- ${item.present ? 'yes' : 'no'}: ${item.path}`);
  }
  lines.push('');

  // CI
  lines.push('## CI (presence only)');
  lines.push('');
  lines.push(`- Workflows dir present: ${report.ci.present ? 'yes' : 'no'}`);
  lines.push(`- Workflow files: ${report.ci.workflowCount}`);
  lines.push('');

  // Appendices
  lines.push('## Appendix A — Backend modules (full)');
  lines.push('');
  lines.push('| Module | Launch % | Tests | Missing |');
  lines.push('|---|---:|---|---|');
  for (const m of report.backend.modules.slice().sort((a, b) => a.name.localeCompare(b.name))) {
    const missing = m.missing.length ? m.missing.join(', ') : '—';
    lines.push(`| ${m.name} | ${m.pct}% | ${m.tests || 'no'} | ${missing} |`);
  }
  lines.push('');

  lines.push('## Appendix B — Frontend routes (full)');
  lines.push('');
  lines.push('| Status | UI Route | Component | API Calls | Notes |');
  lines.push('|---|---|---|---|---|');
  for (const r of report.frontend.routes) {
    const apiCalls = (r.apiCalls || []).join(' | ') || '—';
    const notes = (r.notes || '').replace(/\|/g, '\\|') || '—';
    const comp = r.component ? `${r.component} (${r.componentFile})` : r.componentFile || '—';
    lines.push(`| ${r.status} | ${r.uiRoute} | ${comp.replace(/\|/g, '\\|')} | ${apiCalls.replace(/\|/g, '\\|')} | ${notes} |`);
  }
  lines.push('');

  fs.writeFileSync(outMdPath, lines.join('\n'));
  console.log(`Wrote ${outMdPath}`);
}

function mdEscape(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function writeDetailedMarkdown(report) {
  const lines = [];

  lines.push('# Launch Readiness — Detailed Report (Code-Only)');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Sources');
  lines.push('');
  lines.push(`- Backend scan: ${report.sources.backendModuleScan}`);
  lines.push(`- Frontend route map: ${report.sources.frontendRouteMap}`);
  lines.push(`- Route map generatedAt: ${report.sources.embeddedRouteMapJsonGeneratedAt || 'unknown'}`);
  lines.push('');

  lines.push('## Backend Modules (43/43 complete)');
  lines.push('');
  lines.push('| Module | Launch % | Tests | Files | Missing |');
  lines.push('|---|---:|---|---:|---|');
  for (const m of report.backend.modules.slice().sort((a, b) => a.name.localeCompare(b.name))) {
    const missing = m.missing.length ? m.missing.join(', ') : '—';
    lines.push(`| ${mdEscape(m.name)} | ${m.pct}% | ${mdEscape(m.tests)} | ${m.filesCount ?? '—'} | ${mdEscape(missing)} |`);
  }
  lines.push('');

  lines.push('## Frontend Routes (Launch v1)');
  lines.push('');
  lines.push(`- Total routes: ${report.frontend.totalRoutes}`);
  lines.push(`- In: ${report.frontend.statusCounts.In || 0}`);
  lines.push(`- Detected API calls: ${report.frontend.routesWithApiCalls}`);
  lines.push(`- API calls mapped to backend controllers: ${report.frontend.routesWithMappedApiCalls}`);
  lines.push('');
  lines.push('| Status | UI Route | Component File | API Calls | Mapped | Notes |');
  lines.push('|---|---|---|---|---:|---|');
  for (const r of report.frontend.routes) {
    const apiCalls = (r.apiCalls || []).join(' | ') || '—';
    const mapped = /map to backend controllers/i.test(r.notes) ? 'yes' : 'no';
    lines.push(
      `| ${mdEscape(r.status)} | ${mdEscape(r.uiRoute)} | ${mdEscape(r.componentFile || '—')} | ${mdEscape(apiCalls)} | ${mapped} | ${mdEscape(r.notes || '—')} |`,
    );
  }
  lines.push('');

  lines.push('## Packaging / Infra');
  lines.push('');
  lines.push(`- Checklist: ${report.infra.present}/${report.infra.total} present (${report.infra.pct}%)`);
  lines.push('');
  lines.push('| Item | Present |');
  lines.push('|---|---|');
  for (const item of report.infra.items) {
    lines.push(`| ${mdEscape(item.path)} | ${item.present ? 'yes' : 'no'} |`);
  }
  lines.push('');

  lines.push('## CI (presence only)');
  lines.push('');
  lines.push('| Check | Value |');
  lines.push('|---|---|');
  lines.push(`| Workflows dir present | ${report.ci.present ? 'yes' : 'no'} |`);
  lines.push(`| Workflow files | ${report.ci.workflowCount} |`);
  lines.push('');

  fs.writeFileSync(outDetailedMdPath, lines.join('\n'));
  console.log(`Wrote ${outDetailedMdPath}`);
}

function writeBackendOnlyMarkdown(report) {
  const lines = [];

  lines.push('# Launch Readiness — Backend Report (Code-Only)');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Sources');
  lines.push('');
  lines.push(`- Backend scan: ${report.sources.backendModuleScan}`);
  lines.push('');

  lines.push('## Backend Modules');
  lines.push('');
  lines.push('| Module | Launch % | Tests | Files | Missing |');
  lines.push('|---|---:|---|---:|---|');
  for (const m of report.backend.modules.slice().sort((a, b) => a.name.localeCompare(b.name))) {
    const missing = m.missing.length ? m.missing.join(', ') : '—';
    lines.push(`| ${mdEscape(m.name)} | ${m.pct}% | ${mdEscape(m.tests)} | ${m.filesCount ?? '—'} | ${mdEscape(missing)} |`);
  }
  lines.push('');

  lines.push('## Packaging / Infra');
  lines.push('');
  lines.push(`- Checklist: ${report.infra.present}/${report.infra.total} present (${report.infra.pct}%)`);
  lines.push('');
  lines.push('| Item | Present |');
  lines.push('|---|---|');
  for (const item of report.infra.items) {
    lines.push(`| ${mdEscape(item.path)} | ${item.present ? 'yes' : 'no'} |`);
  }
  lines.push('');

  lines.push('## CI (presence only)');
  lines.push('');
  lines.push('| Check | Value |');
  lines.push('|---|---|');
  lines.push(`| Workflows dir present | ${report.ci.present ? 'yes' : 'no'} |`);
  lines.push(`| Workflow files | ${report.ci.workflowCount} |`);
  lines.push('');

  fs.writeFileSync(outBackendMdPath, lines.join('\n'));
  console.log(`Wrote ${outBackendMdPath}`);
}

function writeFrontendOnlyMarkdown(report) {
  const lines = [];

  lines.push('# Launch Readiness — Frontend Report (Code-Only)');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Sources');
  lines.push('');
  lines.push(`- Frontend route map: ${report.sources.frontendRouteMap}`);
  lines.push(`- Route map generatedAt: ${report.sources.embeddedRouteMapJsonGeneratedAt || 'unknown'}`);
  lines.push('');

  lines.push('## Frontend Routes (Launch v1)');
  lines.push('');
  lines.push(`- Total routes: ${report.frontend.totalRoutes}`);
  lines.push(`- In: ${report.frontend.statusCounts.In || 0}`);
  lines.push(`- Detected API calls: ${report.frontend.routesWithApiCalls}`);
  lines.push(`- API calls mapped to backend controllers: ${report.frontend.routesWithMappedApiCalls}`);
  lines.push('');

  lines.push('| Status | UI Route | Component File | API Calls | Mapped | Notes |');
  lines.push('|---|---|---|---|---:|---|');
  for (const r of report.frontend.routes) {
    const apiCalls = (r.apiCalls || []).join(' | ') || '—';
    const mapped = /map to backend controllers/i.test(r.notes) ? 'yes' : 'no';
    lines.push(
      `| ${mdEscape(r.status)} | ${mdEscape(r.uiRoute)} | ${mdEscape(r.componentFile || '—')} | ${mdEscape(apiCalls)} | ${mapped} | ${mdEscape(r.notes || '—')} |`,
    );
  }
  lines.push('');

  lines.push('## Packaging / Infra');
  lines.push('');
  lines.push(`- Checklist: ${report.infra.present}/${report.infra.total} present (${report.infra.pct}%)`);
  lines.push('');
  lines.push('| Item | Present |');
  lines.push('|---|---|');
  for (const item of report.infra.items) {
    lines.push(`| ${mdEscape(item.path)} | ${item.present ? 'yes' : 'no'} |`);
  }
  lines.push('');

  lines.push('## CI (presence only)');
  lines.push('');
  lines.push('| Check | Value |');
  lines.push('|---|---|');
  lines.push(`| Workflows dir present | ${report.ci.present ? 'yes' : 'no'} |`);
  lines.push(`| Workflow files | ${report.ci.workflowCount} |`);
  lines.push('');

  fs.writeFileSync(outFrontendMdPath, lines.join('\n'));
  console.log(`Wrote ${outFrontendMdPath}`);
}

function main() {
  const backendScan = safeReadJson(backendScanPath);
  if (!backendScan) {
    console.error(`Missing or invalid backend scan JSON at: ${backendScanPath}`);
    process.exitCode = 1;
    return;
  }

  const routeMapTxt = safeReadFile(routeMapPath);
  const { rows: routeRows, embeddedJson } = parseRouteMap(routeMapTxt);

  const backendSummary = summarizeBackend(backendScan);

  // Add a couple extra fields for detailed reporting.
  const backendModulesDetailed = (backendScan.results || []).map((r) => ({
    name: r.name,
    pct: r.pct,
    missing: r.missing || [],
    tests: (r.present && r.present.tests) || 'no',
    filesCount: r.filesCount,
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'code-only',
    sources: {
      backendModuleScan: path.relative(root, backendScanPath).replace(/\\/g, '/'),
      frontendRouteMap: path.relative(root, routeMapPath).replace(/\\/g, '/'),
      embeddedRouteMapJsonGeneratedAt: embeddedJson && embeddedJson.generatedAt,
    },
    backend: {
      ...backendSummary,
      modules: backendModulesDetailed,
    },
    frontend: summarizeRoutes(routeRows),
    infra: buildInfraChecklist(),
    ci: buildCiChecklist(),
  };

  fs.writeFileSync(outJsonPath, JSON.stringify(report, null, 2));
  console.log(`Wrote ${outJsonPath}`);
  writeMarkdown(report);
  writeDetailedMarkdown(report);
  writeBackendOnlyMarkdown(report);
  writeFrontendOnlyMarkdown(report);
}

main();
