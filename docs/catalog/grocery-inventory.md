# Grocery Inventory, Batch & Expiry

Grocery inventory reuses the shared inventory and the **Medicine batch/expiry
stack**. Nothing grocery-specific was built.

## Inventory

Each sellable variant maps to a `SellerProduct` → `Inventory` row (`quantity`,
`lowStockThreshold`). This is the same path Electronics/Medicine use; the seed
sets stock per variant, so a product can have different availability per weight
(e.g. rice 1 kg in stock, 25 kg low).

## Batch registry (reused)

Table `medicine_batches` is generic despite its name:

- `product_variant_id`, `batch_number` (unique per variant)
- `manufacturing_date`, `expiry_date`, `quantity`, `reserved_quantity`
- `status`: `ACTIVE | EXPIRED | BLOCKED | DEPLETED`

`MedicineInventoryService` provides the reusable expiry-aware operations:

- `evaluateVariants(variantIds, now)` — per-variant sellable qty from non-expired batches
- `allocateFefo(variantId, qty, now)` — First-Expiry-First-Out allocation
- `expireStaleBatches(now)` — flips past-dated batches to `EXPIRED`

## Rule: batches only where they matter

A variant with **no batches** is unaffected — cart/checkout fall back to plain
`Inventory.quantity`. Grocery applies batches only to perishables/packaged goods:

| Category | Batches? |
| --- | --- |
| Rice, lentils, oil, cleaning | ❌ no (shelf-stable) |
| Spices, packaged food, beverages, bakery | ✅ yes |
| Dairy, frozen food | ✅ yes (strongest expiry need) |
| Fresh produce, meat, fish | shelf-life attribute; batch optional |

## Cart / checkout guarantees

`apps/api/src/public/cart/cart.service.ts` rejects a batch-tracked variant when
no unexpired stock exists (`No unexpired stock is available for this medicine`),
so expired groceries cannot be sold. Checkout revalidates price, stock, seller
and variant state inside a transaction.

## Seed coverage

| Batch state | Demo item |
| --- | --- |
| ACTIVE | `SALT-2028-A`, `TURMERIC-2027-A`, `PARATHA-2028-A`, … |
| EXPIRED | `MILK-EXPIRED-C` on *Demo Fresh Milk 500 ml* (2025-01-31) |
| DEPLETED | `NUGGETS-2028-A` on out-of-stock *Frozen Chicken Nuggets* |
| BLOCKED | supported by the enum; admin-managed |

E2E (`catalog-grocery.spec.ts`) asserts an out-of-stock grocery product is not
purchasable. Expiry behaviour itself is covered by the shared
`medicine-inventory.service.spec.ts` and cart specs.
