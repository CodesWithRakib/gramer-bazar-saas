# Toys, Games & Hobbies Vertical Architecture

## 1. Domain Overview
The **Toys, Games & Hobbies** catalog vertical (`toys-games-hobbies` / খেলনা, গেমস ও শখের জিনিস) provides a child-safe, age-appropriate, and rich discovery platform for parents, children, educators, and hobbyists across Bangladesh.

Built entirely on the existing **Universal Catalog Engine** of Gramer Bazar, this vertical enforces:
- **Zero Schema Duplication**: No `ToyProduct`, `ToyVariant`, `ToySKU`, or `ToyCart` tables. Everything leverages universal `Category`, `ProductType`, `Attribute`, `Product`, `ProductVariant`, `Inventory`, and `Order` entities.
- **Strict Child Safety Standards**: Explicit attribute support for `EN71`, `ASTM F963`, `BSTI`, and `CE` certifications, with visible Choking Hazard warnings (`toys-choking-hazard`) for items with small parts.
- **Structured Age Grading**: Dynamic age ranges (`0–6 Months`, `6–12 Months`, `1–2 Years`, `2–3 Years`, `3–5 Years`, `5–8 Years`, `8–12 Years`, `12+ Years`, `Teen`, `Adult`, `All Ages`) and numeric min/max age filters instead of unparsed string titles.
- **Dynamic Multi-Axis Facets**: STEM area, piece counts, battery requirements, radio-control (RC) frequency & range, board game player count & playtime, and material non-toxicity.

---

## 2. Universal Engine Architecture Mapping

```text
Category (Root: Toys, Games & Hobbies)
  ├── 15 Primary Branches (Baby Toys, Educational Toys, Building Blocks, RC, Games, Puzzles...)
  │     └── 80+ L3 Subcategories
  └── Product Types (52 Reusable Schemas: stem-kit, building-block, rc-car, board-game...)
        └── Dynamic Attributes (Age Grade, Choking Hazard, Battery, STEM Area, Players...)
              └── Product (Universal Master Entity)
                    └── ProductVariant (Color, Theme/Edition, Piece Count, Size)
                          └── SellerProduct & Live Inventory (Stock, Pricing in BDT)
```

---

## 3. Taxonomy Hierarchy (15 Primary Branches)

1. **Baby Toys** (`baby-toys` / শিশুদের খেলনা)
   - Rattles & Teethers (`rattles`)
   - Soft & Plush Toys (`soft-toys`)
   - Musical Baby Toys (`musical-baby-toys`)
   - Stacking & Sensory Toys (`stacking-toys`)
2. **Educational Toys** (`educational-toys` / শিক্ষামূলক খেলনা)
   - STEM & Science Kits (`stem-toys`)
   - Montessori Learning Toys (`montessori-toys`)
   - Math, Alphabet & Number Toys (`math-alphabet-toys`)
   - Educational Learning Games (`educational-games`)
3. **Dolls & Dollhouses** (`dolls-dollhouses` / পুতুল ও ডলহাউস)
   - Fashion & Baby Dolls (`fashion-dolls`)
   - Dollhouses & Furniture (`dollhouses-furniture`)
   - Doll Clothing & Accessories (`doll-accessories`)
4. **Action Figures & Collectibles** (`action-figures-collectibles` / অ্যাকশন ফিগার ও সংগ্রাহক বস্তু)
   - Superhero & Character Figures (`superhero-action-figures`)
   - Collectible Figures & Statues (`collectible-statues`)
5. **Building & Construction** (`building-construction` / বিল্ডিং ও কনস্ট্রাকশন ব্লক)
   - Classic Building Blocks (`building-blocks`)
   - Mechanical Engineering Sets (`engineering-kits`)
   - Magnetic Tiles & Blocks (`magnetic-building-sets`)
6. **Remote Control Toys** (`remote-control-toys` / রিমোট কন্ট্রোল খেলনা)
   - RC Racing Cars & Monster Trucks (`rc-cars`)
   - RC Quadcopter Drones & Helicopters (`rc-drones`)
   - RC Boats & Spare Accessories (`rc-boats-accessories`)
7. **Vehicles & Ride-On Toys** (`vehicles-ride-on-toys` / যানবাহন ও রাইড-অন টয়)
   - Die-Cast Cars & Trucks (`toy-cars`)
   - Electric & Push Ride-On Cars (`ride-on-cars`)
   - Kids Kick Scooters & Tricycles (`scooters`)
   - Electric Trains & Tracks (`toy-trains`)
8. **Board Games** (`board-games` / বোর্ড গেমস)
   - Family Board Games (`family-games`)
   - Strategy & Chess Games (`strategy-games`)
   - Card Games & Flashcards (`card-games`)
9. **Puzzles** (`puzzles` / ধাঁধা ও পাজল)
   - Jigsaw Puzzles (`jigsaw-puzzles`)
   - 3D Wooden Mechanical Puzzles (`3d-puzzles`)
   - Wooden Educational Puzzles (`wooden-puzzles`)
10. **Outdoor Toys** (`outdoor-toys` / আউটডোর ও খেলাধুলার খেলনা)
    - Play Tents & Tunnels (`play-tents`)
    - Swings, Slides & Trampolines (`swings-slides`)
11. **Arts & Crafts** (`arts-crafts-toys` / আর্ট ও ক্রাফট খেলনা)
    - Drawing & Painting Sets (`painting-kits`)
    - Clay & Modeling Dough Sets (`clay-modeling`)
    - DIY Craft & Origami Kits (`diy-craft-kits`)
12. **Musical Toys** (`musical-toys` / বাদ্যযন্ত্র ও সুরের খেলনা)
    - Toy Keyboards & Pianos (`toy-keyboard`)
    - Toy Drums, Guitars & Percussion (`toy-drums-guitars`)
13. **Pretend Play** (`pretend-play` / রোল প্লে ও প্রিটেন্ড প্লে)
    - Cooking & Kitchen Play Sets (`kitchen-sets`)
    - Doctor & Medical Case Sets (`doctor-sets`)
    - Mechanic Tool & Workshop Sets (`tool-sets`)
14. **Hobbies** (`hobbies` / শখ ও স্কেল মডেল)
    - Aircraft & Vehicle Scale Model Kits (`scale-model-kits`)
15. **Party & Celebration Toys** (`party-celebration-toys` / উৎসব ও পার্টি টয়)
    - Party Games & Bubble Guns (`party-games`)

---

## 4. Brand & Manufacturer Authenticity
Demonstration brands with strict separation between brand entity and manufacturing entity:
- **LEGO** (`LEGO System A/S`, Denmark)
- **Mattel** (`Mattel, Inc.`, USA)
- **Hasbro** & **Hasbro Gaming** (`Hasbro, Inc.`, USA)
- **Barbie** & **Hot Wheels** (`Mattel, Inc.`, USA)
- **Fisher-Price** (`Mattel, Inc.`, USA)
- **Play-Doh** (`Hasbro, Inc.`, USA)
- **Ravensburger** (`Ravensburger Verlag GmbH`, Germany)
- **SYMA** (`Guangdong Syma Model Aircraft Industrial Co., Ltd.`, China)
- **Rastar** (`Rastar Group`, China)
- **Funskool** (`Funskool India Ltd.`, India)
- **Casio** (`Casio Computer Co., Ltd.`, Japan)
- **Shonali Shilpa Toys** (`Shonali Shilpa Handicrafts Bangladesh`, Bangladesh)
- **Monalisa Craft & Toy BD** (`Monalisa Enterprise Bangladesh`, Bangladesh)

---

## 5. Frontend PDP & Storefront Integration
- **Contextual Badges**:
  - `Age Group Chip`: Highlighted in violet with child-friendly sparkle indicator.
  - `Choking Hazard Warning`: Rendered in high-visibility amber with AlertTriangle icon.
  - `STEM Area Indicator`: Highlights science, robotics, or engineering orientation.
  - `Players Count`: Exposes player capacity and playtime for board/card games.
  - `RC Transmission Range`: Displays 2.4GHz range (in meters) and speed (km/h).
  - `Official Safety Certification`: BSTI, EN71, or CE badges.
- **Safety Advisory Banner**: Dedicated advisory assuring 100% BPA-free and non-toxic materials, adult supervision recommendations, and strict child safety compliance.
