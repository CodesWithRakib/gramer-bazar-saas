# Tools & Hardware Taxonomy Specification

## 1. Hierarchy Tree

The taxonomy follows a 3-tier structure (`L1 Root -> L2 Primary Branch -> L3 Subcategory`).

```
tools-hardware (Root: Tools & Hardware / যন্ত্রপাতি ও হার্ডওয়্যার)
├── hand-tools (L2: Hand Tools / হস্তচালিত যন্ত্রপাতি)
│   ├── screwdrivers-wrenches (L3: Screwdrivers & Wrenches / স্ক্রু-ড্রাইভার ও রেঞ্জ)
│   ├── pliers-cutters (L3: Pliers & Cutters / প্লায়ার্স ও কাটার)
│   ├── hammers-chisels (L3: Hammers & Chisels / হাতুড়ি ও বাটালি)
│   ├── hand-saws (L3: Hand Saws & Cutting / করাত ও কাটিং টুলস)
│   ├── measuring-tapes-rules (L3: Measuring Tapes & Rules / পরিমাপক ফিতা ও রুলার)
│   └── hand-tool-sets (L3: Tool Sets & Combos / টুল সেট ও কম্বো কিট)
│
├── power-tools (L2: Power Tools / পাওয়ার টুলস ও বৈদ্যুতিক যন্ত্রপাতি)
│   ├── drills-drivers (L3: Drills & Drivers / ড্রিল ও ড্রাইভার)
│   ├── angle-grinders-cutters (L3: Angle Grinders & Cutters / অ্যাঙ্গেল গ্রাইন্ডার ও কাটার)
│   ├── power-saws (L3: Power Saws / পাওয়ার করাত)
│   └── heat-guns-blowers (L3: Heat Guns & Blowers / হিট গান ও ব্লোয়ার)
│
├── workshop-garage (L2: Workshop & Garage Equipment / ওয়ার্কশপ ও গ্যারেজ সরঞ্জাম)
│   ├── tool-boxes-storage (L3: Tool Boxes & Storage / টুল বক্স ও স্টোরেজ)
│   ├── vises-clamps (L3: Vises & Clamps / ভাইস ও ক্ল্যাম্প)
│   ├── ladders-access (L3: Ladders & Step Stools / মই ও স্টেপ ল্যাডার)
│   └── air-compressors-washers (L3: Air Compressors & Washers / কম্প্রেসর ও প্রেশার ওয়াশার)
│
├── hardware-fasteners (L2: Hardware & Fasteners / হার্ডওয়্যার ও নাট-বল্টু)
│   ├── screws-drywall (L3: Screws & Drywall Fasteners / স্ক্রু ও ড্রাইভাল ফাস্টেনার)
│   ├── bolts-nuts-washers (L3: Bolts, Nuts & Washers / বোল্ট, নাট ও ওয়াশার)
│   ├── wall-anchors-plugs (L3: Wall Anchors & Plugs / ওয়াল অ্যাঙ্কর ও প্লাগ)
│   ├── locks-latches-padlocks (L3: Locks, Latches & Padlocks / তালা ও সিকিউরিটি লক)
│   └── brackets-hinges (L3: Hinges & Brackets / কব্জা ও ব্র্যাকেট)
│
├── electrical-supplies (L2: Electrical Supplies & Wiring / বৈদ্যুতিক সরঞ্জাম ও ওয়্যারিং)
│   ├── switches-sockets (L3: Switches & Sockets / সুইচ ও সকেট)
│   ├── extension-power-strips (L3: Extension Boards & Strips / মাল্টিপ্লাগ ও পাওয়ার স্ট্রিপ)
│   ├── wires-cables (L3: Wires & Cables / তার ও ক্যাবল)
│   └── circuit-breakers-mcb (L3: Circuit Breakers & Distribution / সার্কিট ব্রেকার ও এমসিবি)
│
├── plumbing-sanitary (L2: Plumbing & Sanitary / প্লাম্বিং ও পাইপ ফিটিংস)
│   ├── pipes-conduits (L3: Pipes & Conduits / পিভিসি ও পিপিআর পাইপ)
│   ├── pipe-fittings-elbows (L3: Pipe Fittings, Elbows & Tees / ফিটিংস, এলবো ও টি)
│   ├── valves-taps (L3: Valves & Brass Taps / বাল্ব ও ব্রাস ট্যাপ)
│   └── thread-tapes-sealants (L3: Thread Seal Tapes & Adhesives / থ্রেড সিল টেপ ও পাইপ গ্লু)
│
├── paint-decorating (L2: Paint & Decorating / রং ও দেয়াল সাজসজ্জা)
│   ├── wall-paints-enamels (L3: Interior & Exterior Paints / দেয়াল ও মেটাল পেইন্ট)
│   └── paint-brushes-rollers (L3: Paint Brushes & Rollers / পেইন্ট ব্রাশ ও রোলার)
│
├── safety-ppe (L2: Safety Gear & PPE / নিরাপত্তা ও সুরক্ষা সরঞ্জাম)
│   ├── safety-gloves (L3: Heavy-Duty Work Gloves / সেফটি গ্লাভস)
│   ├── safety-shoes-boots (L3: Safety Shoes & Steel Toe Boots / সেফটি সু ও বুট)
│   └── safety-goggles-helmets (L3: Helmets & Eye Protection / হেলমেট ও সেফটি গগলস)
│
├── building-construction-supplies (L2: Building & Construction Supplies / নির্মাণ সামগ্রী ও কেমিক্যাল)
│   └── silicone-waterproofing (L3: Silicone Sealants & Adhesives / সিলিকন সিলেন্ট ও আঠা)
│
├── garden-outdoor-tools (L2: Garden & Outdoor Tools / বাগান ও বহিরঙ্গন যন্ত্রপাতি)
│   └── pruning-shears-cutters (L3: Pruners & Garden Shears / ছাঁটাই কাঁচি ও প্রুনার)
│
└── measuring-leveling (L2: Measuring & Testing Instruments / পরিমাপ ও টেস্টিং সরঞ্জাম)
    ├── spirit-laser-levels (L3: Spirit & Laser Levels / স্পিরিট ও লেজার লেভেল)
    └── calipers-multimeters (L3: Calipers & Multimeters / ক্যালিপার ও ডিজিটাল মিটার)
```

## 2. Slug Naming Conventions
- Root vertical slug: `tools-hardware`
- Primary branch slugs: `hand-tools`, `power-tools`, `workshop-garage`, `hardware-fasteners`, `electrical-supplies`, `plumbing-sanitary`, `paint-decorating`, `safety-ppe`, `building-construction-supplies`, `garden-outdoor-tools`, `measuring-leveling`
- Subcategory slugs: Clean, descriptive kebab-case (e.g. `drills-drivers`, `screws-drywall`, `switches-sockets`)
- Bilingual support: Each node contains `nameEn` and `nameBn` (e.g., `Tools & Hardware` / `যন্ত্রপাতি ও হার্ডওয়্যার`).
