# Cosmetics Shades & Variant Dimensionality

## Overview
Cosmetics products feature two distinct variant axes:
1. **Shade / Color (`cosmetics-shade`)**: Used for foundations, lipsticks, blushes, powders, etc.
2. **Volume / Net Weight (`cosmetics-volume`)**: Used for serums, creams, shampoos, fragrances, lotions, etc.

Both axes can operate independently or in combination (e.g. `Foundation 01 Ivory / 30 ml`).

## Shade Palette & Swatch Hex Values

| Shade Name (EN) | Shade Name (BN) | Hex Swatch | Category Context |
| --- | --- | --- | --- |
| 01 Ivory | ০১ আইভরি | `#f6ebd9` | Light / Porcelain Complexion |
| 02 Natural Ivory | ০২ ন্যাচারাল আইভরি | `#f3e3ce` | Fair Complexion |
| 03 Classic Nude | ০৩ ক্লাসিক নুড | `#edd0b0` | Light Medium |
| 04 Natural Beige | ০৪ ন্যাচারাল বেইজ | `#e4be96` | Medium Neutral |
| 05 Pure Beige | ০৫ পিওর বেইজ | `#dfb48b` | Medium Warm |
| 06 Sun Beige | ০৬ সান বেইজ | `#d7a57a` | Warm Tan |
| 07 Warm Honey | ০৭ ওয়ার্ম হানি | `#cb915f` | Deep Warm Honey |
| Ruby Red | রুবি রেড | `#b31b2c` | Classic Bold Red Lipstick |
| Pink Rose | পিংক রোজ | `#d94e77` | Soft Daily Rose Pink |
| Nude Coral | নুড কোরাল | `#d47a65` | Warm Peach/Coral Nude |
| Berry Plum | বেরি প্লাম | `#7d2248` | Deep Evening Berry |
| Velvet Crimson | ভেলভেট ক্রিমসন | `#8a1325` | Velvet Dark Red |
| Black Onyx | ব্ল্যাক অনিক্স | `#1a1a1a` | Kajal & Gel Eyeliner |

## Frontend PDP Behavior
- Circular swatches display the exact hex swatch preview.
- Active shade has an outer primary ring with offset.
- Light shades automatically switch checkmark icon from white to dark charcoal (`#18181b`) for optimal contrast.
- Out-of-stock shades show reduced opacity with an angled diagonal strike-through and are disabled for selection.
