# Variant System

## 1. Specs vs variants

- **Specifications** (`product_attribute_values`) describe what the product *is*
  (NVMe, M.2 2280, 5 Years warranty).
- **Variants** (`product_variants`) describe sellable variations (1TB / 2TB) and
  own the unique **SKU**.

Example — Samsung SSD:

```text
Specs:  Interface = NVMe PCIe 4.0, Form Factor = M.2 2280, TBW = 600
Variant: 1TB   → SKU SSD-SAM-980PRO-1TB
Variant: 2TB   → SKU SSD-SAM-980PRO-2TB
```

## 2. Entities

`product_variants`

| Column | Notes |
| --- | --- |
| `id` | uuid PK |
| `product_id` | FK → products, `CASCADE` |
| `name_en` / `name_bn` | variant label |
| `sku` | unique |
| `images` | jsonb URL array |
| `attributes` | jsonb variant-axis values, e.g. `{ "capacity": "2tb" }` |
| `is_active` | visibility |

`seller_products` (listing) and `inventory` remain the price/stock layer:

```text
product_variants ──► seller_products ──► inventory
                          │
                     price · discountPrice · sellerSku · shop
```

## 3. How variants are created

- **Admin/global products:** `ProductsService.create` always creates a default
  variant so every product is immediately sellable. Additional variants are
  created via `ProductVariantsService`.
- **Seller products:** the seller transaction creates the master product, its
  default variant, the `SellerProduct` listing and `Inventory` together.
- **Seed data:** `SeedElectronicsProduct.variants[]` defines variants with
  `attributes` (variant axes), each seeded with its own SKU, listing and stock.

## 4. Variant axes

`attributes.is_variant_axis = true` (e.g. `capacity`) marks attributes intended
for variant construction. Variant axis values are stored in
`product_variants.attributes` as a JSON map keyed by attribute slug.

## 5. Preservation rules

- Variants are never duplicated across products; a variant belongs to exactly one
  master product.
- Deleting a product cascades to its variants; deleting a variant is restricted
  while a `seller_products` listing references it.
- Archiving a product deactivates its variants and listings rather than deleting
  them, protecting order history.
