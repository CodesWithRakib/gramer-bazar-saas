# Automotive Catalog Vertical & Vehicle Fitment System

The **eighth vertical** running on the Gramer Bazar universal catalog engine (joining Electronics, Medicine, Grocery, Fashion, Cosmetics, Home & Kitchen, and Baby & Kids).
Adhering strictly to universal architectural principles, Automotive operates with **zero separate tables or architectural duplication**. It reuses Categories, Product Types, Attributes, Brands, Variants, SKU, Inventory, Search, Filters, Cart, Checkout, and Orders, while providing a **robust vehicle compatibility / fitment system**.

```
                           UNIVERSAL CATALOG ENGINE (shared)
                                         │
   ┌──────────┬──────────┬──────────┬────┴─────┬──────────┬──────────────┬──────────────┬──────────────┐
   │          │          │          │          │          │              │              │              │
Electronics Medicine  Grocery    Fashion   Cosmetics  Home & Kitchen   Baby & Kids    Automotive      Future
  Products   Products  Products   Products   Products    Products       Products       Products
  Variants   Variants  Variants   Variants   Variants    Variants       Variants       Variants    (viscosity × volume × pack × tire)
  Attributes Attributes Attributes Attributes Attributes  Attributes     Attributes     Attributes  (+ make/model fitment / warranty)
  Inventory  Inventory Inventory  Inventory  Inventory   Inventory      Inventory      Inventory
```

---

## 1. What was Reused (Audit & Compliance)

| Concern | Reused | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` with root `automotive` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` (Brake Pad, Engine Oil, Spark Plug, Air Filter, Car Battery, Car Shampoo, Tire, Dash Cam, OBD Scanner, Motorcycle Helmet) |
| Attribute engine (incl. SELECT option sets) | ✅ | `attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values` |
| Brands & Manufacturers | ✅ | `upsertVerticalBrands` & `upsertVerticalManufacturers` (Bosch, Mobil 1, Denso, NGK, Bridgestone, Rahimafrooz, 70mai, Steelbird, Toyota Genuine, etc.) |
| Variants / SKU / Inventory | ✅ | Oil Viscosity, Fluid Volume, Tire Size, Battery Capacity, Pack Configuration, and Position are variant-axis attributes |
| Search / Dynamic Filters / Facets | ✅ | Facet builder and filter engine seamlessly filter on vehicle make, vehicle model, OEM part number, viscosity, and brand |
| Vehicle Fitment / Compatibility | ✅ | Modeled via structured attributes (`auto-compatible-make`, `auto-compatible-model`, `auto-fitment-type`, `auto-position`, `auto-oem-classification`) |
| Cart / Checkout / Order / Analytics / RBAC | ✅ | Full end-to-end integration without custom tables |

**No category-specific database tables or schema copies exist (`AutomotiveProduct`, `AutomotiveSKU`, `AutomotiveCart`, etc. are forbidden).**

---

## 2. Taxonomy Hierarchy (`automotive`)

Root `automotive` — *Automotive* / *অটোমোটিভ ও মোটর পার্টস* (Icon: 🚗) — organized into 10 primary branches:

```
Automotive (অটোমোটিভ ও মোটর পার্টস)
├── Car Parts (গাড়ির পার্টস)
│   ├── Brake System (ব্রেক সিস্টেম) → brake-pad
│   ├── Engine Parts & Ignition (ইঞ্জিন পার্টস ও ইগনিশন) → spark-plug
│   ├── Automotive Filters (অটোমোটিভ ফিল্টার) → car-filter
│   └── Suspension & Steering (সাসপেনশন ও স্টিয়ারিং) → shock-absorber
├── Motorcycle Parts (মোটরসাইকেল পার্টস)
│   ├── Motorcycle Brakes & Cables (বাইক ব্রেক ও ক্যাবল) → moto-brake-pad
│   └── Chain & Sprockets (চেইন ও স্প্রকেট) → chain-sprocket-kit
├── Car Accessories (গাড়ির এক্সেসরিজ)
│   ├── Interior Accessories & Mats (ইন্টেরিয়র এক্সেসরিজ ও ম্যাট) → car-mat
│   └── Phone Holders & Fast Chargers (ফোন হোল্ডার ও চার্জার) → car-charger-holder
├── Motorcycle Accessories (মোটরসাইকেল এক্সেসরিজ)
│   └── Helmets & Riding Gear (হেলমেট ও রাইডিং গিয়ার) → moto-helmet
├── Tires & Wheels (টায়ার ও চাকা)
│   ├── Car Tires (গাড়ির টায়ার) → car-tire-pt
│   └── Motorcycle Tires (মোটরসাইকেল টায়ার) → moto-tire-pt
├── Car Care & Detailing (গাড়ির যত্ন ও ক্লিনিং)
│   └── Car Wash & Foam Shampoo (কার ওয়াশ ও শ্যাম্পু) → car-wash-shampoo-pt
├── Oils & Lubricants (ইঞ্জিন অয়েল ও লুব্রিকেন্ট)
│   ├── Synthetic Engine Oil (সিন্থেটিক ইঞ্জিন অয়েল) → engine-oil-pt
│   └── Brake Fluids & Coolants (ব্রেক ফ্লুইড ও কুল্যান্ট) → brake-fluid-pt
├── Automotive Batteries (গাড়ি ও বাইকের ব্যাটারি)
│   └── Maintenance-Free Car Batteries (কার ব্যাটারি) → car-battery-pt
├── Tools & Equipment (টুলস ও ডায়াগনস্টিক গ্যাজেট)
│   └── OBD2 Diagnostic Scanners (ওবিডি২ স্ক্যানার ও গেজ) → obd-scanner-pt
└── Automotive Electronics (কার ইলেকট্রনিক্স)
    └── Smart Dash Cams & Reverse Cameras (স্মার্ট ড্যাশ ক্যাম ও রিভার্স ক্যামেরা) → dash-cam-pt
```

---

## 3. Structured Attributes & Multi-Dimensional Variants

13 reusable attributes defined for the Automotive vertical:

| Attribute Slug | Type | Axis | Purpose & Options |
| --- | --- | --- | --- |
| `auto-vehicle-type` | SELECT | Spec | Passenger Car / Sedan, SUV / Crossover, Microbus / Van, Motorcycle / Scooter, Commercial Truck / Pickup, Universal Fit |
| `auto-compatible-make` | SELECT | Spec | Toyota, Honda, Nissan, Mitsubishi, Suzuki, Hyundai, Mazda, Yamaha, Bajaj, TVS, Hero, Universal |
| `auto-compatible-model` | SELECT | Spec | Toyota Corolla / Axio (2012–2020), Toyota Allion / Premio (2007–2018), Toyota Noah / Voxy (2014–2021), Honda Civic (2016–2021), Honda Vezel / HR-V (2013–2020), Nissan X-Trail T32 (2013–2020), Suzuki Swift / Dzire (2017–2024), Yamaha FZ / FZS V2/V3, Bajaj Pulsar 150, Universal Fit for All Vehicles |
| `auto-fitment-type` | SELECT | Spec | Direct OEM Fit (Vehicle-Specific), Universal Fit (All Models), Performance Upgrade |
| `auto-oem-classification` | SELECT | Spec | OEM Genuine Factory Part, OEM Equivalent Specification, Premium Aftermarket, Universal Fitment |
| `auto-position` | SELECT | Spec | Front Axle, Rear Axle, Front & Rear, Left (Passenger Side), Right (Driver Side), Engine Bay, Interior Cabin, Universal |
| `auto-oil-viscosity` | SELECT | **Variant** | 0W-20, 5W-30, 5W-40, 10W-30, 10W-40, 20W-50 |
| `auto-volume` | SELECT | **Variant** | 1 Liter, 3 Liters, 4 Liters, 5 Liters, 200 ml, 500 ml, 1 Gallon (3.78L) |
| `auto-tire-size` | SELECT | **Variant** | 185/65 R15, 195/65 R15, 205/55 R16, 215/55 R17, 225/65 R17, 100/90-17, 140/70-17 |
| `auto-battery-capacity` | SELECT | **Variant** | 35 Ah, 45 Ah, 55 Ah, 65 Ah, 75 Ah, 5 Ah (Bike), 7 Ah (Bike), 9 Ah (Bike) |
| `auto-pack-size` | SELECT | **Variant** | 1 Piece, Set of 4, Pair of 2, Complete Kit, Single Front Cam, Dual Front + Rear Cam Set |
| `auto-warranty` | SELECT | Spec | No Warranty, 6 Months Replacement, 12 Months Official Warranty, 18 Months Warranty, 24 Months Warranty |
| `auto-country-of-origin` | SELECT | Spec | Japan, Germany, USA, Bangladesh, India, Thailand, Indonesia, China, Italy |

---

## 4. Authentic Regional & Global Brands

- **Japanese OEM & Leaders:** Toyota Genuine Parts, Denso, NGK, Bridgestone, Yokohama, Yamaha Genuine Parts.
- **European & Global Giants:** Bosch (Germany), Brembo (Italy), Mobil 1 (USA), Castrol (UK), Motul (France), Shell Helix (UK), Michelin (France).
- **Bangladeshi Powerhouses:** Rahimafrooz (Globatt / Volta), Lucas Batteries Bangladesh.
- **Smart Tech & Gear:** 70mai (Xiaomi Ecosystem), Steelbird (India), Meguiar’s / 3M (USA), Ancel (USA), Baseus.

---

## 5. Rich Seed Demo Products

1. **Bosch Blue Ceramic Front Brake Pads** — Set of 4, Direct OEM Fit for Toyota Corolla / Axio 2012–2020.
2. **Mobil 1 Advanced Full Synthetic 5W-30 Engine Oil** — 1 Liter & 4 Liters, API SP / ILSAC GF-6A.
3. **NGK Laser Iridium Long-Life Spark Plugs** — Set of 4, Direct Fit for Honda Civic & Vezel (100,000 km lifespan).
4. **Denso High-Efficiency Engine Air & Cabin Filter** — Engine Air Filter & Carbon Cabin Filter for Toyota Allion/Premio.
5. **Rahimafrooz Globatt Sealed Maintenance-Free Car Battery** — 45 Ah, 55 Ah, 65 Ah with 18 Months Warranty.
6. **Meguiar’s Gold Class Rich Carnauba Wash & Wax** — 500 ml & 1 Gallon (3.78L) clear-coat safe shampoo.
7. **Bridgestone Ecopia EP150 Low Rolling Resistance Radial Tire** — 195/65 R15 & 205/55 R16, 24 Months Warranty.
8. **70mai Smart Dash Cam Pro Plus+ A500S Dual Vision** — Single Front Cam & Dual Front + Rear Cam Set with GPS & ADAS.
9. **Ancel AD310 OBD2 Universal Car Engine Diagnostic Code Reader** — 1 Piece, Universal OBD2/EOBD scanner.
10. **Steelbird Air SBA-1 Full Face Aerodynamic Helmet** — M (580mm), L (600mm), XL (620mm) in Matte Black & Pearl White.

---

## 6. Frontend Storefront Integration

- **Product Details Page (`ProductDetailsClient.tsx`):**
  - Instant vertical detection via `isAutomotive`.
  - Vehicle fitment resolution: `autoCompatibleModelSpec`, `autoFitmentTypeSpec`, `autoPositionSpec`, `autoOemSpec`, `autoWarrantySpec`.
  - Dedicated Purchase Box Badges: `✓ Direct Fit: Toyota Corolla`, `Direct OEM Fit`, `OEM Equivalent`, `Position: Front Axle`, `Warranty: 18 Months`.
  - Dynamic variant axis labels adapting to Viscosity Grade, Tire Size, Battery Capacity, or Packaging Set.
  - **Vehicle Fitment & Technical Installation Advisory Banner:** Reminds users to verify make/model/year compatibility and advises certified technician installation for safety-critical components.
- **Product Card (`ProductCard.tsx`):**
  - Dedicated `automotive` category theme with slate/zinc badge (`অটোমোটিভ` / `Automotive`) and `ShieldCheck` icon.
