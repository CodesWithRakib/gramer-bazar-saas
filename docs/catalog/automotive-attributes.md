# Automotive Attribute Dictionary

All automotive attributes are dynamically registered in the universal attribute schema and bound to specific Product Types.

| Attribute Slug | Type | Variant Axis | Filterable | Description & Allowed Values |
| --- | --- | --- | --- | --- |
| `auto-vehicle-type` | SELECT | No | **Yes** | Target vehicle category: Passenger Car / Sedan, SUV / Crossover, Microbus / Van, Motorcycle / Scooter, Commercial Truck / Pickup, Universal Fit |
| `auto-compatible-make` | SELECT | No | **Yes** | Vehicle brand: Toyota, Honda, Nissan, Mitsubishi, Suzuki, Hyundai, Mazda, Yamaha, Bajaj, TVS, Hero, Universal |
| `auto-compatible-model` | SELECT | No | **Yes** | Supported vehicle model & generation: Toyota Corolla / Axio (2012–2020), Toyota Allion / Premio (2007–2018), Toyota Noah / Voxy (2014–2021), Honda Civic (2016–2021), Honda Vezel / HR-V (2013–2020), Nissan X-Trail T32 (2013–2020), Suzuki Swift / Dzire (2017–2024), Yamaha FZ / FZS V2/V3, Bajaj Pulsar 150, Universal Fit for All Vehicles |
| `auto-fitment-type` | SELECT | No | **Yes** | Fitment category: Direct OEM Fit (Vehicle-Specific), Universal Fit (All Models), Performance Upgrade |
| `auto-oem-classification` | SELECT | No | **Yes** | Part grade: OEM Genuine Factory Part, OEM Equivalent Specification, Premium Aftermarket, Universal Fitment |
| `auto-position` | SELECT | No | **Yes** | Vehicle mounting location: Front Axle, Rear Axle, Front & Rear, Left (Passenger Side), Right (Driver Side), Engine Bay, Interior Cabin, Universal |
| `auto-oil-viscosity` | SELECT | **Yes** | **Yes** | SAE motor oil viscosity rating: 0W-20, 5W-30, 5W-40, 10W-30, 10W-40, 20W-50 |
| `auto-volume` | SELECT | **Yes** | **Yes** | Fluid volume: 1 Liter, 3 Liters, 4 Liters, 5 Liters, 200 ml, 500 ml, 1 Gallon (3.78L) |
| `auto-tire-size` | SELECT | **Yes** | **Yes** | Metric tire dimension: 185/65 R15, 195/65 R15, 205/55 R16, 215/55 R17, 225/65 R17, 100/90-17, 140/70-17 |
| `auto-battery-capacity` | SELECT | **Yes** | **Yes** | Battery amp-hour capacity: 35 Ah, 45 Ah, 55 Ah, 65 Ah, 75 Ah, 5 Ah (Bike), 7 Ah (Bike), 9 Ah (Bike) |
| `auto-pack-size` | SELECT | **Yes** | **Yes** | Packaging configuration: 1 Piece, Set of 4, Pair of 2, Complete Kit, Single Front Cam, Dual Front + Rear Cam Set |
| `auto-warranty` | SELECT | No | **Yes** | Official warranty duration: No Warranty, 6 Months Replacement, 12 Months Official Warranty, 18 Months Warranty, 24 Months Warranty |
| `auto-country-of-origin` | SELECT | No | **Yes** | Country of origin: Japan, Germany, USA, Bangladesh, India, Thailand, Indonesia, China, Italy |
