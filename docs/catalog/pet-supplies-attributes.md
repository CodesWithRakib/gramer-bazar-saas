# Pet Supplies Dynamic Attributes Specification

## Overview
Dynamic attributes enable faceted search, product comparison, variant selector generation, and detailed specifications on the storefront without modifying database columns.

---

## Complete Attributes Registry

### 1. Target Species & Biology
- **`pet-type`** (SELECT):
  - English: *Target Pet Type*, Bangla: *পোষা প্রাণীর ধরন*
  - Options: `Dog`, `Cat`, `Bird`, `Fish`, `Rabbit`, `Hamster`, `All Pets`
- **`pet-life-stage`** (SELECT):
  - English: *Life Stage*, Bangla: *জীবন পর্যায়*
  - Options: `Kitten / Puppy`, `Adult`, `Senior (7+ Years)`, `All Life Stages`
- **`pet-breed-size`** (SELECT):
  - English: *Breed Size*, Bangla: *জাত ও আকার*
  - Options: `Small Breed (<10kg)`, `Medium Breed (10–25kg)`, `Large Breed (>25kg)`, `Giant Breed`, `All Breeds`

### 2. Nutrition & Dietary Profile
- **`pet-food-type`** (SELECT):
  - English: *Food Form*, Bangla: *খাবারের ধরন*
  - Options: `Dry Kibble`, `Wet Gravy / Jelly`, `Freeze-Dried`, `Biscuits / Treats`, `Flakes / Pellets`
- **`pet-protein-percentage`** (NUMBER):
  - English: *Crude Protein (%)*, Bangla: *অপরিশোধিত প্রোটিন (%)*
  - Units: `%` (e.g. `24`, `28`, `32`, `36`)
- **`pet-flavor`** (TEXT):
  - English: *Flavor*, Bangla: *স্বাদ*
  - Examples: `Chicken`, `Salmon & Ocean Fish`, `Tuna & Whitebait`, `Roasted Lamb`, `Beef`
- **`pet-main-ingredients`** (TEXT):
  - English: *Key Ingredients*, Bangla: *প্রধান উপাদানসমূহ*
  - Examples: `Dehydrated poultry protein, rice, animal fats, maize, beet pulp`
- **`pet-feeding-instructions`** (TEXT):
  - English: *Daily Feeding Guide*, Bangla: *খাওয়ানোর নির্দেশাবলী*
- **`pet-storage-instructions`** (TEXT):
  - English: *Storage Instructions*, Bangla: *সংরক্ষণ নির্দেশাবলী*
  - Examples: `Store in a cool, dry place away from direct sunlight. Seal tightly after opening.`

### 3. Hygiene, Waste & Litter
- **`pet-litter-type`** (SELECT):
  - English: *Litter Material*, Bangla: *লিটারের ধরন*
  - Options: `Bentonite Clay`, `Tofu / Soybean`, `Silica Gel Crystals`, `Pine Wood Pellets`
- **`pet-litter-clumping`** (BOOLEAN):
  - English: *Clumping Action*, Bangla: *জমাট বাঁধার ক্ষমতা*
  - True: Yes (Forms solid clumps upon contact with moisture), False: No (Non-clumping)
- **`pet-scent`** (SELECT):
  - English: *Scent / Fragrance*, Bangla: *সুগন্ধি*
  - Options: `Unscented`, `Lavender`, `Apple`, `Lemon`, `Baby Powder`, `Active Carbon`

### 4. Hardware, Aquatics & Gear Dimensions
- **`pet-tank-capacity-liters`** (NUMBER):
  - English: *Aquarium Tank Capacity (Liters)*, Bangla: *ট্যাঙ্কের ধারণক্ষমতা (লিটার)*
  - Units: `Liters` (e.g. `10`, `30`, `60`, `120`)
- **`pet-filter-flow-rate-lph`** (NUMBER):
  - English: *Filter Flow Rate (L/h)*, Bangla: *ফিল্টারের গতিবেগ (লিটার/ঘণ্টা)*
  - Units: `L/h` (e.g. `300`, `600`, `1200`)
- **`pet-power-watt`** (NUMBER):
  - English: *Power Rating (Watt)*, Bangla: *পাওয়ার (ওয়াট)*
  - Units: `W` (e.g. `10`, `15`, `25`, `50`, `100`, `300`)
- **`pet-voltage`** (TEXT):
  - English: *Voltage*, Bangla: *ভোল্টেজ*
  - Values: `220V - 240V / 50Hz` (Bangladesh Standard)
- **`pet-neck-size-cm`** (TEXT):
  - English: *Collar Neck Circumference*, Bangla: *গলার মাপ (সেমি)*
  - Examples: `20–30 cm`, `30–45 cm`, `45–65 cm`
- **`pet-chest-size-cm`** (TEXT):
  - English: *Chest Girth*, Bangla: *বুকের মাপ (সেমি)*
  - Examples: `35–50 cm`, `50–70 cm`, `70–95 cm`
- **`pet-leash-length-meters`** (NUMBER):
  - English: *Leash Length (Meters)*, Bangla: *বেল্টের দৈর্ঘ্য (মিটার)*
  - Values: `1.2m`, `1.5m`, `3.0m`, `5.0m Retractable`
- **`pet-material`** (TEXT):
  - English: *Material*, Bangla: *উপাদান*
  - Examples: `Nylon, Heavy-Duty Webbing`, `Natural Rubber`, `Stainless Steel`, `Ultra-Clear Glass`
- **`pet-washable`** (BOOLEAN):
  - English: *Machine / Water Washable*, Bangla: *ধোয়া যায়*
- **`pet-pack-size`** (TEXT):
  - English: *Pack Size / Net Weight*, Bangla: *প্যাক সাইজ / ওজন*
  - Examples: `400g`, `1.2kg`, `3kg`, `7kg`, `10kg`, `15kg`, `5L`, `10L`
- **`pet-country-of-origin`** (TEXT):
  - English: *Country of Origin*, Bangla: *উৎপাদনকারী দেশ*
  - Examples: `France`, `USA`, `Germany`, `Thailand`, `India`, `China`, `Bangladesh`
- **`pet-warranty`** (TEXT):
  - English: *Warranty*, Bangla: *ওয়ারেন্টি*
  - Examples: `6 Months Electrical Warranty`, `1 Year Service Warranty`, `No Warranty`
