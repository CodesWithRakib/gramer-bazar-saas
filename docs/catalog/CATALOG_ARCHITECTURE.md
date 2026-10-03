# Gramer Bazar — Scalable Catalog Architecture

## 1. Purpose

The catalog engine represents complex product taxonomies **without hard-coding
category-specific behaviour**. Electronics is the first implementation; Medicine,
Grocery, Fashion and Cosmetics reuse the exact same tables, services and
components.

The pipeline is:

```text
CATEGORY ──► PRODUCT TYPE ──► ATTRIBUTE SCHEMA ──► PRODUCT ──► VARIANT ──► SKU ──► SELLER ──► INVENTORY
                                                   │
                                            SEARCH · FILTER · SORT · PAGINATION · BRAND · PRICE · OFFER · REVIEW
```

## 2. Core separation of concerns

| Concept | Table | Meaning |
| --- | --- | --- |
| Category | `categories` | Navigable node in an unlimited-depth tree |
| Product Type | `product_types` | The concrete kind of product a category sells (Processor, Monitor…) |
| Attribute | `attributes` | Reusable property definition (Socket, Screen Size…) |
| Attribute Option | `attribute_options` | Allowed value for SELECT / MULTI_SELECT attributes |
| Product Type ↔ Attribute | `product_type_attributes` | Which attributes apply to a product type, plus filter/required/group config |
| Product | `products` | A sellable master item, linked to one category + optional product type |
| Spec value | `product_attribute_values` | Typed structured specification value on a product |
| Variant | `product_variants` | Variant axis combination + unique SKU |
| Listing | `seller_products` | A shop's price/offer for a variant |
| Inventory | `inventory` | Stock balance for a listing |

> **Rule:** never encode a product characteristic as a category. `Socket`,
> `Brand`, `Screen Size` and `Generation` are attributes, not categories.

## 3. Database relationships

```text
categories (parent_id, level, path)
   ▲
   │ category_id (CASCADE)
product_types
   ├── product_type_attributes ──► attributes ──► attribute_options
   └── products.product_type_id (SET NULL)
                        │
                        ├── product_attribute_values (attribute_id, option_id)
                        └── product_variants ──► seller_products ──► inventory
```

Foreign-key delete behaviour:

- `categories.parent_id` → `CASCADE` (children removed with parent)
- `product_types.category_id` → `CASCADE`
- `product_type_attributes.*` → `CASCADE`
- `product_attribute_values.product_id` → `CASCADE`
- `product_attribute_values.option_id` → `SET NULL`
- `products.product_type_id` → `SET NULL`
- `products.category_id` → `RESTRICT` (existing behaviour preserved)

## 4. Deep hierarchy

`categories` carries a materialized `level` and `path`
(`electronics/computers-pc/pc-components/processor`). This means:

- unlimited depth, unlike the previous 2-level relations
- subtree reads via `path = :path OR path LIKE :path || '/%'`
- breadcrumbs resolved without loading the whole tree
- moving a node triggers a single recursive pass that refreshes descendants

## 5. Backend modules

```
apps/api/src/catalog/
  attributes/            AttributesService + controller (CRUD + options)
  product-types/         ProductTypesService + controller (CRUD + mappings + facets)
  products/
    products.service.ts                     admin product CRUD (product type + specs)
    product-attribute-values.service.ts     typed spec persistence + read grouping
  categories/            deep tree + level/path maintenance
```

Public storefront reads live in `apps/api/src/public/`:

- `GET /public/categories/tree` — deep tree with product counts and product types
- `GET /public/categories/:slug` — node + breadcrumb + children + product types
- `GET /public/catalog/facets` — dynamic filter facets
- `GET /public/catalog/search` — listing with dynamic attribute filters

## 6. Frontend

- `features/catalog/catalogApi.ts` — typed RTK Query endpoints
- `app/[lang]/(public)/categories/[slug]` — category page with breadcrumb,
  product-type pills and dynamic filters
- `components/catalog/ProductFilterSidebar.tsx` — renders facets from the API
- `components/catalog/ProductDetailsClient.tsx` — grouped structured specs
- `features/seller/products/...` — category-aware product form
- `features/admin/products/components/ProductsHubView.tsx` — catalog hub cards
- `features/admin/products/components/AdminProductTypesView.tsx` +
  `ProductTypeDialogs.tsx` — product-type + attribute-schema management
- `features/admin/products/components/AdminAttributesView.tsx` +
  `AttributeDialogs.tsx` — reusable attribute & option management
- `features/admin/products/components/ProductAttributesSection.tsx` — dynamic
  specification fields in the admin product create/edit dialogs

## 7. Adding a brand-new vertical (e.g. Medicine)

See `CATEGORY_TAXONOMY.md` §"Adding Medicine later" and
`ELECTRONICS_TAXONOMY.md`. In short: add taxonomy + attributes to a data file,
add a seeder method, and everything else (filters, spec tables, forms) works
automatically. No `if (category === "medicine")` code is required.
