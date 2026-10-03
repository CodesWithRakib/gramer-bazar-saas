# Home & Kitchen Catalog Vertical

The **sixth vertical** running on the Gramer Bazar universal catalog engine (joining Electronics, Medicine, Grocery, Fashion, and Cosmetics).
Adhering strictly to universal architectural principles, Home & Kitchen operates with **zero separate tables or architectural duplication**. It reuses Categories, Product Types, Attributes, Brands, Variants, SKU, Inventory, Search, Filters, Cart, Checkout, and Orders.

```
                  UNIVERSAL CATALOG ENGINE (shared)
                               │
         ┌──────────┬──────────┼──────────┬──────────┬──────────┬──────────────┐
         │          │          │          │          │          │              │
    Electronics  Medicine   Grocery    Fashion   Cosmetics  Home & Kitchen   Future
      Products   Products   Products   Products   Products    Products
      Variants   Variants   Variants   Variants   Variants    Variants   (capacity × pack × color)
      Attributes Attributes Attributes Attributes Attributes  Attributes (+ dimension/power)
      Inventory  Inventory  Inventory  Inventory  Inventory   Inventory
```

---

## 1. What was Reused (Audit & Compliance)

| Concern | Reused | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` with root `home-kitchen` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` (Rice Cooker, Kettle, Blender, Pan, Chair, Bedsheet, etc.) |
| Attribute engine (incl. SELECT option sets) | ✅ | `attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values` |
| Brands | ✅ | `upsertVerticalBrands` (Walton, Vision, RFL, Gazi, Regal, Kiam, Hatil, Philips, Panasonic, etc.) |
| Variants / SKU / Inventory | ✅ | Capacity, Dimensions, Pack Size, Bed Size, and Color are variant-axis attributes |
| Search / Dynamic Filters / Facets | ✅ | Facet builder and filter engine seamlessly filter on material, wattage, warranty, and room |
| Visual Swatches | ✅ | Reuses `attribute_options.hex_color` for metallic, wood, and color previews |
| Cart / Checkout / Order / Analytics / RBAC | ✅ | Full end-to-end integration without custom tables |

**No category-specific database tables or schema copies exist.**

---

## 2. Taxonomy Hierarchy (`home-kitchen`)

Root `home-kitchen` — *Home & Kitchen* / *হোম ও কিচেন* — organized into 10 primary branches:

```
Home & Kitchen
├── Kitchen & Dining (রান্নাঘর ও ডাইনিং)
│   ├── Cookware & Pans (রান্নার পাত্র ও প্যান) → home-cookware
│   ├── Dinnerware & Sets (ডিনার সেট ও প্লেট) → home-dinnerware
│   ├── Water Bottles & Flasks (পানির বোতল ও ফ্লাস্ক) → home-waterbottle
│   └── Food Storage & Containers (ফুড স্টোরেজ ও কন্টেইনার) → home-container
├── Kitchen Appliances (রান্নাঘরের যন্ত্রপাতি)
│   ├── Rice Cookers (রাইস কুকার) → home-ricecooker
│   ├── Electric Kettles (ইলেকট্রিক কেটলি) → home-electrickettle
│   ├── Blenders & Grinders (ব্লেন্ডার ও গ্রাইন্ডার) → home-blender
│   ├── Microwave & Electric Ovens (মাইক্রোওয়েভ ও ওভেন) → home-microwave
│   └── Air Fryers (এয়ার ফ্রায়ার) → home-airfryer
├── Home Appliances (গৃহস্থালি যন্ত্রপাতি)
│   ├── Electric Fans (ফ্যান) → home-fan
│   ├── Refrigerators & Freezers (রেফ্রিজারেটর ও ফ্রিজ) → home-refrigerator
│   ├── Washing Machines (ওয়াশিং মেশিন) → home-washingmachine
│   └── Electric Irons (ইস্ত্রি) → home-iron
├── Home Decor (গৃহসজ্জা)
│   ├── Wall Decor & Clocks (দেয়াল সজ্জা ও ঘড়ি) → home-walldecor
│   └── Vases & Artificial Plants (ফুলদানি ও কৃত্রিম গাছ) → home-vase
├── Furniture (আসবাবপত্র)
│   ├── Tables & Desks (টেবিল ও ডেস্ক) → home-table
│   ├── Chairs & Stools (চেয়ার ও টুল) → home-chair
│   └── Shelves & Storage Cabinets (তাক ও কেবিনেট) → home-cabinet
├── Bedding & Bath (বেডিং ও বাথ)
│   ├── Bedsheets & Pillow Covers (বিছানার চাদর ও কভার) → home-bedsheet
│   ├── Blankets & Comforters (কম্বল ও কমফোর্টার) → home-blanket
│   ├── Bath Towels & Mats (তোয়ালে ও বাথ ম্যাট) → home-towel
│   └── Curtains & Drapes (পর্দা) → home-curtain
├── Cleaning & Laundry (পরিচ্ছন্নতা ও লন্ড্রি)
│   ├── Mops, Brooms & Brushes (মপ, ঝাড়ু ও ব্রাশ) → home-mop
│   └── Laundry Baskets & Dryers (লন্ড্রি ঝুড়ি ও ড্রায়ার) → home-laundry
├── Storage & Organization (স্টোরেজ ও অর্গানাইজার)
│   ├── Storage Boxes & Baskets (স্টোরেজ বক্স ও ঝুড়ি) → home-storagebox
│   └── Shoe Racks & Wardrobes (জুতার র‍্যাক ও ওয়ারড্রব) → home-shoerack
├── Lighting & Lamps (লাইটিং ও আলোকসজ্জা)
│   ├── LED Bulbs & Tube Lights (এলইডি বাল্ব ও টিউব লাইট) → home-ledbulb
│   └── Table Lamps & Ceiling Lights (টেবিল ল্যাম্প ও সিলিং লাইট) → home-lamp
└── Home Improvement & Tools (হোম ইমপ্রুভমেন্ট ও টুলস)
    ├── Hardware & Hand Tools (হার্ডওয়্যার ও হ্যান্ড টুল) → home-hardware
    └── Bathroom Fixtures & Hooks (বাথরুম ফিটিংস ও হুক) → home-bathfixture
```

---

## 3. Structured Attributes & Multi-Dimensional Variants

14 reusable attributes defined for home and appliance products:

| Attribute Slug | Type | Axis | Purpose & Options |
| --- | --- | --- | --- |
| `home-material` | SELECT | Spec | Stainless Steel, Aluminum, Cast Iron, Granite, Glass, Ceramic, Plastic, Wood, Cotton, etc. |
| `home-capacity` | SELECT | **Variant** | 500 ml, 750 ml, 1.2 L, 1.5 L, 1.8 L, 2.8 L, 5 L, 8 kg, 250 L |
| `home-dimensions` | SELECT | Spec/Var | 20 cm, 24 cm, 28 cm, 32 cm, Queen Size, King Size, 120 × 60 × 75 cm |
| `home-power` | SELECT | Spec | 12W, 40W, 75W, 250W, 750W, 1000W, 1200W, 1800W, 2000W |
| `home-voltage` | SELECT | Spec | 220-240V |
| `home-energy-rating` | SELECT | Spec | 3 Star, 4 Star, 5 Star, Inverter Class A+++ |
| `home-room` | SELECT | Spec | Kitchen, Dining Room, Living Room, Bedroom, Bathroom, Home Office |
| `home-finish` | SELECT | Spec | Matte, Glossy, Polished, Wood Grain, Brushed |
| `home-assembly` | SELECT | Spec | Pre-Assembled, Assembly Required, Tool-Free DIY Assembly |
| `home-warranty` | SELECT | Spec | 6 Months, 1 Year, 2 Years, 3 Years, 5 Years, 10 Years Motor Warranty |
| `home-pack-size` | SELECT | **Variant** | 1 Piece, 2 Pieces, 3-Piece Set, 6-Piece Set, Value Pack of 3, 24-Piece Dinner Set |
| `home-bed-size` | SELECT | **Variant** | Single, Semi Double, Double, Queen, King |
| `home-color` | SELECT | **Variant** | Black, White, Silver, Grey, Red, Navy Blue, Natural Wood, Walnut Brown, Gold |
| `home-country-of-origin` | SELECT | Spec | Bangladesh, India, China, Japan, France, Germany, USA, Malaysia |

---

## 4. Frontend Storefront & PDP Features

1. **Flexible Variant Axis Resolution**:
   - Dynamic label: `'ক্যাপাসিটি / সাইজ (Capacity / Size):'` when browsing Home & Kitchen products.
   - Dual-axis support (e.g. Capacity + Color for kettles, Dimensions + Color for pans, Bed Size + Color for sheets).
2. **Technical Badges**:
   - Official warranty indicator (`ওয়ারেন্টি: ২ বছর` / `Warranty: 2 Years`).
   - Power wattage (`1800W`, `750W`).
   - Energy rating (`Inverter Class A+++`, `4 Star`).
   - Material badge (`উপাদান: স্টেইনলেস স্টিল` / `Material: Stainless Steel`).
   - Assembly status (`Pre-Assembled`, `Assembly Required`).
3. **Care & Warranty Delivery Advisory**:
   - Informs customers to retain purchase invoice and warranty documentation.
   - Doorstep inspection advisory for fragile glassware and heavy furniture.
