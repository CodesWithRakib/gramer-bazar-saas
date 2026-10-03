# Fashion Catalog

Fashion, Clothing & Apparel is the fourth vertical of the universal catalog
engine. It reuses the shared categories, product types, attributes, brands,
variants/SKU, inventory, filters, search, cart, orders, analytics and RBAC.

- Full reference: [`FASHION_VERTICAL.md`](./FASHION_VERTICAL.md)
- Taxonomy: [`fashion-taxonomy.md`](./fashion-taxonomy.md)
- Variants (colour × size): [`fashion-variants.md`](./fashion-variants.md)
- Size system & charts: [`fashion-size-system.md`](./fashion-size-system.md)

## Shape

```
Category → Subcategory → Product Type → Attribute Schema → Product
        → Variant (Colour × Size) → SKU → Inventory
```

- Root: `clothing` (*Fashion & Clothing*)
- Data: `apps/api/src/seeder/data/fashion-taxonomy.data.ts` exports
  `FASHION_VERTICAL: SeedVertical`, registered in `SeederService.seedCatalogVerticals()`.
- Seed: 66 categories, 36 product types, 29 attributes, 25 demo products.
- Only additive DB change: `attribute_options.hex_color` (generic swatch colour).
