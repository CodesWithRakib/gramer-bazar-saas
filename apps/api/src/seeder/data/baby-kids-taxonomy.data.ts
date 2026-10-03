import { AttributeDataType } from '../../catalog/enums/attribute-data-type.enum.js';
import type {
  SeedAttribute,
  SeedAttributeOption,
  SeedBrand,
  SeedManufacturer,
  SeedProductType,
  SeedTaxonomyNode,
  SeedVertical,
  SeedVerticalVariant,
  SeedVerticalProduct,
} from './catalog-vertical.types.js';

const opt = (...values: string[]): SeedAttributeOption[] => values.map((value) => ({ value }));
const swatchOpt = (pairs: ReadonlyArray<readonly [string, string]>): SeedAttributeOption[] =>
  pairs.map(([value, hexColor]) => ({ value, hexColor }));
const pt = (
  slug: string,
  attributes: string[],
  nameEn?: string,
  nameBn?: string,
): SeedProductType => ({ slug, attributes, nameEn, nameBn });

/** Diaper Size & Pack variant helper */
const dv = (
  size: string,
  packSize: string,
  sku: string,
  price: number,
  stock: number,
): SeedVerticalVariant => ({
  nameEn: `Size ${size} (${packSize})`,
  nameBn: `সাইজ ${size} (${packSize})`,
  sku,
  price,
  stock,
  attributes: {
    'baby-diaper-size': size,
    'baby-pack-size': packSize,
  },
});

/** Age & Color variant helper for clothing */
const av = (
  ageGroup: string,
  color: string,
  sku: string,
  price: number,
  stock: number,
): SeedVerticalVariant => ({
  nameEn: `${ageGroup} / ${color}`,
  nameBn: `${ageGroup} / ${color}`,
  sku,
  price,
  stock,
  attributes: {
    'baby-age-group': ageGroup,
    'baby-color': color,
  },
});

/** Volume variant helper for toiletries & feeding */
const vv = (
  volume: string,
  sku: string,
  price: number,
  stock: number,
  color?: string,
): SeedVerticalVariant => ({
  nameEn: color ? `${volume} / ${color}` : volume,
  nameBn: color ? `${volume} / ${color}` : volume,
  sku,
  price,
  stock,
  attributes: {
    'baby-volume': volume,
    ...(color ? { 'baby-color': color } : {}),
  },
});

/** Pack or Piece variant helper */
const pv = (
  packSize: string,
  sku: string,
  price: number,
  stock: number,
  color?: string,
): SeedVerticalVariant => ({
  nameEn: color ? `${packSize} / ${color}` : packSize,
  nameBn: color ? `${packSize} / ${color}` : packSize,
  sku,
  price,
  stock,
  attributes: {
    'baby-pack-size': packSize,
    ...(color ? { 'baby-color': color } : {}),
  },
});

/** Shoe Size variant helper */
const sv = (
  shoeSize: string,
  color: string,
  sku: string,
  price: number,
  stock: number,
): SeedVerticalVariant => ({
  nameEn: `${shoeSize} / ${color}`,
  nameBn: `${shoeSize} / ${color}`,
  sku,
  price,
  stock,
  attributes: {
    'baby-footwear-size': shoeSize,
    'baby-color': color,
  },
});

/**
 * Universal Baby & Kids attributes.
 *
 * Age group, diaper size, weight range, material, safety claims, pack size,
 * color, volume, and footwear size are structured attributes — never categories.
 */
export const BABY_KIDS_ATTRIBUTES: SeedAttribute[] = [
  {
    slug: 'baby-age-group',
    nameEn: 'Age Group',
    nameBn: 'বয়স সীমা',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      'Newborn (0-1M)',
      '0–3 Months',
      '3–6 Months',
      '6–12 Months',
      '1–2 Years',
      '2–3 Years',
      '3–5 Years',
      '5–8 Years',
      '8–12 Years',
      '12+ Years',
    ),
  },
  {
    slug: 'baby-diaper-size',
    nameEn: 'Diaper Size',
    nameBn: 'ডায়াপার সাইজ',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt('Newborn (NB)', 'S', 'M', 'L', 'XL', 'XXL'),
  },
  {
    slug: 'baby-weight-range',
    nameEn: 'Weight Range / Capacity',
    nameBn: 'ওজন সীমা / ধারণক্ষমতা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Up to 5 kg',
      '4–8 kg',
      '6–11 kg',
      '9–14 kg',
      '12–17 kg',
      '15+ kg',
      'Up to 15 kg',
      'Up to 25 kg',
    ),
  },
  {
    slug: 'baby-gender',
    nameEn: 'Gender',
    nameBn: 'জেন্ডার',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Unisex', 'Boys', 'Girls'),
  },
  {
    slug: 'baby-material',
    nameEn: 'Primary Material',
    nameBn: 'প্রধান উপাদান',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '100% Organic Cotton',
      'BPA-Free Silicone',
      'Food-Grade PP',
      'Borosilicate Glass',
      'Soft Plush',
      'Solid Pine Wood',
      'Natural Latex',
      'Stainless Steel',
      'Breathable Mesh',
      'Melamine Free Bamboo Fibre',
      'ABS Plastic (Non-Toxic)',
    ),
  },
  {
    slug: 'baby-pack-size',
    nameEn: 'Pack Size / Quantity',
    nameBn: 'প্যাক সাইজ / সংখ্যা',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      '1 Piece',
      '2-Pack',
      '3-Pack',
      '20 pcs',
      '40 pcs',
      '60 pcs',
      '80 Wipes Pack',
      'Pack of 3',
      '50 pcs Box',
      '100 pcs Box',
      '300g',
      '400g',
    ),
  },
  {
    slug: 'baby-safety-claims',
    nameEn: 'Safety & Hygiene Claims',
    nameBn: 'নিরাপত্তা ও হাইজিন বৈশিষ্ট্য',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'BPA Free',
      'Phthalate Free',
      'Non-Toxic',
      'Hypoallergenic',
      'Pediatrician Approved',
      'Dermatologically Tested',
      'Tear-Free Formula',
      'Organic Certified',
      'Child-Safe Non-Toxic Paint',
      'Alcohol Free',
      'Paraben Free',
    ),
  },
  {
    slug: 'baby-warning',
    nameEn: 'Safety Warning / Caution',
    nameBn: 'সতর্কতা ও নির্দেশিকা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Adult Supervision Required',
      'Choking Hazard (Small Parts)',
      'Do Not Microwave',
      'Keep Away from Fire',
      'External Use Only',
      'Discard If Torn or Damaged',
    ),
  },
  {
    slug: 'baby-color',
    nameEn: 'Color',
    nameBn: 'রং',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: swatchOpt([
      ['Pastel Pink', '#f472b6'],
      ['Sky Blue', '#38bdf8'],
      ['Mint Green', '#4ade80'],
      ['Sunny Yellow', '#facc15'],
      ['Pure White', '#ffffff'],
      ['Navy Blue', '#1e3a8a'],
      ['Soft Grey', '#9ca3af'],
      ['Vibrant Red', '#ef4444'],
      ['Lavender Purple', '#c084fc'],
      ['Peach Coral', '#fb923c'],
    ]),
  },
  {
    slug: 'baby-volume',
    nameEn: 'Volume / Net Weight',
    nameBn: 'পরিমাণ / নেট ওজন',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      '50 ml',
      '100 ml',
      '125 ml',
      '200 ml',
      '240 ml',
      '250 ml',
      '400 ml',
      '500 ml',
      '300g',
      '400g',
    ),
  },
  {
    slug: 'baby-footwear-size',
    nameEn: 'Footwear Size',
    nameBn: 'জুতোর সাইজ',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      'EU 18',
      'EU 19',
      'EU 20',
      'EU 21',
      'EU 22',
      'EU 24',
      'EU 26',
      'EU 28',
      'EU 30',
      'EU 32',
    ),
  },
  {
    slug: 'baby-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎপাদনকারী দেশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Bangladesh',
      'India',
      'UK',
      'USA',
      'Japan',
      'Germany',
      'Thailand',
      'China',
      'Italy',
      'Netherlands',
      'Switzerland',
      'Denmark',
    ),
  },
];

/**
 * Full Baby & Kids taxonomy tree with 12 subtrees.
 */
export const BABY_KIDS_TAXONOMY: SeedTaxonomyNode = {
  slug: 'baby-kids',
  nameEn: 'Baby & Kids',
  nameBn: 'শিশু ও বাচ্চাদের সামগ্রী',
  icon: '👶',
  descriptionEn:
    'Complete baby care, diapers, clothing, feeding essentials, educational toys, strollers, nursery, and kids school supplies.',
  descriptionBn:
    'শিশুর যত্ন, ডায়াপার, পোশাক, ফিডিং সামগ্রী, খেলনা, স্ট্রোলার, নার্সারি ও স্কুল সামগ্রীর বিশ্বস্ত সংগ্রহ।',
  children: [
    // 1. Baby Clothing
    {
      slug: 'baby-clothing',
      nameEn: 'Baby Clothing',
      nameBn: 'শিশুর পোশাক',
      icon: '🍼',
      children: [
        {
          slug: 'baby-newborn-clothing',
          nameEn: 'Newborn Clothing',
          nameBn: 'নবজাতকের পোশাক',
          productTypes: [
            pt('baby-romper', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Baby Romper', 'বেবি রম্পার'),
            pt('baby-bodysuit', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Baby Bodysuit', 'বেবি বডিস্যুট'),
          ],
        },
        {
          slug: 'baby-rompers-bodysuits',
          nameEn: 'Rompers & Bodysuits',
          nameBn: 'রম্পার ও বডিস্যুট',
          productTypes: [
            pt('baby-romper', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Baby Romper', 'বেবি রম্পার'),
          ],
        },
        {
          slug: 'baby-sets',
          nameEn: 'Baby Sets & Sleepwear',
          nameBn: 'বেবি সেট ও স্লিপওয়্যার',
          productTypes: [
            pt('baby-set', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Baby Set', 'বেবি সেট'),
          ],
        },
        {
          slug: 'baby-dresses',
          nameEn: 'Baby Frocks & Dresses',
          nameBn: 'বেবি ফ্রক ও ড্রেস',
          productTypes: [
            pt('baby-dress', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Baby Dress', 'বেবি ড্রেস'),
          ],
        },
      ],
    },

    // 2. Kids Clothing
    {
      slug: 'baby-kids-clothing',
      nameEn: 'Kids Clothing',
      nameBn: 'বাচ্চাদের পোশাক',
      icon: '👕',
      children: [
        {
          slug: 'kids-boys-clothing',
          nameEn: 'Boys Clothing',
          nameBn: 'ছেলেদের পোশাক',
          productTypes: [
            pt('kids-tshirt', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Kids T-Shirt', 'বাচ্চাদের টি-শার্ট'),
            pt('kids-panjabi', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Kids Panjabi', 'বাচ্চাদের পাঞ্জাবি'),
            pt('kids-pants', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Kids Pants', 'বাচ্চাদের প্যান্ট'),
          ],
        },
        {
          slug: 'kids-girls-clothing',
          nameEn: 'Girls Clothing',
          nameBn: 'মেয়েদের পোশাক',
          productTypes: [
            pt('kids-frock', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Kids Frock & Dress', 'মেয়েদের ফ্রক ও ড্রেস'),
            pt('kids-salwar', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Kids Salwar Kameez', 'বাচ্চাদের সালোয়ার কামিজ'),
          ],
        },
      ],
    },

    // 3. Baby Feeding
    {
      slug: 'baby-feeding',
      nameEn: 'Baby Feeding',
      nameBn: 'শিশুর ফিডিং ও খাওয়ানো',
      icon: '🍼',
      children: [
        {
          slug: 'baby-feeding-bottles',
          nameEn: 'Feeding Bottles',
          nameBn: 'ফিডিং বোতল',
          productTypes: [
            pt('feeding-bottle', [
              'baby-volume',
              'baby-material',
              'baby-safety-claims',
              'baby-warning',
              'baby-color',
              'baby-country-of-origin',
            ], 'Feeding Bottle', 'ফিডিং বোতল'),
          ],
        },
        {
          slug: 'baby-sippy-cups',
          nameEn: 'Sippy Cups & Straw Bottles',
          nameBn: 'সিপি কাপ ও স্ট্র বোতল',
          productTypes: [
            pt('sippy-cup', [
              'baby-volume',
              'baby-age-group',
              'baby-color',
              'baby-material',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Sippy Cup', 'সিপি কাপ'),
          ],
        },
        {
          slug: 'baby-plates-spoons',
          nameEn: 'Plates, Bowls & Spoons',
          nameBn: 'প্লেট, বাটি ও চামচ',
          productTypes: [
            pt('baby-feeding-set', [
              'baby-age-group',
              'baby-material',
              'baby-safety-claims',
              'baby-color',
              'baby-country-of-origin',
            ], 'Baby Feeding Set', 'বেবি ফিডিং সেট'),
          ],
        },
        {
          slug: 'baby-bibs',
          nameEn: 'Bibs & Napkins',
          nameBn: 'বিব ও ন্যাপকিন',
          productTypes: [
            pt('baby-bib', [
              'baby-age-group',
              'baby-material',
              'baby-pack-size',
              'baby-color',
              'baby-country-of-origin',
            ], 'Baby Bib', 'বেবি বিব'),
          ],
        },
      ],
    },

    // 4. Diapering
    {
      slug: 'baby-diapering',
      nameEn: 'Diapering',
      nameBn: 'ডায়াপার ও ডায়াপারিং',
      icon: '🧷',
      children: [
        {
          slug: 'baby-diapers-pants',
          nameEn: 'Baby Diapers & Pants',
          nameBn: 'বেবি ডায়াপার ও প্যান্ট ডায়াপার',
          productTypes: [
            pt('diaper-pants', [
              'baby-diaper-size',
              'baby-weight-range',
              'baby-pack-size',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Diaper Pants', 'প্যান্ট ডায়াপার'),
            pt('baby-diaper-tape', [
              'baby-diaper-size',
              'baby-weight-range',
              'baby-pack-size',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Tape Diaper', 'টেপ ডায়াপার'),
          ],
        },
        {
          slug: 'baby-wipes-changing',
          nameEn: 'Baby Wipes & Changing Mats',
          nameBn: 'বেবি ওয়াইপস ও চেঞ্জিং ম্যাট',
          productTypes: [
            pt('baby-wipe', [
              'baby-pack-size',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Baby Wipe', 'বেবি ওয়াইপ'),
            pt('changing-mat', [
              'baby-material',
              'baby-color',
              'baby-country-of-origin',
            ], 'Changing Mat', 'চেঞ্জিং ম্যাট'),
          ],
        },
        {
          slug: 'baby-cloth-diapers',
          nameEn: 'Cloth Diapers & Nappies',
          nameBn: 'কাপড়ের ডায়াপার ও ন্যাপি',
          productTypes: [
            pt('cloth-diaper', [
              'baby-age-group',
              'baby-material',
              'baby-pack-size',
              'baby-color',
              'baby-country-of-origin',
            ], 'Cloth Diaper', 'কাপড়ের ডায়াপার'),
          ],
        },
      ],
    },

    // 5. Baby Care & Toiletries
    {
      slug: 'baby-care',
      nameEn: 'Baby Care & Toiletries',
      nameBn: 'শিশুর যত্ন ও টয়লেট্রিজ',
      icon: '🧴',
      children: [
        {
          slug: 'baby-bath-hair',
          nameEn: 'Baby Shampoo & Wash',
          nameBn: 'বেবি শ্যাম্পু ও বডি ওয়াশ',
          productTypes: [
            pt('baby-shampoo', [
              'baby-volume',
              'baby-age-group',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Baby Shampoo', 'বেবি শ্যাম্পু'),
            pt('baby-soap', [
              'baby-volume',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Baby Soap', 'বেবি সাবান'),
          ],
        },
        {
          slug: 'baby-skin-care',
          nameEn: 'Baby Lotion, Oil & Cream',
          nameBn: 'বেবি লোশন, তেল ও ক্রিম',
          productTypes: [
            pt('baby-lotion', [
              'baby-volume',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Baby Lotion', 'বেবি লোশন'),
            pt('baby-oil', [
              'baby-volume',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Baby Oil', 'বেবি তেল'),
            pt('baby-rash-cream', [
              'baby-volume',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Diaper Rash Cream', 'ডায়াপার র্যাশ ক্রিম'),
          ],
        },
        {
          slug: 'baby-powder',
          nameEn: 'Baby Powder',
          nameBn: 'বেবি পাউডার',
          productTypes: [
            pt('baby-powder-pt', [
              'baby-volume',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Baby Powder', 'বেবি পাউডার'),
          ],
        },
      ],
    },

    // 6. Baby Food
    {
      slug: 'baby-food',
      nameEn: 'Baby Food',
      nameBn: 'শিশুর খাবার',
      icon: '🥣',
      children: [
        {
          slug: 'baby-cereals-purees',
          nameEn: 'Baby Cereals & Purees',
          nameBn: 'বেবি সিরিয়াল ও পিউরি',
          productTypes: [
            pt('baby-cereal', [
              'baby-age-group',
              'baby-volume',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Baby Cereal', 'বেবি সিরিয়াল'),
          ],
        },
        {
          slug: 'baby-infant-formula',
          nameEn: 'Infant Formula & Toddler Nutrition',
          nameBn: 'ইনফ্যান্ট ফর্মুলা ও পুষ্টিকর খাবার',
          productTypes: [
            pt('infant-formula', [
              'baby-age-group',
              'baby-volume',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Infant Formula', 'ইনফ্যান্ট ফর্মুলা'),
          ],
        },
      ],
    },

    // 7. Toys & Games
    {
      slug: 'baby-toys-games',
      nameEn: 'Toys & Games',
      nameBn: 'খেলনা ও গেমস',
      icon: '🧸',
      children: [
        {
          slug: 'baby-educational-toys',
          nameEn: 'Educational Toys & Blocks',
          nameBn: 'শিক্ষামূলক খেলনা ও বিল্ডিং ব্লক',
          productTypes: [
            pt('building-blocks', [
              'baby-age-group',
              'baby-pack-size',
              'baby-material',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Building Blocks', 'বিল্ডিং ব্লক'),
            pt('educational-puzzle', [
              'baby-age-group',
              'baby-material',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Educational Puzzle', 'শিক্ষামূলক পাজল'),
          ],
        },
        {
          slug: 'baby-dolls-plush',
          nameEn: 'Dolls & Plush Toys',
          nameBn: 'পুতুল ও সফট টয়',
          productTypes: [
            pt('plush-toy', [
              'baby-age-group',
              'baby-material',
              'baby-color',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Plush Toy', 'সফট প্লাশ টয়'),
            pt('fashion-doll', [
              'baby-age-group',
              'baby-material',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Doll', 'পুতুল'),
          ],
        },
        {
          slug: 'baby-vehicles-rc',
          nameEn: 'Vehicles & Remote Control',
          nameBn: 'গাড়ি ও রিমোট কন্ট্রোল খেলনা',
          productTypes: [
            pt('rc-car', [
              'baby-age-group',
              'baby-material',
              'baby-color',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Remote Control Toy', 'রিমোট কন্ট্রোল খেলনা'),
          ],
        },
      ],
    },

    // 8. Baby Gear & Travel
    {
      slug: 'baby-gear',
      nameEn: 'Baby Gear & Travel',
      nameBn: 'বেবি গিয়ার ও ভ্রমণ',
      icon: '🚼',
      children: [
        {
          slug: 'baby-strollers-prams',
          nameEn: 'Strollers & Prams',
          nameBn: 'বেবি স্ট্রোলার ও প্র্যাম',
          productTypes: [
            pt('baby-stroller', [
              'baby-age-group',
              'baby-weight-range',
              'baby-color',
              'baby-material',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Baby Stroller', 'বেবি স্ট্রোলার'),
          ],
        },
        {
          slug: 'baby-carriers-walkers',
          nameEn: 'Carriers & Walkers',
          nameBn: 'ক্যারিয়ার ও ওয়াকার',
          productTypes: [
            pt('baby-carrier', [
              'baby-age-group',
              'baby-weight-range',
              'baby-material',
              'baby-color',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Baby Carrier', 'বেবি ক্যারিয়ার'),
            pt('baby-walker', [
              'baby-age-group',
              'baby-weight-range',
              'baby-material',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Baby Walker', 'বেবি ওয়াকার'),
          ],
        },
      ],
    },

    // 9. Nursery & Bedding
    {
      slug: 'baby-nursery',
      nameEn: 'Nursery & Bedding',
      nameBn: 'নার্সারি ও বেবি বেডিং',
      icon: '🛏️',
      children: [
        {
          slug: 'baby-beds-cribs',
          nameEn: 'Beds, Cribs & Mattresses',
          nameBn: 'বেবি খাট, ক্রিব ও তোষক',
          productTypes: [
            pt('baby-crib', [
              'baby-age-group',
              'baby-material',
              'baby-color',
              'baby-safety-claims',
              'baby-country-of-origin',
            ], 'Baby Crib', 'বেবি ক্রিব'),
          ],
        },
        {
          slug: 'baby-blankets-bedding',
          nameEn: 'Blankets, Quilts & Pillows',
          nameBn: 'কম্বল, কাঁথা ও বালিশ',
          productTypes: [
            pt('baby-blanket', [
              'baby-age-group',
              'baby-material',
              'baby-color',
              'baby-country-of-origin',
            ], 'Baby Blanket', 'বেবি কম্বল'),
          ],
        },
      ],
    },

    // 10. Kids Footwear
    {
      slug: 'baby-footwear',
      nameEn: 'Kids Footwear',
      nameBn: 'বাচ্চাদের জুতো',
      icon: '👟',
      children: [
        {
          slug: 'baby-shoes-booties',
          nameEn: 'Baby Shoes & Booties',
          nameBn: 'বেবি জুতো ও বুটি',
          productTypes: [
            pt('baby-booties', [
              'baby-age-group',
              'baby-material',
              'baby-color',
              'baby-country-of-origin',
            ], 'Baby Booties', 'বেবি বুটি'),
          ],
        },
        {
          slug: 'kids-sneakers-sandals',
          nameEn: 'Kids Sneakers & Sandals',
          nameBn: 'বাচ্চাদের স্নিকার্স ও স্যান্ডেল',
          productTypes: [
            pt('kids-sneaker', [
              'baby-footwear-size',
              'baby-gender',
              'baby-color',
              'baby-material',
              'baby-country-of-origin',
            ], 'Kids Sneaker', 'বাচ্চাদের স্নিকার'),
          ],
        },
      ],
    },

    // 11. Kids Bags & Accessories
    {
      slug: 'baby-bags-accessories',
      nameEn: 'Kids Bags & Accessories',
      nameBn: 'বাচ্চাদের ব্যাগ ও এক্সেসরিজ',
      icon: '🎒',
      children: [
        {
          slug: 'kids-school-bags',
          nameEn: 'School Bags & Backpacks',
          nameBn: 'স্কুল ব্যাগ ও ব্যাকপ্যাক',
          productTypes: [
            pt('kids-backpack', [
              'baby-age-group',
              'baby-gender',
              'baby-material',
              'baby-color',
              'baby-country-of-origin',
            ], 'School Backpack', 'স্কুল ব্যাকপ্যাক'),
          ],
        },
        {
          slug: 'kids-caps-watches',
          nameEn: 'Watches, Caps & Accessories',
          nameBn: 'ঘড়ি, টুপি ও এক্সেসরিজ',
          productTypes: [
            pt('kids-watch', [
              'baby-age-group',
              'baby-gender',
              'baby-color',
              'baby-country-of-origin',
            ], 'Kids Watch', 'বাচ্চাদের ঘড়ি'),
          ],
        },
      ],
    },

    // 12. Kids School & Stationery
    {
      slug: 'baby-school-stationery',
      nameEn: 'School & Stationery',
      nameBn: 'স্কুল ও স্টেশনারি',
      icon: '✏️',
      children: [
        {
          slug: 'kids-art-drawing',
          nameEn: 'Drawing & Art Supplies',
          nameBn: 'ড্রয়িং ও আর্ট সরঞ্জাম',
          productTypes: [
            pt('art-color-set', [
              'baby-age-group',
              'baby-pack-size',
              'baby-safety-claims',
              'baby-warning',
              'baby-country-of-origin',
            ], 'Kids Color Art Set', 'বাচ্চাদের রঙের সেট'),
          ],
        },
        {
          slug: 'kids-stationery-sets',
          nameEn: 'Notebooks & Stationery Sets',
          nameBn: 'খাতা ও স্টেশনারি সেট',
          productTypes: [
            pt('stationery-set', [
              'baby-age-group',
              'baby-pack-size',
              'baby-country-of-origin',
            ], 'Stationery Set', 'স্টেশনারি সেট'),
          ],
        },
      ],
    },
  ],
};

/**
 * Authentic regional (Bangladesh) and international Baby & Kids brands.
 */
export const BABY_KIDS_BRANDS: SeedBrand[] = [
  { name: 'Meril Baby', manufacturer: 'Square Toiletries Ltd.' },
  { name: 'Just for Baby', manufacturer: 'Marico Bangladesh Ltd.' },
  { name: 'Supermom', manufacturer: 'Square Toiletries Ltd.' },
  { name: 'Chu Chu', manufacturer: 'Square Toiletries Ltd.' },
  { name: 'Neocare', manufacturer: 'Incepta Hygiene & Personal Care Ltd.' },
  { name: 'Twinkle', manufacturer: 'Bashundhara Group' },
  { name: 'RFL Play', manufacturer: 'PRAN-RFL Group' },
  { name: 'Hatil Kids', manufacturer: 'Hatil Complex Ltd.' },
  { name: "Johnson's Baby", manufacturer: 'Johnson & Johnson / Kenvue' },
  { name: 'Pampers', manufacturer: 'Procter & Gamble Co.' },
  { name: 'Huggies', manufacturer: 'Kimberly-Clark Corporation' },
  { name: 'MamyPoko', manufacturer: 'Unicharm Corporation' },
  { name: 'Sebamed', manufacturer: 'Sebapharma GmbH & Co. KG' },
  { name: 'Chicco', manufacturer: 'Artsana S.p.A.' },
  { name: 'Philips Avent', manufacturer: 'Philips Consumer Lifestyle B.V.' },
  { name: 'Pigeon', manufacturer: 'Pigeon Corporation' },
  { name: 'Cerelac', manufacturer: 'Nestlé S.A.' },
  { name: 'Lego', manufacturer: 'The LEGO Group' },
  { name: 'Fisher-Price', manufacturer: 'Mattel Inc.' },
  { name: 'Barbie', manufacturer: 'Mattel Inc.' },
];

export const BABY_KIDS_MANUFACTURERS: SeedManufacturer[] = [
  { name: 'Square Toiletries Ltd.', nameBn: 'স্কয়ার টয়লেট্রিজ লি.', country: 'Bangladesh' },
  { name: 'Marico Bangladesh Ltd.', nameBn: 'মেরিকো বাংলাদেশ লি.', country: 'Bangladesh' },
  { name: 'Incepta Hygiene & Personal Care Ltd.', nameBn: 'ইনসেপ্টা হাইজিন অ্যান্ড পার্সোনাল কেয়ার লি.', country: 'Bangladesh' },
  { name: 'Bashundhara Group', nameBn: 'বসুন্ধরা গ্রুপ', country: 'Bangladesh' },
  { name: 'PRAN-RFL Group', nameBn: 'প্রাণ-আরএফএল গ্রুপ', country: 'Bangladesh' },
  { name: 'Hatil Complex Ltd.', nameBn: 'হাতিল কমপ্লেক্স লি.', country: 'Bangladesh' },
  { name: 'Procter & Gamble Co.', nameBn: 'প্রক্টর অ্যান্ড গ্যাম্বল', country: 'USA' },
  { name: 'Kimberly-Clark Corporation', nameBn: 'কিম্বার্লি-ক্লার্ক কর্পোরেশন', country: 'USA' },
  { name: 'Johnson & Johnson / Kenvue', nameBn: 'জনসন অ্যান্ড জনসন / কেনভিউ', country: 'USA' },
  { name: 'Unicharm Corporation', nameBn: 'ইউনিচার্ম কর্পোরেশন', country: 'Japan' },
  { name: 'Sebapharma GmbH & Co. KG', nameBn: 'সেবাফার্মা জিএমবিএইচ', country: 'Germany' },
  { name: 'Artsana S.p.A.', nameBn: 'আর্টসানা এস.পি.এ.', country: 'Italy' },
  { name: 'Philips Consumer Lifestyle B.V.', nameBn: 'ফিলিপস কনজিউমার লাইফস্টাইল', country: 'Netherlands' },
  { name: 'Pigeon Corporation', nameBn: 'পিজিয়ন কর্পোরেশন', country: 'Japan' },
  { name: 'Nestlé S.A.', nameBn: 'নেসলে এস.এ.', country: 'Switzerland' },
  { name: 'Mattel Inc.', nameBn: 'ম্যাটেল ইনকর্পোরেটেড', country: 'USA' },
  { name: 'The LEGO Group', nameBn: 'দ্য লেগো গ্রুপ', country: 'Denmark' },
];

/**
 * 10 Realistic Demo Products across the Baby & Kids spectrum with rich specs and variants.
 */
export const BABY_KIDS_PRODUCTS: SeedVerticalProduct[] = [
  // 1. Diapers: Pampers Baby Dry Diaper Pants
  {
    categoryPath: 'baby-kids/baby-diapering/baby-diapers-pants',
    productTypeSlug: 'diaper-pants',
    nameEn: 'Demo Pampers Baby Dry Pants Diaper with Magic Gel Channels',
    nameBn: 'ডেমো প্যাম্পার্স বেবি ড্রাই প্যান্টস ডায়াপার (ম্যাজিক জেল)',
    slug: 'demo-baby-pampers-baby-dry-pants',
    sku: 'BK-DP-PMP-01',
    brand: 'Pampers',
    manufacturer: 'Procter & Gamble Co.',
    shortDescriptionEn:
      'Up to 12 hours of overnight dryness with 3 absorbing channels and 360-degree soft stretchy waistband.',
    shortDescriptionBn:
      '১২ ঘণ্টা পর্যন্ত সারারাত শুষ্কতা ও ৩টি শোষণ চ্যানেলযুক্ত আরামদায়ক প্যান্ট ডায়াপার।',
    price: 1150,
    compareAtPrice: 1250,
    stock: 150,
    unit: 'pack',
    isFeatured: true,
    specs: {
      'baby-safety-claims': 'Dermatologically Tested',
      'baby-warning': 'Discard If Torn or Damaged',
      'baby-country-of-origin': 'USA',
    },
    variants: [
      dv('S', '40 pcs', 'BK-DP-PMP-S40', 1050, 50),
      dv('M', '40 pcs', 'BK-DP-PMP-M40', 1150, 60),
      dv('L', '40 pcs', 'BK-DP-PMP-L40', 1250, 40),
    ],
  },

  // 2. Baby Care: Meril Baby Mild Shampoo with Tear-Free Formula
  {
    categoryPath: 'baby-kids/baby-care/baby-bath-hair',
    productTypeSlug: 'baby-shampoo',
    nameEn: 'Demo Meril Baby Mild Shampoo Tear-Free Gentle Cleanser',
    nameBn: 'ডেমো মেরিল বেবি মাইল্ড শ্যাম্পু (টিয়ার-ফ্রি ফর্মুলা)',
    slug: 'demo-baby-meril-mild-shampoo',
    sku: 'BK-BC-MRL-01',
    brand: 'Meril Baby',
    manufacturer: 'Square Toiletries Ltd.',
    shortDescriptionEn:
      'Ultra-mild, pH-balanced formula tested to be as gentle to newborn eyes as pure water. Leaves baby hair clean, soft, and delicately scented.',
    shortDescriptionBn:
      'চোখের জ্বালাবিহীন টিয়ার-ফ্রি ও পিএইচ-ব্যালান্সড কোমল বেবি শ্যাম্পু।',
    price: 180,
    compareAtPrice: 200,
    stock: 220,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'baby-safety-claims': 'Tear-Free Formula',
      'baby-warning': 'External Use Only',
      'baby-country-of-origin': 'Bangladesh',
    },
    batches: [
      {
        batchNumber: 'MRL-BS-2026A',
        manufacturingDate: '2026-01-10',
        expiryDate: '2028-01-09',
        quantity: 220,
      },
    ],
    variants: [
      vv('100 ml', 'BK-BC-MRL-100', 180, 120),
      vv('200 ml', 'BK-BC-MRL-200', 320, 100),
    ],
  },

  // 3. Feeding: Philips Avent Natural Glass Feeding Bottle
  {
    categoryPath: 'baby-kids/baby-feeding/baby-feeding-bottles',
    productTypeSlug: 'feeding-bottle',
    nameEn: 'Demo Philips Avent Natural Glass Feeding Bottle Anti-Colic',
    nameBn: 'ডেমো ফিলিপস অ্যাভেন্ট ন্যাচারাল গ্লাস ফিডিং বোতল',
    slug: 'demo-baby-philips-avent-glass-bottle',
    sku: 'BK-FD-AVN-01',
    brand: 'Philips Avent',
    manufacturer: 'Philips Consumer Lifestyle B.V.',
    shortDescriptionEn:
      'Premium thermal shock-resistant borosilicate glass with natural wide breast-shaped nipple and advanced anti-colic system.',
    shortDescriptionBn:
      'বোরোসিলিকেট কাঁচ ও প্রাকৃতিক ব্রেস্ট-শেপড নিপলযুক্ত উন্নত অ্যান্টিকলিক ফিডিং বোতল।',
    price: 1850,
    compareAtPrice: 2000,
    stock: 75,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'baby-material': 'Borosilicate Glass',
      'baby-safety-claims': 'BPA Free',
      'baby-warning': 'Adult Supervision Required',
      'baby-country-of-origin': 'Netherlands',
    },
    variants: [
      vv('125 ml', 'BK-FD-AVN-125', 1750, 35),
      vv('240 ml', 'BK-FD-AVN-240', 1850, 40),
    ],
  },

  // 4. Baby Clothing: Just for Baby 100% Organic Cotton Romper Set
  {
    categoryPath: 'baby-kids/baby-clothing/baby-newborn-clothing',
    productTypeSlug: 'baby-romper',
    nameEn: 'Demo Just for Baby 100% Organic Cotton Soft Newborn Romper',
    nameBn: 'ডেমো জাস্ট ফর বেবি ১০০% অর্গানিক কটন নবজাতকের রম্পার',
    slug: 'demo-baby-jfb-cotton-romper',
    sku: 'BK-CL-JFB-01',
    brand: 'Just for Baby',
    manufacturer: 'Marico Bangladesh Ltd.',
    shortDescriptionEn:
      'GOTS certified super-soft organic cotton breathable bodysuit with nickel-free snaps for effortless diaper changes.',
    shortDescriptionBn:
      'নিকেল-মুক্ত বোতামযুক্ত ১০০% খাঁটি সুতি ও আরামদায়ক নবজাতকের রম্পার।',
    price: 450,
    compareAtPrice: 520,
    stock: 110,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'baby-material': '100% Organic Cotton',
      'baby-safety-claims': 'Hypoallergenic',
      'baby-gender': 'Unisex',
      'baby-country-of-origin': 'Bangladesh',
    },
    variants: [
      av('0–3 Months', 'Sky Blue', 'BK-CL-JFB-03BLU', 450, 30),
      av('0–3 Months', 'Pastel Pink', 'BK-CL-JFB-03PNK', 450, 30),
      av('3–6 Months', 'Sky Blue', 'BK-CL-JFB-06BLU', 480, 25),
      av('6–12 Months', 'Pastel Pink', 'BK-CL-JFB-12PNK', 500, 25),
    ],
  },

  // 5. Baby Food: Nestlé Cerelac Wheat & 4 Fruits Baby Cereal with Iron+
  {
    categoryPath: 'baby-kids/baby-food/baby-cereals-purees',
    productTypeSlug: 'baby-cereal',
    nameEn: 'Demo Nestlé Cerelac Wheat & 4 Fruits Infant Cereal (Iron+)',
    nameBn: 'ডেমো নেসলে সেরেলাক গম ও ৪ ফলমূল বেবি সিরিয়াল (আয়রন+)',
    slug: 'demo-baby-nestle-cerelac-wheat-fruits',
    sku: 'BK-BF-CRL-01',
    brand: 'Cerelac',
    manufacturer: 'Nestlé S.A.',
    shortDescriptionEn:
      'Iron-fortified infant cereal enriched with vitamins, minerals, and Bifidus BL probiotics for healthy growth and cognitive development.',
    shortDescriptionBn:
      'আয়রন, ভিটামিন এবং প্রোবায়োটিকযুক্ত সুস্বাদু ও পুষ্টিকর বেবি খাদ্য (৬ মাস+)।',
    price: 420,
    compareAtPrice: 450,
    stock: 140,
    unit: 'pack',
    isFeatured: true,
    specs: {
      'baby-age-group': '6–12 Months',
      'baby-safety-claims': 'Pediatrician Approved',
      'baby-warning': 'Adult Supervision Required',
      'baby-country-of-origin': 'Switzerland',
    },
    batches: [
      {
        batchNumber: 'CRL-WF-2026B',
        manufacturingDate: '2026-02-01',
        expiryDate: '2027-02-01',
        quantity: 140,
      },
    ],
    variants: [
      vv('300g', 'BK-BF-CRL-300G', 420, 80),
      vv('400g', 'BK-BF-CRL-400G', 540, 60),
    ],
  },

  // 6. Feeding / Sippy: Pigeon Soft Anti-Spill Sippy Cup
  {
    categoryPath: 'baby-kids/baby-feeding/baby-sippy-cups',
    productTypeSlug: 'sippy-cup',
    nameEn: 'Demo Pigeon MagMag Soft Silicone Straw Anti-Leak Cup 240ml',
    nameBn: 'ডেমো পিজিয়ন ম্যাগ-ম্যাগ লিক-প্রুফ সিলিকন স্ট্র কাপ ২৪০ মিলি',
    slug: 'demo-baby-pigeon-magmag-sippy-cup',
    sku: 'BK-FD-PGN-01',
    brand: 'Pigeon',
    manufacturer: 'Pigeon Corporation',
    shortDescriptionEn:
      'Cross-cut leak-proof silicone straw designed for easy transition from bottle to cup. Easy-grip handles ergonomically sized for small hands.',
    shortDescriptionBn:
      'সহজে পানি ও দুধ পানের লিক-প্রুফ সিলিকন স্ট্র কাপ ও হ্যান্ডেল।',
    price: 680,
    stock: 90,
    unit: 'piece',
    specs: {
      'baby-volume': '240 ml',
      'baby-age-group': '6–12 Months',
      'baby-material': 'BPA-Free Silicone',
      'baby-safety-claims': 'BPA Free',
      'baby-country-of-origin': 'Japan',
    },
    variants: [
      vv('240 ml', 'BK-FD-PGN-MNT', 680, 50, 'Mint Green'),
      vv('240 ml', 'BK-FD-PGN-BLU', 680, 40, 'Sky Blue'),
    ],
  },

  // 7. Toys: Fisher-Price Educational Sorting Building Blocks
  {
    categoryPath: 'baby-kids/baby-toys-games/baby-educational-toys',
    productTypeSlug: 'building-blocks',
    nameEn: 'Demo Fisher-Price Baby First Blocks Shape Sorter & Stacker',
    nameBn: 'ডেমো ফিশার-প্রাইস বেবি ফার্স্ট শেপ সর্টার ও বিল্ডিং ব্লক',
    slug: 'demo-baby-fisher-price-blocks',
    sku: 'BK-TY-FPR-01',
    brand: 'Fisher-Price',
    manufacturer: 'Mattel Inc.',
    shortDescriptionEn:
      'Chunky, colorful shape-sorting blocks that introduce colors and geometric shapes while developing fine motor skills and problem-solving.',
    shortDescriptionBn:
      'বাচ্চাদের বুদ্ধিবিকাশ ও মোটর স্কিল বৃদ্ধির নন-টক্সিক রঙিন শেপ সর্টার ব্লক।',
    price: 890,
    compareAtPrice: 990,
    stock: 85,
    unit: 'box',
    isFeatured: true,
    specs: {
      'baby-age-group': '6–12 Months',
      'baby-material': 'ABS Plastic (Non-Toxic)',
      'baby-safety-claims': 'Child-Safe Non-Toxic Paint',
      'baby-warning': 'Choking Hazard (Small Parts)',
      'baby-country-of-origin': 'USA',
    },
    variants: [
      pv('50 pcs Box', 'BK-TY-FPR-50P', 890, 50),
      pv('100 pcs Box', 'BK-TY-FPR-100P', 1450, 35),
    ],
  },

  // 8. Baby Gear: Chicco Foldable Lightweight Multi-Recline Baby Stroller
  {
    categoryPath: 'baby-kids/baby-gear/baby-strollers-prams',
    productTypeSlug: 'baby-stroller',
    nameEn: 'Demo Chicco Echo Lightweight Quick-Fold Compact Stroller',
    nameBn: 'ডেমো চিকো ইকো ফোল্ডেবল লাইটওয়েট বেবি স্ট্রোলার',
    slug: 'demo-baby-chicco-compact-stroller',
    sku: 'BK-GR-CHC-01',
    brand: 'Chicco',
    manufacturer: 'Artsana S.p.A.',
    shortDescriptionEn:
      'Ultra-compact one-hand umbrella fold stroller with 4-position reclining backrest, 5-point safety harness, and lockable front swivel wheels.',
    shortDescriptionBn:
      'একহাতে সহজে ফোল্ড করা যায় এমন ৪-পজিশন রিক্লাইন ও ৫-পয়েন্ট সেফটি হারনেসযুক্ত প্রিমিয়াম স্ট্রোলার।',
    price: 9800,
    compareAtPrice: 11000,
    stock: 25,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'baby-age-group': '0–3 Months',
      'baby-weight-range': 'Up to 25 kg',
      'baby-material': 'Breathable Mesh',
      'baby-safety-claims': 'Pediatrician Approved',
      'baby-warning': 'Adult Supervision Required',
      'baby-country-of-origin': 'Italy',
    },
    variants: [
      pv('1 Piece', 'BK-GR-CHC-NVY', 9800, 15, 'Navy Blue'),
      pv('1 Piece', 'BK-GR-CHC-GRY', 9800, 10, 'Soft Grey'),
    ],
  },

  // 9. Diapering / Wipes: Supermom Pure Water Baby Wipes with Aloe Vera
  {
    categoryPath: 'baby-kids/baby-diapering/baby-wipes-changing',
    productTypeSlug: 'baby-wipe',
    nameEn: 'Demo Supermom 99% Pure Water Extra-Soft Baby Wipes (Aloe Vera)',
    nameBn: 'ডেমো সুপারমম ৯৯% খাঁটি পানি ও অ্যালোভেরা বেবি ওয়াইপস',
    slug: 'demo-baby-supermom-water-wipes',
    sku: 'BK-DP-SPM-01',
    brand: 'Supermom',
    manufacturer: 'Square Toiletries Ltd.',
    shortDescriptionEn:
      'Thick, ultra-soft non-woven wipes made with 99% pure EDI purified water, enriched with organic aloe vera and Vitamin E. Alcohol & paraben free.',
    shortDescriptionBn:
      '৯৯% বিশুদ্ধ পানি ও অ্যালোভেরা সমৃদ্ধ নন-অ্যালকোহলিক কোমল বেবি ওয়াইপস।',
    price: 160,
    stock: 350,
    unit: 'pack',
    specs: {
      'baby-safety-claims': 'Alcohol Free',
      'baby-warning': 'External Use Only',
      'baby-country-of-origin': 'Bangladesh',
    },
    batches: [
      {
        batchNumber: 'SPM-WP-2026C',
        manufacturingDate: '2026-03-01',
        expiryDate: '2028-03-01',
        quantity: 350,
      },
    ],
    variants: [
      pv('80 Wipes Pack', 'BK-DP-SPM-80W', 160, 230),
      pv('Pack of 3', 'BK-DP-SPM-3PK', 440, 120),
    ],
  },

  // 10. Kids Footwear: Kids Breathable Soft-Sole First Walkers Sneakers
  {
    categoryPath: 'baby-kids/baby-footwear/kids-sneakers-sandals',
    productTypeSlug: 'kids-sneaker',
    nameEn: 'Demo Kids Active Mesh Breathable Anti-Slip First Walkers Sneakers',
    nameBn: 'ডেমো বাচ্চাদের অ্যান্টি-স্লিপ হালকা ও আরামদায়ক কেডস',
    slug: 'demo-baby-kids-active-mesh-sneaker',
    sku: 'BK-FW-KDS-01',
    brand: 'RFL Play',
    manufacturer: 'PRAN-RFL Group',
    shortDescriptionEn:
      'Ultra-flexible anti-slip rubber honeycomb sole with breathable flying-knit upper. Provides natural toe spread and stability for growing feet.',
    shortDescriptionBn:
      'হালকা ও অ্যান্টি-স্লিপ সোলের আরামদায়ক বাচ্চাদের রানিং ও স্পোর্টস কেডস।',
    price: 750,
    compareAtPrice: 850,
    stock: 90,
    unit: 'pair',
    isFeatured: true,
    specs: {
      'baby-material': 'Breathable Mesh',
      'baby-safety-claims': 'Non-Toxic',
      'baby-gender': 'Unisex',
      'baby-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('EU 20', 'Navy Blue', 'BK-FW-KDS-20NVY', 750, 20),
      sv('EU 20', 'Pastel Pink', 'BK-FW-KDS-20PNK', 750, 20),
      sv('EU 21', 'Navy Blue', 'BK-FW-KDS-21NVY', 780, 25),
      sv('EU 22', 'Pastel Pink', 'BK-FW-KDS-22PNK', 800, 25),
    ],
  },
];

export const BABY_KIDS_VERTICAL: SeedVertical = {
  key: 'baby-kids',
  root: BABY_KIDS_TAXONOMY,
  attributes: BABY_KIDS_ATTRIBUTES,
  brands: BABY_KIDS_BRANDS,
  manufacturers: BABY_KIDS_MANUFACTURERS,
  products: BABY_KIDS_PRODUCTS,
};
