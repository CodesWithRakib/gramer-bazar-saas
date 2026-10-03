# Fashion Variants (Colour × Size)

Fashion uses the universal variant/SKU/inventory engine. The dominant sellable
dimension is **Colour × Size** — each combination is one SKU with its own price
and inventory.

```
Product: Demo Men's Classic Cotton T-Shirt
  Black / S  → FSH-TS-MEN-CLASSIC-BLK-S  → 10
  Black / M  → FSH-TS-MEN-CLASSIC-BLK-M  → 20
  Black / L  → FSH-TS-MEN-CLASSIC-BLK-L  →  0
  White / S  → FSH-TS-MEN-CLASSIC-WHT-S  →  5
  White / M  → FSH-TS-MEN-CLASSIC-WHT-M  → 10
  White / L  → FSH-TS-MEN-CLASSIC-WHT-L  →  3
  Navy  / M  → FSH-TS-MEN-CLASSIC-NVY-M  →  8
  Navy  / L  → FSH-TS-MEN-CLASSIC-NVY-L  →  0
```

## How it is stored

- `product_variants` — one row per colour/size combination (unique `sku`,
  `name_en`/`name_bn` = "Black / M", `attributes` JSON holds the axis values).
- Variant attributes are keyed by attribute slug, e.g.
  `{ "fashion-color": "Black", "fashion-size-clothing": "M" }`.
- `SellerProduct` + `Inventory` — per-variant price and stock.

## SKU

SKUs are unique and generated from product + colour + size (existing universal
SKU column, no Fashion-specific logic). Uniqueness is enforced by the
`product_variants.sku` unique constraint.

## Colour

Colour is the `fashion-color` SELECT attribute (14 options), each option carrying
a swatch hex (`attribute_options.hex_color`). It is a variant axis **and** a
facet, so the storefront can filter by colour and show swatches.

## Size

Size is one of several size-system attributes (see
[`fashion-size-system.md`](./fashion-size-system.md)). Each product type maps
only its relevant size system.

## Filtering

The shared filter engine was extended so attribute filters match **either**
product-level spec values **or** variant-axis values (via `jsonb_each_text`).
Facets for variant-axis attributes are computed from variant attributes with live
counts. This means Colour and Size appear as real, working facets.

## Images

Variant-aware images reuse `ProductVariant.images`; the PDP gallery swaps to the
selected variant's images and falls back to product-level images when a variant
has none. Seed variants ship without images (sellers upload via the existing
storage system).

## Availability

- PDP variant buttons for out-of-stock combinations are **disabled** and labelled
  "Out of Stock".
- Cart/checkout revalidate the selected variant, colour/size validity, price,
  stock, seller and product state server-side — frontend state is never trusted.
