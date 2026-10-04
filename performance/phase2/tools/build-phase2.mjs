// Phase 2 report builder: combines the before/after benchmark, EXPLAIN and
// coverage artifacts into performance/phase2/backend-phase2.{json,md}.
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const rd = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const exists = (p) => existsSync(resolve(root, p));

const baseline = rd('performance-reports/baseline-bench.json').results;
const phase2 = rd('performance-reports/phase2-bench.json').results;
// Latest categories measurement (with the productCounts cache in place).
const catLatest = exists('performance-reports/phase2-categories-bench.json')
  ? rd('performance-reports/phase2-categories-bench.json').results
  : [];
const catByName = new Map(catLatest.map((r) => [r.name, r]));

const explainBefore = rd('performance/phase2/_explain-before.json').queries;
const explainAfter = rd('performance/phase2/_explain-after.json').queries;
const afterByKey = new Map(explainAfter.map((q) => [q.key, q]));

// Coverage from vitest's coverage-final.json
let coverage = null;
if (exists('apps/api/coverage/coverage-final.json')) {
  const cov = rd('apps/api/coverage/coverage-final.json');
  let sTot = 0, sCov = 0, fTot = 0, fCov = 0, bTot = 0, bCov = 0;
  for (const f in cov) {
    const d = cov[f];
    for (const k in d.s) { sTot++; if (d.s[k] > 0) sCov++; }
    for (const k in d.f) { fTot++; if (d.f[k] > 0) fCov++; }
    for (const k in d.b) for (const c of d.b[k]) { bTot++; if (c > 0) bCov++; }
  }
  const pct = (a, b) => (b ? Number(((100 * a) / b).toFixed(2)) : 0);
  coverage = {
    statementsPct: pct(sCov, sTot), statements: `${sCov}/${sTot}`,
    functionsPct: pct(fCov, fTot), functions: `${fCov}/${fTot}`,
    branchesPct: pct(bCov, bTot), branches: `${bCov}/${bTot}`,
  };
}

const round = (n, d = 1) => (typeof n === 'number' ? Number(n.toFixed(d)) : null);
const delta = (before, after) => {
  if (typeof before !== 'number' || typeof after !== 'number' || before === 0) return null;
  return round(((after - before) / before) * 100, 1);
};

// ---- Endpoint comparison ----
const bByName = new Map(baseline.map((r) => [r.name, r]));
const comparison = [];
for (const r of phase2) {
  const o = bByName.get(r.name);
  const after = catByName.get(r.name) ?? r; // prefer the latest (cached) categories numbers
  comparison.push({
    group: r.group,
    name: r.name,
    route: r.route,
    beforeAvgMs: o?.latencyMs?.avg ?? null,
    afterAvgMs: after.latencyMs?.avg ?? null,
    beforeP95Ms: o?.latencyMs?.p95 ?? null,
    afterP95Ms: after.latencyMs?.p95 ?? null,
    beforeRps: o?.requests?.rps ?? null,
    afterRps: after.requests?.rps ?? null,
    avgDeltaPct: delta(o?.latencyMs?.avg, after.latencyMs?.avg),
    note: o?.skipped ? 'Phase 1 skipped (cold timeout)' : null,
  });
}
comparison.sort((a, b) => (b.beforeAvgMs ?? -1) - (a.beforeAvgMs ?? -1));

const mix = comparison.find((c) => c.name === 'mixed public read traffic');

// ---- Additional single cold-request measurements (not in the benchmark scenario set) ----
const extras = [
  { name: 'public/catalog/homepage', before: '58.8s (after a first batching pass; not in Phase 1 set)', after: '8.0s', note: 'Remaining cost is the featured-shops query (~5.3s), out of scope' },
  { name: 'public/catalog/category-sections (all roots)', before: '52.3s', after: '50.2s', note: 'Fetches 52 sections; unchanged by default to preserve output' },
  { name: 'public/catalog/category-sections?limit=4', before: '52.3s', after: '0.68s', note: 'New optional limit; homepage now uses limit=4' },
  { name: 'public/categories / tree (single cold request)', before: '>20s timeout', after: '0.8s (DB) / ~4.6s under C=10', note: 'DB query fixed; 5.5 MB unpaginated payload is now the bottleneck' },
  { name: 'GET /admin/analytics/demand', before: 'HTTP 500 every call (~1.6s to fail)', after: 'HTTP 200, 0.27s cold / 150ms avg under load', note: 'Fixed broken column reference' },
];

const output = {
  phase: 2,
  generatedAt: new Date().toISOString(),
  title: 'Gramer Bazar Backend Performance — Phase 2 (optimization) results',
  method: {
    database: 'Isolated scratch copy (gramer_bazar_p2) restored from the dev DB via pg_dump/psql; dev DB never modified.',
    server: 'Built API run in NODE_ENV=production against the scratch DB on :4005, DB_SYNCHRONIZE=false, MIGRATIONS_RUN=false, throttling disabled.',
    benchmark: 'autocannon, concurrency 10, warmup 3s, duration 8s (identical harness to Phase 1 baseline).',
    sql: 'EXPLAIN (ANALYZE, BUFFERS) of the same hot queries on the scratch DB.',
  },
  sqlExplain: explainBefore.map((q) => ({
    query: q.key,
    beforeMs: q.executionMs,
    afterMs: afterByKey.get(q.key)?.executionMs ?? null,
    beforeNodes: q.nodeTypes,
    afterNodes: afterByKey.get(q.key)?.nodeTypes ?? null,
  })),
  queryRewrites: [
    {
      query: 'categories productCounts()',
      beforeMs: 40561.456,
      afterMs: 118.589,
      speedup: '~342x',
      note: 'Original per-category correlated subquery vs the new set-based recursive rollup. Index alone only helped to ~38.8s (see table); the rewrite is what removes the cost. Counts verified byte-identical for all 9,700 categories.',
    },
  ],
  endpointComparison: comparison,
  mixedWorkload: mix,
  additionalMeasurements: extras,
  tests: {
    files: '65 passed (65)',
    tests: '284 passed (284)',
    previousFailure: 'src/reviews/reviews.service.spec.ts (3 tests) — fixed by updating the stale DataSource.transaction mock',
  },
  coverage,
  changes: [
    { id: 'A', file: 'apps/api/src/migrations/1793000000000-RestorePerformanceIndexes.ts (new)', summary: 'Idempotent migration recreating the 10 lost indexes + adds reviews(product_id,is_approved,created_at), reviews(created_at), reviews(user_id,product_id), products(name_en), product_variants(product_id). Registered in app.module.ts.' },
    { id: 'A2', file: 'apps/api/src/app.module.ts', summary: 'Schema sync is now opt-in (DB_SYNCHRONIZE=true only). Previously synchronize defaulted on outside production and dropped migration-managed indexes.' },
    { id: 'B', file: 'apps/api/src/public/categories/categories.service.ts', summary: 'productCounts() rewritten as a single set-based recursive rollup (was a per-category correlated subquery), plus a 60s in-process cache. Byte-identical counts verified for all 9,700 categories.' },
    { id: 'C', file: 'apps/api/src/analytics/analytics.service.ts', summary: 'GET /admin/analytics/demand: request.productName -> request.requestedProductName (column did not exist).' },
    { id: 'D', file: 'apps/api/src/public/catalog/catalog.service.ts + catalog.controller.ts', summary: 'getCategorySections() batches item/rating/sub-category fetches (one LATERAL + one hydration) and accepts an optional ?limit; homepage requests only the 4 sections it renders.' },
    { id: 'E', file: 'apps/api/src/settings/settings.service.ts', summary: 'getSettings() cached (5s TTL) with immediate invalidation on update; removes a per-request DB query from the global MaintenanceGuard.' },
    { id: 'F', file: 'apps/api/src/reviews/reviews.service.spec.ts', summary: 'Spec mock updated to provide DataSource.transaction manager, matching current service behavior.' },
  ],
  limitations: [
    'All latency figures are from a single local Windows workstation; they are before/after comparisons, not production predictions.',
    'Node heap / event-loop / GC internals remain unmeasurable with the available tooling.',
    'The scratch DB was restored from the dev DB, so the seeded category `path` quirks are present; product counts intentionally preserve the legacy semantics.',
    'public/categories is now DB-fast but returns a 5.5 MB unpaginated payload (separate issue).',
  ],
};

writeFileSync(resolve(root, 'performance/phase2/backend-phase2.json'), JSON.stringify(output, null, 2));

// ---- Markdown report ----
const fmt = (v, suffix = '') => (v === null || v === undefined ? '—' : `${v}${suffix}`);
const pctStr = (v) => (v === null ? '—' : `${v > 0 ? '+' : ''}${v}%`);

let md = `# Gramer Bazar Backend — Phase 2 Optimization Results\n\n`;
md += `> Measured against an **isolated scratch copy** of the production-sized dataset\n`;
md += `> (\`gramer_bazar_p2\`, restored from the dev DB). The dev database was never modified.\n`;
md += `> Method: built API in production mode on :4005 against the scratch DB, autocannon\n`;
md += `> (C=10, warmup 3s, duration 8s) — the identical harness used for the Phase 1 baseline.\n\n`;
md += `Generated: ${output.generatedAt}\n\n---\n\n`;

md += `## 1. What changed\n\n`;
for (const c of output.changes) md += `- **${c.id}. ${c.file}** — ${c.summary}\n`;
md += `\n---\n\n`;

md += `## 2. SQL-level effect (EXPLAIN ANALYZE, scratch DB)\n\n`;
md += `Effect of the **indexes alone** on the original query shapes:\n\n`;
md += `| Query | Before (ms) | After (ms) | Speedup | After plan |\n|---|---:|---:|---:|---|\n`;
for (const q of output.sqlExplain) {
  const sp = q.beforeMs && q.afterMs ? `${round(q.beforeMs / q.afterMs, 1)}x` : '—';
  md += `| \`${q.query}\` | ${fmt(q.beforeMs)} | ${fmt(afterByKey.get(q.query)?.executionMs)} | ${sp} | ${(q.afterNodes || []).slice(0, 4).join(', ')} |\n`;
}
md += `\n> \`categories_productCounts\` in the table above is the **original correlated subquery** with indexes added — the index does not fix it, which is why it was also rewritten:\n\n`;
md += `| Query rewrite | Before (ms) | After (ms) | Speedup |\n|---|---:|---:|---:|\n`;
for (const r of output.queryRewrites) {
  md += `| ${r.query} | ${r.beforeMs} | ${r.afterMs} | ${r.speedup} |\n`;
}
md += `\n${output.queryRewrites[0].note}\n`;
md += `\n---\n\n`;

md += `## 3. HTTP endpoint comparison (before → after)\n\n`;
md += `| Endpoint | Group | Avg before | Avg after | Avg Δ | p95 before | p95 after | rps before | rps after |\n`;
md += `|---|---|---:|---:|---:|---:|---:|---:|---:|\n`;
for (const c of comparison) {
  md += `| ${c.name} | ${c.group} | ${fmt(c.beforeAvgMs, 'ms')} | ${fmt(c.afterAvgMs, 'ms')} | ${pctStr(c.avgDeltaPct)} | ${fmt(c.beforeP95Ms)} | ${fmt(c.afterP95Ms)} | ${fmt(c.beforeRps)} | ${fmt(c.afterRps)} |\n`;
}

md += `\n**Mixed realistic public workload:** avg **${fmt(mix?.beforeAvgMs, 'ms')} → ${fmt(mix?.afterAvgMs, 'ms')}** (${pctStr(mix?.avgDeltaPct)}), `;
md += `p95 **${fmt(mix?.beforeP95Ms)} → ${fmt(mix?.afterP95Ms)}**, throughput **${fmt(mix?.beforeRps)} → ${fmt(mix?.afterRps)} rps**.\n\n`;
md += `\n---\n\n`;

md += `## 4. Additional single cold-request measurements\n\n`;
md += `| Endpoint | Before | After | Note |\n|---|---|---|---|\n`;
for (const e of extras) md += `| ${e.name} | ${e.before} | ${e.after} | ${e.note} |\n`;
md += `\n---\n\n`;

md += `## 5. Test suite & coverage\n\n`;
md += `- Test files: **${output.tests.files}**; tests: **${output.tests.tests}**.\n`;
md += `- Previously failing: ${output.tests.previousFailure}\n`;
if (coverage) {
  md += `- Coverage (was **unmeasurable** in Phase 1 because the run aborted on the failing suite):\n`;
  md += `  - statements **${coverage.statementsPct}%** (${coverage.statements})\n`;
  md += `  - functions **${coverage.functionsPct}%** (${coverage.functions})\n`;
  md += `  - branches **${coverage.branchesPct}%** (${coverage.branches})\n`;
}
md += `\n---\n\n`;

md += `## 6. Verification method\n\n`;
md += `- The 10 missing indexes + reviews indexes were applied to the scratch DB via \`migration:run\`; \`migration:revert\` then \`migration:run\` was exercised to prove both directions, and re-running the \`CREATE INDEX IF NOT EXISTS\` statements proved idempotency.\n`;
md += `- \`productCounts()\` output was diffed row-by-row against the original correlated subquery for **all 9,700 categories — 0 mismatches**.\n`;
md += `- The settings cache was proven with a query-logging dev instance: \`/health\` emits **1 query** when cold and **0 queries** within the TTL (it emitted 1 on every call before).\n`;
md += `- The demand endpoint returns **HTTP 200** with the expected six data keys.\n\n`;
md += `## 7. Limitations\n\n`;
for (const l of output.limitations) md += `- ${l}\n`;
md += `\n## 8. Remaining bottlenecks (not addressed in Phase 2)\n\n`;
md += `- \`POST /auth/login\` still ~1.9s (bcrypt cost 10) — backlog #10.\n`;
md += `- \`reviews/admin\` ~1.1s — dominated by the \`getManyAndCount\` COUNT over 728k joined rows.\n`;
md += `- \`GET /public/catalog/brands\` /\`brands (admin)\` ~0.8–1.0s with 850 kB+ payloads (unpaginated) — backlog #6.\n`;
md += `- \`/public/categories\` 5.5 MB unpaginated payload — now DB-fast but serialization-bound under load.\n`;
md += `- Homepage featured-shops query ~5.3s (joins 728k reviews) — remaining homepage bottleneck.\n`;

writeFileSync(resolve(root, 'performance/phase2/backend-phase2-report.md'), md);
console.log('wrote performance/phase2/backend-phase2.json and backend-phase2-report.md');
console.log('comparison rows:', comparison.length, '| sql rows:', output.sqlExplain.length, '| coverage:', JSON.stringify(coverage));
