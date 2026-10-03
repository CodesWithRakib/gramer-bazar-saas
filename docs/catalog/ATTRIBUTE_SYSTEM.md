# Attribute System

## 1. Concepts

- **Attribute** — a reusable property definition: `Socket`, `Screen Size`,
  `Panel Type`, `Warranty`.
- **Attribute Option** — an allowed value for a SELECT / MULTI_SELECT / RANGE
  attribute: `AM5`, `IPS`, `3 Years`.
- **Product Type Attribute** — the mapping of an attribute onto a product type.
- **Product Attribute Value** — a product's structured specification value.

## 2. `attributes`

| Column | Notes |
| --- | --- |
| `id` | uuid PK |
| `name_en` / `name_bn` | bilingual |
| `slug` | unique |
| `data_type` | `TEXT · NUMBER · BOOLEAN · SELECT · MULTI_SELECT · RANGE · DATE` |
| `unit` | optional suffix, e.g. `GHz`, `W`, `inch` |
| `is_filterable` | default for facets |
| `is_variant_axis` | used to build variants (e.g. Capacity) |
| `sort_order`, `is_active` | ordering/visibility |

## 3. `attribute_options`

| Column | Notes |
| --- | --- |
| `attribute_id` | FK → attributes, `CASCADE` |
| `value` / `value_bn` | display value |
| `slug` | unique per attribute; used in URLs/filters |
| `sort_order`, `is_active` | ordering/visibility |

## 4. `product_attribute_values`

Typed columns allow filtering without casting text:

| Column | Notes |
| --- | --- |
| `product_id` / `attribute_id` | unique pair |
| `option_id` | nullable FK for SELECT/MULTI_SELECT/RANGE |
| `value_text` | TEXT |
| `value_number` | NUMBER / RANGE (numeric 14,3) |
| `value_boolean` | BOOLEAN |

## 5. API

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/attributes` | public | list with options |
| GET | `/attributes/:id` | public | detail with options |
| POST | `/attributes` | ADMIN/SUPER_ADMIN | create (+ nested options) |
| PATCH | `/attributes/:id` | ADMIN/SUPER_ADMIN | update (options replaced when supplied) |
| DELETE | `/attributes/:id` | ADMIN/SUPER_ADMIN | blocked if products use the attribute |

## 6. Persisting spec values

`ProductAttributeValuesService.saveValues(productId, inputs)`:

- resolves attributes by `attributeId` **or** `attributeSlug`
- resolves options by `optionId` **or** `optionSlug`
- rejects unknown attributes/options, duplicate attributes and missing options
  for select-type attributes
- replaces all values for the product in one transaction-safe write

## 7. Reading spec values

`getSpecGroups(productId)` returns display-ready groups with
`displayValueEn` / `displayValueBn` (option label, number + unit, or yes/no),
which the product detail page renders as a grouped specifications table.

## 8. Governance

- Attributes are global and reused — never duplicate `Brand` or `Warranty` per
  vertical.
- `Brand` intentionally stays a dedicated table (`brands`), not an attribute, so
  brand logos and category associations remain first-class.
- Deleting an attribute used by products is refused; deactivate instead.

## 9. Admin UI

The **Attribute Engine** (`AdminAttributesView`, route
`/[lang]/{admin,super-admin}/products/attributes`) manages the global attribute
catalogue: create/edit name (EN/BN), slug, data type, unit, `isFilterable`,
`isVariantAxis`, sort order and active flag. Selectable options for
`SELECT`/`MULTI_SELECT` are edited inline. `ProductAttributesSection` then renders
one input per mapped attribute (select / number / boolean / date / text) inside the
admin product create and edit dialogs, keyed purely by the attribute data type.
