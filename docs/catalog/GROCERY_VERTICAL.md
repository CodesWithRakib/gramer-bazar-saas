# Grocery, Fresh Food & Daily Essentials Vertical

The **third vertical** powered by the same universal catalog engine that powers
Electronics and Medicine. Nothing was rebuilt: the taxonomy, product types,
attributes, variant/SKU, inventory, batch/expiry (FEFO), cart, order, analytics
and RBAC layers are all shared. Grocery is **data**, not a new subsystem.

```
                  UNIVERSAL CATALOG ENGINE (shared, unchanged)
                           │
          ┌────────────────┼──────────────────┐
    Electronics        Medicine           Grocery & Daily Essentials
    Categories         Categories         Categories
    Product Types      Product Types       Product Types
    Attributes         Attributes         Attributes
    Brands             Brands             Brands
    Variants / SKU     Variants / SKU     Variants / SKU (weight/volume/unit)
    Inventory          Inventory          Inventory
                       Batches + Expiry   Batches + Expiry (reused)
                       FEFO               FEFO (reused)
```

## 1. What was reused (audit result)

| Concern | Reused as-is | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` |
| Attribute engine (`attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values`) | ✅ | `upsertVerticalAttributes` / `saveVerticalSpecs` |
| Brands | ✅ | `upsertVerticalBrands` |
| Variants / SKU | ✅ | `SeedVerticalVariant` (weight, volume, pack size as variant axes) |
| Inventory | ✅ | `Inventory` via `SellerProduct` |
| Batch / Expiry / FEFO | ✅ | `medicineBatches` + `MedicineInventoryService` |
| Cart / Checkout / Order / Delivery / Payment / Refund / Dispute | ✅ | expiry-aware cart validation already generic |
| Search / dynamic filters / facets | ✅ | `ProductTypesService.getFacets` |
| Analytics / RBAC / translations | ✅ | no grocery-specific code |

**No new database tables, no new columns, no new migration.** Grocery is modelled
entirely by the existing generic entities (see §7 for the documented decisions
about concepts that were *not* added).

## 2. Taxonomy (`grocery`)

Root `grocery` — *Grocery & Daily Essentials* / *মুদি ও নিত্যপ্রয়োজনীয়*. The seed
produces **66 categories** across arbitrary depth, e.g.:

```
Grocery & Daily Essentials
├── Fresh Produce → Vegetables / Fruits / Herbs & Greens / Seasonal Produce
├── Meat & Poultry → Beef / Chicken / Mutton / Other Meat
├── Fish & Seafood → Fresh Fish / Frozen Fish / Seafood / Dried Fish
├── Rice & Grains → Rice / Wheat / Flour / Corn / Other Grains
├── Lentils & Pulses
├── Cooking Essentials → Cooking Oil / Salt / Sugar / Vinegar / Cooking Ingredients
├── Spices & Seasonings → Whole / Ground / Mixes / Herbs
├── Dairy & Eggs → Milk / Yogurt / Cheese / Butter / Eggs
├── Bakery → Bread / Biscuits / Cakes / Bakery Snacks
├── Snacks & Confectionery → Chips / Chocolate / Candy / Nuts
├── Beverages → Water / Juice / Soft Drinks / Tea / Coffee
├── Frozen Food
├── Canned & Packaged Food
├── Instant & Ready Food
├── Baby Food
├── Household Cleaning → Laundry / Dishwashing / Floor / Toilet
└── Kitchen & Household Essentials
```

### Why weight is NOT a category

The master spec explicitly forbids category explosion. Weight/volume/unit are
**attributes**, and each sellable size is a **variant**:

```
Category: Grocery → Rice & Grains → Rice
Product:  Demo Miniket Rice
Variants: 1 kg · 5 kg · 25 kg      ← never 1 kg/2 kg/5 kg/… categories
```

### Slug namespacing

Descendant slugs are namespaced `grocery-*` (e.g. `grocery-rice-grains`,
`grocery-vegetables`). This guarantees **global slug uniqueness** across
verticals and — importantly — avoids re-parenting any pre-existing legacy
category rows that the base catalogue seed (`catalog_seed.json`) owns. Seeding is
therefore **stable across repeated runs** (no parent flip-flop between the base
seed and the vertical seed).

## 3. Product Types (17)

`Fresh Produce`, `Meat`, `Fish`, `Grain`, `Pulse`, `Cooking Oil`, `Spice`,
`Dairy Product`, `Bakery Product`, `Snack`, `Beverage`, `Frozen Food`,
`Packaged Food`, `Instant Food`, `Baby Food`, `Cleaning Product`,
`Household Product`.

Product types are attached to the section node they belong to (e.g. `grocery-grain`
on *Rice & Grains*), exactly like Electronics/Medicine. Each product type carries
its own mix-and-match attribute list, so filters never show globally irrelevant
attributes (a rice never shows *Scent*; a detergent never shows *Rice Type*).

> Facets are generated for a category **and its descendants**. Because a product
> type is attached to a section, the richest facets appear when browsing that
> section (e.g. `/en/categories/grocery-rice-grains`) — the same behaviour as the
> Medicine vertical.

## 4. Attributes (35)

Discovery attributes (filterable): `Origin`, `Grade`, `Organic`, `Variety`,
`Produce Type`, `Weight`, `Volume`, `Unit`, `Pack Size`, `Pack Count`,
`Packaging Type`, `Flavor`, `Rice Type`, `Meat Type`, `Cut Type`, `Fish Type`,
`Freshness`, `Season`, `Processing`, `Cleaning Type`, `Scent`, `Detergent Form`,
`Storage Type`, `Shelf Life`.

Support-only attributes (seller/admin entered, deliberately **not** filterable and
**never auto-populated or inferred**): `Ingredient Statement`, `Nutrition Notes`,
`Allergens`, `Dietary Type`, `Calories`, `Protein`, `Carbohydrates`, `Fat`,
`Sugar`, `Sodium`, `Batch / Expiry Tracking Required`.

All attribute slugs are namespaced `grocery-*` so they cannot clobber the shared
Electronics/Medicine attribute dictionary (the engine upserts attributes by
global slug).

## 5. Units & variants

Structured `quantity + unit`, never only a free-text `"5kg pack"`:

- **Weight** options: `50 g → 25 kg`
- **Volume** options: `100 ml → 5 L`
- **Unit**: `g, kg, ml, L, piece, pack, box, dozen, bundle, bottle, jar, can, packet`
- **Pack size / pack count** for piece/bundle products (e.g. eggs 6/12 pcs, paratha 8 pcs)

`Weight`, `Volume`, `Unit`, `Pack Size` are flagged `isVariantAxis`, so a single
product exposes several sellable SKUs with independent price/inventory/barcode.

## 6. Batch, Expiry & FEFO (reused)

Perishable / frozen / packaged products reuse the Medicine batch stack:

- `medicine_batches` (variant-level batch number, manufacturing/expiry date, qty, status)
- `MedicineInventoryService.allocateFefo` / `evaluateVariants` / `expireStaleBatches`
- Expiry-aware cart validation (`cart.service.ts`) rejects variants whose batches
  are all expired/depleted/blocked.

**Rule:** a variant that has **no** batches is unaffected — the cart falls back to
plain `Inventory.quantity`. That is why Electronics stays untouched and why
expiry is only applied where it genuinely matters.

Seed covers all four batch states: an **ACTIVE** batch, an **EXPIRED** test batch
(`MILK-EXPIRED-C` on *Demo Fresh Milk 500 ml*), a **DEPLETED** batch on the
out-of-stock *Frozen Chicken Nuggets*, and the enum supports **BLOCKED** for admin
use. Non-perishables (rice, oil, spices, cleaning) intentionally carry no batches.

## 7. Documented decisions (NOT invented)

Per the master prompt's "do not invent" rule, the following were deliberately
**not** implemented and remain business decisions:

1. **Nutrition values, allergens, dietary/health claims** are modelled as
   attributes but left unpopulated in demo data. Nothing is inferred from product
   names. They are non-filterable so empty claims never appear as filters.
2. **Variable-weight pricing** (e.g. "2.3 kg beef → price × actual weight") is not
   supported by the current order/inventory architecture. The extension point is
   the variant axis `Weight` + `Inventory`; proportional pricing is *not* assumed.
3. **Legacy root categories.** The base seed already ships a legacy `grocery`
   root (with children `rice`, `dal`, `oil`, …) and a separate `fresh-vegetables`
   root. This vertical enriches the `grocery` root and adds the new namespaced
   engine taxonomy. Consolidating the legacy children / `fresh-vegetables` root
   into the new taxonomy is a future data-migration decision (destroying existing
   rows was out of scope).
4. **Precise geographic fields** (District / Upazila / Farm / Producer) beyond the
   existing `Origin` attribute were not added — the business model does not yet
   require them.

## 8. Seed data

`apps/api/src/seeder/data/grocery-taxonomy.data.ts` exports `GROCERY_VERTICAL : SeedVertical`,
registered in `SeederService.seedCatalogVerticals()`.

Seed output: **66 categories, 17 product types, 35 attributes, 34 demo products**,
multiple brands (Pran, Fresh, ACI, Radhuni, Teer, Ifad, Rashid Agro), many
variants across weights/volumes/units, batches on perishables/packaged goods, an
expired test batch and an out-of-stock product.

## 9. APIs

No grocery-specific endpoints were added — the existing generic catalog APIs
serve Grocery:

- `GET /public/categories/:slug`, `GET /public/categories/tree`
- `GET /public/catalog/facets?categoryPath=…`
- `GET /public/catalog/search?q=…`
- `GET /public/catalog/:slug`, `GET /public/catalog/:slug/related`
- Admin: `/product-types`, `/attributes`, `/brands`, `/categories`
- Seller: existing product/inventory/batch endpoints

Swagger regenerated and exported (`swagger-spec.json`).

## 10. QA

- API: full Vitest suite green (see §"Automated tests" in the summary).
- E2E: `apps/e2e/tests/catalog-grocery.spec.ts` — browse taxonomy, dynamic
  `Origin` facet, structured specs, weight variants, out-of-stock, Bangla
  storefront, admin product types.
- Regression: Electronics + Medicine facets and product detail verified live.

See also: [`grocery.md`](./grocery.md), [`grocery-taxonomy.md`](./grocery-taxonomy.md),
[`grocery-attributes.md`](./grocery-attributes.md), [`grocery-inventory.md`](./grocery-inventory.md).
