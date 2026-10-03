# Cosmetics Attribute Dictionary

## 1. Skin & Hair Profiling Attributes
- **`cosmetics-skin-type`** (SELECT, Filterable):
  - Normal, Dry, Oily, Combination, Sensitive, Acne-Prone, All Skin Types
- **`cosmetics-hair-type`** (SELECT, Filterable):
  - Straight, Wavy, Curly, Coily, Dry Hair, Oily Hair, Damaged Hair, Color-Treated Hair, All Hair Types
- **`cosmetics-concern`** (SELECT, Filterable):
  - Acne & Blemishes, Anti-Aging & Wrinkles, Dark Spots & Pigmentation, Dryness & Dehydration, Dullness & Uneven Tone, Oil & Pores, Hair Fall, Dandruff, Frizz Control
- **`cosmetics-benefit`** (SELECT, Filterable):
  - Hydrating, Brightening, Moisturizing, Soothing, Nourishing, Deep Cleansing, Long-Lasting, Sun Protection, Volumizing, Repairs Damage

## 2. Makeup & Sensory Attributes
- **`cosmetics-finish`** (SELECT, Filterable):
  - Matte, Dewy, Satin, Glossy, Natural, Shimmer
- **`cosmetics-coverage`** (SELECT, Filterable):
  - Light, Medium, Full, Sheer, Buildable
- **`cosmetics-shade`** (SELECT, Variant Axis, Swatches):
  - 13 pre-defined shade swatches with hex color values
- **`cosmetics-scent-family`** (SELECT, Filterable):
  - Floral, Woody, Citrus, Oriental, Fresh, Fruity, Musk, Oud, Sweet
- **`cosmetics-form`** (SELECT, Filterable):
  - Liquid, Cream, Gel, Foam, Powder, Serum, Oil, Lotion, Balm, Bar, Spray

## 3. Protection & Claims Attributes
- **`cosmetics-spf`** (SELECT, Filterable):
  - SPF 15, SPF 30, SPF 50, SPF 50+ PA++++, PA+++
- **`cosmetics-claims`** (SELECT, Filterable):
  - Vegan, Cruelty-Free, Paraben-Free, Sulfate-Free, Alcohol-Free, Dermatologically Tested, Waterproof, Organic, Natural
- **`cosmetics-country-of-origin`** (SELECT, Filterable):
  - Bangladesh, Korea, India, France, USA, UK, Thailand, Japan, Germany
- **`cosmetics-gender`** (SELECT, Filterable):
  - Women, Men, Unisex, Baby, Kids
