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
  SeedProductBatch,
} from './catalog-vertical.types.js';

const opt = (...values: string[]): SeedAttributeOption[] => values.map((value) => ({ value }));
const pt = (
  slug: string,
  attributes: string[],
  nameEn?: string,
  nameBn?: string,
): SeedProductType => ({ slug, attributes, nameEn, nameBn });

/** Weight or Pack Size variant helper for pet food, treats, litter */
const wv = (
  weightDesc: string,
  sku: string,
  price: number,
  stock: number,
  batches?: SeedProductBatch[],
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: weightDesc,
  nameBn: weightDesc,
  sku,
  price,
  stock,
  batches,
  attributes: {
    'pet-pack-size': weightDesc,
    ...(extraAttr ?? {}),
  },
});

/** Flavor or Formula variant helper for food and treats */
const fv = (
  flavorDesc: string,
  sku: string,
  price: number,
  stock: number,
  batches?: SeedProductBatch[],
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: flavorDesc,
  nameBn: flavorDesc,
  sku,
  price,
  stock,
  batches,
  attributes: {
    'pet-flavor': flavorDesc,
    ...(extraAttr ?? {}),
  },
});

/** Size variant helper for collars, harnesses, beds, cages, carriers */
const sv = (
  sizeDesc: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: sizeDesc,
  nameBn: sizeDesc,
  sku,
  price,
  stock,
  attributes: {
    'pet-size': sizeDesc,
    ...(extraAttr ?? {}),
  },
});

/** Color variant helper */
const cv = (
  colorDesc: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: colorDesc,
  nameBn: colorDesc,
  sku,
  price,
  stock,
  attributes: {
    color: colorDesc,
    ...(extraAttr ?? {}),
  },
});

/**
 * Universal dynamic attributes for Pet Supplies.
 *
 * Pet Type, Food Type, Life Stage, Breed Size, Flavor, Protein %, Ingredients,
 * Litter Type, Clumping, Scent, Material, Neck/Chest Size, Leash Length, Tank Capacity,
 * Filter Flow Rate, Power, and Warranty are structured attributes — never separate database entities.
 */
export const PET_ATTRIBUTES: SeedAttribute[] = [
  // 1. Target Animal & Pet Type
  {
    slug: 'pet-type',
    nameEn: 'Pet Type',
    nameBn: 'পোষা প্রাণীর ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Dog',
      'Cat',
      'Bird',
      'Fish',
      'Rabbit',
      'Hamster',
      'Guinea Pig',
      'Small Animal',
      'All Pets',
    ),
  },

  // 2. Pet Food & Nutrition
  {
    slug: 'pet-food-type',
    nameEn: 'Food Type',
    nameBn: 'খাবারের ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Dry Food (Kibble)',
      'Wet Food (Gravy)',
      'Canned Loaf',
      'Crunchy Treats',
      'Dental Chews',
      'Seed Mix',
      'Flakes',
      'Pellets',
      'Hay & Grass',
    ),
  },
  {
    slug: 'pet-life-stage',
    nameEn: 'Life Stage',
    nameBn: 'জীবন পর্যায় / বয়স',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Puppy', 'Kitten', 'Adult', 'Senior', 'All Life Stages'),
  },
  {
    slug: 'pet-breed-size',
    nameEn: 'Breed Size',
    nameBn: 'জাতের আকার',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Small Breed (<10kg)',
      'Medium Breed (10–25kg)',
      'Large Breed (>25kg)',
      'All Breed Sizes',
    ),
  },
  {
    slug: 'pet-flavor',
    nameEn: 'Flavor / Recipe',
    nameBn: 'ফ্লেভার বা স্বাদ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Chicken',
      'Ocean Fish & Tuna',
      'Salmon',
      'Beef',
      'Lamb',
      'Mackerel & Sardine',
      'Mixed Seeds & Fruits',
      'Vegetable & Spirulina',
    ),
  },
  {
    slug: 'pet-protein-percentage',
    nameEn: 'Crude Protein (%)',
    nameBn: 'প্রোটিন শতকরা হার (%)',
    dataType: AttributeDataType.NUMBER,
    unit: '%',
    isFilterable: true,
  },
  {
    slug: 'pet-main-ingredients',
    nameEn: 'Key Ingredients',
    nameBn: 'প্রধান উপাদান',
    dataType: AttributeDataType.TEXT,
  },
  {
    slug: 'pet-storage-instructions',
    nameEn: 'Storage Instructions',
    nameBn: 'সংরক্ষণ নির্দেশিকা',
    dataType: AttributeDataType.TEXT,
  },
  {
    slug: 'pet-feeding-instructions',
    nameEn: 'Feeding Instructions',
    nameBn: 'খাওয়ানোর নিয়মাবলী',
    dataType: AttributeDataType.TEXT,
  },

  // 3. Cat Litter & Hygiene
  {
    slug: 'pet-litter-type',
    nameEn: 'Litter Material Type',
    nameBn: 'লিটারের ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Bentonite Clay',
      'Silica Gel Crystals',
      'Pine Wood Pellets',
      'Tofu Biodegradable',
      'Activated Carbon Infused',
    ),
  },
  {
    slug: 'pet-litter-clumping',
    nameEn: 'Clumping Formula',
    nameBn: 'ক্ল্যাম্পিং বৈশিষ্ট্য',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'pet-scent',
    nameEn: 'Scent / Odor Fragrance',
    nameBn: 'সুগন্ধি বা গন্ধ নিয়ন্ত্রণ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Unscented (Odor Lock)',
      'Fresh Lavender',
      'Baby Powder',
      'Lemon Fresh',
      'Coffee Aroma',
      'Apple Blossom',
    ),
  },

  // 4. Pet Gear, Accessories & Apparel
  {
    slug: 'pet-material',
    nameEn: 'Material',
    nameBn: 'উপাদান',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Stainless Steel',
      'Food-Grade PP Plastic',
      'Heavy-Duty Nylon',
      'Breathable Mesh',
      'Natural Solid Wood',
      'Ceramic',
      'Cotton Plush & PP Fiber',
      'Wrought Iron Metal',
      'Tempered Glass',
    ),
  },
  {
    slug: 'pet-size',
    nameEn: 'Size',
    nameBn: 'সাইজ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'),
  },
  {
    slug: 'pet-neck-size-cm',
    nameEn: 'Neck Girth (cm)',
    nameBn: 'গলার মাপ (সেমি)',
    dataType: AttributeDataType.NUMBER,
    unit: 'cm',
    isFilterable: true,
  },
  {
    slug: 'pet-chest-size-cm',
    nameEn: 'Chest Girth (cm)',
    nameBn: 'বুকের মাপ (সেমি)',
    dataType: AttributeDataType.NUMBER,
    unit: 'cm',
    isFilterable: true,
  },
  {
    slug: 'pet-leash-length-meters',
    nameEn: 'Leash Length (Meters)',
    nameBn: 'রশির দৈর্ঘ্য (মিটার)',
    dataType: AttributeDataType.NUMBER,
    unit: 'm',
    isFilterable: true,
  },
  {
    slug: 'pet-carrier-max-weight-kg',
    nameEn: 'Max Weight Capacity (kg)',
    nameBn: 'সর্বোচ্চ ওজন ধারণ ক্ষমতা (কেজি)',
    dataType: AttributeDataType.NUMBER,
    unit: 'kg',
    isFilterable: true,
  },

  // 5. Fish & Aquarium Hardware
  {
    slug: 'pet-tank-capacity-liters',
    nameEn: 'Tank Capacity (Liters)',
    nameBn: 'ট্যাংকের ধারণক্ষমতা (লিটার)',
    dataType: AttributeDataType.NUMBER,
    unit: 'L',
    isFilterable: true,
  },
  {
    slug: 'pet-filter-flow-rate-lph',
    nameEn: 'Filter Flow Rate (L/h)',
    nameBn: 'ফিল্টার ফ্লো রেট (লিটার/ঘণ্টা)',
    dataType: AttributeDataType.NUMBER,
    unit: 'L/h',
    isFilterable: true,
  },
  {
    slug: 'pet-power-watt',
    nameEn: 'Power Consumption (Watts)',
    nameBn: 'বিদ্যুৎ খরচ (ওয়াট)',
    dataType: AttributeDataType.NUMBER,
    unit: 'W',
    isFilterable: true,
  },
  {
    slug: 'pet-voltage',
    nameEn: 'Operating Voltage',
    nameBn: 'ভোল্টেজ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('220–240V AC 50Hz', '110–120V AC', 'USB 5V Powered'),
  },

  // 6. Care, Washable, Pack & Warranty
  {
    slug: 'pet-washable',
    nameEn: 'Machine Washable',
    nameBn: 'মেশিনে ধোয়া যায়',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'pet-pack-size',
    nameEn: 'Pack Size / Net Weight',
    nameBn: 'প্যাক সাইজ বা ওজন',
    dataType: AttributeDataType.TEXT,
  },
  {
    slug: 'pet-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎপাদনকারী দেশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Bangladesh', 'Thailand', 'USA', 'France', 'Germany', 'Japan', 'China', 'India'),
  },
  {
    slug: 'pet-warranty',
    nameEn: 'Warranty Period',
    nameBn: 'ওয়ারেন্টি',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'No Warranty',
      '7 Days Replacement Warranty',
      '1 Month Motor & Pump Warranty',
      '6 Months Electrical Warranty',
      '1 Year Service Warranty',
    ),
  },
];

// Product Types definitions mapped to attribute slugs
const DRY_FOOD_PT = pt(
  'pet-food-dry',
  [
    'pet-type',
    'pet-food-type',
    'pet-life-stage',
    'pet-breed-size',
    'pet-flavor',
    'pet-protein-percentage',
    'pet-main-ingredients',
    'pet-storage-instructions',
    'pet-feeding-instructions',
    'pet-pack-size',
    'pet-country-of-origin',
  ],
  'Dry Pet Food (Kibble)',
  'শুকনো পোষা প্রাণীর খাবার',
);

const WET_FOOD_PT = pt(
  'pet-food-wet',
  [
    'pet-type',
    'pet-food-type',
    'pet-life-stage',
    'pet-flavor',
    'pet-protein-percentage',
    'pet-main-ingredients',
    'pet-storage-instructions',
    'pet-feeding-instructions',
    'pet-pack-size',
    'pet-country-of-origin',
  ],
  'Wet Pet Food & Gravy Pouches',
  'ভেজা খাবার ও গ্রেভি পাউচ',
);

const PET_TREAT_PT = pt(
  'pet-treat',
  [
    'pet-type',
    'pet-food-type',
    'pet-flavor',
    'pet-main-ingredients',
    'pet-pack-size',
    'pet-country-of-origin',
  ],
  'Pet Treats & Chews',
  'ট্রিটস ও চিউস',
);

const CAT_LITTER_PT = pt(
  'cat-litter',
  ['pet-type', 'pet-litter-type', 'pet-litter-clumping', 'pet-scent', 'pet-pack-size', 'pet-country-of-origin'],
  'Cat Litter & Sand',
  'ক্যাট লিটার বালি',
);

const PET_COLLAR_PT = pt(
  'pet-collar',
  ['pet-type', 'pet-size', 'pet-neck-size-cm', 'pet-material', 'pet-washable'],
  'Pet Collar',
  'পেট কলার',
);

const PET_LEASH_PT = pt(
  'pet-leash',
  ['pet-type', 'pet-leash-length-meters', 'pet-material', 'pet-carrier-max-weight-kg'],
  'Pet Leash & Belt',
  'পেট রশি ও বেল্ট',
);

const PET_HARNESS_PT = pt(
  'pet-harness',
  ['pet-type', 'pet-size', 'pet-chest-size-cm', 'pet-neck-size-cm', 'pet-material'],
  'Pet Harness',
  'বডি হারনেস',
);

const PET_CARRIER_PT = pt(
  'pet-carrier',
  ['pet-type', 'pet-size', 'pet-carrier-max-weight-kg', 'pet-material', 'pet-warranty'],
  'Pet Travel Carrier & Backpack',
  'পেট ট্রাভেল ক্যারিয়ার',
);

const PET_BED_PT = pt(
  'pet-bed',
  ['pet-type', 'pet-size', 'pet-material', 'pet-washable'],
  'Pet Bed & Mat Cushion',
  'পেট বেড ও কুশন',
);

const PET_BOWL_PT = pt(
  'pet-bowl',
  ['pet-type', 'pet-size', 'pet-material'],
  'Pet Feeding Bowl & Feeder',
  'খাবারের বাটি ও ফিডার',
);

const PET_SHAMPOO_PT = pt(
  'pet-grooming-shampoo',
  ['pet-type', 'pet-pack-size', 'pet-country-of-origin'],
  'Pet Shampoo & Wash',
  'পেট শ্যাম্পু ও ওয়াশ',
);

const PET_BRUSH_PT = pt(
  'pet-brush',
  ['pet-type', 'pet-material'],
  'Pet Brush & De-Shedder',
  'পেট ব্রাশ ও চিরুনি',
);

const PET_TOY_PT = pt(
  'pet-toy',
  ['pet-type', 'pet-material'],
  'Pet Toy & Teaser',
  'পেট খেলনা ও টিজার',
);

const BIRD_FOOD_PT = pt(
  'bird-food',
  ['pet-type', 'pet-flavor', 'pet-main-ingredients', 'pet-pack-size', 'pet-country-of-origin'],
  'Bird Grain & Seed Mix',
  'পাখির দানাদার খাবার ও বীজ',
);

const BIRD_CAGE_PT = pt(
  'bird-cage',
  ['pet-type', 'pet-material', 'pet-size'],
  'Bird Cage & Stand',
  'পাখির খাঁচা ও স্ট্যান্ড',
);

const FISH_FOOD_PT = pt(
  'fish-food',
  ['pet-type', 'pet-food-type', 'pet-protein-percentage', 'pet-pack-size', 'pet-country-of-origin'],
  'Fish Food Flakes & Pellets',
  'মাছের খাবার ও প্যালেট',
);

const AQUARIUM_FILTER_PT = pt(
  'aquarium-filter',
  ['pet-tank-capacity-liters', 'pet-filter-flow-rate-lph', 'pet-power-watt', 'pet-voltage', 'pet-warranty'],
  'Aquarium Power Filter',
  'অ্যাকোয়ারিয়াম ফিল্টার',
);

const AQUARIUM_HEATER_PT = pt(
  'aquarium-heater',
  ['pet-tank-capacity-liters', 'pet-power-watt', 'pet-voltage', 'pet-warranty'],
  'Aquarium Submersible Heater',
  'অ্যাকোয়ারিয়াম হিটার',
);

const SMALL_ANIMAL_FOOD_PT = pt(
  'small-animal-food',
  ['pet-type', 'pet-main-ingredients', 'pet-pack-size', 'pet-country-of-origin'],
  'Small Animal Food & Hay',
  'খরগোশ ও ক্ষুদ্র প্রাণীর খাবার',
);

/**
 * 9 primary category branches with full L3 hierarchy.
 */
export const PET_TAXONOMY: SeedTaxonomyNode = {
  slug: 'pet-supplies',
  nameEn: 'Pet Supplies',
  nameBn: 'পোষা প্রাণীর সামগ্রী',
  icon: '🐾',
  descriptionEn:
    'Comprehensive range of verified dog food, cat nutrition, litter sand, bird seeds, aquarium tanks and filters, small animal care, grooming, and pet travel accessories.',
  descriptionBn:
    'কুকুর ও বিড়ালের পুষ্টিকর খাবার, ক্যাট লিটার বালি, পাখির দানা, অ্যাকোয়ারিয়াম ফিল্টার, হিটার, খাঁচা, কলার ও পেট কেয়ারের সব প্রয়োজনীয় পণ্য।',
  children: [
    // 1. Dog Supplies
    {
      slug: 'dog-supplies',
      nameEn: 'Dog Supplies',
      nameBn: 'কুকুরের সামগ্রী',
      icon: '🐕',
      children: [
        { slug: 'dog-food', nameEn: 'Dog Dry & Wet Food', nameBn: 'কুকুরের শুকনো ও ভেজা খাবার', productTypes: [DRY_FOOD_PT, WET_FOOD_PT] },
        { slug: 'dog-treats', nameEn: 'Dog Treats & Chews', nameBn: 'কুকুরের ট্রিটস ও চিউস', productTypes: [PET_TREAT_PT] },
        { slug: 'dog-collars-leashes', nameEn: 'Collars, Leashes & Harnesses', nameBn: 'কলার, রশি ও হারনেস', productTypes: [PET_COLLAR_PT, PET_LEASH_PT, PET_HARNESS_PT] },
        { slug: 'dog-beds-accessories', nameEn: 'Beds, Bowls & Accessories', nameBn: 'বিছানা, বাটি ও এক্সেসরিজ', productTypes: [PET_BED_PT, PET_BOWL_PT] },
      ],
    },

    // 2. Cat Supplies
    {
      slug: 'cat-supplies',
      nameEn: 'Cat Supplies',
      nameBn: 'বিড়ালের সামগ্রী',
      icon: '🐈',
      children: [
        { slug: 'cat-food', nameEn: 'Cat Dry & Wet Food', nameBn: 'বিড়ালের খাবার ও গ্রেভি পাউচ', productTypes: [DRY_FOOD_PT, WET_FOOD_PT] },
        { slug: 'cat-treats', nameEn: 'Cat Treats & Puree', nameBn: 'ক্যাট ট্রিটস ও পিউরি', productTypes: [PET_TREAT_PT] },
        { slug: 'cat-litter', nameEn: 'Cat Litter Sand & Accessories', nameBn: 'ক্যাট লিটার বালি ও ট্রে', productTypes: [CAT_LITTER_PT] },
        { slug: 'cat-toys-collars', nameEn: 'Cat Toys, Collars & Scratchers', nameBn: 'খেলনা, কলার ও স্ক্র্যাচার', productTypes: [PET_TOY_PT, PET_COLLAR_PT] },
      ],
    },

    // 3. Bird Supplies
    {
      slug: 'bird-supplies',
      nameEn: 'Bird Supplies',
      nameBn: 'পাখির সামগ্রী',
      icon: '🦜',
      children: [
        { slug: 'bird-food', nameEn: 'Bird Food & Seed Mixes', nameBn: 'পাখির দানাদার বীজ ও খাবার', productTypes: [BIRD_FOOD_PT] },
        { slug: 'bird-cages', nameEn: 'Bird Cages, Perches & Feeders', nameBn: 'পাখির খাঁচা ও পার্চ', productTypes: [BIRD_CAGE_PT] },
      ],
    },

    // 4. Fish & Aquarium
    {
      slug: 'fish-aquarium',
      nameEn: 'Fish & Aquarium',
      nameBn: 'মাছ ও অ্যাকোয়ারিয়াম',
      icon: '🐠',
      children: [
        { slug: 'fish-food', nameEn: 'Fish Food Flakes & Pellets', nameBn: 'মাছের খাবার ও প্যালেট', productTypes: [FISH_FOOD_PT] },
        { slug: 'aquarium-filters', nameEn: 'Aquarium Filters & Water Pumps', nameBn: 'অ্যাকোয়ারিয়াম ফিল্টার ও পাম্প', productTypes: [AQUARIUM_FILTER_PT] },
        { slug: 'aquarium-heaters-lighting', nameEn: 'Aquarium Heaters & LED Lighting', nameBn: 'অ্যাকোয়ারিয়াম হিটার ও লাইট', productTypes: [AQUARIUM_HEATER_PT] },
      ],
    },

    // 5. Small Animal Supplies
    {
      slug: 'small-animal-supplies',
      nameEn: 'Small Animal Supplies',
      nameBn: 'ক্ষুদ্র প্রাণীর সামগ্রী',
      icon: '🐇',
      children: [
        { slug: 'rabbit-supplies', nameEn: 'Rabbit Food, Hay & Cages', nameBn: 'খরগোশের খাবার, খড় ও খাঁচা', productTypes: [SMALL_ANIMAL_FOOD_PT] },
        { slug: 'hamster-supplies', nameEn: 'Hamster Food, Bedding & Wheels', nameBn: 'হ্যামস্টার ফুড ও বেডিং', productTypes: [SMALL_ANIMAL_FOOD_PT] },
      ],
    },

    // 6. Pet Food
    {
      slug: 'pet-food',
      nameEn: 'Pet Food & Nutrition',
      nameBn: 'সকল পোষা প্রাণীর খাবার',
      icon: '🥩',
      children: [
        { slug: 'dry-food', nameEn: 'Dry Food (Kibble)', nameBn: 'শুকনো খাবার (কিবল)', productTypes: [DRY_FOOD_PT] },
        { slug: 'wet-food', nameEn: 'Wet Food & Gravy', nameBn: 'ভেজা খাবার ও পাউচ', productTypes: [WET_FOOD_PT] },
        { slug: 'treats-chews', nameEn: 'Treats, Biscuits & Chews', nameBn: 'ট্রিটস ও বিস্কুট', productTypes: [PET_TREAT_PT] },
      ],
    },

    // 7. Pet Grooming
    {
      slug: 'pet-grooming',
      nameEn: 'Pet Grooming & Hygiene',
      nameBn: 'পেট গ্রুমিং ও রূপচর্চা',
      icon: '✂️',
      children: [
        { slug: 'pet-shampoo-conditioner', nameEn: 'Pet Shampoo & Washes', nameBn: 'পেট শ্যাম্পু ও ওয়াশ', productTypes: [PET_SHAMPOO_PT] },
        { slug: 'brushes-nail-clippers', nameEn: 'Brushes, Combs & Nail Clippers', nameBn: 'ব্রাশ, চিরুনি ও নেইল ক্লিপার', productTypes: [PET_BRUSH_PT] },
      ],
    },

    // 8. Pet Accessories
    {
      slug: 'pet-accessories',
      nameEn: 'Pet Accessories & Travel',
      nameBn: 'পেট এক্সেসরিজ ও ট্রাভেল',
      icon: '🎒',
      children: [
        { slug: 'collars-leashes-harnesses', nameEn: 'Collars, Leashes & Harnesses', nameBn: 'কলার, রশি ও হারনেস', productTypes: [PET_COLLAR_PT, PET_LEASH_PT, PET_HARNESS_PT] },
        { slug: 'pet-carriers-travel', nameEn: 'Carriers, Backpacks & Travel', nameBn: 'পেট ক্যারিয়ার ও ব্যাকপ্যাক', productTypes: [PET_CARRIER_PT] },
        { slug: 'pet-beds-blankets', nameEn: 'Pet Beds & Cushions', nameBn: 'পেট বেড ও কুশন', productTypes: [PET_BED_PT] },
        { slug: 'bowls-automatic-feeders', nameEn: 'Bowls & Drinkers', nameBn: 'খাবারের বাটি ও ফিডার', productTypes: [PET_BOWL_PT] },
      ],
    },

    // 9. Pet Cleaning & Hygiene
    {
      slug: 'pet-cleaning-hygiene',
      nameEn: 'Cleaning & Waste Hygiene',
      nameBn: 'পরিচ্ছন্নতা ও বর্জ্য ব্যবস্থাপনা',
      icon: '🧹',
      children: [
        { slug: 'cat-litter-sand', nameEn: 'Clumping Litter Sand', nameBn: 'ক্ল্যাম্পিং লিটার বালি', productTypes: [CAT_LITTER_PT] },
      ],
    },
  ],
};

/**
 * Authentic international and Bangladeshi pet brands.
 */
export const PET_BRANDS: SeedBrand[] = [
  { name: 'Royal Canin', manufacturer: 'Royal Canin SAS' },
  { name: 'Pedigree', manufacturer: 'Mars Petcare Inc.' },
  { name: 'Whiskas', manufacturer: 'Mars Petcare Inc.' },
  { name: 'SmartHeart', manufacturer: 'Perfect Companion Group Co., Ltd.' },
  { name: 'Me-O', manufacturer: 'Perfect Companion Group Co., Ltd.' },
  { name: 'Drools', manufacturer: 'Drools Pet Food Pvt. Ltd.' },
  { name: 'Purina', manufacturer: 'Nestle Purina PetCare Co.' },
  { name: 'Tetra', manufacturer: 'Tetra GmbH' },
  { name: 'Sobo', manufacturer: 'Guangdong Sobo Aquarium Co., Ltd.' },
  { name: 'Sanicat', manufacturer: 'Tolsa S.A.' },
  { name: 'Paws & Tails BD', manufacturer: 'Paws & Tails Bangladesh Ltd.' },
  { name: 'Bengal Pets Nutrition', manufacturer: 'Bengal Pets Agro & Feeds Bangladesh' },
];

/**
 * Verified manufacturers for Pet Supplies.
 */
export const PET_MANUFACTURERS: SeedManufacturer[] = [
  {
    name: 'Royal Canin SAS',
    nameBn: 'রয়্যাল ক্যানিন এসএএস',
    country: 'France',
    website: 'https://www.royalcanin.com',
  },
  {
    name: 'Mars Petcare Inc.',
    nameBn: 'মার্স পেটকেয়ার ইনকর্পোরেটেড',
    country: 'USA',
    website: 'https://www.mars.com',
  },
  {
    name: 'Perfect Companion Group Co., Ltd.',
    nameBn: 'পারফেক্ট কম্প্যানিয়ন গ্রুপ কোং লিমিটেড',
    country: 'Thailand',
    website: 'https://www.perfectcompanion.com',
  },
  {
    name: 'Drools Pet Food Pvt. Ltd.',
    nameBn: 'ড্রুলস পেট ফুড প্রাঃ লিঃ',
    country: 'India',
    website: 'https://www.drools.com',
  },
  {
    name: 'Nestle Purina PetCare Co.',
    nameBn: 'নেস্লে পুরিনা পেটকেয়ার কোং',
    country: 'USA',
    website: 'https://www.purina.com',
  },
  {
    name: 'Tetra GmbH',
    nameBn: 'টেট্রা জিএমবিএইচ',
    country: 'Germany',
    website: 'https://www.tetra.net',
  },
  {
    name: 'Guangdong Sobo Aquarium Co., Ltd.',
    nameBn: 'গুয়াংডং সোবো অ্যাকোয়ারিয়াম কোং লিমিটেড',
    country: 'China',
    website: 'https://www.sobo.cn',
  },
  {
    name: 'Tolsa S.A.',
    nameBn: 'টোলসা এস.এ.',
    country: 'Spain',
    website: 'https://www.sanicat.com',
  },
  {
    name: 'Paws & Tails Bangladesh Ltd.',
    nameBn: 'পজ অ্যান্ড টেইলস বাংলাদেশ লিমিটেড',
    country: 'Bangladesh',
    website: 'https://www.pawsandtailsbd.com',
  },
  {
    name: 'Bengal Pets Agro & Feeds Bangladesh',
    nameBn: 'বেঙ্গল পেটস অ্যাগ্রো অ্যান্ড ফিডস বাংলাদেশ',
    country: 'Bangladesh',
    website: 'https://www.bengalpets.com.bd',
  },
];

/**
 * 22 realistic, rich seed demo products covering all key pet subcategories and product types.
 */
export const PET_PRODUCTS: SeedVerticalProduct[] = [
  // 1. Royal Canin Maxi Adult Dry Dog Food (Dog Food)
  {
    categoryPath: 'pet-supplies/dog-supplies/dog-food',
    productTypeSlug: 'pet-food-dry',
    nameEn: 'Demo Royal Canin Maxi Adult Dry Dog Food (26% Protein)',
    nameBn: 'ডেমো রয়্যাল ক্যানিন ম্যাক্সি অ্যাডাল্ট ড্রাই ডগ ফুড (২৬% প্রোটিন)',
    slug: 'demo-pet-royal-canin-maxi-adult-dog-food',
    sku: 'PT-RC-MAXI-01',
    brand: 'Royal Canin',
    manufacturer: 'Royal Canin SAS',
    shortDescriptionEn:
      'Tailored nutrition for large breed adult dogs (26–44 kg) featuring high digestibility, joint support with EPA-DHA, and optimal protein.',
    shortDescriptionBn:
      'বড় জাতের প্রাপ্তবয়স্ক কুকুরের (২৬-৪৪ কেজি) হাড় ও জয়েন্টের সুস্থতা নিশ্চিত করার জন্য উচ্চমানের রয়্যাল ক্যানিন ড্রাই ফুড।',
    price: 3650,
    compareAtPrice: 4100,
    stock: 35,
    unit: 'bag',
    isFeatured: true,
    specs: {
      'pet-type': 'Dog',
      'pet-food-type': 'Dry Food (Kibble)',
      'pet-life-stage': 'Adult',
      'pet-breed-size': 'Large Breed (>25kg)',
      'pet-flavor': 'Chicken',
      'pet-protein-percentage': 26,
      'pet-main-ingredients': 'Dehydrated poultry protein, maize, maize flour, animal fats, wheat, beet pulp, fish oil.',
      'pet-storage-instructions': 'Store in a cool dry place. Keep bag sealed after opening.',
      'pet-feeding-instructions': 'Feed 300g–450g daily based on weight and activity level.',
      'pet-country-of-origin': 'France',
    },
    variants: [
      wv('3kg Bag', 'PT-RC-MAXI-3KG', 3650, 25, [
        { batchNumber: 'RC-2026-09A', expiryDate: '2027-09-30', manufacturingDate: '2026-03-01', quantity: 25 },
      ]),
      wv('10kg Bag', 'PT-RC-MAXI-10KG', 10500, 10, [
        { batchNumber: 'RC-2026-09B', expiryDate: '2027-09-30', manufacturingDate: '2026-03-01', quantity: 10 },
      ]),
    ],
  },

  // 2. Pedigree Adult Dry Dog Food Chicken & Vegetables (Dog Food)
  {
    categoryPath: 'pet-supplies/dog-supplies/dog-food',
    productTypeSlug: 'pet-food-dry',
    nameEn: 'Demo Pedigree Adult Dry Dog Food (Chicken & Vegetables)',
    nameBn: 'ডেমো পেডিগ্রি অ্যাডাল্ট ড্রাই ডগ ফুড (চিকেন ও ভেজিটেবল)',
    slug: 'demo-pet-pedigree-chicken-vegetable-dog-food',
    sku: 'PT-PED-CHK-01',
    brand: 'Pedigree',
    manufacturer: 'Mars Petcare Inc.',
    shortDescriptionEn:
      'Complete and balanced dog food formulated with real chicken, vegetables, dietary fiber for digestion, and calcium for strong teeth.',
    shortDescriptionBn:
      'আসল চিকেন ও শাকসবজি দিয়ে তৈরি, রোগ প্রতিরোধ ক্ষমতা ও উজ্জ্বল লোম নিশ্চিত করতে পেডিগ্রি কমপ্লিট ডগ ফুড।',
    price: 1350,
    compareAtPrice: 1550,
    stock: 50,
    unit: 'bag',
    isFeatured: true,
    specs: {
      'pet-type': 'Dog',
      'pet-food-type': 'Dry Food (Kibble)',
      'pet-life-stage': 'Adult',
      'pet-breed-size': 'All Breed Sizes',
      'pet-flavor': 'Chicken',
      'pet-protein-percentage': 20,
      'pet-main-ingredients': 'Cereals and cereal by-products, chicken and chicken by-products, vegetables, vitamins, minerals.',
      'pet-storage-instructions': 'Store in an airtight container in a dry place.',
      'pet-feeding-instructions': 'Feed according to dog body weight: 100g to 300g per day.',
      'pet-country-of-origin': 'Thailand',
    },
    variants: [
      wv('1.2kg Bag', 'PT-PED-CHK-1.2KG', 1350, 30, [
        { batchNumber: 'PED-2026-08', expiryDate: '2027-08-31', manufacturingDate: '2026-02-15', quantity: 30 },
      ]),
      wv('3kg Bag', 'PT-PED-CHK-3KG', 3150, 20, [
        { batchNumber: 'PED-2026-08L', expiryDate: '2027-08-31', manufacturingDate: '2026-02-15', quantity: 20 },
      ]),
    ],
  },

  // 3. SmartHeart Chicken Jerky Dog Treats (Dog Treats)
  {
    categoryPath: 'pet-supplies/dog-supplies/dog-treats',
    productTypeSlug: 'pet-treat',
    nameEn: 'Demo SmartHeart Chicken Jerky Real Meat Dog Treats (100g Pouch)',
    nameBn: 'ডেমো স্মার্টহার্ট চিকেন জার্কি আসল মাংসের ডগ ট্রিটস (১০০ গ্রাম)',
    slug: 'demo-pet-smartheart-dog-treat-chicken-chew',
    sku: 'PT-SH-TREAT-01',
    brand: 'SmartHeart',
    manufacturer: 'Perfect Companion Group Co., Ltd.',
    shortDescriptionEn:
      'Delicious chewy strips made from real chicken meat, perfect for obedience training, rewarding good behavior, and dental exercise.',
    shortDescriptionBn:
      '১০০% খাঁটি চিকেন মিট দিয়ে তৈরি মুখরোচক ডগ ট্রিটস, যা ট্রেনিং ও পোষা কুকুরের পছন্দের পুরষ্কার হিসেবে আদর্শ।',
    price: 320,
    compareAtPrice: 380,
    stock: 65,
    unit: 'pouch',
    isFeatured: false,
    specs: {
      'pet-type': 'Dog',
      'pet-food-type': 'Crunchy Treats',
      'pet-flavor': 'Chicken',
      'pet-main-ingredients': 'Chicken meat, vegetable protein, glycerin, natural flavor, potassium sorbate.',
      'pet-pack-size': '100g Pouch',
      'pet-country-of-origin': 'Thailand',
    },
    variants: [
      fv('Grilled Chicken Flavor (100g)', 'PT-SH-TRT-CHK', 320, 40),
      fv('Smoked Beef Flavor (100g)', 'PT-SH-TRT-BEEF', 320, 25),
    ],
  },

  // 4. Whiskas Ocean Fish Adult Dry Cat Food (Cat Food)
  {
    categoryPath: 'pet-supplies/cat-supplies/cat-food',
    productTypeSlug: 'pet-food-dry',
    nameEn: 'Demo Whiskas Adult Ocean Fish Complete Dry Cat Food (1.2kg)',
    nameBn: 'ডেমো হুইস্কাস অ্যাডাল্ট ওশান ফিশ কমপ্লিট ড্রাই ক্যাট ফুড (১.২ কেজি)',
    slug: 'demo-pet-whiskas-ocean-fish-dry-cat-food',
    sku: 'PT-WHIS-OCN-01',
    brand: 'Whiskas',
    manufacturer: 'Mars Petcare Inc.',
    shortDescriptionEn:
      'Crunchy kibbles with delicious soft centers packed with real ocean fish, taurine for healthy vision, and zinc and omega-6 for shiny fur.',
    shortDescriptionBn:
      'আসল সামুদ্রিক মাছের স্বাদ এবং দৃষ্টিশক্তি ও লোমের সুস্থতার জন্য টারিন ও ওমেগা-৬ সমৃদ্ধ হুইস্কাস বিড়ালের শুকনো খাবার।',
    price: 1150,
    compareAtPrice: 1350,
    stock: 55,
    unit: 'bag',
    isFeatured: true,
    specs: {
      'pet-type': 'Cat',
      'pet-food-type': 'Dry Food (Kibble)',
      'pet-life-stage': 'Adult',
      'pet-flavor': 'Ocean Fish & Tuna',
      'pet-protein-percentage': 30,
      'pet-main-ingredients': 'Wholegrain cereals, poultry by-product meal, ocean fish, fish oil, taurine, vitamins and minerals.',
      'pet-storage-instructions': 'Store sealed in a dry cool area.',
      'pet-feeding-instructions': 'Feed 45g to 70g daily according to cat body weight.',
      'pet-country-of-origin': 'Thailand',
    },
    variants: [
      wv('1.2kg Bag', 'PT-WHIS-OCN-1.2KG', 1150, 35, [
        { batchNumber: 'WHIS-2026-07', expiryDate: '2027-07-31', manufacturingDate: '2026-01-20', quantity: 35 },
      ]),
      wv('3kg Bag', 'PT-WHIS-OCN-3KG', 2650, 20, [
        { batchNumber: 'WHIS-2026-07L', expiryDate: '2027-07-31', manufacturingDate: '2026-01-20', quantity: 20 },
      ]),
    ],
  },

  // 5. Me-O Creamy Cat Treats Salmon & Bonito Puree (Cat Treats)
  {
    categoryPath: 'pet-supplies/cat-supplies/cat-treats',
    productTypeSlug: 'pet-treat',
    nameEn: 'Demo Me-O Creamy Lickable Cat Treat Puree (Salmon & Bonito 4x15g)',
    nameBn: 'ডেমো মি-ও ক্রিমি লিকাবল ক্যাট ট্রিট পিউরি (স্যামন ও বোনিটো ৪x১৫ গ্রাম)',
    slug: 'demo-pet-meo-creamy-treat-cat-puree',
    sku: 'PT-MEO-CRM-01',
    brand: 'Me-O',
    manufacturer: 'Perfect Companion Group Co., Ltd.',
    shortDescriptionEn:
      'Irresistible creamy puree packed in 4 individual squeeze tubes enriched with prebiotics, taurine, omega-6, and zinc.',
    shortDescriptionBn:
      'বিড়ালের মন ভোলানো ক্রিমি লিকাবল পিউরি ট্রিট, হজমশক্তি ও চোখের সুরক্ষায় প্রিবায়োটিক ও টারিন সমৃদ্ধ।',
    price: 240,
    compareAtPrice: 280,
    stock: 80,
    unit: 'pack',
    isFeatured: true,
    specs: {
      'pet-type': 'Cat',
      'pet-food-type': 'Wet Food (Gravy)',
      'pet-flavor': 'Salmon',
      'pet-main-ingredients': 'Salmon meat, bonito meat, chicken meat, flavoring agent, modified starch, taurine, green tea extract.',
      'pet-pack-size': 'Pack of 4 (60g total)',
      'pet-country-of-origin': 'Thailand',
    },
    variants: [
      fv('Salmon Flavor (4x15g)', 'PT-MEO-CRM-SLM', 240, 45),
      fv('Bonito & Crab Flavor (4x15g)', 'PT-MEO-CRM-BNT', 240, 35),
    ],
  },

  // 6. Royal Canin Kitten Thin Slices in Jelly Wet Food (Cat Wet Food)
  {
    categoryPath: 'pet-supplies/cat-supplies/cat-food',
    productTypeSlug: 'pet-food-wet',
    nameEn: 'Demo Royal Canin Kitten Wet Food (Thin Slices in Jelly 85g Pouch)',
    nameBn: 'ডেমো রয়্যাল ক্যানিন কিটেন ওয়েট ফুড (থিন স্লাইসেস ইন জেলি ৮৫ গ্রাম)',
    slug: 'demo-pet-royal-canin-kitten-jelly-pouch',
    sku: 'PT-RC-KITWET-01',
    brand: 'Royal Canin',
    manufacturer: 'Royal Canin SAS',
    shortDescriptionEn:
      'Nutritionally balanced wet food designed for kittens up to 12 months with tender small slices in savory jelly to support natural immunity.',
    shortDescriptionBn:
      '১ থেকে ১২ মাস বয়সী বিড়ালের বাচ্চার ইমিউনিটি ও সুস্থ বৃদ্ধির জন্য সহজপাচ্য সুস্বাদু জেলিযুক্ত রয়্যাল ক্যানিন ওয়েট ফুড।',
    price: 185,
    compareAtPrice: 220,
    stock: 100,
    unit: 'pouch',
    isFeatured: false,
    specs: {
      'pet-type': 'Cat',
      'pet-food-type': 'Wet Food (Gravy)',
      'pet-life-stage': 'Kitten',
      'pet-flavor': 'Chicken',
      'pet-protein-percentage': 12,
      'pet-main-ingredients': 'Meat and animal derivatives, vegetable protein extracts, derivatives of vegetable origin, minerals, oils and fats.',
      'pet-pack-size': '85g Pouch',
      'pet-country-of-origin': 'France',
    },
    variants: [
      wv('Single Pouch (85g)', 'PT-RC-KIT-1PCH', 185, 60, [
        { batchNumber: 'RC-KW-2026', expiryDate: '2027-10-31', manufacturingDate: '2026-02-01', quantity: 60 },
      ]),
      wv('Box of 12 Pouches', 'PT-RC-KIT-12BX', 2150, 40, [
        { batchNumber: 'RC-KW-2026B', expiryDate: '2027-10-31', manufacturingDate: '2026-02-01', quantity: 40 },
      ]),
    ],
  },

  // 7. Paws & Tails Bentonite Clumping Cat Litter (Cat Litter)
  {
    categoryPath: 'pet-supplies/cat-supplies/cat-litter',
    productTypeSlug: 'cat-litter',
    nameEn: 'Demo Paws & Tails Ultra Odor Lock Clumping Bentonite Cat Litter (10L)',
    nameBn: 'ডেমো পজ অ্যান্ড টেইলস আল্ট্রা ওডর লক ক্ল্যাম্পিং বেন্টোনাইট ক্যাট লিটার (১০ লিটার)',
    slug: 'demo-pet-bentonite-clumping-cat-litter',
    sku: 'PT-LIT-BENT-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      '99.5% dust-free high-grade natural sodium bentonite litter with instant hard clumping action and long-lasting active odor neutralization.',
    shortDescriptionBn:
      'দ্রুত শক্ত দলা পাকায় এবং দুর্গন্ধ সম্পূর্ণ দূর করে, বিড়ালের জন্য শতভাগ নিরাপদ ও ধুলামুক্ত প্রিমিয়াম ক্যাট লিটার বালি।',
    price: 650,
    compareAtPrice: 780,
    stock: 70,
    unit: 'bag',
    isFeatured: true,
    specs: {
      'pet-type': 'Cat',
      'pet-litter-type': 'Bentonite Clay',
      'pet-litter-clumping': true,
      'pet-scent': 'Fresh Lavender',
      'pet-pack-size': '10L Bag (~8kg)',
      'pet-country-of-origin': 'Bangladesh',
    },
    variants: [
      cv('Fresh Lavender Scent (10L)', 'PT-LIT-BENT-LAV', 650, 40),
      cv('Baby Powder Scent (10L)', 'PT-LIT-BENT-BBY', 650, 20),
      cv('Unscented Activated Carbon (10L)', 'PT-LIT-BENT-CARB', 680, 10),
    ],
  },

  // 8. Paws & Tails Reflective Breathable No-Pull Dog Harness (Dog Harness)
  {
    categoryPath: 'pet-supplies/dog-supplies/dog-collars-leashes',
    productTypeSlug: 'pet-harness',
    nameEn: 'Demo Paws & Tails Reflective Breathable No-Pull Ergonomic Dog Harness',
    nameBn: 'ডেমো পজ অ্যান্ড টেইলস রিফ্লেক্টিভ ব্রিদেবল নো-পুল ডগ হারনেস',
    slug: 'demo-pet-heavy-duty-padded-dog-harness',
    sku: 'PT-HARN-NOPULL-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Padded chest vest with dual leash attachment clips, sturdy top control handle, breathable air mesh, and 3M night reflective safety stitching.',
    shortDescriptionBn:
      'কুকুরকে টানাহেঁচড়া করা থেকে বিরত রাখে, নরম প্যাডেড মেটারিয়াল ও রাতে আলো প্রতিফলিতকারী সেফটি স্ট্রিপ সহ বডি হারনেস।',
    price: 1250,
    compareAtPrice: 1500,
    stock: 40,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'pet-type': 'Dog',
      'pet-size': 'M',
      'pet-chest-size-cm': 58,
      'pet-neck-size-cm': 42,
      'pet-material': 'Heavy-Duty Nylon',
      'pet-washable': true,
      'pet-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('Medium (Chest 50–68cm)', 'PT-HARN-M', 1250, 20),
      sv('Large (Chest 65–85cm)', 'PT-HARN-L', 1450, 15),
      sv('Extra Large (Chest 80–105cm)', 'PT-HARN-XL', 1650, 5),
    ],
  },

  // 9. Premium 1.5m Heavy-Duty Shock Absorbing Nylon Dog Leash (Dog Leash)
  {
    categoryPath: 'pet-supplies/dog-supplies/dog-collars-leashes',
    productTypeSlug: 'pet-leash',
    nameEn: 'Demo Heavy-Duty Shock Absorbing 1.5m Nylon Dog Leash with Padded Handle',
    nameBn: 'ডেমো হেভি-ডিউটি শক অ্যাবসর্বিং ১.৫ মিটার নাইলন ডগ রশি (প্যাডেড হ্যান্ডেল)',
    slug: 'demo-pet-nylon-reflective-dog-leash',
    sku: 'PT-LEASH-NYL-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Durable rock climbing rope leash with soft foam padded grip, rust-proof 360-degree swivel carabiner hook, and shock buffer.',
    shortDescriptionBn:
      'হাতে আরামদায়ক ফোম হ্যান্ডেল ও মরিচারোধী সুইভেল হুক যুক্ত ১.৫ মিটার দীর্ঘ শক্তপোক্ত নাইলন ডগ রশি।',
    price: 550,
    compareAtPrice: 650,
    stock: 50,
    unit: 'piece',
    isFeatured: false,
    specs: {
      'pet-type': 'Dog',
      'pet-leash-length-meters': 1.5,
      'pet-material': 'Heavy-Duty Nylon',
      'pet-carrier-max-weight-kg': 50,
    },
    variants: [
      cv('Jet Black', 'PT-LEASH-BLK', 550, 25),
      cv('Neon Red', 'PT-LEASH-RED', 550, 15),
      cv('Royal Blue', 'PT-LEASH-BLU', 550, 10),
    ],
  },

  // 10. Quick-Release Breakaway Cat Collar with Bell (Cat Collar)
  {
    categoryPath: 'pet-supplies/cat-supplies/cat-toys-collars',
    productTypeSlug: 'pet-collar',
    nameEn: 'Demo Quick-Release Breakaway Safety Cat Collar with Jingle Bell',
    nameBn: 'ডেমো কুইক-রিলিজ ব্রেকঅ্যাওয়ে সেফটি ক্যাট কলার (ঘণ্টি সহ)',
    slug: 'demo-pet-breakaway-bell-cat-collar',
    sku: 'PT-CAT-COL-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Safe breakaway buckle that automatically releases if caught on obstacles, equipped with a removable cute jingle bell.',
    shortDescriptionBn:
      'বিড়াল কোথাও আটকে গেলে স্বয়ংক্রিয়ভাবে খুলে যাওয়া সেফটি বাকল ও মিষ্টি আওয়াজের ঘণ্টা সহ সুন্দর ক্যাট কলার।',
    price: 220,
    compareAtPrice: 280,
    stock: 60,
    unit: 'piece',
    isFeatured: false,
    specs: {
      'pet-type': 'Cat',
      'pet-size': 'Free Size',
      'pet-neck-size-cm': 24,
      'pet-material': 'Heavy-Duty Nylon',
      'pet-washable': true,
    },
    variants: [
      cv('Velvet Pink with Bell', 'PT-CAT-COL-PNK', 220, 25),
      cv('Sky Blue with Bell', 'PT-CAT-COL-BLU', 220, 20),
      cv('Golden Yellow with Bell', 'PT-CAT-COL-YLW', 220, 15),
    ],
  },

  // 11. Ultra Soft Plush Orthopedic Doughnut Calming Pet Bed (Pet Bed)
  {
    categoryPath: 'pet-supplies/pet-accessories/pet-beds-blankets',
    productTypeSlug: 'pet-bed',
    nameEn: 'Demo Ultra Soft Shag Plush Orthopedic Doughnut Calming Pet Bed (60cm)',
    nameBn: 'ডেমো আল্ট্রা সফট প্লাশ অর্থোপেডিক ডোনাট কামিং পেট বেড (৬০ সেমি)',
    slug: 'demo-pet-orthopedic-calming-dog-bed',
    sku: 'PT-BED-DONUT-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Round doughnut pet bed with raised rim headrest, high-density orthopedic PP cotton filling, and non-slip waterproof bottom base.',
    shortDescriptionBn:
      'কুকুর ও বিড়ালের গভীর ও শান্ত ঘুমের জন্য নরম তুলতুলে ডোনাট বেড, যা জয়েন্টের চাপ কমাতে সহায়তা করে।',
    price: 1850,
    compareAtPrice: 2200,
    stock: 25,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'pet-type': 'All Pets',
      'pet-size': 'M',
      'pet-material': 'Cotton Plush & PP Fiber',
      'pet-washable': true,
      'pet-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('Medium 60cm (Up to 9kg Pets)', 'PT-BED-M-60', 1850, 15),
      sv('Large 80cm (Up to 20kg Pets)', 'PT-BED-L-80', 2650, 10),
    ],
  },

  // 12. Airline-Approved Breathable Mesh Pet Travel Carrier (Pet Carrier)
  {
    categoryPath: 'pet-supplies/pet-accessories/pet-carriers-travel',
    productTypeSlug: 'pet-carrier',
    nameEn: 'Demo Airline-Approved Breathable Mesh Expandable Pet Travel Carrier Bag',
    nameBn: 'ডেমো এয়ারলাইন-অ্যাপ্রুভড ব্রিদেবল মেশ পেট ট্রাভেল ক্যারিয়ার ব্যাগ',
    slug: 'demo-pet-airline-approved-pet-carrier',
    sku: 'PT-CARR-AIR-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Collapsible pet carrier with 4-side breathable mesh ventilation windows, padded shoulder strap, washable fleece mat, and luggage trolley strap.',
    shortDescriptionBn:
      'গাড়িতে বা বিমানে পোষা প্রাণী নিয়ে ভ্রমণের উপযোগী আরামদায়ক ও বায়ু চলাচলকারী ফোল্ডিং পেট ক্যারিয়ার।',
    price: 2450,
    compareAtPrice: 2900,
    stock: 20,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'pet-type': 'Cat',
      'pet-size': 'M',
      'pet-carrier-max-weight-kg': 8,
      'pet-material': 'Breathable Mesh',
      'pet-warranty': '7 Days Replacement Warranty',
      'pet-country-of-origin': 'Bangladesh',
    },
    variants: [
      cv('Slate Grey with Black Trim', 'PT-CARR-GRY', 2450, 12),
      cv('Navy Blue with Silver Trim', 'PT-CARR-NVY', 2450, 8),
    ],
  },

  // 13. Self-Cleaning Slicker Brush & De-Shedding Grooming Tool (Pet Brush)
  {
    categoryPath: 'pet-supplies/pet-grooming/brushes-nail-clippers',
    productTypeSlug: 'pet-brush',
    nameEn: 'Demo Self-Cleaning Slicker Grooming Brush & Undercoat De-Shedder',
    nameBn: 'ডেমো সেলফ-ক্লিনিং স্লিকার গ্রুমিং ব্রাশ ও ফার রিমুভার',
    slug: 'demo-pet-self-cleaning-slicker-brush',
    sku: 'PT-BRUSH-SLICK-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'One-click button retracts fine bent wire bristles to instantly drop trapped loose hair, undercoat fur, and tangles without scratching pet skin.',
    shortDescriptionBn:
      'এক ক্লিকে ব্রাশে জমে থাকা চুল পরিষ্কার করার পুশ বাটন সমৃদ্ধ নিরাপদ মসৃণ দাঁতের পেট গ্রুমিং ব্রাশ।',
    price: 480,
    compareAtPrice: 580,
    stock: 55,
    unit: 'piece',
    isFeatured: false,
    specs: {
      'pet-type': 'All Pets',
      'pet-material': 'Food-Grade PP Plastic',
    },
    variants: [
      cv('Mint Green', 'PT-BRUSH-GRN', 480, 30),
      cv('Soft Purple', 'PT-BRUSH-PRP', 480, 25),
    ],
  },

  // 14. Bengal Pets Organic Neem & Aloe Vera Anti-Tick Pet Shampoo (Pet Shampoo)
  {
    categoryPath: 'pet-supplies/pet-grooming/pet-shampoo-conditioner',
    productTypeSlug: 'pet-grooming-shampoo',
    nameEn: 'Demo Bengal Pets Organic Neem & Aloe Vera Anti-Tick & Flea Pet Shampoo (500ml)',
    nameBn: 'ডেমো বেঙ্গল পেটস অর্গানিক নিম ও অ্যালোভেরা অ্যান্টি-টিক পেট শ্যাম্পু (৫০০ মিলি)',
    slug: 'demo-pet-neem-aloe-dog-cat-shampoo',
    sku: 'PT-SHAMP-NEEM-01',
    brand: 'Bengal Pets Nutrition',
    manufacturer: 'Bengal Pets Agro & Feeds Bangladesh',
    shortDescriptionEn:
      'Herbal botanical formula containing natural neem extract, aloe vera gel, and tea tree oil for soothing itchy skin, repelling fleas, and nourishing coat.',
    shortDescriptionBn:
      'প্রাকৃতিক নিম ও অ্যালোভেরা সমৃদ্ধ হারবাল পেট শ্যাম্পু যা উকুন ও এঁটেল পোকা প্রতিরোধ করে ত্বক কোমল রাখে।',
    price: 450,
    compareAtPrice: 550,
    stock: 45,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'pet-type': 'All Pets',
      'pet-pack-size': '500ml Bottle',
      'pet-country-of-origin': 'Bangladesh',
    },
    variants: [
      wv('500ml Dispenser Bottle', 'PT-SHMP-500ML', 450, 35, [
        { batchNumber: 'BP-SH-2026', expiryDate: '2028-04-30', manufacturingDate: '2026-03-01', quantity: 35 },
      ]),
      wv('1000ml Economy Refill Bottle', 'PT-SHMP-1000ML', 780, 10, [
        { batchNumber: 'BP-SH-2026B', expiryDate: '2028-04-30', manufacturingDate: '2026-03-01', quantity: 10 },
      ]),
    ],
  },

  // 15. Stainless Steel Double Pet Feeding Bowl with Non-Slip Base (Pet Bowl)
  {
    categoryPath: 'pet-supplies/pet-accessories/bowls-automatic-feeders',
    productTypeSlug: 'pet-bowl',
    nameEn: 'Demo Stainless Steel Double Pet Food & Water Bowl with Non-Spill Silicone Mat',
    nameBn: 'ডেমো স্টেইনলেস স্টিল ডাবল পেট বাটি (নন-স্লিপ সিলিকন বেস সহ)',
    slug: 'demo-pet-stainless-steel-double-bowl',
    sku: 'PT-BOWL-DBL-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Removable rust-resistant food-grade stainless steel double bowls set in a spill-catching non-skid silicone base to prevent floor messes.',
    shortDescriptionBn:
      'মেঝেতে খাবার ও পানি ছিটকে পড়া রোধ করতে সিলিকন ম্যাট যুক্ত উন্নতমানের ডাবল স্টেইনলেস স্টিল বাটি।',
    price: 850,
    compareAtPrice: 1050,
    stock: 40,
    unit: 'set',
    isFeatured: false,
    specs: {
      'pet-type': 'All Pets',
      'pet-size': 'M',
      'pet-material': 'Stainless Steel',
    },
    variants: [
      sv('Medium (2x 400ml Bowls)', 'PT-BWL-M-400', 850, 25),
      sv('Large (2x 850ml Bowls)', 'PT-BWL-L-850', 1250, 15),
    ],
  },

  // 16. Telescopic Wand Interactive Feather Cat Teaser Toy (Pet Toy)
  {
    categoryPath: 'pet-supplies/cat-supplies/cat-toys-collars',
    productTypeSlug: 'pet-toy',
    nameEn: 'Demo Telescopic Retractable Wand Interactive Feather & Bell Cat Teaser Toy',
    nameBn: 'ডেমো টেলিস্কোপিক রড ইন্টারঅ্যাক্টিভ পালক ও ঘণ্টি ক্যাট টিজার খেলনা',
    slug: 'demo-pet-interactive-feather-cat-teaser',
    sku: 'PT-TOY-TEASER-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Extendable 38-inch carbon fiber wand with 5 interchangeable natural bird feather refills and bell lure for exercise and bonding.',
    shortDescriptionBn:
      'বিড়ালের কৌতূহল ও শিকারী প্রবৃত্তি জাগ্রত করে চঞ্চল রাখার জন্য আকর্ষণীয় পালকের টিজার স্টিক।',
    price: 350,
    compareAtPrice: 420,
    stock: 50,
    unit: 'piece',
    isFeatured: false,
    specs: {
      'pet-type': 'Cat',
      'pet-material': 'Natural Solid Wood',
    },
    variants: [
      cv('Rainbow Feather Refills Set', 'PT-TOY-RNBW', 350, 30),
      cv('Guinea Fowl Natural Plume Set', 'PT-TOY-PLUM', 350, 20),
    ],
  },

  // 17. TetraMin Tropical Flakes Complete Daily Fish Food (Fish Food)
  {
    categoryPath: 'pet-supplies/fish-aquarium/fish-food',
    productTypeSlug: 'fish-food',
    nameEn: 'Demo TetraMin Tropical Flakes Complete Daily Nutrition Fish Food (100g / 500ml)',
    nameBn: 'ডেমো টেট্রামিন ট্রপিক্যাল ফ্লেকস মাছের পুষ্টিকর ফ্লেক ফুড (১০০ গ্রাম)',
    slug: 'demo-pet-tetra-min-tropical-fish-flakes',
    sku: 'PT-TETRA-MIN-01',
    brand: 'Tetra',
    manufacturer: 'Tetra GmbH',
    shortDescriptionEn:
      'Scientifically developed bioactive formula flakes for tropical aquarium fish, promoting clear water, vitality, and vivid natural pigmentation.',
    shortDescriptionBn:
      'অ্যাকোয়ারিয়ামের মাছের উজ্জ্বল প্রাকৃতিক রঙ ও দীর্ঘায়ুর জন্য জার্মানির বিশ্ববিখ্যাত টেট্রামিন ফ্লেক ফুড।',
    price: 650,
    compareAtPrice: 750,
    stock: 45,
    unit: 'canister',
    isFeatured: true,
    specs: {
      'pet-type': 'Fish',
      'pet-food-type': 'Flakes',
      'pet-protein-percentage': 47,
      'pet-pack-size': '100g Canister',
      'pet-country-of-origin': 'Germany',
    },
    variants: [
      wv('100g (500ml Canister)', 'PT-TET-100G', 650, 30, [
        { batchNumber: 'TET-2026-F', expiryDate: '2028-06-30', manufacturingDate: '2026-01-10', quantity: 30 },
      ]),
      wv('200g (1000ml Economy Canister)', 'PT-TET-200G', 1150, 15, [
        { batchNumber: 'TET-2026-FL', expiryDate: '2028-06-30', manufacturingDate: '2026-01-10', quantity: 15 },
      ]),
    ],
  },

  // 18. Sobo WP-1000F Submersible Aquarium Power Filter (Aquarium Filter)
  {
    categoryPath: 'pet-supplies/fish-aquarium/aquarium-filters',
    productTypeSlug: 'aquarium-filter',
    nameEn: 'Demo Sobo WP-1000F Submersible Multi-Stage Aquarium Power Filter (650 L/h, 15W)',
    nameBn: 'ডেমো সোবো ডাব্লিউপি-১০০০এফ সাবমার্সিবল অ্যাকোয়ারিয়াম ফিল্টার (৬৫০ লি/ঘণ্টা)',
    slug: 'demo-pet-sobo-internal-aquarium-filter',
    sku: 'PT-SOBO-1000F-01',
    brand: 'Sobo',
    manufacturer: 'Guangdong Sobo Aquarium Co., Ltd.',
    shortDescriptionEn:
      'Quiet and energy-efficient 3-in-1 submersible filter providing mechanical filtration, biological purification, and oxygen aeration.',
    shortDescriptionBn:
      'অ্যাকোয়ারিয়ামের পানি স্ফটিকের মত পরিষ্কার ও অক্সিজেনযুক্ত রাখতে ৩-ইন-১ সাবমার্সিবল পাওয়ার ফিল্টার।',
    price: 850,
    compareAtPrice: 1050,
    stock: 30,
    unit: 'box',
    isFeatured: true,
    specs: {
      'pet-tank-capacity-liters': 80,
      'pet-filter-flow-rate-lph': 650,
      'pet-power-watt': 15,
      'pet-voltage': '220–240V AC 50Hz',
      'pet-warranty': '1 Month Motor & Pump Warranty',
      'pet-country-of-origin': 'China',
    },
    variants: [
      wv('WP-1000F (650 L/h, 15W)', 'PT-SOBO-1000F', 850, 20),
      wv('WP-2000F (880 L/h, 20W)', 'PT-SOBO-2000F', 1150, 10),
    ],
  },

  // 19. Sobo 100W Explosion-Proof Submersible Aquarium Heater (Aquarium Heater)
  {
    categoryPath: 'pet-supplies/fish-aquarium/aquarium-heaters-lighting',
    productTypeSlug: 'aquarium-heater',
    nameEn: 'Demo Sobo 100W Explosion-Proof Quartz Glass Submersible Aquarium Heater with Thermostat',
    nameBn: 'ডেমো সোবো ১০০ ওয়াট এক্সপ্লোশন-প্রুফ গ্লাস সাবমার্সিবল অ্যাকোয়ারিয়াম হিটার',
    slug: 'demo-pet-sobo-submersible-glass-heater',
    sku: 'PT-SOBO-HEAT100-01',
    brand: 'Sobo',
    manufacturer: 'Guangdong Sobo Aquarium Co., Ltd.',
    shortDescriptionEn:
      'Precise automatic temperature controller (20°C to 34°C) with double insulation and shatter-resistant quartz glass tube for winter protection.',
    shortDescriptionBn:
      'শীতকালে পানির তাপমাত্রা সঠিক রাখতে অটোমেটিক থার্মোস্ট্যাট যুক্ত শকপ্রুফ অ্যাকোয়ারিয়াম কাঁচের হিটার।',
    price: 750,
    compareAtPrice: 900,
    stock: 35,
    unit: 'box',
    isFeatured: false,
    specs: {
      'pet-tank-capacity-liters': 60,
      'pet-power-watt': 100,
      'pet-voltage': '220–240V AC 50Hz',
      'pet-warranty': '6 Months Electrical Warranty',
      'pet-country-of-origin': 'China',
    },
    variants: [
      wv('100W (Up to 60L Tanks)', 'PT-SOBO-HEAT-100W', 750, 20),
      wv('200W (Up to 120L Tanks)', 'PT-SOBO-HEAT-200W', 950, 15),
    ],
  },

  // 20. SmartHeart Cockatiel & Lovebird Premium Seed Mix (Bird Food)
  {
    categoryPath: 'pet-supplies/bird-supplies/bird-food',
    productTypeSlug: 'bird-food',
    nameEn: 'Demo SmartHeart Cockatiel & Lovebird Complete Daily Grain & Seed Mix (1kg)',
    nameBn: 'ডেমো স্মার্টহার্ট ককাটেল ও লাভবার্ড কমপ্লিট দানাদার পাখির খাবার (১ কেজি)',
    slug: 'demo-pet-smartheart-cockatiel-bird-food',
    sku: 'PT-SH-BIRD-01',
    brand: 'SmartHeart',
    manufacturer: 'Perfect Companion Group Co., Ltd.',
    shortDescriptionEn:
      'Rich combination of sunflower seeds, red millet, canary grass seeds, flaxseeds, and extrusion pellets fortified with vitamins A, D3, and E.',
    shortDescriptionBn:
      'ককাটেল, লাভবার্ড ও তোতা পাখির রোগ প্রতিরোধ ক্ষমতা এবং সুন্দর পালকের জন্য পুষ্টিকর দানাদার মিশ্রণ।',
    price: 520,
    compareAtPrice: 600,
    stock: 45,
    unit: 'bag',
    isFeatured: false,
    specs: {
      'pet-type': 'Bird',
      'pet-flavor': 'Mixed Seeds & Fruits',
      'pet-main-ingredients': 'Sunflower seed, canary seed, red millet, yellow millet, safflower seed, extruded vitamin pellets.',
      'pet-pack-size': '1kg Bag',
      'pet-country-of-origin': 'Thailand',
    },
    variants: [
      wv('1kg Bag', 'PT-SH-BIRD-1KG', 520, 30, [
        { batchNumber: 'SH-B-2026', expiryDate: '2027-11-30', manufacturingDate: '2026-02-15', quantity: 30 },
      ]),
      wv('2.5kg Family Pack', 'PT-SH-BIRD-2.5KG', 1200, 15, [
        { batchNumber: 'SH-B-2026L', expiryDate: '2027-11-30', manufacturingDate: '2026-02-15', quantity: 15 },
      ]),
    ],
  },

  // 21. Deluxe Medium Wrought Iron Bird Cage with Perches & Feeders (Bird Cage)
  {
    categoryPath: 'pet-supplies/bird-supplies/bird-cages',
    productTypeSlug: 'bird-cage',
    nameEn: 'Demo Deluxe Wrought Iron Bird Cage with Standing Perches & Transparent Feeders',
    nameBn: 'ডেমো ডিলাক্স পেটা লোহার পাখির খাঁচা (কাঠের পার্চ ও ফিডার সহ)',
    slug: 'demo-pet-wrought-iron-bird-cage',
    sku: 'PT-CAGE-BIRD-01',
    brand: 'Paws & Tails BD',
    manufacturer: 'Paws & Tails Bangladesh Ltd.',
    shortDescriptionEn:
      'Electrostatic rust-proof powder coated iron cage with slide-out waste bottom tray, 2 wooden standing perches, and 2 clear feeding cups.',
    shortDescriptionBn:
      'মরিচারোধী পেইন্ট ও নিচে সহজে ময়লা পরিষ্কারের ট্রে যুক্ত নান্দনিক ও মজবুত পাখির খাঁচা।',
    price: 1850,
    compareAtPrice: 2200,
    stock: 25,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'pet-type': 'Bird',
      'pet-size': 'M',
      'pet-material': 'Wrought Iron Metal',
      'pet-country-of-origin': 'Bangladesh',
    },
    variants: [
      cv('Classic White (46x36x70cm)', 'PT-CAGE-WHT', 1850, 15),
      cv('Midnight Black (46x36x70cm)', 'PT-CAGE-BLK', 1850, 10),
    ],
  },

  // 22. Bengal Pets Timothy Hay & Grain Complete Rabbit Food (Small Animal Food)
  {
    categoryPath: 'pet-supplies/small-animal-supplies/rabbit-supplies',
    productTypeSlug: 'small-animal-food',
    nameEn: 'Demo Bengal Pets High-Fiber Timothy Hay & Nutrient Grain Pellets Rabbit Food (1.5kg)',
    nameBn: 'ডেমো বেঙ্গল পেটস হাই-ফাইবার টিমোথি হে ও গ্রেইন খরগোশের খাবার (১.৫ কেজি)',
    slug: 'demo-pet-rabbit-timothy-hay-pellet-food',
    sku: 'PT-RAB-FOOD-01',
    brand: 'Bengal Pets Nutrition',
    manufacturer: 'Bengal Pets Agro & Feeds Bangladesh',
    shortDescriptionEn:
      'High-fiber natural Timothy hay pellets promoting gastrointestinal motility and natural tooth wear for pet rabbits, guinea pigs, and chinchillas.',
    shortDescriptionBn:
      'খরগোশ ও গিনিপিগের হজমক্রিয়া সুস্থ রাখতে ও দাঁতের সঠিক ক্ষয়ের জন্য উচ্চ আঁশযুক্ত টিমোথি গ্রাস খাদ্য।',
    price: 680,
    compareAtPrice: 800,
    stock: 40,
    unit: 'bag',
    isFeatured: false,
    specs: {
      'pet-type': 'Rabbit',
      'pet-main-ingredients': 'Sun-cured Timothy grass meal, wheat middlings, soybean hulls, alfalfa meal, flaxseed.',
      'pet-pack-size': '1.5kg Bag',
      'pet-country-of-origin': 'Bangladesh',
    },
    variants: [
      wv('1.5kg Bag', 'PT-RAB-1.5KG', 680, 25, [
        { batchNumber: 'BP-RAB-2026', expiryDate: '2027-09-30', manufacturingDate: '2026-03-01', quantity: 25 },
      ]),
      wv('3kg Jumbo Pack', 'PT-RAB-3KG', 1250, 15, [
        { batchNumber: 'BP-RAB-2026L', expiryDate: '2027-09-30', manufacturingDate: '2026-03-01', quantity: 15 },
      ]),
    ],
  },
];

/**
 * Pet Supplies vertical definition.
 */
export const PET_VERTICAL: SeedVertical = {
  key: 'pets',
  root: PET_TAXONOMY,
  attributes: PET_ATTRIBUTES,
  brands: PET_BRANDS,
  manufacturers: PET_MANUFACTURERS,
  products: PET_PRODUCTS,
};
