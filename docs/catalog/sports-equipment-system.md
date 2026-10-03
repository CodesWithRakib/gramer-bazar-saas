# Sports Equipment & Sizing Architecture

## Overview
Athletic gear and equipment require precise sizing conventions, weight standards, and ergonomic ratings to ensure athlete performance and injury prevention. Rather than fracturing the database with sport-specific tables, Gramer Bazar leverages the universal attribute and variant system.

## 1. Multi-Axis Variant Resolution Matrix

| Discipline / Category | Primary Variant Axis | Secondary Variant Axis | Example SKU |
| --- | --- | --- | --- |
| **Cricket Bats** | `sports-size` (SH / LH / Size 6) | `sports-material` (English / Kashmir Willow) | `SP-CR-SG-SH` |
| **Footballs & Ball Sports** | `sports-size` (Size 4, Size 5) | `sports-skill-level` (Match / Training) | `SP-FB-MIK-SZ5` |
| **Badminton Rackets** | `sports-weight-capacity` (77g 5U, 83g 4U) | Color / Grip Size (G4) | `SP-BM-YNX-77G-BLK` |
| **Dumbbells & Weights** | `sports-weight-capacity` (5 kg, 10 kg, 15 kg) | `sports-pack-size` (Pair of 2) | `SP-GY-DEC-10KG` |
| **Running Shoes** | `sports-footwear-size` (EU 41 - EU 45) | Color | `SP-FW-NKE-42` |
| **Boxing Gloves** | `sports-glove-size` (10 oz, 12 oz, 14 oz) | Color | `SP-BX-EVR-12OZ` |
| **Sportswear & Jerseys** | `sports-size` (S, M, L, XL, XXL) | Color / Team | `SP-SW-BDC-L` |
| **Cardio Machines (Treadmills)** | `sports-weight-capacity` (Up to 120 kg) | Motor HP / Programs | `SP-GY-PWM-120KG` |
| **Bicycles** | `sports-size` (26-Inch, 27.5-Inch) | Frame Material | `SP-CY-DUR-MBK` |

## 2. Safety, Ergonomics & Maintenance Guidelines
The storefront automatically renders targeted safety advisories on sports gear PDPs:
1. **Protective Gear:** Emphasizes helmets, mouthguards, shin guards, and pads for contact or high-speed sports.
2. **Weight Capacity Compliance:** Reminds users to observe maximum user ratings on motorized treadmills and benches.
3. **Equipment Care:** Guidelines on badminton racket string tension, cricket bat knocking-in, and yoga mat anti-microbial maintenance.
