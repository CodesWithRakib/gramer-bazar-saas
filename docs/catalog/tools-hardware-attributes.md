# Tools & Hardware Dynamic Attributes Specification

## Overview
Dynamic attributes enable faceted search, product comparison, variant selector generation, and detailed specifications on the storefront without modifying database columns.

---

## Complete Attributes Registry

### 1. Power & Motor Systems
- **`tools-power-source`** (SELECT):
  - English: *Power Source*, Bangla: *পাওয়ার সোর্স*
  - Options: `Cordless Battery`, `Corded Electric`, `Manual Hand-Operated`, `Pneumatic (Air)`, `Petrol Engine`
- **`tools-voltage`** (TEXT):
  - English: *Voltage*, Bangla: *ভোল্টেজ*
  - Examples: `18V Li-ion`, `20V Max`, `220V–240V AC`
- **`tools-wattage`** (NUMBER):
  - English: *Power Rating (Watt)*, Bangla: *পাওয়ার (ওয়াট)*
  - Units: `W` (e.g. `840`, `1350`, `1400`, `2000`)
- **`tools-battery-capacity`** (TEXT):
  - English: *Battery Capacity*, Bangla: *ব্যাটারির ধারণক্ষমতা*
  - Examples: `1.5Ah`, `2.0Ah`, `4.0Ah`, `5.0Ah Li-ion`
- **`tools-no-load-speed-rpm`** (NUMBER):
  - English: *No-Load Speed (RPM)*, Bangla: *গতিবেগ (RPM)*
  - Units: `RPM` (e.g. `1900`, `2600`, `5500`, `11000`)
- **`tools-max-torque-nm`** (NUMBER):
  - English: *Max Torque (Nm)*, Bangla: *সর্বোচ্চ টর্ক (Nm)*
  - Units: `Nm` (e.g. `50`, `65`, `120`)
- **`tools-chuck-size`** (TEXT):
  - English: *Chuck / Collet Size*, Bangla: *চক সাইজ*
  - Examples: `10mm (3/8")`, `13mm (1/2")`, `SDS-Plus`
- **`tools-disc-diameter-mm`** (NUMBER):
  - English: *Disc Diameter (mm)*, Bangla: *ডিস্ক ব্যাস (মিমি)*
  - Units: `mm` (e.g. `100`, `115`, `125`)
- **`tools-blade-diameter-mm`** (NUMBER):
  - English: *Blade Diameter (mm)*, Bangla: *ব্লেড ব্যাস (মিমি)*
  - Units: `mm` (e.g. `165`, `184`, `210`)

### 2. Hand Tools & Mechanical Hardware
- **`tools-drive-size`** (TEXT):
  - English: *Socket Drive Size*, Bangla: *ড্রাইভ সাইজ*
  - Examples: `1/4" Drive`, `3/8" Drive`, `1/2" Drive`
- **`tools-material`** (TEXT):
  - English: *Material / Metallurgy*, Bangla: *উপাদান ও ধাতু*
  - Examples: `Chrome Vanadium Steel (Cr-V)`, `High Carbon Steel`, `Aircraft Grade Aluminium 6063-T6`
- **`tools-handle-grip`** (TEXT):
  - English: *Handle & Grip Type*, Bangla: *হ্যান্ডেল ও গ্রিপ*
  - Examples: `AntiVibe Ergonomic Rubber Grip`, `TPR Non-Slip Grip`
- **`tools-measurement-range`** (TEXT):
  - English: *Measurement Range*, Bangla: *পরিমাপ পরিসীমা*
  - Examples: `3 Meters`, `5 Meters`, `8 Meters`, `150mm / 6-Inch`

### 3. Fasteners, Fastening & Fixings
- **`tools-fastener-diameter`** (TEXT):
  - English: *Fastener Diameter / Gauge*, Bangla: *ফাস্টেনার ব্যাস*
  - Examples: `3.5mm (#6)`, `6mm`, `8mm`, `M8 (8mm)`, `M10 (10mm)`
- **`tools-fastener-length`** (TEXT):
  - English: *Length / Size / Pack Option*, Bangla: *দৈর্ঘ্য / সাইজ*
  - Examples: `25mm (1 Inch)`, `38mm (1.5 Inch)`, `50mm (2 Inch)`, `6-Step (6 Feet)`, `Medium (Size 8)`
- **`tools-thread-type`** (TEXT):
  - English: *Thread Type*, Bangla: *থ্রেডের ধরন*
  - Examples: `Coarse Thread`, `Fine Thread`, `Metric ISO Coarse`
- **`tools-head-type`** (TEXT):
  - English: *Head Style*, Bangla: *মাথার ধরন*
  - Examples: `Countersunk Bugle Head`, `Hexagonal Head`, `Pan Head`
- **`tools-drive-type`** (TEXT):
  - English: *Drive Style*, Bangla: *ড্রাইভ স্টাইল*
  - Examples: `Phillips #2`, `Slotted / Flat`, `Hex Socket Allen`
- **`tools-pack-quantity`** (TEXT):
  - English: *Pack Quantity / Kit Option*, Bangla: *প্যাক সংখ্যা / কিট বিকল্প*
  - Examples: `Box of 500`, `Box of 100`, `Bare Tool`, `Full Kit with 2x 2.0Ah Batteries`

### 4. Electrical, Plumbing & Finishes
- **`tools-electrical-rated-current`** (TEXT):
  - English: *Rated Current (Amps)*, Bangla: *বিদ্যুৎ প্রবাহ (অ্যাম্পিয়ার)*
  - Examples: `10A`, `13A (2500W Max)`, `15A Continuous`, `16A`, `32A`
- **`tools-number-of-gangs-sockets`** (TEXT):
  - English: *Number of Gangs / Sockets*, Bangla: *সকেট সংখ্যা*
  - Examples: `1-Gang`, `2-Gang`, `4-Gang`, `4 Universal Sockets`
- **`tools-pipe-diameter`** (TEXT):
  - English: *Pipe Diameter / Bore*, Bangla: *পাইপের ব্যাস*
  - Examples: `1/2" Socket (15mm)`, `3/4" Socket (20mm)`, `1" Socket (25mm)`
- **`tools-paint-finish`** (SELECT):
  - English: *Paint Sheen / Finish*, Bangla: *পেইন্ট ফিনিশ*
  - Options: `Matte`, `Eggshell`, `Silk / Satin`, `Semi-Gloss`, `High Gloss`
- **`tools-paint-volume`** (TEXT):
  - English: *Volume / Container Size*, Bangla: *পরিমাণ / ভলিউম*
  - Examples: `1 Liter Can`, `1 Gallon (3.64 Liters)`, `18 Liters Master Drum`, `300ml Cartridge`

### 5. Standards, Safety & Warranty
- **`tools-safety-certification`** (TEXT):
  - English: *Safety Certification*, Bangla: *নিরাপত্তা মানদণ্ড*
  - Examples: `EN 388 4543D Cut Level 5`, `CE EN ISO 20345:2011 S1P`, `EN 131 Certified (150kg)`
- **`tools-country-of-origin`** (TEXT):
  - English: *Country of Origin*, Bangla: *উৎপাদনকারী দেশ*
  - Examples: `Germany`, `Japan`, `USA`, `China`, `Bangladesh`
- **`tools-warranty`** (TEXT):
  - English: *Warranty Period*, Bangla: *ওয়ারেন্টি*
  - Examples: `1 Year Official Bosch Warranty`, `6 Months Service Warranty`, `5 Years Replacement Warranty`
