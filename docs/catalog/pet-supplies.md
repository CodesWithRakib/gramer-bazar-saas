# Pet Supplies Catalog Vertical Implementation Guide

## Executive Summary
The **Pet Supplies** vertical (`pet-supplies` / পোষা প্রাণীর সামগ্রী) offers a robust, veterinarian-conscious catalog spanning complete animal nutrition, habitat gear, aquarium hydraulics, hygiene, and toys.

### Core Architecture Highlights
1. **Universal Taxonomy**: Operates inside the core category tree (`Category.slug = 'pet-supplies'`) without branching out into duplicate micro-services or redundant tables.
2. **First-Expiry-First-Out (FEFO) Batch Engine**: Uses the universal `SeedProductBatch` schema for dog/cat dry food, canned gravy, and bird/fish feed batches with precise lot tracking and expiry verification.
3. **Multi-Variant Axis**:
   - Pack Weight & Volume: `400g`, `1.2kg`, `3kg`, `7kg`, `10kg`, `20kg`
   - Flavor: `Chicken & Vegetable`, `Salmon & Ocean Fish`, `Tuna in Jelly`, `Roasted Beef`
   - Scent & Fragrance: `Lavender`, `Apple Scent`, `Baby Powder`, `Unscented`
   - Equipment Capacity: `100W / 50L`, `300W / 150L`, `500 L/h`, `1000 L/h`
4. **Bilingual Presentation**: Full dual-language localization (English and Bangla) across navigation, specifications, safety disclaimers, and warranty badges.

---

## Catalog Structure

```
Pet Supplies (Root)
│
├── Dog Supplies
│   ├── Dry Food, Wet Food, Treats & Biscuits
│   ├── Collars, Leashes & Harnesses
│   └── Beds, Kennels & Toys
│
├── Cat Supplies
│   ├── Dry Kibble, Wet Gravy & Catnip
│   ├── Bentonite & Tofu Litter
│   └── Scratching Posts & Teasers
│
├── Bird Supplies
│   ├── Seed Mixes, Pellets & Mineral Blocks
│   └── Bird Cages, Perches & Feeders
│
├── Fish & Aquarium
│   ├── Flakes, Pellets & Freeze-Dried Treats
│   ├── Tanks, Canister Filters & Submersible Pumps
│   └── Submersible Heaters & LED Lighting
│
├── Small Animal Supplies
│   ├── Rabbit & Guinea Pig Alfalfa Pellets
│   └── Hamster Enclosures & Exercise Wheels
│
├── Pet Grooming & Health
│   ├── Medicated & Conditioning Shampoos
│   ├── De-shedding Rakes & Nail Grinders
│   └── Flea & Tick Spot-On Pipettes
│
├── Pet Accessories & Travel
│   ├── IATA Airline-Approved Crates & Carriers
│   └── Stainless Steel Non-Skid Bowls & Water Fountains
│
└── Pet Cleaning & Hygiene
    ├── Ultra Clumping Bentonite Litter
    ├── 5-Layer Activated Carbon Pee Pads
    └── Enzymatic Urine & Odor Eliminator Sprays
```

---

## Seeded Demo Products Matrix

| Product Name | Category | Product Type | Primary Spec | Variants |
|---|---|---|---|---|
| **Royal Canin Maxi Adult Dry Dog Food** | Dog Food | `pet-food-dry` | 26% Protein, Large Breeds | 4kg (৳5,200), 15kg (৳16,800) |
| **Pedigree Adult Chicken & Vegetables** | Dog Food | `pet-food-dry` | Complete Nutrition, 20% Protein | 1.2kg (৳850), 3kg (৳1,950), 10kg (৳5,800) |
| **Royal Canin Kitten Dry Cat Food** | Cat Food | `pet-food-dry` | 36% Protein, Digestive Health | 400g (৳850), 2kg (৳3,600), 4kg (৳6,800) |
| **Whiskas Ocean Fish Adult Cat Food** | Cat Food | `pet-food-dry` | 30% Protein, Hairball Control | 1.2kg (৳980), 3kg (৳2,350), 7kg (৳5,100) |
| **Me-O Creamy Cat Treats (Bonito & Crab)** | Cat Treats | `pet-treat` | Taurine & Omega-3 | 4 x 15g (৳190), 20 x 15g (৳850) |
| **Sanicat Ultra Clumping Cat Litter** | Cat Litter | `cat-litter` | 99.9% Dust-Free, Bentonite | 5L (৳650), 10L (৳1,200) |
| **Sobo Submersible Power Aquarium Filter** | Aquarium Hardware | `aquarium-filter` | 15W, 800 LPH, Dual Sponge | 800 L/h (৳850), 1200 L/h (৳1,350) |
| **TetraMin Tropical Flakes Fish Food** | Fish Food | `fish-food` | Clean & Clear Water Formula | 100ml / 20g (৳380), 250ml / 52g (৳850) |
| **Prestige Premium Budgie Seed Mix** | Bird Food | `bird-food` | VAM Pellets & Chia Seeds | 1kg (৳750), 4kg (৳2,700) |
| **Bioline Anti-Flea & Tick Dog Shampoo** | Pet Grooming | `pet-grooming-shampoo`| Margosa Extract, 0% Parabens | 250ml (৳580), 500ml (৳980) |
| **KONG Classic Durable Rubber Dog Toy**| Dog Toys | `dog-toys` | Natural Dental Rubber | Medium (৳1,450), Large (৳1,950) |
| **Heavy Duty Double Door Pet Carrier** | Pet Travel | `pet-carrier` | IATA Approved, Security Lock | Small 19" (৳2,800), Medium 24" (৳4,500) |
