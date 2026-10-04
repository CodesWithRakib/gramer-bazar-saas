# Phase 8.1 - Load Testing

## Prerequisites
- Node.js 18+
- pnpm 8+
- Autocannon (installed via `pnpm add -D autocannon @types/autocannon`)

## Database Setup
Ensure the database is running with enough connections to support your desired concurrency.
By default, the TypeORM pool config uses 10 connections.

## Performance Dataset Setup
To seed the database with the large performance dataset (150K products, 392K seller products):
```bash
pnpm --filter api seed:perf
```

## Environment Variables
The load tester relies on strict safety toggles. To run the load test, you MUST explicitly provide the environment variables:
- `LOAD_TEST_ENABLED=true`
- `LOAD_TEST_ENV=local`
- `LOAD_TEST_BASE_URL=http://localhost:4000`

Optional configuration:
- `LOAD_TEST_DURATION=30` (Seconds per scenario, default 30)
- `LOAD_TEST_WARMUP=5` (Warmup seconds per scenario, default 5)
- `LOAD_TEST_CONCURRENCIES=1,5,10,25,50,100` (Concurrency matrix for `--matrix`)
- `LOAD_TEST_MIX_CATALOG_NEWEST=40` (Percentage for mixed traffic newest)

## Starting the API
Start the API in production mode for accurate benchmarking:
```bash
NODE_ENV=production PERFORMANCE_DB=true pnpm --filter api start:prod
```

## Running Load Tests
### Running Individual Scenarios (Quick Test)
Runs all scenarios with concurrency = 10.
```bash
$env:LOAD_TEST_ENABLED="true"; $env:LOAD_TEST_ENV="local"; $env:LOAD_TEST_BASE_URL="http://localhost:4000"; pnpm --filter api load:test
```

### Running Concurrency Matrix
Runs the full concurrency matrix:
```bash
$env:LOAD_TEST_ENABLED="true"; $env:LOAD_TEST_ENV="local"; pnpm --filter api load:test:matrix
```

### Running Cursor Pagination Test
Tests sequential deep cursor pagination (page 1, 10, 50, 100):
```bash
$env:LOAD_TEST_ENABLED="true"; $env:LOAD_TEST_ENV="local"; pnpm --filter api load:test:cursor
```

## Reading Reports
After running the script, a report will be generated at:
`performance-reports/phase-8.1/latest.json`
`performance-reports/phase-8.1/latest.md`

## Safety Warnings
- NEVER run this script against a production database. The script explicitly crashes if `LOAD_TEST_ENV=production` is detected.
- Never manually override the safety checks to point at external production URLs.

## Troubleshooting
- **Connection Refused:** Ensure the API is running on `http://localhost:4000`.
- **Pre-flight Error / Missing Signature:** Ensure the API dataset is seeded and returning valid data.
- **Timeout / Dropped Connections:** The database connection pool may be saturated. Reduce the concurrency levels if your local machine cannot handle the load.
