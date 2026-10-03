# Medicine & Health Vertical

The second vertical powered by the **same universal catalog engine** that powers
Electronics. Nothing in the taxonomy, product type, attribute, variant, SKU or
inventory layers is medicine-specific — only four genuinely new concepts were
added, and they are additive and nullable so every other vertical is untouched.

```
                    CATALOG ENGINE (shared)
                            │
        ┌───────────────────┼───────────────────┐
    Electronics         Medicine           Future verticals
    Categories          Categories
    Product Types       Product Types
    Attributes          Attributes
    Brands              Brands
    Variants / SKU      Variants / SKU
    Inventory           + Ingredients (composition)
                        + Manufacturers
                        + Batches / Expiry / FEFO
                        + requiresPrescription
```

## 1. Taxonomy (`medicine-health`)

Root `medicine-health` (English: *Medicine & Health*, Bangla: *ঔষধ ও স্বাস্থ্য*),
flagged `isRegulated = true` on the whole subtree. Current seed produces **40
categories** across arbitrary depth, e.g.:

```
Medicine & Health
├── Prescription Medicine → Antibiotics / Blood Pressure / Antidiabetic
├── Over-the-Counter Medicine → Antacids / Probiotics
├── Pain Relief
│   ├── Analgesics → Paracetamol / NSAIDs
│   ├── Muscle & Joint Pain
│   └── Headache & Migraine
├── Cold, Cough & Flu → Cough Syrups / Cold & Flu / Sore Throat
├── Allergy & Sinus
├── Digestive Health
├── Vitamins & Supplements → Multivitamins / Vitamin C / Vitamin D / Calcium & Bone
├── Diabetes Care
├── Heart & Blood Pressure Care
├── Skin Care & Dermatology
├── Eye & Ear Care
├── Oral & Dental Care
├── Women's Health
├── Men's Health
├── Baby & Child Health
├── First Aid
├── Medical Devices → Thermometers / Nebulizers / Pulse Oximeters
├── Personal Care & Hygiene
└── Other Health Products
```

**Generic names are NOT categories.** Paracetamol, Ibuprofen, etc. are product
metadata (the `ingredients` table + the `generic-name` attribute), which is what
prevents category explosion.

## 2. Product Types

28 data-driven product types, e.g. `pain-tablet`, `cough-syrup`, `capsule`,
`cream`, `ointment`, `eye-drops`, `toothpaste`, `hand-sanitizer`, `glucometer`,
`bp-monitor`, `medical-device`, `vitamin-capsule`, `baby-care`. Each declares its
own attribute list via `product_types` + `product_type_attributes` — there is no
`if (category === "medicine")` anywhere.

## 3. Attributes

24 reusable attributes (shared globally, reusing `warranty` from Electronics):

| Group | Attributes |
| --- | --- |
| Generic/clinical | generic-name, therapeutic-class, drug-class, indication |
| Product | dosage-form, strength, pack-size, route-of-administration, volume, net-weight |
| Safety/regulatory | prescription-required, otc-status, regulatory-status, age-group, target-gender, pregnancy-warning, storage-requirement, expiry-required, batch-required |
| Device | device-type, model, usage, power-source |

`strength` is a controlled SELECT (e.g. `500 mg`, `250 mg/5 ml`) so it is
filterable; the *precise* numeric strength per ingredient lives in
`product_ingredients`.

## 4. Composition (structured active ingredients)

`ingredients` (reusable generic substances) + `product_ingredients` (per-product
strength). Combination medicines get several rows:

```
Demo Multivitamin Capsule
  → Vitamin C  60 mg
  → Vitamin D3 400 IU
```

This is deliberately not a single free-text field.

## 5. Manufacturer vs Brand

`manufacturers` is a first-class, separate table (`products.manufacturer_id`).
Brand identity (Napa) and legal producer (Beximco Pharmaceuticals Ltd.) can
differ, which the generic `brands` table cannot express. Suppliers/manufacturers
are never modelled as categories.

## 6. Batches, FEFO & expiry enforcement

`medicine_batches` attaches to a **sellable variant** (`product_variant_id`) and
tracks `batch_number`, `manufacturing_date`, `expiry_date`, `quantity`,
`reserved_quantity`, `supplier`, `purchase_cost` and a `BatchStatus`
(`ACTIVE | EXPIRED | BLOCKED | DEPLETED`).

`MedicineInventoryService` (`catalog/medicine/`) provides:

- `evaluateVariants(variantIds)` — total sellable quantity per variant.
- `allocateFefo(variantId, qty)` — First-Expiry-First-Out allocation.
- `expireStaleBatches()` — mark past-expiry batches `EXPIRED` (schedulable).

**Non-breaking rule:** variants *without* batches are absent from the result, so
callers fall back to the plain `inventory.quantity`. Electronics and every future
non-medicine vertical behave exactly as before.

Cart validation (`public/cart`) now:
- rejects items whose batch-tracked variant has no unexpired stock
  (`"No unexpired stock is available for this medicine"`);
- surfaces `requiresPrescription` for the (future) prescription workflow.

## 7. Prescription-ready architecture (extension point — NOT a full workflow)

- `products.requires_prescription` (indexed boolean) — fast sellability flag.
- `attributes.prescription-required` / `otc-status` — display + filtering.
- `ingredients.is_prescription_only` — data-level capability.

No upload/verification workflow is implemented because no business requirement
defines it. The suggested future states are documented only:
`NOT_REQUIRED → REQUIRED → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED`.
**This is an unresolved business decision** (see §10).

## 8. Database changes

Migration `1791500000000-MedicineCatalog` (idempotent, registered in `app.module`):

| Object | Notes |
| --- | --- |
| `manufacturers` | + index `is_active` |
| `products.manufacturer_id` | nullable + FK + index |
| `products.requires_prescription` | boolean default false + index |
| `ingredients` | + index `is_active` |
| `product_ingredients` | unique `(product_id, ingredient_id)` + indexes |
| `medicine_batches` | enum `medicine_batches_status_enum`, unique `(product_variant_id, batch_number)`, indexes on variant/expiry/status |

`down()` fully reverses it. Existing Electronics data is never touched.

## 9. API

Reused as-is (medicine appears automatically): categories, products, product
types, attributes, public categories/catalog/facets/search, cart validation.

New & fully Swagger-documented:
- `catalog/manufacturers` + `manufacturers` — list (search/isActive), get,
  create/patch/delete (ADMIN or SUPER_ADMIN; `brands.*` permissions; delete
  refused while products reference it).
- `catalog/ingredients` + `ingredients` — list/search active pharmaceutical
  substances (name, slug, isPrescriptionOnly, isActive), get by ID, create/patch/delete
  (ADMIN or SUPER_ADMIN; deletion blocked if referenced in product composition).
- `catalog/medicine/batches` + `medicine/batches` — physical stock batch intake
  and FEFO management (productVariantId, batchNumber, mfgDate, expiryDate, quantity,
  purchaseCost, supplier, status: ACTIVE | EXPIRED | BLOCKED | DEPLETED) with
  automatic expiry classification.

## 10. Seed data, UI & QA

`medicine-taxonomy.data.ts` seeds clearly-labelled **DEMO** data: 4 manufacturers,
6 brands, 13 products (tablets, capsules, syrup, cream, devices, hygiene, baby,
women's health), 8 ingredients, and batches including one deliberately
**EXPIRED** batch (`PARA-EXPIRED-C`, 2025-01-31) to exercise expiry blocking.

Frontend & UI implementations:
- `AdminManufacturersView` — full admin management view with search, pagination,
  and create/edit/delete dialogs in Admin & SuperAdmin Products Hubs.
- `ProductDetailsClient` (PDP) — Manufacturer badges and metadata table rows,
  prominent `Rx` Prescription Required badges, and Medicine Safety Advisory notices.
- `ProductCard` — Medicine & Health category theme, activity icon, and `Rx` badge overlay.
- Bilingual localization in `en.json` and `bn.json`.

Tests:
- `medicine-inventory.service.spec.ts` — 5 cases: non-batch passthrough, active
  filtering, expired/blocked/depleted exclusion, FEFO ordering, insufficient stock.
- `ingredients.service.spec.ts` — 4 cases: slug generation, search, 404 validation,
  referenced deletion prevention.
- `medicine-batches.service.spec.ts` — 5 cases: batch creation, variant validation,
  automatic expiry detection, FEFO ordering.
- `seeder.service.spec.ts` — updated DI; full suite **277 passing**.
- `tests/catalog-medicine.spec.ts` (Playwright) — customer browse → product →
  specs → manufacturer & safety advisory verification.

## 11. Remaining business decisions (NOT invented)

1. **Prescription workflow** — upload, pharmacist verification, rejection, audit.
2. **Regulatory rules** — which substances are narcotic/restricted in Bangladesh,
   and whether those may be sold at all.
3. **Expiry policy details** — sell-through window before expiry (e.g. block
   within N days of expiry rather than on the day), returns of near-expiry stock.

The architecture is in place for each; none are hard-coded.
