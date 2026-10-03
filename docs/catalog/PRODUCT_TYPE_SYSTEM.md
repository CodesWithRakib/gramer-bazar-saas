# Product Type System

## 1. What a product type is

A **Product Type** is the concrete kind of item a category sells, and it owns the
attribute schema used for structured specs and dynamic filters.

Examples: `Processor`, `Motherboard`, `Graphics Card`, `RAM`, `SSD`, `Laptop`,
`Monitor`, `Router`.

A product type is **not** a category. One category can expose many product types
(e.g. `PC Components` → Processor, Motherboard, Graphics Card, RAM, SSD, HDD…),
and a product type is not required at all for simple verticals (Grocery).

## 2. Table

`product_types`

| Column | Notes |
| --- | --- |
| `id` | uuid PK |
| `category_id` | FK → categories, `CASCADE` |
| `name_en` / `name_bn` | bilingual |
| `slug` | unique |
| `description_en` / `description_bn`, `icon` | optional |
| `sort_order`, `is_active` | ordering/visibility |

## 3. Attribute schema

`product_type_attributes` maps attributes onto a product type with per-mapping
config:

| Column | Notes |
| --- | --- |
| `product_type_id` / `attribute_id` | unique pair |
| `is_required` | seller forms can require it |
| `is_filterable` | whether it becomes a storefront filter |
| `spec_group` | logical grouping on the product page |
| `sort_order` | display order |

## 4. API

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/product-types` | public | list (`categoryId`, `categoryPath`, `includeMappings`) |
| GET | `/product-types/:id` | public | detail |
| POST | `/product-types` | ADMIN/SUPER_ADMIN | create |
| PATCH | `/product-types/:id` | ADMIN/SUPER_ADMIN | update |
| DELETE | `/product-types/:id` | ADMIN/SUPER_ADMIN | delete (blocked if products use it) |
| GET | `/product-types/:id/attributes` | public | current mappings |
| PUT | `/product-types/:id/attributes` | ADMIN/SUPER_ADMIN | replace schema |
| GET | `/product-types/facets` | public | dynamic filter facets |

## 5. Product type compatibility

`ProductsService.validateProductType` accepts a product type when the selected
category is the product type's own category **or any descendant/ancestor** of it
(path-based). This is why a `Laptop` product may live under `Gaming Laptop`
without special-casing.

## 6. Seller flow

The seller form:

```text
Select Category (deep picker)
   ↓
Product types for the category load automatically
   ↓
Select Product Type
   ↓
Attribute fields render from the mapping schema
```

## 7. Admin management UI

The admin/super-admin catalog hub links to dedicated tools under
`/[lang]/{admin,super-admin}/products/`:

- `product-types` — **Product Types** list (`AdminProductTypesView`) with a deep
  category filter, create/edit dialogs, and a **Manage attributes** dialog
  (`ManageProductTypeAttributesDialog`) that toggles the `isRequired`,
  `isFilterable`, `specGroup` and `sortOrder` of each mapped attribute.
- `attributes` — **Attribute Engine** list (`AdminAttributesView`) for creating
  reusable attributes, choosing their data type, and editing the option values
  used by SELECT/MULTI_SELECT filters.

Both are also reachable from `ProductsHubView` cards and are mirrored under
`super-admin`. The same schema powers the admin product create/edit dialogs via
`ProductAttributesSection`, so the platform catalog and seller listings share one
source of truth.

No irrelevant fields are shown: a Processor form never asks for a dress size,
and a Laptop form never asks for a prescription.
