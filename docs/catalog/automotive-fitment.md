# Automotive Vehicle Fitment & Compatibility System

## 1. Fitment Architecture
Vehicle fitment allows customers to quickly find and verify products specifically engineered for their vehicle, eliminating costly mismatches. The system models fitment as structured metadata attached to products:
- **Compatible Make:** Primary automaker (e.g. Toyota, Honda, Nissan, Yamaha, Bajaj).
- **Compatible Model & Generation:** Vehicle series with generational year bounds (e.g. `Toyota Corolla / Axio (2012–2020)`).
- **Fitment Type:** `Direct OEM Fit (Vehicle-Specific)` vs. `Universal Fit (All Models)` vs. `Performance Upgrade`.
- **Mounting Position:** Front Axle, Rear Axle, Engine Bay, Interior, etc.
- **Part Classification:** OEM Genuine Factory Part, OEM Equivalent Specification, or Premium Aftermarket.

## 2. Customer Fitment Experience
1. **Category & Facet Filtering:** Customers can filter replacement parts directly by automaker (`auto-compatible-make`) and vehicle model (`auto-compatible-model`).
2. **Product Detail Fitment Confirmation:** Every compatible product prominently displays:
   - Green `✓ Direct Fit: [Vehicle Model]` badge in the Purchase Box.
   - Exact mounting position tag (e.g., `Front Axle`).
   - Manufacturer part classification and warranty period.
3. **Safety & Technical Installation Advisory:** A dedicated advisory banner appears on all automotive product detail pages instructing customers to confirm vehicle year ranges and utilize certified technicians for critical safety installations.

## 3. Universal Catalog Synergy
Unlike legacy ecommerce setups that duplicate databases with rigid ACES/PIES tables, Gramer Bazar models fitment cleanly through the universal attribute engine. This guarantees:
- Compatibility data is immediately indexed by the global Elasticsearch / full-text engine.
- Filters, facets, and sorting operate without expensive N+1 joins.
- Sellers can supply structured fitment during standard product creation.
- Zero separate tables, zero schema drift.
