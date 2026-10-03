# Grocery Taxonomy

Root: **`grocery`** — *Grocery & Daily Essentials* / *মুদি ও নিত্যপ্রয়োজনীয়*.

```
Grocery & Daily Essentials
├── grocery-fresh-produce            Fresh Produce
│   ├── grocery-vegetables           Vegetables
│   ├── grocery-fruits               Fruits
│   ├── grocery-herbs-greens         Herbs & Greens
│   └── grocery-seasonal-produce     Seasonal Produce
├── grocery-meat-poultry             Meat & Poultry
│   ├── grocery-beef / grocery-chicken / grocery-mutton / grocery-other-meat
├── grocery-fish-seafood             Fish & Seafood
│   ├── grocery-fresh-fish / grocery-frozen-fish / grocery-seafood / grocery-dried-fish
├── grocery-rice-grains              Rice & Grains
│   ├── grocery-rice / grocery-wheat / grocery-flour / grocery-corn / grocery-other-grains
├── grocery-lentils-pulses           Lentils & Pulses
├── grocery-cooking-essentials       Cooking Essentials
│   ├── grocery-cooking-oil / grocery-salt / grocery-sugar / grocery-vinegar / grocery-cooking-ingredients
├── grocery-spices-seasonings        Spices & Seasonings
│   ├── grocery-whole-spices / grocery-ground-spices / grocery-spice-mixes / grocery-herbs
├── grocery-dairy-eggs               Dairy & Eggs
│   ├── grocery-milk / grocery-yogurt / grocery-cheese / grocery-butter / grocery-eggs
├── grocery-bakery                   Bakery
│   ├── grocery-bread / grocery-biscuits / grocery-cakes / grocery-bakery-snacks
├── grocery-snacks-confectionery     Snacks & Confectionery
│   ├── grocery-chips / grocery-chocolate / grocery-candy / grocery-nuts
├── grocery-beverages                Beverages
│   ├── grocery-water / grocery-juice / grocery-soft-drinks / grocery-tea / grocery-coffee
├── grocery-frozen-food              Frozen Food
├── grocery-canned-packaged          Canned & Packaged Food
├── grocery-instant-ready            Instant & Ready Food
├── grocery-baby-food                Baby Food
├── grocery-household-cleaning       Household Cleaning
│   ├── grocery-laundry / grocery-dishwashing / grocery-floor-cleaning / grocery-toilet-cleaning
└── grocery-kitchen-household        Kitchen & Household Essentials
```

## Design rules

- **No category explosion.** Weight, volume, unit, pack size, flavour, variety,
  origin and grade are attributes/variants — never categories.
- **Arbitrary depth.** The engine stores `level` and `path`; depth is data-driven.
- **Namespaced slugs.** All descendants use the `grocery-` prefix so they never
  collide with existing legacy categories and never re-parent rows owned by the
  base catalogue seed. Repeated seeding is idempotent and stable.
- **Product types live on section nodes** (e.g. `grocery-grain` on *Rice & Grains*),
  which is where dynamic facets are richest.
