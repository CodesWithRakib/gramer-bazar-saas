# Home & Kitchen Variant Dimensions & SKU Architecture

## Overview
Home & Kitchen products require versatile variant dimensions depending on the product type:
1. **Capacity Axis (`home-capacity`)**: Rice Cookers (1.8 L vs 2.8 L), Kettles (1.2 L vs 1.5 L), Refrigerators (220 L vs 250 L).
2. **Dimension / Diameter Axis (`home-dimensions`)**: Frying Pans (24 cm vs 28 cm), Tables (120 cm vs 150 cm).
3. **Pack Size Axis (`home-pack-size`)**: Storage Containers (3-Piece Set vs 6-Piece Set), Mops (1 Piece vs Value Pack of 3).
4. **Bedding Size Axis (`home-bed-size`)**: Bedsheets (Queen vs King).
5. **Color Axis (`home-color`)**: Visual swatches for appliances (Black, White, Silver) and furniture finishes (Natural Wood, Walnut Brown).

## Variant Matrix Examples

| Product | Variant Axis 1 | Variant Axis 2 | Generated SKU | Price (BDT) |
| --- | --- | --- | --- | --- |
| Walton Rice Cooker | 1.8 L | White | `HM-RC-WLT-18L` | 2,450 |
| Walton Rice Cooker | 2.8 L | White | `HM-RC-WLT-28L` | 3,150 |
| Philips Kettle | 1.5 L | Black | `HM-KT-PHL-BLK` | 2,850 |
| Philips Kettle | 1.5 L | White | `HM-KT-PHL-WHT` | 2,850 |
| Kiam Frying Pan | 24 cm | Black | `HM-CW-KIM-24CM` | 1,150 |
| Kiam Frying Pan | 28 cm | Black | `HM-CW-KIM-28CM` | 1,450 |
| Regal King Bedsheet | King | Navy Blue | `HM-BD-RGL-KG-BLU` | 1,650 |
| Regal Queen Bedsheet | Queen | Navy Blue | `HM-BD-RGL-QN-BLU` | 1,350 |
| Hatil Dining Chair | Natural Wood | — | `HM-FN-HTL-NAT` | 4,500 |
| Hatil Dining Chair | Walnut Brown | — | `HM-FN-HTL-WLN` | 4,500 |
| RFL Container Set | 3-Piece Set | — | `HM-ST-RFL-3PC` | 480 |
| RFL Container Set | 6-Piece Set | — | `HM-ST-RFL-6PC` | 880 |

## Storefront PDP Rendering
- Dynamic label: `'ক্যাপাসিটি / সাইজ (Capacity / Size):'` adapts for home products.
- Active pill displays the selected capacity, pack size, or bed size.
- Color swatches show metallic silver, walnut brown, and classic appliance finishes.
- Each variant synchronizes stock and price immediately upon selection.
