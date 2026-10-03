# Fashion Taxonomy

Root: **`clothing`** — *Fashion & Clothing* / *পোশাক ও ফ্যাশন* (66 categories).

```
Fashion & Clothing
├── fashion-mens          Men's Fashion
│   ├── fashion-mens-tshirts (T-Shirt) · fashion-mens-shirts (Shirt)
│   ├── fashion-mens-polos (Polo) · fashion-mens-pants (Trouser)
│   ├── fashion-mens-jeans (Jeans) · fashion-mens-panjabi (Panjabi)
│   ├── fashion-mens-pajamas · fashion-mens-shorts (Shorts)
│   ├── fashion-mens-jackets (Jacket)
│   ├── fashion-mens-sweaters (Hoodie) · fashion-mens-suits
│   ├── fashion-mens-underwear (Underwear) · fashion-mens-traditional
├── fashion-womens        Women's Fashion
│   ├── fashion-womens-saree (Saree) · fashion-womens-salwar (Salwar Kameez)
│   ├── fashion-womens-kurti (Kurti) · fashion-womens-tops (Top)
│   ├── fashion-womens-dresses (Dress) · fashion-womens-shirts
│   ├── fashion-womens-pants · fashion-womens-jeans · fashion-womens-skirts
│   ├── fashion-womens-hijab (Hijab) · fashion-womens-abaya (Abaya)
│   ├── fashion-womens-jackets · fashion-womens-innerwear
├── fashion-kids          Kids' Fashion
│   ├── fashion-kids-boys (Kids' T-Shirt) · fashion-kids-girls (Kids' Dress)
│   ├── fashion-kids-baby (Baby Clothing) · fashion-kids-school
│   ├── fashion-kids-shoes · fashion-kids-accessories
├── fashion-footwear      Footwear
│   ├── fashion-footwear-sandals (Sandal) · fashion-footwear-sneakers (Sneaker)
│   ├── fashion-footwear-formal (Formal Shoe) · fashion-footwear-slippers (Slipper)
│   ├── fashion-footwear-sports (Sports Shoe) · Men's/Women's/Kids' Shoes
├── fashion-bags          Bags
│   ├── fashion-bags-backpacks (Backpack) · fashion-bags-handbags (Handbag)
│   ├── fashion-bags-wallets (Wallet) · School / Shoulder / Travel Bags
├── fashion-accessories   Fashion Accessories
│   ├── fashion-accessories-watches (Watch) · fashion-accessories-belts (Belt)
│   ├── fashion-accessories-sunglasses (Sunglasses) · fashion-accessories-caps (Cap)
│   ├── fashion-accessories-scarves (Scarf) · fashion-accessories-jewelry (Jewelry)
│   └── fashion-accessories-gloves
└── fashion-sportswear    Sportswear
    ├── fashion-sportswear-jerseys (Jersey) · fashion-sportswear-tracksuits (Tracksuit)
    └── Sports T-Shirts / Sports Shorts / Activewear
```

## Rules

- **No category explosion.** Colour, size, material, fit, pattern, style,
  occasion etc. are attributes/variants — never categories.
- **Namespaced slugs** (`fashion-*`) keep global slug uniqueness and avoid
  re-parenting the pre-existing legacy `clothing` rows; seeding is idempotent.
- **Product types live on the leaf/category they belong to**, which is where
  dynamic facets are richest.
- The taxonomy is data — the admin can extend/reshape it via the category engine.
