# Toys, Games & Hobbies Attributes Dictionary

All attributes are managed dynamically through the universal `Attribute` and `ProductAttributeValue` entities.

## Dynamic Attribute Definitions

| Slug | Data Type | Unit | Filterable | Example Values |
| :--- | :--- | :--- | :--- | :--- |
| `toys-age-group` | SELECT | - | Yes | `0–6 Months`, `1–2 Years`, `3–5 Years`, `5–8 Years`, `8–12 Years`, `12+ Years` |
| `toys-min-age-years` | NUMBER | years | Yes | `1`, `3`, `6`, `8`, `12` |
| `toys-max-age-years` | NUMBER | years | Yes | `3`, `8`, `10`, `99` |
| `toys-material` | SELECT | - | Yes | `BPA-Free ABS Plastic`, `Natural Solid Wood`, `Super Soft Plush & PP Cotton`, `Die-Cast Metal & ABS` |
| `toys-safety-warning` | TEXT | - | No | "Choking Hazard: Small parts. Not suitable for children under 3 years." |
| `toys-choking-hazard` | BOOLEAN | - | Yes | `true`, `false` |
| `toys-adult-supervision` | BOOLEAN | - | Yes | `true`, `false` |
| `toys-safety-certification` | SELECT | - | Yes | `EN71 European Safety Standard`, `ASTM F963 US Standard`, `BSTI Certified`, `CE Certified` |
| `toys-battery-required` | BOOLEAN | - | Yes | `true`, `false` |
| `toys-battery-included` | BOOLEAN | - | Yes | `true`, `false` |
| `toys-battery-type` | SELECT | - | Yes | `AA Batteries`, `AAA Batteries`, `Built-in Rechargeable Li-Ion (3.7V/7.4V)`, `12V Rechargeable Lead-Acid` |
| `toys-learning-area` | SELECT | - | Yes | `STEM`, `Science & Robotics`, `Math & Numbers`, `Logic & Problem Solving`, `Fine Motor Skills` |
| `toys-stem-area` | SELECT | - | Yes | `Science`, `Technology`, `Engineering`, `Mathematics`, `Robotics`, `Coding` |
| `toys-skill-development` | TEXT | - | No | "Hand-Eye Coordination, Fine Motor Skills, Logical Thinking" |
| `toys-pieces` | NUMBER | pieces | Yes | `16`, `42`, `120`, `254`, `668` |
| `toys-assembly-required` | BOOLEAN | - | Yes | `true`, `false` |
| `toys-character` | TEXT | - | Yes | `LEGO City`, `Barbie`, `Marvel Avengers`, `Hot Wheels`, `Disney` |
| `toys-rc-control-type` | SELECT | - | Yes | `2.4GHz Wireless Remote Controller`, `Infrared (IR) Remote`, `Smartphone App` |
| `toys-rc-range-meters` | NUMBER | m | Yes | `20`, `35`, `50`, `100` |
| `toys-operating-time-mins`| NUMBER | mins | No | `10`, `25`, `60` |
| `toys-charging-time-mins` | NUMBER | mins | No | `50`, `90`, `360` |
| `toys-max-speed-kmh` | NUMBER | km/h | Yes | `10`, `12`, `25` |
| `toys-game-players` | SELECT | - | Yes | `1–2 Players`, `2–4 Players`, `2–6 Players`, `2–10 Players` |
| `toys-game-playtime-mins` | SELECT | - | Yes | `15–30 Mins`, `30–60 Mins`, `60–90 Mins` |
| `toys-game-type` | SELECT | - | Yes | `Family Board Game`, `Strategy Game`, `Party Game`, `Card Game` |
| `toys-puzzle-type` | SELECT | - | Yes | `Jigsaw Puzzle`, `Wooden Shape Sorter`, `3D Mechanical Wooden Puzzle` |
| `toys-puzzle-pieces` | NUMBER | pieces | Yes | `24`, `60`, `254`, `500`, `1000` |
| `toys-max-weight-capacity-kg`| NUMBER | kg | Yes | `40`, `60`, `100` |
| `toys-washable-non-toxic` | SELECT | - | Yes | `100% Non-Toxic & Machine Washable`, `Non-Toxic & Surface Wipe Clean`, `Non-Toxic Washable Dough` |
| `toys-pack-size` | TEXT | - | No | `Set of 3`, `Set of 5 Cars`, `120-Piece Wooden Case` |
| `toys-country-of-origin` | SELECT | - | Yes | `Bangladesh`, `Denmark`, `USA`, `Germany`, `Japan`, `China`, `India` |
| `toys-warranty` | SELECT | - | Yes | `No Warranty`, `7 Days Replacement Warranty`, `1 Month Motor & Electronics Warranty`, `6 Months Brand Warranty` |
