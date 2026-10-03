# Baby & Kids Catalog Vertical

The **seventh vertical** running on the Gramer Bazar universal catalog engine (joining Electronics, Medicine, Grocery, Fashion, Cosmetics, and Home & Kitchen).
Adhering strictly to universal architectural principles, Baby & Kids operates with **zero separate tables or architectural duplication**. It reuses Categories, Product Types, Attributes, Brands, Variants, SKU, Inventory, Search, Filters, Cart, Checkout, and Orders.

```
                  UNIVERSAL CATALOG ENGINE (shared)
                                │
   ┌──────────┬──────────┬──────┴───┬──────────┬──────────┬──────────────┬──────────────┐
   │          │          │          │          │          │              │              │
Electronics Medicine  Grocery    Fashion   Cosmetics  Home & Kitchen   Baby & Kids    Future
  Products   Products  Products   Products   Products    Products       Products
  Variants   Variants  Variants   Variants   Variants    Variants       Variants   (age × diaper size × pack × color)
  Attributes Attributes Attributes Attributes Attributes  Attributes     Attributes (+ weight / safety / warnings)
  Inventory  Inventory Inventory  Inventory  Inventory   Inventory      Inventory
```

---

## 1. What was Reused (Audit & Compliance)

| Concern | Reused | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` with root `baby-kids` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` (Diaper Pants, Romper, Feeding Bottle, Baby Shampoo, Cereal, Building Blocks, Stroller, Wipes, Sneaker, etc.) |
| Attribute engine (incl. SELECT option sets) | ✅ | `attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values` |
| Brands & Manufacturers | ✅ | `upsertVerticalBrands` & `upsertVerticalManufacturers` (Meril Baby, Just for Baby, Supermom, Neocare, Pampers, Huggies, Sebamed, Chicco, Pigeon, Avent, Cerelac, Lego, Fisher-Price, Barbie) |
| Variants / SKU / Inventory | ✅ | Age Group, Diaper Size, Pack Size, Volume, Footwear Size, and Color are variant-axis attributes |
| Search / Dynamic Filters / Facets | ✅ | Facet builder and filter engine seamlessly filter on age group, diaper size, material, safety claims, and brands |
| Visual Swatches | ✅ | Reuses `attribute_options.hex_color` for pastel baby shades (Pastel Pink, Sky Blue, Mint Green, etc.) |
| Expiry & Batch System | ✅ | Reuses Medicine/Grocery batch tracking for infant cereals, baby food, and baby wipes (`batches`) |
| Cart / Checkout / Order / Analytics / RBAC | ✅ | Full end-to-end integration without custom tables |

**No category-specific database tables or schema copies exist (`BabyProduct`, `BabySKU`, `BabyCart`, etc. are forbidden).**

---

## 2. Taxonomy Hierarchy (`baby-kids`)

Root `baby-kids` — *Baby & Kids* / *শিশু ও বাচ্চাদের সামগ্রী* (Icon: 👶) — organized into 12 primary branches:

```
Baby & Kids (শিশু ও বাচ্চাদের সামগ্রী)
├── Baby Clothing (শিশুর পোশাক)
│   ├── Newborn Clothing (নবজাতকের পোশাক) → baby-romper, baby-bodysuit
│   ├── Rompers & Bodysuits (রম্পার ও বডিস্যুট) → baby-romper
│   ├── Baby Sets & Sleepwear (বেবি সেট ও স্লিপওয়্যার) → baby-set
│   └── Baby Frocks & Dresses (বেবি ফ্রক ও ড্রেস) → baby-dress
├── Kids Clothing (বাচ্চাদের পোশাক)
│   ├── Boys Clothing (ছেলেদের পোশাক) → kids-tshirt, kids-panjabi, kids-pants
│   └── Girls Clothing (মেয়েদের পোশাক) → kids-frock, kids-salwar
├── Baby Feeding (শিশুর ফিডিং ও খাওয়ানো)
│   ├── Feeding Bottles (ফিডিং বোতল) → feeding-bottle
│   ├── Sippy Cups & Straw Bottles (সিপি কাপ ও স্ট্র বোতল) → sippy-cup
│   ├── Plates, Bowls & Spoons (প্লেট, বাটি ও চামচ) → baby-feeding-set
│   └── Bibs & Napkins (বিব ও ন্যাপকিন) → baby-bib
├── Diapering (ডায়াপার ও ডায়াপারিং)
│   ├── Baby Diapers & Pants (বেবি ডায়াপার ও প্যান্ট ডায়াপার) → diaper-pants, baby-diaper-tape
│   ├── Baby Wipes & Changing Mats (বেবি ওয়াইপস ও চেঞ্জিং ম্যাট) → baby-wipe, changing-mat
│   └── Cloth Diapers & Nappies (কাপড়ের ডায়াপার ও ন্যাপি) → cloth-diaper
├── Baby Care & Toiletries (শিশুর যত্ন ও টয়লেট্রিজ)
│   ├── Baby Shampoo & Wash (বেবি শ্যাম্পু ও বডি ওয়াশ) → baby-shampoo, baby-soap
│   ├── Baby Lotion, Oil & Cream (বেবি লোশন, তেল ও ক্রিম) → baby-lotion, baby-oil, baby-rash-cream
│   └── Baby Powder (বেবি পাউডার) → baby-powder-pt
├── Baby Food (শিশুর খাবার)
│   ├── Baby Cereals & Purees (বেবি সিরিয়াল ও পিউরি) → baby-cereal
│   └── Infant Formula & Toddler Nutrition (ইনফ্যান্ট ফর্মুলা ও পুষ্টিকর খাবার) → infant-formula
├── Toys & Games (খেলনা ও গেমস)
│   ├── Educational Toys & Blocks (শিক্ষামূলক খেলনা ও বিল্ডিং ব্লক) → building-blocks, educational-puzzle
│   ├── Dolls & Plush Toys (পুতুল ও সফট টয়) → plush-toy, fashion-doll
│   └── Vehicles & Remote Control (গাড়ি ও রিমোট কন্ট্রোল খেলনা) → rc-car
├── Baby Gear & Travel (বেবি গিয়ার ও ভ্রমণ)
│   ├── Strollers & Prams (বেবি স্ট্রোলার ও প্র্যাম) → baby-stroller
│   └── Carriers & Walkers (ক্যারিয়ার ও ওয়াকার) → baby-carrier, baby-walker
├── Nursery & Bedding (নার্সারি ও বেবি বেডিং)
│   ├── Beds, Cribs & Mattresses (বেবি খাট, ক্রিব ও তোষক) → baby-crib
│   └── Blankets, Quilts & Pillows (কম্বল, কাঁথা ও বালিশ) → baby-blanket
├── Kids Footwear (বাচ্চাদের জুতো)
│   ├── Baby Shoes & Booties (বেবি জুতো ও বুটি) → baby-booties
│   └── Kids Sneakers & Sandals (বাচ্চাদের স্নিকার্স ও স্যান্ডেল) → kids-sneaker
├── Kids Bags & Accessories (বাচ্চাদের ব্যাগ ও এক্সেসরিজ)
│   ├── School Bags & Backpacks (স্কুল ব্যাগ ও ব্যাকপ্যাক) → kids-backpack
│   └── Watches, Caps & Accessories (ঘড়ি, টুপি ও এক্সেসরিজ) → kids-watch
└── Kids School & Stationery (স্কুল ও স্টেশনারি)
    ├── Drawing & Art Supplies (ড্রয়িং ও আর্ট সরঞ্জাম) → art-color-set
    └── Notebooks & Stationery Sets (খাতা ও স্টেশনারি সেট) → stationery-set
```

---

## 3. Structured Attributes & Multi-Dimensional Variants

12 reusable attributes defined for the Baby & Kids vertical:

| Attribute Slug | Type | Axis | Purpose & Options |
| --- | --- | --- | --- |
| `baby-age-group` | SELECT | **Variant** | Newborn (0-1M), 0–3 Months, 3–6 Months, 6–12 Months, 1–2 Years, 2–3 Years, 3–5 Years, 5–8 Years, 8–12 Years, 12+ Years |
| `baby-diaper-size` | SELECT | **Variant** | Newborn (NB), S, M, L, XL, XXL |
| `baby-weight-range` | SELECT | Spec | Up to 5 kg, 4–8 kg, 6–11 kg, 9–14 kg, 12–17 kg, 15+ kg, Up to 15 kg, Up to 25 kg |
| `baby-gender` | SELECT | Spec | Unisex, Boys, Girls |
| `baby-material` | SELECT | Spec | 100% Organic Cotton, BPA-Free Silicone, Food-Grade PP, Borosilicate Glass, Soft Plush, Solid Pine Wood, Natural Latex, Stainless Steel, Breathable Mesh, Melamine Free Bamboo Fibre, ABS Plastic |
| `baby-pack-size` | SELECT | **Variant** | 1 Piece, 2-Pack, 3-Pack, 20 pcs, 40 pcs, 60 pcs, 80 Wipes Pack, Pack of 3, 50 pcs Box, 100 pcs Box, 300g, 400g |
| `baby-safety-claims` | SELECT | Spec | BPA Free, Phthalate Free, Non-Toxic, Hypoallergenic, Pediatrician Approved, Dermatologically Tested, Tear-Free Formula, Organic Certified, Child-Safe Non-Toxic Paint, Alcohol Free, Paraben Free |
| `baby-warning` | SELECT | Spec | Adult Supervision Required, Choking Hazard (Small Parts), Do Not Microwave, Keep Away from Fire, External Use Only, Discard If Torn or Damaged |
| `baby-color` | SELECT | **Variant** | Pastel Pink (#f472b6), Sky Blue (#38bdf8), Mint Green (#4ade80), Sunny Yellow (#facc15), Pure White (#ffffff), Navy Blue (#1e3a8a), Soft Grey (#9ca3af), Vibrant Red (#ef4444), Lavender Purple (#c084fc), Peach Coral (#fb923c) |
| `baby-volume` | SELECT | **Variant** | 50 ml, 100 ml, 125 ml, 200 ml, 240 ml, 250 ml, 400 ml, 500 ml, 300g, 400g |
| `baby-footwear-size` | SELECT | **Variant** | EU 18, EU 19, EU 20, EU 21, EU 22, EU 24, EU 26, EU 28, EU 30, EU 32 |
| `baby-country-of-origin` | SELECT | Spec | Bangladesh, India, UK, USA, Japan, Germany, Thailand, China, Italy, Netherlands, Switzerland, Denmark |

---

## 4. Authentic Regional & International Brands

- **Local Leaders (Bangladesh):** Meril Baby (Square), Just for Baby (Marico), Supermom (Square), Chu Chu (Square), Neocare (Incepta), Twinkle (Bashundhara), RFL Play (PRAN-RFL), Hatil Kids (Hatil).
- **International Powerhouses:** Johnson's Baby (Kenvue/J&J), Pampers (P&G), Huggies (Kimberly-Clark), MamyPoko (Unicharm), Sebamed (Sebapharma), Chicco (Artsana), Philips Avent (Philips), Pigeon (Pigeon Corp), Cerelac (Nestlé), Lego, Fisher-Price (Mattel), Barbie (Mattel).

---

## 5. Rich Demo Products Seeded

1. **Pampers Baby Dry Diaper Pants** — Diaper Size (S, M, L / 40 pcs), Magic Gel overnight channels.
2. **Meril Baby Mild Shampoo** — Tear-Free formula, 100 ml & 200 ml variants with batch and 2-year expiry.
3. **Philips Avent Natural Glass Feeding Bottle** — Borosilicate thermal shock-resistant glass, 125 ml & 240 ml.
4. **Just for Baby 100% Organic Cotton Romper Set** — 0–3M, 3–6M, 6–12M in Sky Blue & Pastel Pink.
5. **Nestlé Cerelac Wheat & 4 Fruits Infant Cereal** — Iron-fortified with probiotics, 300g & 400g with batch/expiry.
6. **Pigeon Soft Anti-Spill Sippy Cup** — Cross-cut leak-proof silicone straw 240ml in Mint Green & Sky Blue.
7. **Fisher-Price Educational Sorting Building Blocks** — 50 pcs & 100 pcs non-toxic shape sorter boxes.
8. **Chicco Foldable Lightweight Baby Stroller** — 4-position recline, 5-point safety harness in Navy Blue & Soft Grey.
9. **Supermom Pure Water Baby Wipes** — 99% pure EDI water, aloe vera, 80 wipes pack & 3-pack with batch/expiry.
10. **Kids Breathable Soft-Sole First Walkers Sneakers** — EU 20, EU 21, EU 22 in Navy Blue & Pastel Pink.

---

## 6. Frontend Storefront Integration

- **Product Details Page (`ProductDetailsClient.tsx`):**
  - Instant vertical detection via `isBabyKids`.
  - Visual color swatches for delicate pastel hues.
  - Dynamic size selector displaying `ডায়াপার সাইজ (Diaper Size):` for diapers or `বয়স / সাইজ (Age / Size):` for apparel and gear.
  - Dedicated Purchase Box Badges: `BPA Free`, `Tear-Free Formula`, `Dermatologically Tested`, `Age Suitability`, `Diaper Size`, `Weight Capacity`, and `Organic Cotton Material`.
  - Safety & Child Supervision Advisory Banner covering choking hazard vigilance, proper food preparation, and product shelf life.
- **Product Card (`ProductCard.tsx`):**
  - Dedicated `baby` theme with soft sky blue badge (`শিশু ও কিডস` / `Baby & Kids`) and gentle `Heart` icon.
