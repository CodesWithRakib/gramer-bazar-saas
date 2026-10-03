# Pet Supplies & Nutrition Vertical Architecture

## 1. Domain Overview
The **Pet Supplies** catalog vertical (`pet-supplies` / পোষা প্রাণীর সামগ্রী) is the dedicated, veterinary-grade pet care and nutrition platform for pet owners, animal breeders, and hobbyists across Bangladesh.

Built strictly on the existing **Universal Catalog Engine** of Gramer Bazar, this vertical enforces:
- **Zero Schema Duplication**: No `PetProduct`, `DogProduct`, `CatProduct`, `PetVariant`, `PetSKU`, or `PetCart` tables. Everything leverages universal `Category`, `ProductType`, `Attribute`, `Product`, `ProductVariant`, `Inventory`, and `Order` entities.
- **Strict Consumable Batch & FEFO Expiry Tracking**: Pet foods, treats, vitamins, and supplements leverage the universal `SeedProductBatch` engine with lot numbers, manufacturing dates, and guaranteed shelf-life expiry dates.
- **Target Species & Life Stage Specificity**: Structured attributes for `pet-type` (Dog, Cat, Bird, Fish, Rabbit, Hamster), `pet-life-stage` (Kitten/Puppy, Adult, Senior, All Life Stages), and `pet-breed-size` (Small, Medium, Large, Giant) enable tailored pet nutrition discovery without unstructured text parsing.
- **Specialized Veterinary & Hardware Specifications**: Nutritional guarantees (`pet-protein-percentage`, `pet-main-ingredients`), litter characteristics (`pet-litter-clumping`, `pet-scent`), and aquarium engineering specs (`pet-tank-capacity-liters`, `pet-filter-flow-rate-lph`, `pet-power-watt`).

---

## 2. Universal Engine Architecture Mapping

```text
Category (Root: Pet Supplies - 'pet-supplies')
  ├── 9 Primary Branches (Dog, Cat, Bird, Fish & Aquarium, Small Animal, Pet Food, Grooming, Accessories, Hygiene)
  │     └── 36+ L3 Subcategories
  └── Product Types (25+ Schemas: pet-food-dry, pet-food-wet, cat-litter, aquarium-filter, bird-cage...)
        └── Dynamic Attributes (Target Species, Life Stage, Protein %, Clumping, Tank Capacity...)
              └── Product (Universal Master Entity)
                    └── ProductVariant (Flavor, Pack Size / Weight, Scent, Sizing)
                          ├── Batches (Consumables: Lot Number, MFD, Expiry Date - FEFO)
                          └── SellerProduct & Live Inventory (Stock, Pricing in BDT)
```

---

## 3. Taxonomy Hierarchy (9 Primary Branches)

1. **Dog Supplies** (`dog-supplies` / কুকুরের সামগ্রী)
   - Dry & Wet Dog Food (`dog-food`)
   - Dog Treats, Chews & Bones (`dog-treats-chews`)
   - Dog Collars, Leashes & Harnesses (`dog-collars-leashes`)
   - Dog Beds, Crates & Kennels (`dog-beds-crates`)
   - Dog Toys & Agility Training (`dog-toys`)
2. **Cat Supplies** (`cat-supplies` / বিড়ালের সামগ্রী)
   - Dry & Wet Cat Food (`cat-food`)
   - Cat Treats & Catnip (`cat-treats`)
   - Cat Litter & Litter Boxes (`cat-litter-boxes`)
   - Cat Scratchers & Trees (`cat-scratchers-trees`)
   - Cat Toys & Teasers (`cat-toys`)
3. **Bird Supplies** (`bird-supplies` / পাখির সামগ্রী)
   - Bird Food & Seed Mixes (`bird-food-seeds`)
   - Bird Cages & Perches (`bird-cages-perches`)
   - Bird Toys & Swings (`bird-toys-swings`)
   - Bird Supplements & Feeders (`bird-feeders-accessories`)
4. **Fish & Aquarium** (`fish-aquarium` / মাছ ও অ্যাকোয়ারিয়াম)
   - Fish Food & Flakes (`fish-food-flakes`)
   - Aquarium Tanks & Bowls (`aquarium-tanks-bowls`)
   - Water Filters & Air Pumps (`aquarium-filters-pumps`)
   - Heaters, Lighting & Substrates (`aquarium-lights-decor`)
   - Water Conditioners & Test Kits (`aquarium-water-care`)
5. **Small Animal Supplies** (`small-animal-supplies` / ছোট প্রাণীর সামগ্রী)
   - Rabbit & Guinea Pig Food (`rabbit-food`)
   - Hamster Food & Treats (`hamster-food`)
   - Small Animal Cages & Bedding (`small-animal-cages`)
6. **Pet Food & Nutrition** (`pet-food` / পোষা প্রাণীর খাবার ও পুষ্টি)
   - Premium Dry Kibble (`pet-dry-food`)
   - Wet Gravy & Jelly Pouches (`pet-wet-food`)
   - Dental Treats & Biscuits (`pet-dental-treats`)
   - Multivitamins & Health Supplements (`pet-supplements`)
7. **Pet Grooming & Health** (`pet-grooming` / রূপচর্চা ও স্বাস্থ্য)
   - Shampoos & Conditioners (`pet-shampoo-conditioner`)
   - De-shedding Brushes & Nail Clippers (`pet-brushes-grooming-tools`)
   - Flea, Tick & Parasite Control (`pet-flea-tick-control`)
   - Pet Ear, Eye & Dental Care (`pet-dental-hygiene`)
8. **Pet Accessories & Travel** (`pet-accessories` / আনুষাঙ্গিক ও ভ্রমণ সামগ্রী)
   - Travel Crates & Pet Carriers (`pet-carriers-travel-bags`)
   - Feeding Bowls & Automatic Water Dispensers (`pet-bowls-feeders`)
   - Pet Clothing & Raincoats (`pet-apparel`)
9. **Pet Cleaning & Hygiene** (`pet-cleaning-hygiene` / পরিচ্ছন্নতা ও বর্জ্য নিষ্কাশন)
   - Clumping Bentonite & Tofu Litter (`cat-litter-substrates`)
   - Puppy Training Pee Pads (`pet-training-pads`)
   - Stain & Odor Eliminator Sprays (`pet-odor-eliminator`)
   - Waste Poop Bags & Scoopers (`pet-waste-scoopers`)

---

## 4. Key Dynamic Attributes

| Attribute Code | Name (En / Bn) | Type | Filterable | Example Values |
|---|---|---|---|---|
| `pet-type` | Target Pet Type / পোষা প্রাণীর ধরন | SELECT | Yes | Dog, Cat, Bird, Fish, Rabbit, Hamster |
| `pet-food-type` | Food Type / খাবারের ধরন | SELECT | Yes | Dry Kibble, Wet Gravy, Raw, Dehydrated |
| `pet-life-stage` | Life Stage / জীবন পর্যায় | SELECT | Yes | Kitten / Puppy, Adult, Senior, All Life Stages |
| `pet-breed-size` | Breed Size / জাত ও আকার | SELECT | Yes | Small Breed, Medium Breed, Large Breed, All Breeds |
| `pet-protein-percentage` | Crude Protein / অপরিশোধিত প্রোটিন | NUMBER | Yes | 24%, 28%, 30%, 32%, 34% |
| `pet-flavor` | Flavor / স্বাদ | TEXT | Yes | Chicken, Salmon, Tuna, Ocean Fish, Beef |
| `pet-litter-type` | Litter Material / লিটারের ধরন | SELECT | Yes | Bentonite Clay, Tofu, Silica Gel, Wood Pellets |
| `pet-litter-clumping` | Clumping Action / জমাট বাঁধার ক্ষমতা | BOOLEAN | Yes | Yes (Fast Clumping), No |
| `pet-tank-capacity-liters`| Tank Capacity / ট্যাঙ্কের ধারণক্ষমতা | NUMBER | Yes | 10L, 20L, 50L, 100L |
| `pet-filter-flow-rate-lph`| Flow Rate / ফিল্টারের গতিবেগ | NUMBER | Yes | 300 L/h, 500 L/h, 800 L/h |

---

## 5. Authentic Brands Supported
- **Global Nutrition Leaders**: Royal Canin (France), Pedigree (USA/Mars), Whiskas (UK/Mars), Purina / Friskies / Pro Plan (Nestlé), Drools (India), SmartHeart & Me-O (Perfect Companion Group Thailand).
- **Aquatic & Habitat Hardware**: Tetra (Germany), Sobo (China/Global), SunSun, Dymax, Boyu.
- **Hygiene & Accessories**: Sanicat, Catit, KONG, Beaphar, Paws & Tails BD, Bengal Pets Nutrition.
