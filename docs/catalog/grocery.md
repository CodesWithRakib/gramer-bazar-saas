# Grocery Catalog

Grocery, Fresh Food & Daily Essentials is the third vertical of the universal
catalog engine (after Electronics and Medicine). It reuses the same taxonomy,
product type, attribute, variant/SKU, inventory, batch/expiry and cart systems —
there is **no separate grocery architecture**.

- Full reference: [`GROCERY_VERTICAL.md`](./GROCERY_VERTICAL.md)
- Taxonomy: [`grocery-taxonomy.md`](./grocery-taxonomy.md)
- Attributes: [`grocery-attributes.md`](./grocery-attributes.md)
- Inventory / batch / expiry: [`grocery-inventory.md`](./grocery-inventory.md)

## Shape

```
Category → Subcategory → Nested Category → Product Type → Attributes
        → Product → Variant (weight/volume/unit) → SKU → Inventory
```

- Root: `grocery` (*Grocery & Daily Essentials*)
- Verticals are data: `apps/api/src/seeder/data/grocery-taxonomy.data.ts`
  exports `GROCERY_VERTICAL: SeedVertical`, registered in
  `SeederService.seedCatalogVerticals()`.
- Seed: 66 categories, 17 product types, 35 attributes, 34 demo products.
