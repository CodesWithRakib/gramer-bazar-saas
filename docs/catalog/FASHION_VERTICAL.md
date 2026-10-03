# Fashion, Clothing & Apparel Vertical

The **fourth vertical** on the universal catalog engine (after Electronics,
Medicine and Grocery). Nothing was rebuilt. Fashion reuses categories, product
types, attributes, brands, variants/SKU, inventory, search, filters, cart,
orders, analytics and RBAC — it is **configuration + data**.

```
                  UNIVERSAL CATALOG ENGINE (shared)
                           │
        ┌──────────┬───────┼────────┬─────────┐
        │          │       │        │         │
   Electronics  Medicine Grocery  Fashion   Future
     Products   Products Products Products
     Variants   Variants Variants Variants (colour × size)
     Attributes Attributes Attributes Attributes (+ colour swatch)
     Inventory  Inventory Inventory Inventory
```

## 1. What was reused (audit result)

| Concern | Reused | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` |
| Attribute engine (incl. SELECT option sets) | ✅ | `attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values` |
| Brands | ✅ | `upsertVerticalBrands` |
| Variants / SKU / Inventory | ✅ | colour & size are variant attributes |
| Search / dynamic filters / facets | ✅ **extended** | variant-axis attributes now filterable (see §5) |
| Cart / Checkout / Order / Analytics / RBAC / i18n | ✅ | cart validates colour+size variant server-side |
| Image storage | ✅ | `ProductVariant.images` (variant-aware) reused |

No Fashion-specific product/category/attribute/filter/SKU/inventory/cart/order
copies exist.

## 2. Database changes (minimal & generic)

Only one additive, generic column:

- `attribute_options.hex_color` — nullable swatch colour (e.g. `#1a1a1a`).

Migration `1791700000000-FashionColorSwatches` (idempotent, `IF NOT EXISTS`).
**No `Color` / `SizeSystem` / `Size` tables were created** — see §6 for why and
for the extension point.

## 3. API changes

No new endpoints. `AttributeOptionDto` gained an optional `hexColor`, and the
facets response's option payload gained `hexColor`. Swagger regenerated
(267 endpoints / 247 schemas).

## 4. Taxonomy (`clothing`)

Root `clothing` — *Fashion & Clothing* / *পোশাক ও ফ্যাশন* — **66 categories**:

```
Fashion & Clothing
├── Men's Fashion → T-Shirts / Shirts / Polo / Pants / Jeans / Panjabi / Pajamas /
│                   Shorts / Jackets / Sweaters & Hoodies / Suits / Underwear / Traditional
├── Women's Fashion → Saree / Salwar Kameez / Kurti / Tops / Dresses / Shirts /
│                     Pants / Jeans / Skirts / Hijab / Abaya / Jackets / Innerwear
├── Kids' Fashion → Boys / Girls / Baby / School Wear / Shoes / Accessories
├── Footwear → Men's / Women's / Kids' / Sandals / Sneakers / Formal / Slippers / Sports
├── Bags → Backpacks / School / Handbags / Shoulder / Travel / Wallets
├── Fashion Accessories → Watches / Belts / Sunglasses / Caps / Scarves / Gloves / Jewelry
└── Sportswear → Jerseys / Tracksuits / Sports T-Shirts / Sports Shorts / Activewear
```

Descendant slugs are namespaced `fashion-*` so they never collide with or
re-parent the pre-existing legacy `clothing` rows (stable, idempotent seeding).
The admin can reshape the taxonomy through the existing category engine.

## 5. Colour system & variant-axis filtering

Colour is a normal SELECT attribute (`fashion-color`) with **14 options**, each
carrying a swatch hex. This keeps colour filterable and variant-addressable
without a Fashion-only table, and swatches render in the filter sidebar.

To make colour/size genuinely filterable, the **shared filter engine** was
extended (benefiting every vertical):

- `ProductTypesService.applyAttributeFilters` and the facet builder now match a
  filter against **either** a product-level spec value **or** a variant-axis
  value (`product_variants.attributes` JSON), via `jsonb_each_text`.
- Facets for `isVariantAxis` SELECT attributes are computed from variant
  attributes with live per-option counts (verified: colour options + hex, size
  options).

Verified live: Men's Fashion colour filter narrows white→13, maroon→5,
beige→0, no filter→28.

## 6. Size system & size charts

Sizes are modelled per size system as separate SELECT attributes so no single
global size system is assumed:

| Attribute | System | Values |
| --- | --- | --- |
| `fashion-size-clothing` | Clothing standard | XS…XXXL |
| `fashion-size-numeric` | Numeric waist | 28…40 |
| `fashion-size-kids` | Kids age | 0-3M…12Y |
| `fashion-size-shoe-eu` | EU shoe | 36…45 |
| `fashion-size-shoe-uk` | UK shoe | 3…10 |
| `fashion-size-shoe-us` | US shoe | 4…11 |

Product types map only the relevant size system (a T-shirt never shows EU shoe
sizes). Admin can add/edit these through the existing Attributes UI.

**Extension point (documented, not invented):** a dedicated `SizeSystem` / `Size`
/ `SizeChart` entity pair is the next step if admin-managed size charts with
typed measurement rows (Chest/Waist/Hip/Sleeve, EU/UK/US/Foot Length) are needed.
Measurements must be entered by admin/seller — never generated. A non-filterable
`fashion-size-chart` TEXT attribute is available today for entered guidance.

## 7. Attributes (29)

`Gender`, `Age Group`, `Color`¹, `Size (Clothing)¹`, `Size (Numeric)¹`,
`Size (Kids)¹`, `Shoe Size (EU/UK/US)¹`, `Material`, `Fabric Composition`,
`Pattern`, `Fit`, `Style`, `Occasion`, `Season`, `Sleeve Type`, `Neck Type`,
`Length`, `Closure Type`, `Care Instructions`, `Country of Origin`, `Size Chart`,
`Shoe Type`, `Sole Material`, `Upper Material`, `Heel Type`, `Heel Height`,
`Toe Shape`. (¹ variant axis.)

Attributes are mapped per product type, so filters never show irrelevant
attributes (a saree never shows `Heel Type`). `Material` is never inferred from
product names.

## 8. Product types (36)

T-Shirt, Shirt, Polo, Trouser, Jeans, Panjabi, Shorts, Jacket, Hoodie,
Underwear, Saree, Salwar Kameez, Kurti, Top, Dress, Hijab, Abaya, Kids' T-Shirt,
Kids' Dress, Baby Clothing, Sandal, Sneaker, Formal Shoe, Slipper, Sports Shoe,
Backpack, Handbag, Wallet, Watch, Belt, Sunglasses, Cap, Scarf, Jewelry, Jersey,
Tracksuit — all data-driven.

## 9. Variants & images

Each colour × size combination is a distinct sellable variant with its own SKU,
price and inventory:

```
Product: Demo Men's Classic Cotton T-Shirt
Variants: Black/S (10) · Black/M (20) · Black/L (0) ·
          White/S (5) · White/M (10) · White/L (3) ·
          Navy/M (8) · Navy/L (0)
```

The PDP variant selector disables out-of-stock combinations and shows an
out-of-stock label. Variant-aware images reuse `ProductVariant.images` (seed
leaves it empty; sellers upload via the existing storage system). Product-level
images are the fallback.

## 10. Seed data

`apps/api/src/seeder/data/fashion-taxonomy.data.ts` → `FASHION_VERTICAL`:
**66 categories, 36 product types, 29 attributes, 25 demo products**, 7 demo
brands, colour × size variants, mixed stock (including out-of-stock combos such
as `Black / L`), skewed gender/shoe/clothing size systems.

## 11. QA

- `apps/e2e/tests/catalog-fashion.spec.ts` — taxonomy browse, colour facet +
  swatches, size facet, colour+size variant selection, out-of-stock disabled,
  Bangla storefront, admin attributes.
- Regression: Electronics/Medicine/Grocery facets + products verified live;
  full API Vitest suite green.

See [`fashion.md`](./fashion.md), [`fashion-taxonomy.md`](./fashion-taxonomy.md),
[`fashion-variants.md`](./fashion-variants.md),
[`fashion-size-system.md`](./fashion-size-system.md).
