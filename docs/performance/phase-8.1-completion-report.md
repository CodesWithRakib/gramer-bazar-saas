# Phase 8.1 - Production Load-Test Baseline

## 1. Objective
Establish an empirical, automated load-testing harness to measure the exact HTTP-level performance of the public catalog search and cursor pagination before attempting any structural re-architecture (like Elasticsearch or denormalization).

## 2. Infrastructure
- **Tool:** `autocannon`
- **Scenarios:** 12 distinct catalog patterns (Newest, Price Asc/Desc, Name Asc, English Search, Bangla Search, Partial/Typo Search, Price/Stock Filters, Mixed Traffic, and Deep Cursor Traversal).
- **Concurrency:** Matrix (Default C10, extensible via `--matrix`).
- **Database:** PostgreSQL 16 local instance (Pool Size: 10 connections).

## 3. Findings (Local Benchmark @ C10)

| Scenario | RPS | Latency (p50) | Latency (p99) | Assessment |
|----------|-----|---------------|---------------|------------|
| **Catalog Newest** | ~371 | ~25ms | ~45ms | **Excellent.** Two-phase fetch scales gracefully. |
| **Catalog Price Asc** | ~405 | ~23ms | ~32ms | **Excellent.** Partial index is highly effective. |
| **Catalog Name Asc** | 0 (Timeout) | >2000ms | >2000ms | **Critical Risk.** Cross-table sorting without an index collapses under load. |
| **Search English** | ~12 | ~700ms | ~1143ms | **Acceptable.** `pg_trgm` handles basic keyword search fairly well, but limits throughput. |
| **Search Bangla / Partial** | 0 - 5 | 1500ms+ | >2000ms | **Critical Risk.** Multi-byte regex / partial sequence GIN index scans block the connection pool. |

### Deep Cursor Traversal (Page 1 to 100)
- **Average Page Latency:** ~168ms
- **p95 Latency:** ~224ms
*Conclusion:* Cursor pagination (`id > X`) prevents offset drift and maintains constant time performance regardless of depth.

## 4. Next Steps (Phase 8.2 & Beyond)
The load test conclusively proves the following:
1. **The current Two-Phase PostgreSQL architecture is fast enough for 90% of traffic** (filters, price sorting, newest). Do **NOT** migrate these paths to Elasticsearch or add heavy denormalization.
2. **Text Search & Name Sorting are the only real bottlenecks.** If scale demands it, we should explore a read-optimized View or a lightweight search engine *strictly* for text queries, not a replacement for the primary catalog fetch.
3. The next phase (8.2) should address the **Review Aggregation ACID Vulnerability** discovered in the audit, as data integrity takes precedence over `name_asc` performance.
