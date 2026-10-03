# Dynamic Filter System

## 1. Principle

Filters are **generated from the product type attribute schema**, never
hard-coded. The same engine powers Electronics, Medicine or Fashion.

```text
Category / Product Type
      ↓ (product_type_attributes where is_filterable)
Attribute groups + options
      ↓ (aggregate over product_attribute_values)
Live facet counts + price range + brand counts
```

## 2. Facets endpoint

```http
GET /public/catalog/facets?categoryPath=electronics/computers-pc/pc-components/processor
```

Optional query params: `categoryId`, `categoryPath`, `productTypeId`, `brandId`,
`minPrice`, `maxPrice`, `inStock`, `attributes` (JSON).

`attributes` is a JSON map of attribute slug → selected values, e.g.

```json
{ "socket": ["am5", "lga1700"], "panel-type": ["ips"] }
```

Response:

```json
{
  "productTypeId": null,
  "productTypeIds": ["…"],
  "groups": [
    {
      "attributeId": "…",
      "slug": "socket",
      "nameEn": "Socket",
      "nameBn": "সকেট",
      "dataType": "SELECT",
      "unit": null,
      "options": [
        { "id": "…", "slug": "am5", "value": "AM5", "valueBn": null, "count": 4 }
      ]
    }
  ],
  "priceRange": { "min": 7500, "max": 118000 },
  "brands": [{ "id": "…", "slug": "amd", "nameEn": "AMD", "nameBn": "AMD", "count": 2 }],
  "inStockCount": 9,
  "totalCount": 9
}
```

- SELECT / MULTI_SELECT / RANGE attributes produce **option counts**.
- NUMBER attributes produce a `min`/`max` pair.
- `brands` and `priceRange` are always included.

## 3. Filtering in search

`GET /public/catalog/search` accepts:

- `categoryId` — matches the whole subtree (recursive CTE)
- `categoryPath` — materialized path prefix
- `productTypeId`
- `brandId`
- `minPrice` / `maxPrice`
- `inStock`
- `attributes` — JSON map of attribute slug → values (matches option slug, text
  value or numeric value)
- `q` — also matches specification values

`ProductTypesService.applyAttributeFilters()` appends one parameterized `EXISTS`
subquery per filtered attribute, so filtering composes cleanly with pagination
and sorting.

## 4. Frontend

`ProductFilterSidebar.tsx`:

- resolves the current category from the URL,
- queries `/public/catalog/facets`,
- renders every returned group as checkboxes (with counts), number ranges,
  brand facets and price,
- writes selections into the `attributes` URL param as JSON.

Because the UI iterates over the API response, a newly mapped attribute appears
as a filter automatically — no per-category UI changes.

## 5. Performance

- Facet counts group by option with `COUNT(DISTINCT p.id)`.
- Filter predicates are `EXISTS` semi-joins, not row multiplication, so they do
  not distort pagination counts.
- Indexes exist on `product_attribute_values(product_id, attribute_id, option_id)`
  and on `categories(path)`.
