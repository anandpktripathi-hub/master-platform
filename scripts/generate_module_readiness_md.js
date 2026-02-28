const fs = require('fs');
const path = require('path');

const root = process.cwd();
const inPath = path.join(root, 'reports', 'backend_module_readiness_code_scan.json');
const outPath = path.join(
  root,
  'reports',
  'backend_module_readiness_code_scan.summary.md',
);
const detailedOutPath = path.join(
  root,
  'reports',
  'backend_module_readiness_code_scan.detailed.md',
);

const report = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const results = report.results;
const generatedAt = report.generatedAt;
const weights = report.weights;

const complete = results
  .filter((r) => r.pct === 100)
  .map((r) => r.name)
  .sort((a, b) => a.localeCompare(b));

// Based on what we ran in this session.
const validatedGreen = [
  'auth',
  'billing',
  'custom-domains',
  'domains',
  'hierarchy',
  'logs',
  'packages',
  'payments',
  'profile',
  'rbac',
  'reports',
  'social',
  'support',
  'theme',
  'themes',
  'notifications',
  'projects',
  'dashboard',
  'onboarding',
  'hrm',
  'tenant',
  'user',
  'users',
  'vcards',
];

function fmtMissing(missing) {
  if (!missing || missing.length === 0) return '—';
  return missing.join(', ');
}

function fmtBool(value) {
  return value ? 'yes' : 'no';
}

function fmtTests(value) {
  if (value === 'both') return 'both';
  if (value === 'some') return 'some';
  return 'no';
}

let md = '';
md += '# Backend Module Launch-Readiness (Code Scan)\n\n';
md += `Generated: ${generatedAt}\n\n`;
md +=
  'This report is generated from code only (modules + migrations + tests presence). It does not read any .md/docs.\n\n';

md += '## Scoring (structure-based heuristic)\n\n';
md += `Weights: module ${weights.module}%, controller ${weights.controller}%, service ${weights.service}%, dto ${weights.dto}%, schema wiring ${weights.schema}%, tests ${weights.tests}%, migrations ${weights.migrations}%.\n\n`;
md += 'Notes:\n';
md +=
  '- tests: both means both controller + service spec exist; some means at least one spec exists.\n';
md +=
  '- schema wiring means module/service references Mongoose schemas via InjectModel / forFeature / database/schemas import.\n\n';

md += '## Structurally Complete (100%)\n\n';
md += complete.length ? complete.map((n) => `- ${n}`).join('\n') + '\n\n' : '(none)\n\n';

md += '## Validated Green This Session (tests + build run)\n\n';
md += validatedGreen.map((n) => `- ${n}`).join('\n') + '\n\n';

md += '## All Modules\n\n';
md += '| Module | Launch % | Missing |\n';
md += '|---|---:|---|\n';
for (const r of results) {
  md += `| ${r.name} | ${r.pct}% | ${fmtMissing(r.missing)} |\n`;
}
md += '\n';

md += '## Next Targets (lowest first)\n\n';
md +=
  results
    .slice(0, 10)
    .map((r) => `- ${r.name} (${r.pct}%) -> missing: ${fmtMissing(r.missing)}`)
    .join('\n') + '\n';

fs.writeFileSync(outPath, md);
console.log(`Wrote ${outPath}`);

let detailed = '';
detailed += '# Backend Module Launch-Readiness (Detailed Code Scan)\n\n';
detailed += `Generated: ${generatedAt}\n\n`;
detailed +=
  'This report is generated from code only (modules + migrations + tests presence). It does not read any .md/docs.\n\n';

detailed += '## Legend\n\n';
detailed += '- module/controller/service/dto/schema/migrations: yes/no\n';
detailed += '- tests: both/some/no\n\n';

detailed += '## Structurally Complete (100%)\n\n';
detailed += complete.length
  ? complete.map((n) => `- ${n}`).join('\n') + '\n\n'
  : '(none)\n\n';

detailed += '## Validated Green This Session (tests + build run)\n\n';
detailed += validatedGreen.map((n) => `- ${n}`).join('\n') + '\n\n';

detailed += '## Module Flags\n\n';
detailed +=
  '| Module | Launch % | module | controller | service | dto | schema | tests | migrations | missing |\n';
detailed +=
  '|---|---:|---|---|---|---|---|---|---|---|\n';

for (const r of results) {
  const p = r.present || {};
  detailed += `| ${r.name} | ${r.pct}% | ${fmtBool(p.module)} | ${fmtBool(
    p.controller,
  )} | ${fmtBool(p.service)} | ${fmtBool(p.dto)} | ${fmtBool(
    p.schema,
  )} | ${fmtTests(p.tests)} | ${fmtBool(p.migrations)} | ${fmtMissing(
    r.missing,
  )} |\n`;
}

detailed += '\n';

fs.writeFileSync(detailedOutPath, detailed);
console.log(`Wrote ${detailedOutPath}`);
