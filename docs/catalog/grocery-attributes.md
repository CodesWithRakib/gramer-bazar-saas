# Grocery Attributes & Units

All Grocery attributes are namespaced `grocery-*` and defined in
`apps/api/src/seeder/data/grocery-taxonomy.data.ts` (`GROCERY_ATTRIBUTES`).
They are mapped onto product types (`grocery-fresh-produce`, `grocery-grain`,
`grocery-beverage`, `grocery-cleaning`, …) — filters are generated from those
mappings, so a product never shows irrelevant attributes.

## Discovery attributes (filterable)

| Attribute | Type | Values (excerpt) |
| --- | --- | --- |
| Origin | SELECT | Bangladesh, Local, Imported, India, Thailand, Malaysia, Not Specified |
| Grade | SELECT | Premium, Grade A, Grade B, Standard, Not Specified |
| Organic | SELECT | Organic, Conventional, Not Specified *(never auto-claimed)* |
| Variety | SELECT | Miniket, Nazirshail, Chinigura, Basmati, Amrapali, Desi, … |
| Produce Type | SELECT | Root Vegetable, Bulb, Leafy Green, Fruit Vegetable, Tuber, Seasonal Fruit |
| Rice Type | SELECT | Miniket, Nazirshail, Chinigura, Basmati, BRRI, Parboiled |
| Meat Type | SELECT | Beef, Chicken, Mutton, Other Meat |
| Cut Type | SELECT | Curry Cut, Boneless, Bone-in, Steak, Whole, Fillet, Mince |
| Fish Type | SELECT | Hilsa, Rohu, Katla, Tilapia, Pangas, Shrimp, Prawn, Other |
| Flavor | SELECT | Plain, Chocolate, Vanilla, Mango, Masala, Salted, Spicy, … |
| Cleaning Type | SELECT | Laundry, Dishwashing, Floor Cleaning, Toilet Cleaning, Multi-Surface |
| Scent | SELECT | Lemon, Floral, Fresh, Mint, Unscented, Not Specified |
| Detergent Form | SELECT | Powder, Liquid, Bar, Gel, Tablet, Spray |
| Freshness | SELECT | Fresh, Same-Day, Chilled, Frozen, Dried |
| Season | SELECT | All Season, Summer, Winter, Monsoon, Seasonal |
| Processing | SELECT | Raw, Whole, Polished, Parboiled, Roasted, Ground, Milled |
| Storage Type | SELECT | Room Temperature, Keep Cool & Dry, Refrigerated, Frozen, Protective |
| Shelf Life | SELECT | 1 Day … 24 Months |
| Packaging Type | SELECT | Loose, Polythene, Paper, Carton, Bottle, Jar, Can, Pouch, Tray, Vacuum Pack |

## Weight / volume / unit (structured, variant axes)

| Attribute | Type | Values |
| --- | --- | --- |
| Weight | SELECT (variant axis) | 50 g, 100 g, 200 g, 250 g, 500 g, 1 kg, 2 kg, 5 kg, 10 kg, 25 kg |
| Volume | SELECT (variant axis) | 100 ml, 200 ml, 250 ml, 500 ml, 1 L, 2 L, 5 L |
| Unit | SELECT (variant axis) | g, kg, ml, L, piece, pack, box, dozen, bundle, bottle, jar, can, packet |
| Pack Size | SELECT (variant axis) | 1, 4, 6, 8, 12, 24 pieces |
| Pack Count | NUMBER | — |

Structured `quantity + unit` is preferred over free-text like `"5kg pack"`.

## Support-only attributes (never inferred)

`Ingredient Statement`, `Nutrition Notes`, `Allergens`, `Dietary Type`,
`Calories`, `Protein`, `Carbohydrates`, `Fat`, `Sugar`, `Sodium`,
`Batch / Expiry Tracking Required`.

These are available to seller/admin forms but are **not filterable** and are left
**unpopulated** in demo data. No nutritional, allergen, dietary or health claim is
ever fabricated or inferred from a product name.
