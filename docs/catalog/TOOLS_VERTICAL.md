# Tools & Hardware Vertical Architecture

## 1. Domain Overview
The **Tools & Hardware** catalog vertical (`tools-hardware` / যন্ত্রপাতি ও হার্ডওয়্যার) is the specialized industrial, construction, electrical, plumbing, and home improvement platform for professional tradespeople, contractors, mechanics, and DIY enthusiasts across Bangladesh.

Built entirely on the existing **Universal Catalog Engine** of Gramer Bazar, this vertical enforces:
- **Zero Schema Duplication**: No `HandToolProduct`, `PowerToolProduct`, `FastenerProduct`, `ToolsSKU`, `ToolsInventory`, or `ToolsCart` tables. Everything leverages universal `Category`, `ProductType`, `Attribute`, `Product`, `ProductVariant`, `Inventory`, and `Order` entities.
- **Power & Engineering Specifications**: Structured attributes for power sources (`tools-power-source`), motor wattage (`tools-wattage`), battery voltage & capacity (`tools-voltage`, `tools-battery-capacity`), rotary speed (`tools-no-load-speed-rpm`), maximum torque (`tools-max-torque-nm`), and chuck/collet dimensions (`tools-chuck-size`).
- **Fasteners & Mechanical Standardizations**: Standardized metrics for thread types (`tools-thread-type`), diameter/gauges (`tools-fastener-diameter`), lengths (`tools-fastener-length`), head styles (`tools-head-type`), drive styles (`tools-drive-type`), and pack counts (`tools-pack-quantity`).
- **Certified Chemical & Consumable Batch Tracking**: Industrial wall paints, anti-bacterial emulsions, construction adhesives, and silicone sealants leverage the universal `SeedProductBatch` engine for lot tracking and shelf-life expiry management.
- **Bilingual Industrial Ergonomics**: Full localization (English and Bangla) across tool categories, technical specifications, safety warnings, and warranty claims.

---

## 2. Universal Engine Architecture Mapping

```text
Category (Root: Tools & Hardware - 'tools-hardware')
  ├── 11 Primary Branches (Hand Tools, Power Tools, Workshop, Fasteners, Electrical, Plumbing, Paint, PPE...)
  │     └── 50+ L3 Subcategories
  └── Product Types (30+ Schemas: cordless-drill, angle-grinder, claw-hammer, drywall-screw, mcb-breaker...)
        └── Dynamic Attributes (Voltage, Wattage, RPM, Torque, Chuck, Thread, Material, Warranty...)
              └── Product (Universal Master Entity)
                    └── ProductVariant (Kit/Bare Tool, Diameter, Length, Pack Size, Volume)
                          ├── Batches (Chemical Consumables: Lot Number, MFD, Expiry Date - FEFO)
                          └── SellerProduct & Live Inventory (Stock, Pricing in BDT)
```

---

## 3. Taxonomy Hierarchy (11 Primary Branches)

1. **Hand Tools** (`hand-tools` / হস্তচালিত যন্ত্রপাতি)
   - Screwdrivers & Wrenches (`screwdrivers-wrenches`)
   - Pliers & Cutters (`pliers-cutters`)
   - Hammers & Chisels (`hammers-chisels`)
   - Hand Saws & Cutting (`hand-saws`)
   - Measuring Tapes & Rules (`measuring-tapes-rules`)
   - Tool Sets & Combos (`hand-tool-sets`)
2. **Power Tools** (`power-tools` / পাওয়ার টুলস ও বৈদ্যুতিক যন্ত্রপাতি)
   - Drills & Drivers (`drills-drivers`)
   - Angle Grinders & Cutters (`angle-grinders-cutters`)
   - Power Saws (`power-saws`)
   - Heat Guns & Blowers (`heat-guns-blowers`)
3. **Workshop & Garage Equipment** (`workshop-garage` / ওয়ার্কশপ ও গ্যারেজ সরঞ্জাম)
   - Tool Boxes & Storage (`tool-boxes-storage`)
   - Vises & Clamps (`vises-clamps`)
   - Ladders & Step Stools (`ladders-access`)
   - Air Compressors & Washers (`air-compressors-washers`)
4. **Hardware & Fasteners** (`hardware-fasteners` / হার্ডওয়্যার ও নাট-বল্টু)
   - Screws & Drywall Fasteners (`screws-drywall`)
   - Bolts, Nuts & Washers (`bolts-nuts-washers`)
   - Wall Anchors & Plugs (`wall-anchors-plugs`)
   - Locks, Latches & Padlocks (`locks-latches-padlocks`)
   - Hinges & Brackets (`brackets-hinges`)
5. **Electrical Supplies & Wiring** (`electrical-supplies` / বৈদ্যুতিক সরঞ্জাম ও ওয়্যারিং)
   - Switches & Sockets (`switches-sockets`)
   - Extension Boards & Strips (`extension-power-strips`)
   - Wires & Cables (`wires-cables`)
   - Circuit Breakers & Distribution (`circuit-breakers-mcb`)
6. **Plumbing & Sanitary** (`plumbing-sanitary` / প্লাম্বিং ও পাইপ ফিটিংস)
   - Pipes & Conduits (`pipes-conduits`)
   - Pipe Fittings, Elbows & Tees (`pipe-fittings-elbows`)
   - Valves & Brass Taps (`valves-taps`)
   - Thread Seal Tapes & Adhesives (`thread-tapes-sealants`)
7. **Paint & Decorating** (`paint-decorating` / রং ও দেয়াল সাজসজ্জা)
   - Interior & Exterior Paints (`wall-paints-enamels`)
   - Paint Brushes & Rollers (`paint-brushes-rollers`)
8. **Safety Gear & PPE** (`safety-ppe` / নিরাপত্তা ও সুরক্ষা সরঞ্জাম)
   - Heavy-Duty Work Gloves (`safety-gloves`)
   - Safety Shoes & Steel Toe Boots (`safety-shoes-boots`)
   - Helmets & Eye Protection (`safety-goggles-helmets`)
9. **Building & Construction Supplies** (`building-construction-supplies` / নির্মাণ সামগ্রী ও কেমিক্যাল)
   - Silicone Sealants & Adhesives (`silicone-waterproofing`)
10. **Garden & Outdoor Tools** (`garden-outdoor-tools` / বাগান ও বহিরঙ্গন যন্ত্রপাতি)
    - Pruners & Garden Shears (`pruning-shears-cutters`)
11. **Measuring & Testing Instruments** (`measuring-leveling` / পরিমাপ ও টেস্টিং সরঞ্জাম)
    - Spirit & Laser Levels (`spirit-laser-levels`)
    - Calipers & Multimeters (`calipers-multimeters`)

---

## 4. Key Dynamic Attributes

| Attribute Code | Name (En / Bn) | Type | Filterable | Example Values |
|---|---|---|---|---|
| `tools-power-source` | Power Source / পাওয়ার সোর্স | SELECT | Yes | Cordless Battery, Corded Electric, Manual Hand-Operated, Pneumatic |
| `tools-voltage` | Voltage / ভোল্টেজ | TEXT | Yes | 18V Li-ion, 20V Max, 220V–240V AC |
| `tools-wattage` | Power Rating / পাওয়ার (ওয়াট) | NUMBER | Yes | 840W, 1350W, 1400W, 2000W |
| `tools-no-load-speed-rpm` | Speed / গতিবেগ (RPM) | NUMBER | Yes | 1900, 2600, 5500, 11000 RPM |
| `tools-max-torque-nm` | Max Torque / সর্বোচ্চ টর্ক | NUMBER | Yes | 50 Nm, 65 Nm, 120 Nm |
| `tools-chuck-size` | Chuck Size / চক সাইজ | TEXT | Yes | 10mm (3/8"), 13mm (1/2"), SDS-Plus |
| `tools-material` | Material / উপাদান | TEXT | Yes | Cr-V Steel, Forged Carbon Steel, Polycarbonate |
| `tools-fastener-diameter` | Fastener Diameter / ব্যাস | TEXT | Yes | 3.5mm, 6mm, 8mm, M8, M10 |
| `tools-fastener-length` | Length / দৈর্ঘ্য ও সাইজ | TEXT | Yes | 25mm, 38mm, 50mm, 5m, 8m, 6ft |
| `tools-paint-volume` | Volume / পরিমাণ | TEXT | Yes | 1 Liter, 1 Gallon (3.64L), 18L Drum |
| `tools-safety-certification` | Safety Standard / মানদণ্ড | TEXT | Yes | EN 388, EN 131, CE EN ISO 20345 |
| `tools-warranty` | Warranty / ওয়ারেন্টি | TEXT | Yes | 1 Year Official Warranty, 6 Months |

---

## 5. Authentic Brands Supported
- **Global Power & Hand Tools**: Robert Bosch GmbH, Makita Corporation, DeWalt (Stanley Black & Decker), Stanley, Total Tools, Ingco Tools, Crown.
- **Paints & Coatings**: Berger Paints Bangladesh Ltd., Asian Paints.
- **Electrical & Cables**: BRB Cable Industries Ltd., Super Star Group (SSG), BBS Cables.
- **Plumbing & Building Materials**: RFL Plastics & Pipes, Gazi Group, Dowsil.
