# Phase 8.1 - Production Load-Test Baseline

**Timestamp:** 2026-10-04T04:33:03.923Z
**Environment:** local
**Base URL:** http://localhost:4000
**Duration per test:** 2s (Warmup: 1s)

## Baseline Comparison (Historical Phase 7 SQL vs HTTP)
*Note: Phase 7 recorded internal SQL execution + Node.js hydration time. Phase 8.1 records full HTTP request round-trip latency.*
- Phase 7 `price_asc`: ~41ms
- Phase 7 `newest`: ~228ms
- Phase 7 `name_asc`: ~688ms

## HTTP Load Test Results

| Scenario | Concurrency | RPS | p50 (ms) | p95 (ms) | p99 (ms) | Error % |
| -------- | ----------: | --: | -------: | -------: | -------: | ------: |
| catalog_newest | 10 | 9 | 1273 | undefined | 1590 | 0.00 |
| catalog_price_asc | 10 | 17 | 528 | undefined | 790 | 0.00 |
| catalog_price_desc | 10 | 20 | 380 | undefined | 745 | 0.00 |
| catalog_name_asc | 10 | 0 | 0 | undefined | 0 | NaN |
| search_english | 10 | 12 | 700 | undefined | 1143 | 0.00 |
| search_bangla | 10 | 0 | 0 | undefined | 0 | NaN |
| search_partial | 10 | 5 | 1543 | undefined | 1711 | 0.00 |
| search_typo | 10 | 0 | 0 | undefined | 0 | NaN |
| search_short | 10 | 6.5 | 1103 | undefined | 1670 | 0.00 |
| filter_price | 10 | 15.5 | 576 | undefined | 781 | 0.00 |
| filter_stock | 10 | 16.5 | 427 | undefined | 922 | 0.00 |
| mixed_realistic_traffic | 10 | 16 | 488 | undefined | 905 | 0.00 |

## Cursor Traversal (Sequential)
- Pages Traversed: 100
- Avg Latency: 168.57ms
- p95 Latency: 223.98ms
