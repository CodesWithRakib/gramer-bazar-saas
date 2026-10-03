# Pet Supplies Taxonomy Specification

## 1. Hierarchy Tree

The taxonomy follows a 3-tier structure (`L1 Root -> L2 Primary Branch -> L3 Specific Subcategory`).

```
pet-supplies (Root: Pet Supplies / পোষা প্রাণীর সামগ্রী)
├── dog-supplies (L2: Dog Supplies / কুকুরের সামগ্রী)
│   ├── dog-food (L3: Dry & Wet Dog Food / কুকুরের খাবার)
│   ├── dog-treats-chews (L3: Treats, Chews & Bones / ডগ ট্রিটস ও চিউ)
│   ├── dog-collars-leashes (L3: Collars, Leashes & Harnesses / কলার, বেল্ট ও হারনেস)
│   ├── dog-beds-crates (L3: Beds, Crates & Houses / বিছানা, খাঁচা ও ঘর)
│   └── dog-toys (L3: Dog Toys & Training Gear / খেলনা ও ট্রেনিং গিয়ার)
│
├── cat-supplies (L2: Cat Supplies / বিড়ালের সামগ্রী)
│   ├── cat-food (L3: Dry & Wet Cat Food / বিড়ালের খাবার)
│   ├── cat-treats (L3: Cat Treats & Catnip / বিড়ালের ট্রিটস ও ক্যাটনিপ)
│   ├── cat-litter-boxes (L3: Cat Litter & Litter Boxes / ক্যাট লিটার ও ট্রে)
│   ├── cat-scratchers-trees (L3: Scratchers & Cat Trees / স্ক্র্যাচার ও ক্যাট ট্রি)
│   └── cat-toys (L3: Cat Toys, Balls & Wands / বিড়ালের খেলনা)
│
├── bird-supplies (L2: Bird Supplies / পাখির সামগ্রী)
│   ├── bird-food-seeds (L3: Bird Food & Seed Mixes / পাখির খাবার ও সিড মিক্স)
│   ├── bird-cages-perches (L3: Cages, Stands & Perches / পাখির খাঁচা ও পার্চ)
│   ├── bird-toys-swings (L3: Bird Toys & Swings / পাখির খেলনা ও দোলনা)
│   └── bird-feeders-accessories (L3: Feeders & Waterers / ফিডার ও পানির পাত্র)
│
├── fish-aquarium (L2: Fish & Aquarium / মাছ ও অ্যাকোয়ারিয়াম)
│   ├── fish-food-flakes (L3: Fish Food, Flakes & Pellets / মাছের খাবার)
│   ├── aquarium-tanks-bowls (L3: Glass Tanks & Bowls / অ্যাকোয়ারিয়াম ট্যাঙ্ক ও বাউল)
│   ├── aquarium-filters-pumps (L3: Water Filters & Air Pumps / ফিল্টার ও এয়ার পাম্প)
│   ├── aquarium-lights-decor (L3: LED Lights & Substrates / লাইট, পাথর ও ডেকর)
│   └── aquarium-water-care (L3: Conditioners & Medications / পানি পরিশোধক ও কেয়ার)
│
├── small-animal-supplies (L2: Small Animal Supplies / ছোট প্রাণীর সামগ্রী)
│   ├── rabbit-food (L3: Rabbit & Guinea Pig Food / খরগোশের খাবার)
│   ├── hamster-food (L3: Hamster Food & Treats / হ্যামস্টারের খাবার)
│   └── small-animal-cages (L3: Cages, Bedding & Wheels / খাঁচা ও বেডিং)
│
├── pet-food (L2: Pet Food & Nutrition / পোষা প্রাণীর খাবার ও পুষ্টি)
│   ├── pet-dry-food (L3: Premium Dry Kibble / ড্রাই কিবল)
│   ├── pet-wet-food (L3: Gravy & Canned Food / ভেজা খাবার ও গ্রেভি)
│   ├── pet-dental-treats (L3: Dental Sticks & Bones / ডেন্টাল স্টিকস)
│   └── pet-supplements (L3: Vitamins & Calcium / ভিটামিন ও সাপ্লিমেন্ট)
│
├── pet-grooming (L2: Pet Grooming & Health / রূপচর্চা ও স্বাস্থ্য)
│   ├── pet-shampoo-conditioner (L3: Shampoos & Conditioners / শ্যাম্পু ও কন্ডিশনার)
│   ├── pet-brushes-grooming-tools (L3: Brushes & Nail Trimmers / ব্রাশ ও নেইল ট্রিমার)
│   ├── pet-flea-tick-control (L3: Flea & Tick Treatments / মাছি ও পোকা নিধন)
│   └── pet-dental-hygiene (L3: Dental Toothpaste & Spray / টুথপেস্ট ও স্প্রে)
│
├── pet-accessories (L2: Pet Accessories & Travel / আনুষাঙ্গিক ও ভ্রমণ সামগ্রী)
│   ├── pet-carriers-travel-bags (L3: Crates & Travel Bags / ক্যারিয়ার ও ট্রাভেল ব্যাগ)
│   ├── pet-bowls-feeders (L3: Bowls & Automatic Feeders / বাটি ও অটো ফিডার)
│   └── pet-apparel (L3: Pet Clothing & Harnesses / পোশাক ও বেল্ট)
│
└── pet-cleaning-hygiene (L2: Pet Cleaning & Hygiene / পরিচ্ছন্নতা ও বর্জ্য নিষ্কাশন)
    ├── cat-litter-substrates (L3: Bentonite & Tofu Litter / জমাট বাঁধা লিটার)
    ├── pet-training-pads (L3: Puppy Training Wee Pads / ইউরিন প্যাড)
    ├── pet-odor-eliminator (L3: Stain & Odor Sprays / দুর্গন্ধ দূরীকরণ স্প্রে)
    └── pet-waste-scoopers (L3: Litter Scoopers & Poop Bags / স্কুপার ও ডিসপোজাল ব্যাগ)
```

## 2. Slug Naming Conventions
- Root vertical slug: `pet-supplies`
- Primary branch slugs: `dog-supplies`, `cat-supplies`, `bird-supplies`, `fish-aquarium`, `small-animal-supplies`, `pet-food`, `pet-grooming`, `pet-accessories`, `pet-cleaning-hygiene`
- Subcategory slugs: Kebab-case, prefixed with animal or domain (e.g. `dog-food`, `cat-litter-boxes`, `aquarium-filters-pumps`)
- Bilingual support: Each node contains `nameEn` and `nameBn` (e.g., `Dog Supplies` / `কুকুরের সামগ্রী`).
