# Fashion Size System & Size Charts

## Size systems as attributes

Fashion must not assume a single global size system. Sizes are modelled as
separate SELECT attributes — one per size system — so product types map only the
relevant one:

| Attribute slug | System | Values |
| --- | --- | --- |
| `fashion-size-clothing` | Clothing standard | XS, S, M, L, XL, XXL, XXXL |
| `fashion-size-numeric` | Numeric waist | 28, 30, 32, 34, 36, 38, 40 |
| `fashion-size-kids` | Kids age | 0-3M, 3-6M, 6-12M, 1Y, 2Y, 3Y, 4Y, 5Y, 6Y, 8Y, 10Y, 12Y |
| `fashion-size-shoe-eu` | EU shoe | 36…45 |
| `fashion-size-shoe-uk` | UK shoe | 3…10 |
| `fashion-size-shoe-us` | US shoe | 4…11 |

Shoe sizes are never treated as clothing sizes. Admin can add new size systems
(e.g. a new region) simply by creating a SELECT attribute through the existing
Attributes admin UI — no code change.

## Sizes are variant axes

Every size attribute is `isVariantAxis`, so each size is a distinct SKU with its
own price and inventory (see [`fashion-variants.md`](./fashion-variants.md)).
They are also filterable facets (variant-axis engine support).

## Size charts

A non-filterable `fashion-size-chart` TEXT attribute exists as the current,
low-complexity extension point for admin/seller-entered size guidance. **No
measurements are generated.**

### Recommended next step (documented, not built)

When admin-managed size charts with typed measurement rows are required, add
generic, reusable entities — deliberately **not** prefixed with "Fashion" so any
vertical can reuse them:

```
SizeSystem(id, name, code/slug, type, region, isActive)
Size(id, sizeSystemId, label, sortOrder, isActive)
SizeChart(id, name, type/clothing|footwear, rows JSONB, isActive)
```

`SizeChart.rows` would hold typed rows (Chest / Waist / Hip / Shoulder / Length /
Sleeve for clothing; EU / UK / US / Foot Length for footwear) entered by
admin/seller. A `SizeChart` reference (nullable FK) would live on product or
product type, and the PDP would render a mobile-friendly, localized size-guide
modal only when a chart exists.

This is intentionally deferred: the current attribute model satisfies filtering
and variant selection cleanly, and the prompt instructs against unnecessary
database complexity.
