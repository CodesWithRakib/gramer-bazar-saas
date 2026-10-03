# Tools & Hardware Implementation Guide

## Executive Summary
The **Tools & Hardware** vertical (`tools-hardware` / যন্ত্রপাতি ও হার্ডওয়্যার) provides comprehensive coverage for professional contractors, tradespeople, mechanics, electricians, plumbers, and DIY consumers across Bangladesh.

### Core Architecture Highlights
1. **Universal Taxonomy Engine**: Operates natively in the core category tree (`Category.slug = 'tools-hardware'`) without custom tables or microservices.
2. **First-Expiry-First-Out (FEFO) Chemical Batch Tracking**: Uses the universal `SeedProductBatch` engine for industrial paints, emulsions, and silicone sealants with lot numbers and expiry dates.
3. **Multi-Variant Engineering Dimensions**:
   - Power Tools: Bare Tool (Solo) vs Complete Kit (with 2x Batteries & Fast Charger)
   - Fasteners: Length (`25mm`, `38mm`, `50mm`) & Pack Size (`Box of 100`, `Box of 500`)
   - Cables: Coil Length (`90m`) & Color (`Red / Live`, `Black / Neutral`, `Green / Earth`)
   - Paints: Can Volume (`1 Liter`, `1 Gallon / 3.64L`, `18L Master Drum`)
   - Safety PPE: Sizes (`M`, `L`, `XL` for gloves; `Size 41`, `42`, `43`, `44` for steel-toe boots)
4. **Bilingual Localization**: Full dual-language support (English and Bangla) across navigation, specifications, safety disclaimers, and warranty badges.

---

## Seeded Demo Products Matrix

| Product Name | Category | Product Type | Primary Spec | Variants |
|---|---|---|---|---|
| **Bosch GSB 185-LI Cordless Hammer Drill** | Drills & Drivers | `cordless-drill` | 18V Li-ion, 50 Nm, 1900 RPM | Bare Tool (৳8,200), Kit + 2x 2.0Ah (৳14,500) |
| **Makita 9557HNG Angle Grinder 840W** | Grinders & Cutters | `angle-grinder` | 840W, 11000 RPM, 100mm Disc | Standard (৳5,400), Deluxe (+ 5 Discs) (৳6,100) |
| **DeWalt DWE560 Compact Circular Saw** | Power Saws | `circular-saw` | 1350W, 5500 RPM, 184mm Blade | Standard 24T Carbide Blade (৳12,800) |
| **Total Tools 20V Li-Ion Cordless Jigsaw** | Power Saws | `jigsaw` | 20V Max, 4-Stage Orbital, 2600 RPM | Bare Tool (৳3,900), Full Kit 4.0Ah (৳7,200) |
| **Ingco 2000W Dual Temp Heat Gun** | Heat Guns | `heat-gun` | 2000W, 50°C–600°C Variable | Standard Kit with 4 Nozzles (৳2,450) |
| **Stanley FatMax 16oz AntiVibe Claw Hammer** | Hammers | `claw-hammer` | Forged Carbon Steel, AntiVibe Grip | 16oz / 450g (৳1,650), 20oz / 570g (৳1,950) |
| **Total Tools 24-Piece 1/2" Socket Wrench Set**| Hand Tools | `socket-wrench-set` | Cr-V 50BV30 Steel, 72T Ratchet | 24-Piece Heavy Steel Case (৳4,800) |
| **Ingco 8-Piece Magnetic Screwdriver Set**| Screwdrivers | `screwdriver-set` | Round Cr-V Shank, Magnetic Tips | 8-Piece Set with Wall Mount (৳1,250) |
| **Stanley 8m / 26ft PowerLock Tape** | Measuring | `measuring-tape` | Mylar Polyester Coated Blade | 5m Pocket (৳650), 8m Contractor (৳950) |
| **Crown Heavy-Duty 19" Tool Box** | Storage | `tool-box` | Cold-Rolled Steel, 3-Tier Cantilever | 19" 3-Tier (৳3,200), 21" 5-Tier (৳4,500) |
| **Total Tools 6-Inch Cast Iron Bench Vise**| Vises | `bench-vise` | 360° Swivel, 3500kg Clamping | 6-Inch (150mm) Swivel (৳6,500) |
| **Gazi 6-Step Heavy Aluminium Ladder** | Ladders | `step-ladder` | EN 131 Certified (150kg), 6063-T6 | 5-Step (৳3,800), 6-Step (৳4,600), 8-Step (৳6,200) |
| **Ingco 1400W High Pressure Washer** | Washers | `pressure-washer` | 130 Bar, 5.5 L/min Flow | 130 Bar Complete Kit (৳8,900) |
| **Hardened Black Drywall Screws 3.5mm** | Fasteners | `drywall-screw` | C1022 Steel, Bugle Head, Phillips | 25mm (৳450), 38mm (৳650), 50mm (৳850) |
| **Grade 8.8 High-Tensile Zinc Hex Bolts** | Fasteners | `hex-bolt` | Zinc Plated, Metric ISO Pitch | M8 x 50mm (৳600), M10 x 75mm (৳950) |
| **Nylon Expansion Wall Plug Anchors** | Anchors | `wall-anchor` | Virgin PA6 Nylon + Zinc Screw | 6x30mm (৳280), 8x40mm (৳420) |
| **Super Star 10A Modular Wall Switch** | Electrical | `light-switch` | Flame-Retardant PC, Silver Alloy | 1-Gang (৳180), 2-Gang (৳280), 4-Gang (৳520) |
| **Super Star 4-Way Surge Power Strip** | Electrical | `extension-board` | 2500W Max, 100% Copper Busbars | 3-Meter Cord (৳850), 5-Meter Cord (৳1,150) |
| **BRB 1.5 RM Single Core Cable 90m** | Cables | `electrical-wire` | 99.99% Electrolytic Copper, FR PVC | Red (৳2,650), Black (৳2,650), Green (৳2,650) |
| **RFL uPVC Compact Threaded Ball Valve** | Plumbing | `ball-valve` | 150 PSI, EPDM O-Ring Seals | 1/2" (৳140), 3/4" (৳190), 1" (৳270) |
| **Berger Luxury Silk Interior Wall Paint** | Paints | `wall-paint` | Anti-Bacterial, Silk Sheen | 1L (৳820), 1 Gallon (৳2,850), 18L (৳12,900) |
| **Dowsil GP Waterproof Silicone Sealant** | Adhesives | `silicone-sealant` | 100% Acetoxy Silicone, UV-Resistant | 300ml Clear (৳340), White (৳340), Black (৳340) |
| **Total Level 5 Cut-Resistant Work Gloves** | Safety PPE | `work-gloves` | HPPE Knit + PU Palm, EN 388 Level 5 | Medium (৳350), Large (৳350), XL (৳350) |
| **Ingco Steel Toe Industrial Safety Boots**| Safety PPE | `safety-shoes` | CE EN ISO 20345 S1P, 200J Steel Toe | Size 41 (৳2,800), 42 (৳2,800), 43 (৳2,800), 44 (৳2,800) |
