import autocannon from 'autocannon';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------
// 3. ENVIRONMENT SAFETY
// -----------------------------------------------------
const isEnabled = process.env.LOAD_TEST_ENABLED === 'true';
const env = process.env.LOAD_TEST_ENV || 'production';
const baseUrl = process.env.LOAD_TEST_BASE_URL || 'http://localhost:4000';

if (!isEnabled) {
  console.error('\n❌ LOAD TEST SAFETY TRIGGERED ❌');
  console.error('LOAD_TEST_ENABLED is not true.');
  console.error('Please run with LOAD_TEST_ENABLED=true to explicitly acknowledge safety.');
  process.exit(1);
}

if (env === 'production') {
  console.error('\n❌ LOAD TEST SAFETY TRIGGERED ❌');
  console.error('LOAD_TEST_ENV is set to "production".');
  console.error('This script must never be run against the production database.');
  process.exit(1);
}

const isLocalUrl = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
if (!isLocalUrl && process.env.LOAD_TEST_FORCE_EXTERNAL !== 'true') {
  console.error('\n❌ LOAD TEST SAFETY TRIGGERED ❌');
  console.error(`Target URL ${baseUrl} is not a local address.`);
  console.error('If you REALLY intend to load test a remote server, set LOAD_TEST_FORCE_EXTERNAL=true');
  process.exit(1);
}

// -----------------------------------------------------
// 5. LOAD TEST CONFIGURATION
// -----------------------------------------------------
const config = {
  baseUrl,
  duration: parseInt(process.env.LOAD_TEST_DURATION || '30', 10),
  warmup: parseInt(process.env.LOAD_TEST_WARMUP || '5', 10),
  concurrencyLevels: (process.env.LOAD_TEST_CONCURRENCIES || '1,5,10,25,50,100')
    .split(',')
    .map((s) => parseInt(s.trim(), 10)),
  limit: parseInt(process.env.LOAD_TEST_CATALOG_LIMIT || '24', 10),
  p95Threshold: parseInt(process.env.LOAD_TEST_P95_WARNING_MS || '500', 10),
  p99Threshold: parseInt(process.env.LOAD_TEST_P99_WARNING_MS || '1000', 10),
  errorThreshold: parseFloat(process.env.LOAD_TEST_ERROR_RATE_WARNING_PERCENT || '1'),
  mix: {
    newest: parseInt(process.env.LOAD_TEST_MIX_CATALOG_NEWEST || '40', 10),
    priceAsc: parseInt(process.env.LOAD_TEST_MIX_PRICE_ASC || '15', 10),
    priceDesc: parseInt(process.env.LOAD_TEST_MIX_PRICE_DESC || '10', 10),
    nameAsc: parseInt(process.env.LOAD_TEST_MIX_NAME_ASC || '10', 10),
    search: parseInt(process.env.LOAD_TEST_MIX_SEARCH || '15', 10),
    filtered: parseInt(process.env.LOAD_TEST_MIX_FILTERED || '10', 10),
  }
};

const totalMix = Object.values(config.mix).reduce((a, b) => a + b, 0);
if (totalMix !== 100) {
  console.error(`\n❌ CONFIG ERROR: LOAD_TEST_MIX_* values sum to ${totalMix}, must be exactly 100.`);
  process.exit(1);
}

// -----------------------------------------------------
// TEST DEFINITIONS
// -----------------------------------------------------
const SCENARIOS = [
  { name: 'catalog_newest', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=newest` },
  { name: 'catalog_price_asc', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=price_asc` },
  { name: 'catalog_price_desc', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=price_desc` },
  { name: 'catalog_name_asc', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=name_asc` },
  { name: 'search_english', path: `/api/v1/public/catalog/search?limit=${config.limit}&q=laptop` },
  { name: 'search_bangla', path: `/api/v1/public/catalog/search?limit=${config.limit}&q=${encodeURIComponent('মোবাইল')}` },
  { name: 'search_partial', path: `/api/v1/public/catalog/search?limit=${config.limit}&q=lap` },
  { name: 'search_typo', path: `/api/v1/public/catalog/search?limit=${config.limit}&q=lpatop` },
  { name: 'search_short', path: `/api/v1/public/catalog/search?limit=${config.limit}&q=a` },
  { name: 'filter_price', path: `/api/v1/public/catalog/search?limit=${config.limit}&minPrice=100&maxPrice=500` },
  { name: 'filter_stock', path: `/api/v1/public/catalog/search?limit=${config.limit}&inStock=true` },
];

function runAutocannon(scenarioConf: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const instance = autocannon(scenarioConf, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });

    autocannon.track(instance, { renderProgressBar: false });
  });
}

function validateResponse(result: any) {
    // We will do a separate quick check to ensure the API is returning valid JSON structure.
}

async function verifyEndpointCorrectness(pathUrl: string) {
    const url = `${baseUrl}${pathUrl}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`⚠️ Warning: Endpoint ${pathUrl} returned HTTP ${res.status}`);
            return false;
        }
        const body = await res.json();
        if (!body.data || !body.meta || !body.meta.pagination) {
            console.warn(`⚠️ Warning: Endpoint ${pathUrl} missing data/meta pagination signature!`);
            return false;
        }
        return true;
    } catch(err: any) {
        console.warn(`⚠️ Warning: Failed to connect to ${url}: ${err.message}`);
        return false;
    }
}

async function runScenario(scenario: any, concurrency: number) {
  console.log(`\n===========================================`);
  console.log(`🧪 SCENARIO: ${scenario.name} | CONCURRENCY: ${concurrency}`);
  console.log(`===========================================`);
  
  // Quick pre-flight validation
  const isValid = await verifyEndpointCorrectness(scenario.path);
  if (!isValid) {
      console.log(`Skipping benchmark due to pre-flight failure.`);
      return null;
  }

  // WARMUP
  if (config.warmup > 0) {
    console.log(`🔥 Warming up for ${config.warmup} seconds...`);
    await runAutocannon({
      url: baseUrl + scenario.path,
      connections: concurrency,
      duration: config.warmup
    });
  }

  // MEASURE
  console.log(`📏 Measuring for ${config.duration} seconds...`);
  const result = await runAutocannon({
    url: baseUrl + scenario.path,
    connections: concurrency,
    duration: config.duration,
  });
  
  const errorRate = result.requests.total > 0 ? (result.non2xx + result.errors) / result.requests.total * 100 : 0;

  console.log(`\n📊 RESULTS for ${scenario.name} @ C${concurrency}`);
  console.log(`Req/Sec: ${result.requests.average}`);
  console.log(`Latency p50: ${result.latency.p50}ms`);
  console.log(`Latency p95: ${result.latency.p95}ms`);
  console.log(`Latency p99: ${result.latency.p99}ms`);
  console.log(`Error Rate: ${errorRate.toFixed(2)}%`);
  
  if (result.latency.p95 > config.p95Threshold) {
      console.log(`⚠️ WARNING: p95 latency (${result.latency.p95}ms) exceeded threshold (${config.p95Threshold}ms)`);
  }
  
  return {
    scenario: scenario.name,
    concurrency,
    durationSeconds: config.duration,
    requests: {
      total: result.requests.total,
      successful: result['2xx'],
      failed: result.non2xx + result.errors,
      requestsPerSecond: result.requests.average
    },
    latencyMs: {
      avg: result.latency.average,
      p50: result.latency.p50,
      p95: result.latency.p95,
      p99: result.latency.p99,
      max: result.latency.max
    },
    errorRate
  };
}

// -----------------------------------------------------
// 7. CURSOR PAGINATION SCENARIO (DEEP TRAVERSAL)
// -----------------------------------------------------
async function runCursorDeepTraversal() {
    console.log(`\n===========================================`);
    console.log(`🔗 SCENARIO: CURSOR DEEP TRAVERSAL`);
    console.log(`===========================================`);
    
    let cursor = '';
    const MAX_PAGES = 100;
    let pagesTraversed = 0;
    const latencies: number[] = [];
    
    for (let i = 1; i <= MAX_PAGES; i++) {
        let url = `${baseUrl}/api/v1/public/catalog/search?limit=${config.limit}&sort=price_asc`;
        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }
        
        const start = performance.now();
        const res = await fetch(url);
        const end = performance.now();
        const body = await res.json();
        
        const duration = end - start;
        latencies.push(duration);
        
        pagesTraversed++;
        
        if (i === 1) console.log(`Page 1 latency: ${duration.toFixed(2)}ms`);
        if (i === 10) console.log(`Page 10 latency: ${duration.toFixed(2)}ms`);
        if (i === 50) console.log(`Page 50 latency: ${duration.toFixed(2)}ms`);
        if (i === 100) console.log(`Page 100 latency: ${duration.toFixed(2)}ms`);
        
        if (!body.meta?.pagination?.hasNextPage) {
            console.log(`Reached end of results at page ${i}`);
            break;
        }
        cursor = body.meta.pagination.nextCursor;
        
        if (!cursor) {
            console.error(`API returned hasNextPage=true but no nextCursor at page ${i}`);
            break;
        }
    }
    
    latencies.sort((a,b) => a-b);
    const avg = latencies.reduce((a,b) => a+b, 0) / latencies.length;
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    
    console.log(`\nCursor Traversal Results (${pagesTraversed} pages):`);
    console.log(`Avg Latency: ${avg.toFixed(2)}ms`);
    console.log(`p50 Latency: ${p50?.toFixed(2)}ms`);
    console.log(`p95 Latency: ${p95?.toFixed(2)}ms`);
    
    return {
        scenario: 'cursor_deep_traversal',
        pagesTraversed,
        latencyMs: {
            avg,
            p50,
            p95
        }
    };
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const isFullMatrix = args.includes('--matrix');
  const isOnlyCursor = args.includes('--cursor');
  
  let scenariosToRun = SCENARIOS;
  let concurrenciesToRun = isFullMatrix ? config.concurrencyLevels : [10];
  
  const results = [];
  
  if (isOnlyCursor) {
      await runCursorDeepTraversal();
      process.exit(0);
  }
  
  for (const c of concurrenciesToRun) {
      for (const scenario of scenariosToRun) {
          const res = await runScenario(scenario, c);
          if (res) results.push(res);
      }
  }
  
  // Mixed Traffic Scenario
  console.log(`\n===========================================`);
  console.log(`🌪️ SCENARIO: MIXED REALISTIC TRAFFIC`);
  console.log(`===========================================`);
  
  const mixedRequests = [
      { method: 'GET', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=newest`, weight: config.mix.newest },
      { method: 'GET', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=price_asc`, weight: config.mix.priceAsc },
      { method: 'GET', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=price_desc`, weight: config.mix.priceDesc },
      { method: 'GET', path: `/api/v1/public/catalog/search?limit=${config.limit}&sort=name_asc`, weight: config.mix.nameAsc },
      { method: 'GET', path: `/api/v1/public/catalog/search?limit=${config.limit}&q=laptop`, weight: config.mix.search },
      { method: 'GET', path: `/api/v1/public/catalog/search?limit=${config.limit}&inStock=true&minPrice=100`, weight: config.mix.filtered },
  ];
  
  // Create an array of requests weighted for autocannon's random request generation
  // Autocannon doesn't explicitly support weighted random out of the box in simple array, 
  // so we build an array of proportional length (100 total items)
  const weightedPaths: any[] = [];
  for (const req of mixedRequests) {
      for (let i = 0; i < req.weight; i++) {
          weightedPaths.push({ method: 'GET', path: req.path });
      }
  }
  
  if (config.warmup > 0) {
      await runAutocannon({
        url: baseUrl,
        connections: concurrenciesToRun[concurrenciesToRun.length-1],
        duration: config.warmup,
        requests: weightedPaths
      });
  }
  
  const mixResult = await runAutocannon({
      url: baseUrl,
      connections: concurrenciesToRun[concurrenciesToRun.length-1],
      duration: config.duration,
      requests: weightedPaths
  });
  
  const mixErrorRate = mixResult.requests.total > 0 ? (mixResult.non2xx + mixResult.errors) / mixResult.requests.total * 100 : 0;
  
  results.push({
      scenario: 'mixed_realistic_traffic',
      concurrency: concurrenciesToRun[concurrenciesToRun.length-1],
      durationSeconds: config.duration,
      requests: {
        total: mixResult.requests.total,
        successful: mixResult['2xx'],
        failed: mixResult.non2xx + mixResult.errors,
        requestsPerSecond: mixResult.requests.average
      },
      latencyMs: {
        avg: mixResult.latency.average,
        p50: mixResult.latency.p50,
        p95: mixResult.latency.p95,
        p99: mixResult.latency.p99,
        max: mixResult.latency.max
      },
      errorRate: mixErrorRate
  });
  
  const cursorResult = await runCursorDeepTraversal();
  
  // Format Results
  const report = {
      timestamp: new Date().toISOString(),
      environment: env,
      baseUrl: baseUrl,
      database: 'PostgreSQL - Pool configuration retained',
      results: results,
      cursorResult: cursorResult
  };
  
  const dir = path.join(__dirname, '../../../../performance-reports/phase-8.1');
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(dir, 'latest.json'), JSON.stringify(report, null, 2));
  
  let md = `# Phase 8.1 - Production Load-Test Baseline\n\n`;
  md += `**Timestamp:** ${report.timestamp}\n`;
  md += `**Environment:** ${env}\n`;
  md += `**Base URL:** ${baseUrl}\n`;
  md += `**Duration per test:** ${config.duration}s (Warmup: ${config.warmup}s)\n\n`;
  
  md += `## Baseline Comparison (Historical Phase 7 SQL vs HTTP)\n`;
  md += `*Note: Phase 7 recorded internal SQL execution + Node.js hydration time. Phase 8.1 records full HTTP request round-trip latency.*\n`;
  md += `- Phase 7 \`price_asc\`: ~41ms\n`;
  md += `- Phase 7 \`newest\`: ~228ms\n`;
  md += `- Phase 7 \`name_asc\`: ~688ms\n\n`;

  md += `## HTTP Load Test Results\n\n`;
  md += `| Scenario | Concurrency | RPS | p50 (ms) | p95 (ms) | p99 (ms) | Error % |\n`;
  md += `| -------- | ----------: | --: | -------: | -------: | -------: | ------: |\n`;
  
  for (const r of results) {
      md += `| ${r.scenario} | ${r.concurrency} | ${r.requests.requestsPerSecond} | ${r.latencyMs.p50} | ${r.latencyMs.p95} | ${r.latencyMs.p99} | ${r.errorRate.toFixed(2)} |\n`;
  }
  
  md += `\n## Cursor Traversal (Sequential)\n`;
  md += `- Pages Traversed: ${cursorResult.pagesTraversed}\n`;
  md += `- Avg Latency: ${cursorResult.latencyMs.avg.toFixed(2)}ms\n`;
  md += `- p95 Latency: ${cursorResult.latencyMs.p95?.toFixed(2)}ms\n`;
  
  fs.writeFileSync(path.join(dir, 'latest.md'), md);
  console.log(`\n✅ Reports generated in performance-reports/phase-8.1/`);
}

main().catch(console.error);
