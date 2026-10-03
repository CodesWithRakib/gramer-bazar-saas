# Sports & Fitness Catalog Vertical & Equipment System

The **ninth vertical** running on the Gramer Bazar universal catalog engine (joining Electronics, Medicine, Grocery, Fashion, Cosmetics, Home & Kitchen, Baby & Kids, and Automotive).
Adhering strictly to universal architectural principles, Sports & Fitness operates with **zero separate tables or architectural duplication**. It reuses Categories, Product Types, Attributes, Brands, Variants, SKU, Inventory, Search, Filters, Cart, Checkout, and Orders, while supporting **structured sports equipment specifications and safety standards**.

```
                           UNIVERSAL CATALOG ENGINE (shared)
                                         │
   ┌──────────┬──────────┬──────────┬────┴─────┬──────────┬──────────────┬──────────────┬──────────────┬──────────────────┐
   │          │          │          │          │          │              │              │              │                  │
Electronics Medicine  Grocery    Fashion   Cosmetics  Home & Kitchen   Baby & Kids    Automotive   Sports & Fitness     Future
  Products   Products  Products   Products   Products    Products       Products       Products       Products
  Variants   Variants  Variants   Variants   Variants    Variants       Variants       Variants       Variants (weight × size × pack)
  Attributes Attributes Attributes Attributes Attributes  Attributes     Attributes     Attributes     Attributes (discipline × skill × material)
  Inventory  Inventory Inventory  Inventory  Inventory   Inventory      Inventory      Inventory      Inventory
```

---

## 1. What was Reused (Audit & Compliance)

| Concern | Reused | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` with root `sports-fitness` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` (Cricket Bat, Football, Badminton Racket, Tennis Racket, Running Shoe, Sports Jersey, Dumbbell Pair, Treadmill, Yoga Mat, Bicycle, Boxing Gloves, Sports Bag, Swimming Goggles) |
| Attribute engine (incl. SELECT option sets) | ✅ | `attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values` |
| Brands & Manufacturers | ✅ | `upsertVerticalBrands` & `upsertVerticalManufacturers` (Yonex, Wilson, Nike, Adidas, Puma, Decathlon, Mikasa, SG, SS, Kookaburra, Everlast, Duranta, Nivia, PowerMax, Cosco, Spalding) |
| Variants / SKU / Inventory | ✅ | Gear/Ball Size, Dumbbell/Plate Weight, Glove Size, Footwear Size, Pack/Set Configuration are variant-axis attributes |
| Search / Dynamic Filters / Facets | ✅ | Facet builder and filter engine seamlessly filter on sport discipline, activity, skill level, material, and brand |
| Sports Equipment & Safety System | ✅ | Modeled via structured attributes (`sports-type`, `sports-activity`, `sports-skill-level`, `sports-material`, `sports-size`, `sports-weight-capacity`, `sports-glove-size`, `sports-footwear-size`, `sports-warranty`) |
| Cart / Checkout / Order / Analytics / RBAC | ✅ | Full end-to-end integration without custom tables |

**No category-specific database tables or schema copies exist (`SportsProduct`, `SportsSKU`, `SportsCart`, etc. are forbidden).**

---

## 2. Taxonomy Hierarchy (`sports-fitness`)

Root `sports-fitness` — *Sports & Fitness* / *খেলাধুলা ও ফিটনেস* (Icon: ⚽) — organized into 14 primary branches:

```
Sports & Fitness (খেলাধুলা ও ফিটনেস)
├── Sportswear & Activewear (খেলাধুলার পোশাক ও অ্যাক্টিভওয়্যার)
│   ├── Men's Sportswear (পুরুষদের স্পোর্টসওয়্যার) → sports-jersey
│   ├── Women's Sportswear (মহিলাদের স্পোর্টসওয়্যার) → sports-jersey
│   ├── Kids Sportswear (বাচ্চাদের স্পোর্টসওয়্যার) → sports-jersey
│   ├── Sports Jerseys (খেলার জার্সি) → sports-jersey
│   └── Shorts & Track Pants (শর্টস ও ট্র্যাক প্যান্ট) → sports-jersey
├── Sports Footwear (স্পোর্টস জুতা)
│   ├── Running Shoes (রানিং জুতা) → running-shoe
│   ├── Football Boots & Cleats (ফুটবল বুট) → running-shoe
│   ├── Cricket Shoes (ক্রিকেট জুতা) → running-shoe
│   ├── Badminton Shoes (ব্যাডমিন্টন জুতা) → running-shoe
│   └── Training & Gym Shoes (ট্রেনিং ও জিম জুতা) → running-shoe
├── Football & Soccer (ফুটবল ও সকার)
│   ├── Match & Training Footballs (ম্যাচ ও ট্রেনিং ফুটবল) → football
│   ├── Goalkeeper Gloves (গোলকিপার গ্লাভস) → boxing-gloves
│   └── Shin Guards & Football Accessories (শিন গার্ড ও এক্সেসরিজ) → football
├── Cricket Gear & Equipment (ক্রিকেট সামগ্রী ও সরঞ্জাম)
│   ├── Cricket Bats (ক্রিকেট ব্যাট) → cricket-bat
│   ├── Cricket Balls (ক্রিকেট বল) → cricket-bat
│   ├── Batting Gloves, Pads & Helmets (ব্যাটিং গ্লাভস, প্যাড ও হেলমেট) → cricket-bat
│   └── Stumps, Kit Bags & Accessories (স্ট্যাম্প, কিট ব্যাগ ও এক্সেসরিজ) → cricket-bat, sports-bag
├── Badminton (ব্যাডমিন্টন)
│   ├── Badminton Rackets (ব্যাডমিন্টন র‍্যাকেট) → badminton-racket
│   ├── Shuttlecocks (Feather & Nylon) (ফেদার ও নাইলন শাটলকক) → badminton-racket
│   └── Badminton Nets, Grips & Strings (নেট, গ্রিপ ও স্ট্রিং) → badminton-racket
├── Tennis (টেনিস)
│   ├── Tennis Rackets (টেনিস র‍্যাকেট) → tennis-racket
│   ├── Tennis Balls (টেনিস বল) → tennis-racket
│   └── Grips, Strings & Nets (গ্রিপ, স্ট্রিং ও নেট) → tennis-racket
├── Table Tennis (টেবিল টেনিস)
│   ├── Table Tennis Tables (টিটি টেবিল) → cricket-bat
│   └── TT Bats & Balls (টিটি ব্যাট ও বল) → cricket-bat
├── Basketball & Volleyball (বাস্কেটবল ও ভলিবল)
│   ├── Basketballs & Hoops (বাস্কেটবল ও হুপ) → football
│   └── Volleyballs & Nets (ভলিবল ও নেট) → football
├── Fitness & Gym Equipment (ফিটনেস ও জিম ইকুইপমেন্ট)
│   ├── Dumbbells & Hand Weights (ডাম্বেল ও হ্যান্ড ওয়েট) → dumbbell-pair
│   ├── Barbells & Weight Plates (বারবেল ও প্লেট) → dumbbell-pair
│   ├── Treadmills & Cardio Machines (ট্রেডমিল ও কার্ডিও মেশিন) → treadmill
│   ├── Weight Benches & Home Gyms (ওয়েট বেঞ্চ ও হোম জিম) → dumbbell-pair
│   └── Resistance Bands & Skipping Ropes (রেজিস্ট্যান্স ব্যান্ড ও স্কিপিং রোপ) → dumbbell-pair
├── Yoga & Pilates (যোগ ও পাইলেটস)
│   ├── Yoga & Exercise Mats (যোগ ও এক্সারসাইজ ম্যাট) → yoga-mat
│   └── Yoga Blocks, Straps & Rings (যোগ ব্লক, স্ট্র্যাপ ও পাইলেটস রিং) → yoga-mat
├── Cycling & Bicycles (সাইক্লিং ও বাইসাইকেল)
│   ├── Mountain Bikes & City Cycles (মাউন্টেন বাইক ও সাইকেল) → bicycle
│   ├── Helmets & Protective Cycling Gear (সাইক্লিং হেলমেট ও গিয়ার) → bicycle
│   └── Pumps, Lights & Locks (পাম্প, লাইট ও লক) → bicycle
├── Swimming & Water Sports (সাঁতার ও ওয়াটার স্পোর্টস)
│   ├── Swimwear & Trunks (সাঁতারের পোশাক) → sports-jersey
│   └── Swimming Goggles & Caps (সাঁতারের চশমা ও ক্যাপ) → swimming-goggles
├── Boxing & Martial Arts (বক্সিং ও মার্শাল আর্টস)
│   ├── Boxing Gloves (বক্সিং গ্লাভস) → boxing-gloves
│   └── Punching Bags, Wraps & Hand Guards (পাঞ্চিং ব্যাগ, হ্যান্ড র‍্যাপ ও গার্ড) → boxing-gloves
└── Sports Bags & Accessories (স্পোর্টস ব্যাগ ও এক্সেসরিজ)
    ├── Gym Bags & Duffel Bags (জিম ব্যাগ ও ডাফেল ব্যাগ) → sports-bag
    ├── Water Bottles & Protein Shakers (পানির বোতল ও শেকার) → sports-bag
    └── Fitness Trackers & Smart Sports Bands (ফিটনেস ট্র্যাকার ও স্পোর্টস ব্যান্ড) → sports-bag
```

---

## 3. Structured Attributes & Multi-Dimensional Variants

12 reusable attributes defined for the Sports & Fitness vertical:

| Attribute Slug | Type | Axis | Purpose & Options |
| --- | --- | --- | --- |
| `sports-type` | SELECT | Spec | Cricket, Football / Soccer, Badminton, Tennis, Table Tennis, Basketball, Volleyball, Gym & Fitness, Yoga & Pilates, Running & Athletics, Cycling, Swimming & Water Sports, Boxing & Martial Arts, Outdoor & Adventure |
| `sports-activity` | SELECT | Spec | Running, Gym & Strength Training, Weightlifting, Cardio & Endurance, Yoga & Stretching, Match & Tournament Play, Daily Practice & Training, Outdoor Cycling, Lap Swimming & Water Sports, Casual & Active Lifestyle |
| `sports-skill-level` | SELECT | Spec | Beginner, Intermediate, Advanced, Professional / Match Grade, All Skill Levels |
| `sports-gender` | SELECT | Spec | Men, Women, Boys, Girls, Unisex, Kids |
| `sports-material` | SELECT | Spec | English Willow, Kashmir Willow, High-Modulus Carbon Graphite, High-Grade PU Synthetic Leather, Natural Rubber, Solid Cast Iron (Rubber Coated), High-Density Eco TPE, High-Tensile Steel, Aircraft-Grade Aluminum Alloy, Breathable Dry-Fit Polyester, Microfiber Synthetic Leather |
| `sports-size` | SELECT | Variant | Size 3, Size 4, Size 5, Short Handle (SH), Long Handle (LH), Full Size, Standard, S, M, L, XL, XXL, 26-Inch, 27.5-Inch, 29-Inch |
| `sports-weight-capacity` | SELECT | Variant | 2.5 kg, 5 kg, 7.5 kg, 10 kg, 15 kg, 20 kg, 77g (5U), 83g (4U), 88g (3U), Up to 100 kg, Up to 120 kg, Up to 150 kg |
| `sports-glove-size` | SELECT | Variant | 8 oz, 10 oz, 12 oz, 14 oz, 16 oz, Size 7, Size 8, Size 9, Size 10 |
| `sports-footwear-size` | SELECT | Variant | EU 39, EU 40, EU 41, EU 42, EU 43, EU 44, EU 45 |
| `sports-pack-size` | SELECT | Variant | 1 Piece, Pair of 2, Tube of 6, Tube of 12, Set of 3, Set of 4, Full Kit |
| `sports-warranty` | SELECT | Spec | No Warranty, 6 Months Official Warranty, 1 Year Official Brand Warranty, 2 Years Motor / Frame Service Warranty |
| `sports-country-of-origin` | SELECT | Spec | Bangladesh, India, Japan, UK, USA, Germany, France, China, Taiwan, Pakistan |

---

## 4. 10 Rich Realistic Demo Products

1. **Cricket Bat:** Demo SG Players Edition Kashmir Willow Cricket Bat (Full Size SH / LH)
2. **Football:** Demo Mikasa FT-5 Goal Master Official Match Football (Size 4 / Size 5)
3. **Badminton Racket:** Demo Yonex Nanoray Light 18i Ultra-Lightweight Carbon Graphite Racket (77g 5U / 83g 4U)
4. **Gym & Fitness / Dumbbells:** Demo Decathlon Domyos Ergonomic Hex Rubber Coated Dumbbell Pair (5 kg, 10 kg, 15 kg Pair)
5. **Running Shoes:** Demo Nike Air Zoom Pegasus Responsive Cushioning Running Shoes (EU 41, EU 42, EU 43, EU 44)
6. **Yoga Mat:** Demo Decathlon Nyamba Eco Non-Slip High-Density TPE Yoga Mat 6mm (Mint Green, Slate Grey)
7. **Sports Jersey:** Demo Bangladesh National Cricket Team Official Moisture-Wicking Match Jersey (M, L, XL, XXL)
8. **Fitness Equipment / Cardio:** Demo PowerMax Fitness 2.0 HP Peak Motorized Foldable Smart Treadmill with LCD (Up to 120 kg with 2 Years Service Warranty)
9. **Boxing Gloves:** Demo Everlast Pro Style Elite Hook-and-Loop Training Boxing Gloves (10 oz, 12 oz, 14 oz)
10. **Bicycle / Cycling:** Demo Duranta Gladiator 26-Inch 21-Speed Alloy Suspension Mountain Bike (26-Inch, 27.5-Inch)

---

## 5. UI/UX & Storefront Features
- **Sports & Discipline Badges:** Prominent tags indicating sport discipline (Football, Cricket, Badminton, etc.) and skill level.
- **Dynamic Variant Axis Resolvers:** Contextual variant selectors for dumbbells (Weight), gloves (Ounce / Size), shoes (EU Size), balls (Size 4 / Size 5), and packs (Pair / Sets).
- **Sports Equipment Safety Advisory:** Guidance on protective gear usage, warm-up routines, treadmill load limits, and racket string maintenance.
- **Bilingual Storefront:** Authentic English & Bangla terminology across all sports subtrees, attributes, and safety recommendations.
