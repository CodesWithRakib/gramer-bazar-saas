# Cosmetics, Beauty & Personal Care Vertical

The **fifth vertical** powered by the universal catalog engine (following Electronics, Medicine, Grocery, and Fashion).
Nothing was duplicated or fragmented. Cosmetics & Personal Care reuses Categories, Product Types, Attributes, Brands, Variants/SKU, Inventory, Search, Filters, Cart, Orders, Analytics, and RBAC — it is purely **configuration + data**.

```
                  UNIVERSAL CATALOG ENGINE (shared)
                               │
         ┌──────────┬──────────┼──────────┬──────────┬──────────┐
         │          │          │          │          │          │
    Electronics  Medicine   Grocery    Fashion   Cosmetics    Future
      Products   Products   Products   Products   Products
      Variants   Variants   Variants   Variants   Variants   (shade × volume)
      Attributes Attributes Attributes Attributes Attributes (+ shade swatches)
      Inventory  Inventory  Inventory  Inventory  Inventory
```

---

## 1. Universal Architecture Audit & Reuse

| Concern | Reused | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` with root `cosmetics` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` (Facewash, Serum, Lipstick, Sunscreen, etc.) |
| Attribute engine (incl. SELECT option sets) | ✅ | `attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values` |
| Brands | ✅ | `upsertVerticalBrands` (Meril, Kool, CeraVe, Maybelline, L'Oréal, The Body Shop, COSRX, etc.) |
| Variants / SKU / Inventory | ✅ | Shade & Volume are variant-axis attributes (`cosmetics-shade`, `cosmetics-volume`) |
| Search / Dynamic Filters / Facets | ✅ | Variant-axis and spec-level facets work seamlessly via universal catalog engine |
| Cart / Checkout / Order / Analytics / RBAC | ✅ | Full end-to-end integration without custom tables |
| Visual Swatches | ✅ | Reuses `attribute_options.hex_color` for realistic shade swatches |

**Zero cosmetics-specific database tables created.**

---

## 2. Taxonomy Hierarchy (`cosmetics`)

Root `cosmetics` — *Cosmetics & Personal Care* / *প্রসাধন ও ব্যক্তিগত যত্ন* — structured into 8 main subtrees with deep product typing:

```
Cosmetics & Personal Care
├── Skin Care (স্কিন কেয়ার)
│   ├── Face Wash & Cleansers (ফেস ওয়াশ ও ক্লিনজার) → cosmetics-facewash
│   ├── Face Moisturizers (ফেস ময়েশ্চারাইজার) → cosmetics-moisturizer
│   ├── Face Serums (ফেস সিরাম) → cosmetics-serum
│   ├── Face Creams (ফেস ক্রিম) → cosmetics-cream
│   ├── Face Masks & Sheet Masks (ফেস মাস্ক) → cosmetics-mask
│   ├── Toners & Mists (টোনার ও মিস্ট) → cosmetics-toner
│   ├── Sunscreens & SPF Care (সানস্ক্রিন ও সানব্লক) → cosmetics-sunscreen
│   ├── Acne & Spot Care (ব্রণ ও স্পট কেয়ার) → cosmetics-acne-care
│   ├── Lip Care & Balms (লিপ কেয়ার ও বাম) → cosmetics-lip-care
│   ├── Eye Creams & Serums (আই ক্রিম ও সিরাম) → cosmetics-eye-care
│   └── Body Lotions & Creams (বডি লোশন ও ক্রিম) → cosmetics-bodylotion
├── Hair Care (চুলের যত্ন)
│   ├── Shampoos (শ্যাম্পু) → cosmetics-shampoo
│   ├── Conditioners (কন্ডিশনার) → cosmetics-conditioner
│   ├── Hair Oils (হেয়ার অয়েল) → cosmetics-hairoil
│   ├── Hair Serums & Treatments (হেয়ার সিরাম) → cosmetics-hair-serum
│   ├── Hair Color & Henna (হেয়ার কালার ও মেহেদি) → cosmetics-hair-color
│   └── Hair Gels & Sprays (হেয়ার জেল ও স্প্রে) → cosmetics-hair-styling
├── Makeup & Cosmetics (রূপচর্চা ও মেকআপ)
│   ├── Foundations & BB Creams (ফাউন্ডেশন ও বিবি ক্রিম) → cosmetics-foundation
│   ├── Concealers (কনসিলার) → cosmetics-concealer
│   ├── Face Powders & Compacts (ফেস পাউডার ও কম্প্যাক্ট) → cosmetics-face-powder
│   ├── Blushes & Highlighters (ব্লাশ ও হাইলাইটার) → cosmetics-blush
│   ├── Makeup Primers (মেকআপ প্রাইমার) → cosmetics-primer
│   ├── Lipsticks & Lip Colors (লিপস্টিক ও লিপ কালার) → cosmetics-lipstick
│   ├── Lip Glosses & Tints (লিপ গ্লস ও টিন্ট) → cosmetics-lip-gloss
│   ├── Eyeliners & Kajal (আইলাইনার ও কাজল) → cosmetics-eyeliner
│   ├── Mascaras (মাসকারা) → cosmetics-mascara
│   ├── Eyeshadow Palettes (আইশ্যাডো প্যালেট) → cosmetics-eyeshadow
│   └── Makeup Removers (মেকআপ রিমুভার) → cosmetics-makeup-remover
├── Fragrances & Perfumes (সুগন্ধি ও পারফিউম)
│   ├── Eau de Parfum & Perfumes (পারফিউম) → cosmetics-perfume
│   ├── Body Sprays & Mists (বডি স্প্রে ও মিস্ট) → cosmetics-bodyspray
│   ├── Deodorants & Roll-ons (ডিওডোরেন্ট ও রোল-অন) → cosmetics-deodorant
│   └── Attars & Non-Alcoholic Fragrances (আতর) → cosmetics-attar
├── Bath & Body Care (গোসল ও শরীর চর্চা)
│   ├── Body Washes & Shower Gels (বডি ওয়াশ) → cosmetics-bodywash
│   ├── Bath Soaps & Bars (সাবান) → cosmetics-soap
│   └── Hand Washes & Sanitizers (হ্যান্ড ওয়াশ) → cosmetics-handwash
├── Oral Care & Hygiene (দাঁতের যত্ন ও পরিচ্ছন্নতা)
│   ├── Toothpastes (টুথপেস্ট) → cosmetics-toothpaste
│   ├── Toothbrushes (টুথব্রাশ) → cosmetics-toothbrush
│   └── Mouthwashes (মাউথওয়াশ) → cosmetics-mouthwash
├── Men's Grooming (পুরুষদের গ্রুমিং)
│   ├── Beard Oils & Balms (বিয়ার্ড অয়েল ও বাম) → cosmetics-beardoil
│   └── Aftershaves & Shaving Creams (আফটারশেভ) → cosmetics-aftershave
└── Baby Personal Care (শিশুদের প্রসাধন ও যত্ন)
    ├── Baby Lotions & Creams (বেবি লোশন) → cosmetics-babylotion
    ├── Baby Shampoos & Washes (বেবি শ্যাম্পু) → cosmetics-babyshampoo
    └── Baby Soaps & Powders (বেবি সোপ) → cosmetics-babysoap
```

---

## 3. Cosmetics Attributes & Variant Dimensions

14 structured, reusable attributes defined:

| Attribute Slug | Type | Axis | Purpose & Options |
| --- | --- | --- | --- |
| `cosmetics-skin-type` | SELECT | Spec | Normal, Dry, Oily, Combination, Sensitive, Acne-Prone, All Skin Types |
| `cosmetics-hair-type` | SELECT | Spec | Straight, Wavy, Curly, Coily, Dry, Oily, Damaged, Color-Treated, All Hair Types |
| `cosmetics-concern` | SELECT | Spec | Acne, Anti-Aging, Dark Spots, Dryness, Dullness, Oil & Pores, Hair Fall, Dandruff |
| `cosmetics-benefit` | SELECT | Spec | Hydrating, Brightening, Soothing, Long-Lasting, Sun Protection, Repairs Damage |
| `cosmetics-finish` | SELECT | Spec | Matte, Dewy, Satin, Glossy, Natural, Shimmer |
| `cosmetics-coverage` | SELECT | Spec | Light, Medium, Full, Sheer, Buildable |
| `cosmetics-shade` | SELECT | **Variant** | Swatch options with `#hexColor` (Ivory, Beige, Honey, Ruby Red, Coral, Plum, etc.) |
| `cosmetics-volume` | SELECT | **Variant** | 15 ml, 30 ml, 50 ml, 100 ml, 150 ml, 200 ml, 250 ml, 400 ml, 500 ml |
| `cosmetics-spf` | SELECT | Spec | SPF 15, SPF 30, SPF 50, SPF 50+ PA++++ |
| `cosmetics-scent-family` | SELECT | Spec | Floral, Woody, Citrus, Oriental, Fresh, Fruity, Musk, Oud, Sweet |
| `cosmetics-form` | SELECT | Spec | Liquid, Cream, Gel, Foam, Powder, Serum, Oil, Lotion, Balm, Bar, Spray |
| `cosmetics-claims` | SELECT | Spec | Vegan, Cruelty-Free, Paraben-Free, Sulfate-Free, Dermatologically Tested, Waterproof |
| `cosmetics-country-of-origin` | SELECT | Spec | Bangladesh, Korea, India, France, USA, UK, Thailand, Japan, Germany |
| `cosmetics-gender` | SELECT | Spec | Women, Men, Unisex, Baby, Kids |

---

## 4. Storefront & PDP Features

1. **Bilingual Shade & Volume Selectors**:
   - Dynamic label switching: `'শেড (Shade):'` / `'Shade:'` when `isCosmetics`, and `'ভলিউম (Volume):'` / `'Volume:'`.
   - Circular color preview swatches with selection rings and out-of-stock strike-throughs.
   - Intelligent multi-variant resolution allowing Shade-only, Volume-only, or Shade × Volume products.
2. **Cosmetic Badges**:
   - SPF rating badge (e.g. `SPF 50+ PA++++`).
   - Skin Type suitability tag (`ত্বক: সংবেদনশীল` / `Skin: Sensitive`).
   - Finish (`Matte`, `Dewy`) & Coverage (`Full`, `Buildable`).
   - Clean / Dermatologically Tested / Vegan claims.
3. **Dermatological & Patch Test Advisory Banner**:
   - Recommends a 24-hour patch test behind the ear or on wrist before first use.
   - Storage instructions (cool place away from direct light).
