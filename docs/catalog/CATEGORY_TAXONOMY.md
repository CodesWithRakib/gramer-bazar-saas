# Category Taxonomy

## 1. Model

`categories` is a self-referencing tree with materialized depth metadata:

| Column | Notes |
| --- | --- |
| `id` | uuid PK |
| `parent_id` | nullable self FK, `CASCADE` on delete |
| `name_en` / `name_bn` | bilingual display names |
| `slug` | globally unique, URL segment |
| `icon`, `image` | presentation |
| `description_en` / `description_bn` | optional copy |
| `level` | depth from root (root = 0) |
| `path` | materialized slug lineage, e.g. `electronics/computers-pc/pc-components` |
| `sort_order`, `is_active`, `is_regulated` | existing behaviour |

Indexes: `parent_id`, `path`, `is_active`.

## 2. Unlimited depth

Depth is **not hard-coded**. `CategoriesService`:

1. computes `level`/`path` from the parent on create/update,
2. rejects cycles (a node cannot move under its own descendant),
3. rebuilds `level`/`path` for the whole tree after a move.

The public tree API builds a nested structure **in memory** from the flat table,
so any depth renders correctly:

```text
Electronics
└── Computers & PC
    └── PC Components
        └── Processor            (leaf category)
```

Another vertical can stop earlier:

```text
Medicine
└── OTC Medicine
    └── Product
```

## 3. Product counts

For each node the count aggregates its whole subtree using the path prefix:

```sql
SELECT c.id,
  (SELECT COUNT(DISTINCT p.id) FROM products p
     JOIN categories pc ON pc.id = p.category_id
   WHERE p.is_active AND (pc.path = c.path OR pc.path LIKE c.path || '/%'))::int
FROM categories c WHERE c.is_active;
```

## 4. API

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/categories/tree` | Admin | nested admin tree |
| GET | `/categories` | Admin | flat list, filters |
| POST | `/categories` | ADMIN/SUPER_ADMIN | create (computes lineage) |
| PATCH | `/categories/:id` | ADMIN/SUPER_ADMIN | update/move |
| DELETE | `/categories/:id` | ADMIN/SUPER_ADMIN | safe delete |
| GET | `/public/categories/tree` | public | deep tree + counts + product types |
| GET | `/public/categories` | public | flat active list + counts |
| GET | `/public/categories/:slug` | public | node + breadcrumb + children + product types |
| GET | `/public/categories/:slug/product-types` | public | product types for a category |

## 5. Adding a new category

1. Admin UI → **Catalog → Categories**, or `POST /categories` with `parentId`.
2. `level`/`path` are derived automatically.
3. Attach product types (see `PRODUCT_TYPE_SYSTEM.md`) and attributes.

## 6. Adding Medicine later (no core changes)

```text
Medicine
├── OTC Medicine
├── Prescription Medicine
├── Vitamins & Supplements
├── Personal Care
├── Medical Devices
└── Healthcare Equipment
```

Attributes: `Generic Name`, `Brand` (existing concept), `Strength`, `Dosage
Form`, `Pack Size`, `Manufacturer`, `Prescription Required`.

Create a `medicine-taxonomy.data.ts` mirroring the Electronics file, add a
`seedMedicineCatalog()` method and its attributes. The category tree, facets,
spec tables, seller form and product detail page all work unchanged.
