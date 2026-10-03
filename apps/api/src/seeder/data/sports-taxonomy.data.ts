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
const pt = (
  slug: string,
  attributes: string[],
  nameEn?: string,
  nameBn?: string,
): SeedProductType => ({ slug, attributes, nameEn, nameBn });

/** Weight or Capacity variant helper for dumbbells, rackets, equipment */
const wv = (
  weight: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: weight,
  nameBn: weight,
  sku,
  price,
  stock,
  attributes: {
    'sports-weight-capacity': weight,
    ...(extraAttr ?? {}),
  },
});

/** Size variant helper for balls, bats, apparel */
const sv = (
  size: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: size,
  nameBn: size,
  sku,
  price,
  stock,
  attributes: {
    'sports-size': size,
    ...(extraAttr ?? {}),
  },
});

/** Glove Size variant helper for boxing, cricket gloves */
const gv = (
  gloveSize: string,
  sku: string,
  price: number,
  stock: number,
  color?: string,
): SeedVerticalVariant => ({
  nameEn: color ? `${gloveSize} / ${color}` : gloveSize,
  nameBn: color ? `${gloveSize} / ${color}` : gloveSize,
  sku,
  price,
  stock,
  attributes: {
    'sports-glove-size': gloveSize,
  },
});

/** Footwear Size variant helper */
const fv = (
  shoeSize: string,
  sku: string,
  price: number,
  stock: number,
): SeedVerticalVariant => ({
  nameEn: shoeSize,
  nameBn: shoeSize,
  sku,
  price,
  stock,
  attributes: {
    'sports-footwear-size': shoeSize,
  },
});

/** Pack or Unit variant helper */
const pv = (
  packSize: string,
  sku: string,
  price: number,
  stock: number,
  colorOrType?: string,
): SeedVerticalVariant => ({
  nameEn: colorOrType ? `${packSize} (${colorOrType})` : packSize,
  nameBn: colorOrType ? `${packSize} (${colorOrType})` : packSize,
  sku,
  price,
  stock,
  attributes: {
    'sports-pack-size': packSize,
  },
});

/**
 * Universal Sports & Fitness attributes.
 *
 * Sport Type, Activity, Skill Level, Material, Gear/Ball Size, Weight Capacity,
 * Glove Size, Footwear Size, and Official Warranty are structured attributes — never categories.
 */
export const SPORTS_ATTRIBUTES: SeedAttribute[] = [
  {
    slug: 'sports-type',
    nameEn: 'Sport / Discipline',
    nameBn: 'খেলার ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Cricket',
      'Football / Soccer',
      'Badminton',
      'Tennis',
      'Table Tennis',
      'Basketball',
      'Volleyball',
      'Gym & Fitness',
      'Yoga & Pilates',
      'Running & Athletics',
      'Cycling',
      'Swimming & Water Sports',
      'Boxing & Martial Arts',
      'Outdoor & Adventure',
    ),
  },
  {
    slug: 'sports-activity',
    nameEn: 'Primary Activity',
    nameBn: 'কার্যকলাপের ক্ষেত্র',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Running',
      'Gym & Strength Training',
      'Weightlifting',
      'Cardio & Endurance',
      'Yoga & Stretching',
      'Match & Tournament Play',
      'Daily Practice & Training',
      'Outdoor Cycling',
      'Lap Swimming & Water Sports',
      'Casual & Active Lifestyle',
    ),
  },
  {
    slug: 'sports-skill-level',
    nameEn: 'Skill Level',
    nameBn: 'দক্ষতার মাত্রা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Beginner',
      'Intermediate',
      'Advanced',
      'Professional / Match Grade',
      'All Skill Levels',
    ),
  },
  {
    slug: 'sports-gender',
    nameEn: 'Target Gender',
    nameBn: 'লিঙ্গ উপযোগিতা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Men',
      'Women',
      'Boys',
      'Girls',
      'Unisex',
      'Kids',
    ),
  },
  {
    slug: 'sports-material',
    nameEn: 'Core Material / Construction',
    nameBn: 'মূল উপাদান বা গঠন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'English Willow',
      'Kashmir Willow',
      'High-Modulus Carbon Graphite',
      'High-Grade PU Synthetic Leather',
      'Natural Rubber',
      'Solid Cast Iron (Rubber Coated)',
      'High-Density Eco TPE',
      'High-Tensile Steel',
      'Aircraft-Grade Aluminum Alloy',
      'Breathable Dry-Fit Polyester',
      'Microfiber Synthetic Leather',
    ),
  },
  {
    slug: 'sports-size',
    nameEn: 'Gear / Ball / Apparel Size',
    nameBn: 'গিয়ার বা বলের সাইজ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      'Size 3',
      'Size 4',
      'Size 5',
      'Short Handle (SH)',
      'Long Handle (LH)',
      'Full Size',
      'Standard',
      'S',
      'M',
      'L',
      'XL',
      'XXL',
      '26-Inch',
      '27.5-Inch',
      '29-Inch',
    ),
  },
  {
    slug: 'sports-weight-capacity',
    nameEn: 'Weight / Capacity',
    nameBn: 'ওজন বা ভারবহন ক্ষমতা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      '2.5 kg',
      '5 kg',
      '7.5 kg',
      '10 kg',
      '15 kg',
      '20 kg',
      '77g (5U)',
      '83g (4U)',
      '88g (3U)',
      'Up to 100 kg',
      'Up to 120 kg',
      'Up to 150 kg',
    ),
  },
  {
    slug: 'sports-glove-size',
    nameEn: 'Glove Size / Weight',
    nameBn: 'গ্লাভসের সাইজ বা ওজন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      '8 oz',
      '10 oz',
      '12 oz',
      '14 oz',
      '16 oz',
      'Size 7',
      'Size 8',
      'Size 9',
      'Size 10',
    ),
  },
  {
    slug: 'sports-footwear-size',
    nameEn: 'Shoe Size (EU)',
    nameBn: 'জুতার সাইজ (ইইউ)',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      'EU 39',
      'EU 40',
      'EU 41',
      'EU 42',
      'EU 43',
      'EU 44',
      'EU 45',
    ),
  },
  {
    slug: 'sports-pack-size',
    nameEn: 'Pack / Set Quantity',
    nameBn: 'প্যাক বা সেটের পরিমাণ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      '1 Piece',
      'Pair of 2',
      'Tube of 6',
      'Tube of 12',
      'Set of 3',
      'Set of 4',
      'Full Kit',
    ),
  },
  {
    slug: 'sports-warranty',
    nameEn: 'Warranty Period',
    nameBn: 'ওয়ারেন্টি মেয়াদ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'No Warranty',
      '6 Months Official Warranty',
      '1 Year Official Brand Warranty',
      '2 Years Motor / Frame Service Warranty',
    ),
  },
  {
    slug: 'sports-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎপাদনকারী দেশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Bangladesh',
      'India',
      'Japan',
      'UK',
      'USA',
      'Germany',
      'France',
      'China',
      'Taiwan',
      'Pakistan',
    ),
  },
];

// Product Types definitions
const CRICKET_BAT_PT = pt(
  'cricket-bat',
  ['sports-type', 'sports-skill-level', 'sports-material', 'sports-size', 'sports-warranty', 'sports-country-of-origin'],
  'Cricket Bat',
  'ক্রিকেট ব্যাট',
);
const FOOTBALL_PT = pt(
  'football',
  ['sports-type', 'sports-skill-level', 'sports-material', 'sports-size', 'sports-warranty', 'sports-country-of-origin'],
  'Football / Match Ball',
  'ফুটবল',
);
const BADMINTON_RACKET_PT = pt(
  'badminton-racket',
  ['sports-type', 'sports-skill-level', 'sports-material', 'sports-weight-capacity', 'sports-warranty', 'sports-country-of-origin'],
  'Badminton Racket',
  'ব্যাডমিন্টন র‍্যাকেট',
);
const TENNIS_RACKET_PT = pt(
  'tennis-racket',
  ['sports-type', 'sports-skill-level', 'sports-material', 'sports-weight-capacity', 'sports-warranty', 'sports-country-of-origin'],
  'Tennis Racket',
  'টেনিস র‍্যাকেট',
);
const RUNNING_SHOE_PT = pt(
  'running-shoe',
  ['sports-type', 'sports-activity', 'sports-gender', 'sports-footwear-size', 'sports-material', 'sports-warranty', 'sports-country-of-origin'],
  'Running Shoes',
  'রানিং জুতা',
);
const SPORTS_JERSEY_PT = pt(
  'sports-jersey',
  ['sports-type', 'sports-activity', 'sports-gender', 'sports-size', 'sports-material', 'sports-country-of-origin'],
  'Sports Jersey',
  'খেলার জার্সি',
);
const DUMBBELL_PT = pt(
  'dumbbell-pair',
  ['sports-type', 'sports-activity', 'sports-material', 'sports-weight-capacity', 'sports-pack-size', 'sports-warranty', 'sports-country-of-origin'],
  'Dumbbell Pair',
  'ডাম্বেল পেয়ার',
);
const TREADMILL_PT = pt(
  'treadmill',
  ['sports-type', 'sports-activity', 'sports-weight-capacity', 'sports-warranty', 'sports-country-of-origin'],
  'Motorized Treadmill',
  'মোটরাইজড ট্রেডমিল',
);
const YOGA_MAT_PT = pt(
  'yoga-mat',
  ['sports-type', 'sports-activity', 'sports-material', 'sports-warranty', 'sports-country-of-origin'],
  'Yoga & Exercise Mat',
  'যোগ ম্যাট',
);
const BICYCLE_PT = pt(
  'bicycle',
  ['sports-type', 'sports-activity', 'sports-size', 'sports-material', 'sports-warranty', 'sports-country-of-origin'],
  'Mountain Bike / Bicycle',
  'মাউন্টেন বাইক / সাইকেল',
);
const BOXING_GLOVES_PT = pt(
  'boxing-gloves',
  ['sports-type', 'sports-skill-level', 'sports-material', 'sports-glove-size', 'sports-warranty', 'sports-country-of-origin'],
  'Boxing Gloves',
  'বক্সিং গ্লাভস',
);
const SPORTS_BAG_PT = pt(
  'sports-bag',
  ['sports-type', 'sports-activity', 'sports-material', 'sports-pack-size', 'sports-country-of-origin'],
  'Sports & Gym Duffel Bag',
  'স্পোর্টস ও জিম ব্যাগ',
);
const SWIMMING_GOGGLES_PT = pt(
  'swimming-goggles',
  ['sports-type', 'sports-skill-level', 'sports-material', 'sports-pack-size', 'sports-country-of-origin'],
  'Swimming Goggles',
  'সাঁতারের চশমা',
);

/**
 * 14 Primary Categories representing the Sports & Fitness taxonomy.
 */
export const SPORTS_TAXONOMY: SeedTaxonomyNode = {
  slug: 'sports-fitness',
  nameEn: 'Sports & Fitness',
  nameBn: 'খেলাধুলা ও ফিটনেস',
  icon: '⚽',
  descriptionEn:
    'Comprehensive sports gear, outdoor equipment, athletic footwear, and home gym essentials for players and fitness enthusiasts.',
  descriptionBn:
    'খেলোয়াড় ও ফিটনেস সচেতনদের জন্য প্রিমিয়াম খেলাধুলার সামগ্রী, ফিটনেস গিয়ার ও পোশাক।',
  children: [
    // 1. Sportswear
    {
      slug: 'sports-sportswear',
      nameEn: 'Sportswear & Activewear',
      nameBn: 'খেলাধুলার পোশাক ও অ্যাক্টিভওয়্যার',
      icon: '👕',
      children: [
        {
          slug: 'sports-mens-sportswear',
          nameEn: "Men's Sportswear",
          nameBn: 'পুরুষদের স্পোর্টসওয়্যার',
          productTypes: [SPORTS_JERSEY_PT],
        },
        {
          slug: 'sports-womens-sportswear',
          nameEn: "Women's Sportswear",
          nameBn: 'মহিলাদের স্পোর্টসওয়্যার',
          productTypes: [SPORTS_JERSEY_PT],
        },
        {
          slug: 'sports-kids-sportswear',
          nameEn: 'Kids Sportswear',
          nameBn: 'বাচ্চাদের স্পোর্টসওয়্যার',
          productTypes: [SPORTS_JERSEY_PT],
        },
        {
          slug: 'sports-jerseys',
          nameEn: 'Sports Jerseys',
          nameBn: 'খেলার জার্সি',
          productTypes: [SPORTS_JERSEY_PT],
        },
        {
          slug: 'sports-shorts-trackpants',
          nameEn: 'Shorts & Track Pants',
          nameBn: 'শর্টস ও ট্র্যাক প্যান্ট',
          productTypes: [SPORTS_JERSEY_PT],
        },
      ],
    },

    // 2. Footwear
    {
      slug: 'sports-footwear',
      nameEn: 'Sports Footwear',
      nameBn: 'স্পোর্টস জুতা',
      icon: '👟',
      children: [
        {
          slug: 'sports-running-shoes',
          nameEn: 'Running Shoes',
          nameBn: 'রানিং জুতা',
          productTypes: [RUNNING_SHOE_PT],
        },
        {
          slug: 'sports-football-boots',
          nameEn: 'Football Boots & Cleats',
          nameBn: 'ফুটবল বুট',
          productTypes: [RUNNING_SHOE_PT],
        },
        {
          slug: 'sports-cricket-shoes',
          nameEn: 'Cricket Shoes',
          nameBn: 'ক্রিকেট জুতা',
          productTypes: [RUNNING_SHOE_PT],
        },
        {
          slug: 'sports-badminton-shoes',
          nameEn: 'Badminton Shoes',
          nameBn: 'ব্যাডমিন্টন জুতা',
          productTypes: [RUNNING_SHOE_PT],
        },
        {
          slug: 'sports-training-shoes',
          nameEn: 'Training & Gym Shoes',
          nameBn: 'ট্রেনিং ও জিম জুতা',
          productTypes: [RUNNING_SHOE_PT],
        },
      ],
    },

    // 3. Football
    {
      slug: 'sports-football',
      nameEn: 'Football & Soccer',
      nameBn: 'ফুটবল ও সকার',
      icon: '⚽',
      children: [
        {
          slug: 'sports-footballs',
          nameEn: 'Match & Training Footballs',
          nameBn: 'ম্যাচ ও ট্রেনিং ফুটবল',
          productTypes: [FOOTBALL_PT],
        },
        {
          slug: 'sports-goalkeeper-gloves',
          nameEn: 'Goalkeeper Gloves',
          nameBn: 'গোলকিপার গ্লাভস',
          productTypes: [BOXING_GLOVES_PT],
        },
        {
          slug: 'sports-football-guards-accessories',
          nameEn: 'Shin Guards & Football Accessories',
          nameBn: 'শিন গার্ড ও এক্সেসরিজ',
          productTypes: [FOOTBALL_PT],
        },
      ],
    },

    // 4. Cricket
    {
      slug: 'sports-cricket',
      nameEn: 'Cricket Gear & Equipment',
      nameBn: 'ক্রিকেট সামগ্রী ও সরঞ্জাম',
      icon: '🏏',
      children: [
        {
          slug: 'sports-cricket-bats',
          nameEn: 'Cricket Bats',
          nameBn: 'ক্রিকেট ব্যাট',
          productTypes: [CRICKET_BAT_PT],
        },
        {
          slug: 'sports-cricket-balls',
          nameEn: 'Cricket Balls',
          nameBn: 'ক্রিকেট বল',
          productTypes: [CRICKET_BAT_PT],
        },
        {
          slug: 'sports-cricket-protective-gear',
          nameEn: 'Batting Gloves, Pads & Helmets',
          nameBn: 'ব্যাটিং গ্লাভস, প্যাড ও হেলমেট',
          productTypes: [CRICKET_BAT_PT],
        },
        {
          slug: 'sports-cricket-stumps-accessories',
          nameEn: 'Stumps, Kit Bags & Accessories',
          nameBn: 'স্ট্যাম্প, কিট ব্যাগ ও এক্সেসরিজ',
          productTypes: [CRICKET_BAT_PT, SPORTS_BAG_PT],
        },
      ],
    },

    // 5. Badminton
    {
      slug: 'sports-badminton',
      nameEn: 'Badminton',
      nameBn: 'ব্যাডমিন্টন',
      icon: '🏸',
      children: [
        {
          slug: 'sports-badminton-rackets',
          nameEn: 'Badminton Rackets',
          nameBn: 'ব্যাডমিন্টন র‍্যাকেট',
          productTypes: [BADMINTON_RACKET_PT],
        },
        {
          slug: 'sports-shuttlecocks',
          nameEn: 'Shuttlecocks (Feather & Nylon)',
          nameBn: 'ফেদার ও নাইলন শাটলকক',
          productTypes: [BADMINTON_RACKET_PT],
        },
        {
          slug: 'sports-badminton-accessories',
          nameEn: 'Badminton Nets, Grips & Strings',
          nameBn: 'নেট, গ্রিপ ও স্ট্রিং',
          productTypes: [BADMINTON_RACKET_PT],
        },
      ],
    },

    // 6. Tennis
    {
      slug: 'sports-tennis',
      nameEn: 'Tennis',
      nameBn: 'টেনিস',
      icon: '🎾',
      children: [
        {
          slug: 'sports-tennis-rackets',
          nameEn: 'Tennis Rackets',
          nameBn: 'টেনিস র‍্যাকেট',
          productTypes: [TENNIS_RACKET_PT],
        },
        {
          slug: 'sports-tennis-balls',
          nameEn: 'Tennis Balls',
          nameBn: 'টেনিস বল',
          productTypes: [TENNIS_RACKET_PT],
        },
        {
          slug: 'sports-tennis-accessories',
          nameEn: 'Grips, Strings & Nets',
          nameBn: 'গ্রিপ, স্ট্রিং ও নেট',
          productTypes: [TENNIS_RACKET_PT],
        },
      ],
    },

    // 7. Table Tennis
    {
      slug: 'sports-table-tennis',
      nameEn: 'Table Tennis',
      nameBn: 'টেবিল টেনিস',
      icon: '🏓',
      children: [
        {
          slug: 'sports-tt-tables',
          nameEn: 'Table Tennis Tables',
          nameBn: 'টিটি টেবিল',
          productTypes: [CRICKET_BAT_PT],
        },
        {
          slug: 'sports-tt-bats-balls',
          nameEn: 'TT Bats & Balls',
          nameBn: 'টিটি ব্যাট ও বল',
          productTypes: [CRICKET_BAT_PT],
        },
      ],
    },

    // 8. Basketball & Volleyball
    {
      slug: 'sports-basketball-volleyball',
      nameEn: 'Basketball & Volleyball',
      nameBn: 'বাস্কেটবল ও ভলিবল',
      icon: '🏀',
      children: [
        {
          slug: 'sports-basketballs',
          nameEn: 'Basketballs & Hoops',
          nameBn: 'বাস্কেটবল ও হুপ',
          productTypes: [FOOTBALL_PT],
        },
        {
          slug: 'sports-volleyballs',
          nameEn: 'Volleyballs & Nets',
          nameBn: 'ভলিবল ও নেট',
          productTypes: [FOOTBALL_PT],
        },
      ],
    },

    // 9. Fitness & Gym Equipment
    {
      slug: 'sports-fitness-gym',
      nameEn: 'Fitness & Gym Equipment',
      nameBn: 'ফিটনেস ও জিম ইকুইপমেন্ট',
      icon: '🏋️',
      children: [
        {
          slug: 'sports-dumbbells',
          nameEn: 'Dumbbells & Hand Weights',
          nameBn: 'ডাম্বেল ও হ্যান্ড ওয়েট',
          productTypes: [DUMBBELL_PT],
        },
        {
          slug: 'sports-barbells-plates',
          nameEn: 'Barbells & Weight Plates',
          nameBn: 'বারবেল ও প্লেট',
          productTypes: [DUMBBELL_PT],
        },
        {
          slug: 'sports-cardio-machines',
          nameEn: 'Treadmills & Cardio Machines',
          nameBn: 'ট্রেডমিল ও কার্ডিও মেশিন',
          productTypes: [TREADMILL_PT],
        },
        {
          slug: 'sports-benches-racks',
          nameEn: 'Weight Benches & Home Gyms',
          nameBn: 'ওয়েট বেঞ্চ ও হোম জিম',
          productTypes: [DUMBBELL_PT],
        },
        {
          slug: 'sports-resistance-gear',
          nameEn: 'Resistance Bands & Skipping Ropes',
          nameBn: 'রেজিস্ট্যান্স ব্যান্ড ও স্কিপিং রোপ',
          productTypes: [DUMBBELL_PT],
        },
      ],
    },

    // 10. Yoga & Pilates
    {
      slug: 'sports-yoga-pilates',
      nameEn: 'Yoga & Pilates',
      nameBn: 'যোগ ও পাইলেটস',
      icon: '🧘',
      children: [
        {
          slug: 'sports-yoga-mats',
          nameEn: 'Yoga & Exercise Mats',
          nameBn: 'যোগ ও এক্সারসাইজ ম্যাট',
          productTypes: [YOGA_MAT_PT],
        },
        {
          slug: 'sports-yoga-props',
          nameEn: 'Yoga Blocks, Straps & Rings',
          nameBn: 'যোগ ব্লক, স্ট্র্যাপ ও পাইলেটস রিং',
          productTypes: [YOGA_MAT_PT],
        },
      ],
    },

    // 11. Cycling
    {
      slug: 'sports-cycling',
      nameEn: 'Cycling & Bicycles',
      nameBn: 'সাইক্লিং ও বাইসাইকেল',
      icon: '🚴',
      children: [
        {
          slug: 'sports-bicycles',
          nameEn: 'Mountain Bikes & City Cycles',
          nameBn: 'মাউন্টেন বাইক ও সাইকেল',
          productTypes: [BICYCLE_PT],
        },
        {
          slug: 'sports-cycling-helmets-gear',
          nameEn: 'Helmets & Protective Cycling Gear',
          nameBn: 'সাইক্লিং হেলমেট ও গিয়ার',
          productTypes: [BICYCLE_PT],
        },
        {
          slug: 'sports-cycling-accessories',
          nameEn: 'Pumps, Lights & Locks',
          nameBn: 'পাম্প, লাইট ও লক',
          productTypes: [BICYCLE_PT],
        },
      ],
    },

    // 12. Swimming
    {
      slug: 'sports-swimming',
      nameEn: 'Swimming & Water Sports',
      nameBn: 'সাঁতার ও ওয়াটার স্পোর্টস',
      icon: '🏊',
      children: [
        {
          slug: 'sports-swimwear',
          nameEn: 'Swimwear & Trunks',
          nameBn: 'সাঁতারের পোশাক',
          productTypes: [SPORTS_JERSEY_PT],
        },
        {
          slug: 'sports-swimming-goggles-caps',
          nameEn: 'Swimming Goggles & Caps',
          nameBn: 'সাঁতারের চশমা ও ক্যাপ',
          productTypes: [SWIMMING_GOGGLES_PT],
        },
      ],
    },

    // 13. Boxing & Martial Arts
    {
      slug: 'sports-boxing-martial-arts',
      nameEn: 'Boxing & Martial Arts',
      nameBn: 'বক্সিং ও মার্শাল আর্টস',
      icon: '🥊',
      children: [
        {
          slug: 'sports-boxing-gloves',
          nameEn: 'Boxing Gloves',
          nameBn: 'বক্সিং গ্লাভস',
          productTypes: [BOXING_GLOVES_PT],
        },
        {
          slug: 'sports-punching-bags-gear',
          nameEn: 'Punching Bags, Wraps & Hand Guards',
          nameBn: 'পাঞ্চিং ব্যাগ, হ্যান্ড র‍্যাপ ও গার্ড',
          productTypes: [BOXING_GLOVES_PT],
        },
      ],
    },

    // 14. Sports Bags & Accessories
    {
      slug: 'sports-accessories',
      nameEn: 'Sports Bags & Accessories',
      nameBn: 'স্পোর্টস ব্যাগ ও এক্সেসরিজ',
      icon: '🎒',
      children: [
        {
          slug: 'sports-gym-bags',
          nameEn: 'Gym Bags & Duffel Bags',
          nameBn: 'জিম ব্যাগ ও ডাফেল ব্যাগ',
          productTypes: [SPORTS_BAG_PT],
        },
        {
          slug: 'sports-bottles-hydration',
          nameEn: 'Water Bottles & Protein Shakers',
          nameBn: 'পানির বোতল ও শেকার',
          productTypes: [SPORTS_BAG_PT],
        },
        {
          slug: 'sports-fitness-trackers',
          nameEn: 'Fitness Trackers & Smart Sports Bands',
          nameBn: 'ফিটনেস ট্র্যাকার ও স্পোর্টস ব্যান্ড',
          productTypes: [SPORTS_BAG_PT],
        },
      ],
    },
  ],
};

/**
 * Authentic regional and global sports and fitness brands.
 */
export const SPORTS_BRANDS: SeedBrand[] = [
  { name: 'Yonex', manufacturer: 'Yonex Co., Ltd.' },
  { name: 'Decathlon', manufacturer: 'Decathlon S.A.' },
  { name: 'Nike', manufacturer: 'Nike, Inc.' },
  { name: 'Adidas', manufacturer: 'Adidas AG' },
  { name: 'Puma', manufacturer: 'Puma SE' },
  { name: 'Wilson', manufacturer: 'Wilson Sporting Goods Co.' },
  { name: 'Mikasa', manufacturer: 'Mikasa Corporation' },
  { name: 'SG', manufacturer: 'Sanspareils Greenlands Pvt. Ltd.' },
  { name: 'SS', manufacturer: 'Sareen Sports Industries' },
  { name: 'Kookaburra', manufacturer: 'Kookaburra Sport Pty Ltd' },
  { name: 'Everlast', manufacturer: 'Everlast Worldwide Inc.' },
  { name: 'Duranta', manufacturer: 'PRAN-RFL Group' },
  { name: 'Nivia', manufacturer: 'Freewill Sports Pvt. Ltd.' },
  { name: 'PowerMax', manufacturer: 'PowerMax Fitness Pvt. Ltd.' },
  { name: 'Cosco', manufacturer: 'Cosco India Ltd.' },
  { name: 'Spalding', manufacturer: 'Spalding Sports Worldwide' },
];

/**
 * Verified manufacturers for Sports & Fitness brands.
 */
export const SPORTS_MANUFACTURERS: SeedManufacturer[] = [
  {
    name: 'Yonex Co., Ltd.',
    nameBn: 'ইয়োনেক্স কোং লিমিটেড',
    country: 'Japan',
    website: 'https://www.yonex.com',
  },
  {
    name: 'Decathlon S.A.',
    nameBn: 'ডেক্যাথলন এস.এ.',
    country: 'France',
    website: 'https://www.decathlon.com',
  },
  {
    name: 'Nike, Inc.',
    nameBn: 'নাইকি ইনকর্পোরেটেড',
    country: 'USA',
    website: 'https://www.nike.com',
  },
  {
    name: 'Adidas AG',
    nameBn: 'অ্যাডিডাস এজি',
    country: 'Germany',
    website: 'https://www.adidas.com',
  },
  {
    name: 'Mikasa Corporation',
    nameBn: 'মিকাসা কর্পোরেশন',
    country: 'Japan',
    website: 'https://mikasasports.co.jp',
  },
  {
    name: 'Sanspareils Greenlands Pvt. Ltd.',
    nameBn: 'সাঁপাড়েইলস গ্রিনল্যান্ডস (এসজি)',
    country: 'India',
    website: 'https://www.sgcricket.com',
  },
  {
    name: 'Everlast Worldwide Inc.',
    nameBn: 'এভারলাস্ট ওয়ার্ল্ডওয়াইড',
    country: 'USA',
    website: 'https://www.everlast.com',
  },
  {
    name: 'PRAN-RFL Group',
    nameBn: 'প্রাণ-আরএফএল গ্রুপ',
    country: 'Bangladesh',
    website: 'https://www.rflbd.com',
  },
  {
    name: 'PowerMax Fitness Pvt. Ltd.',
    nameBn: 'পাওয়ারম্যাক্স ফিটনেস',
    country: 'India',
    website: 'https://www.powermaxfitness.net',
  },
  {
    name: 'Wilson Sporting Goods Co.',
    nameBn: 'উইলসন স্পোর্টিং গুডস',
    country: 'USA',
    website: 'https://www.wilson.com',
  },
];

/**
 * 10 Rich, production-grade demo products spanning cricket, football,
 * badminton, gym, running shoes, yoga, cycling, treadmill, and boxing.
 */
export const SPORTS_PRODUCTS: SeedVerticalProduct[] = [
  // 1. Cricket: SG Players Edition Kashmir Willow Cricket Bat
  {
    categoryPath: 'sports-fitness/sports-cricket/sports-cricket-bats',
    productTypeSlug: 'cricket-bat',
    nameEn: 'Demo SG Players Edition Kashmir Willow Cricket Bat (Full Size SH)',
    nameBn: 'ডেমো এসজি প্লেয়ার্স এডিশন কাশ্মীর উইলো ক্রিকেট ব্যাট',
    slug: 'demo-sports-sg-cricket-bat',
    sku: 'SP-CR-SG-01',
    brand: 'SG',
    manufacturer: 'Sanspareils Greenlands Pvt. Ltd.',
    shortDescriptionEn:
      'Hand-crafted selected Kashmir Willow bat featuring thick edges, balanced sweet spot, and round cane handle with chevron grip for maximum power.',
    shortDescriptionBn:
      'হাতে বাছাই করা কাশ্মীর উইলো দিয়ে তৈরি, নিখুঁত ব্যালান্স ও পাওয়ার হিটিংয়ের জন্য উপযুক্ত ফুল-সাইজ ক্রিকেট ব্যাট।',
    price: 3650,
    compareAtPrice: 4200,
    stock: 45,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'sports-type': 'Cricket',
      'sports-skill-level': 'Intermediate',
      'sports-material': 'Kashmir Willow',
      'sports-size': 'Short Handle (SH)',
      'sports-warranty': '6 Months Official Warranty',
      'sports-country-of-origin': 'India',
    },
    variants: [
      sv('Short Handle (SH)', 'SP-CR-SG-SH', 3650, 30),
      sv('Long Handle (LH)', 'SP-CR-SG-LH', 3850, 15),
    ],
  },

  // 2. Football: Mikasa FT-5 FIFA Quality Official Match Football
  {
    categoryPath: 'sports-fitness/sports-football/sports-footballs',
    productTypeSlug: 'football',
    nameEn: 'Demo Mikasa FT-5 Goal Master Official Match Football (Size 5)',
    nameBn: 'ডেমো মিকাসা এফটি-৫ অফিসিয়াল ম্যাচ ফুটবল (সাইজ ৫)',
    slug: 'demo-sports-mikasa-ft5-football',
    sku: 'SP-FB-MIK-01',
    brand: 'Mikasa',
    manufacturer: 'Mikasa Corporation',
    shortDescriptionEn:
      'Iconic Mikasa Hyde cover with nylon-wound carcass, molded triangle pattern, and exceptional rebound accuracy for all-weather grass and turf matches.',
    shortDescriptionBn:
      'আইকনিক নাইলন-বাউন্ড গঠন ও ট্রায়াঙ্গল প্যাটার্নযুক্ত টেকসই ও নিখুঁত গ্রিপের ম্যাচ ফুটবল।',
    price: 2850,
    compareAtPrice: 3200,
    stock: 60,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'sports-type': 'Football / Soccer',
      'sports-skill-level': 'Professional / Match Grade',
      'sports-material': 'High-Grade PU Synthetic Leather',
      'sports-size': 'Size 5',
      'sports-warranty': '6 Months Official Warranty',
      'sports-country-of-origin': 'Japan',
    },
    variants: [
      sv('Size 5', 'SP-FB-MIK-SZ5', 2850, 40),
      sv('Size 4', 'SP-FB-MIK-SZ4', 2650, 20),
    ],
  },

  // 3. Badminton: Yonex Nanoray Light 18i Carbon Graphite Racket
  {
    categoryPath: 'sports-fitness/sports-badminton/sports-badminton-rackets',
    productTypeSlug: 'badminton-racket',
    nameEn: 'Demo Yonex Nanoray Light 18i Ultra-Lightweight Carbon Graphite Badminton Racket',
    nameBn: 'ডেমো ইয়োনেক্স ন্যানোরে লাইট ১৮আই কার্বন গ্রাফাইট ব্যাডমিন্টন র‍্যাকেট',
    slug: 'demo-sports-yonex-nanoray-racket',
    sku: 'SP-BM-YNX-01',
    brand: 'Yonex',
    manufacturer: 'Yonex Co., Ltd.',
    shortDescriptionEn:
      'Ultra-lightweight 77g (5U) high-modulus graphite frame with Isometric head shape, Aero-box frame design, and up to 30 lbs string tension capability.',
    shortDescriptionBn:
      'আল্ট্রা-লাইট ৭৭ গ্রাম ওজনের হাই-মডুলাস গ্রাফাইট ফ্রেম ও ৩০ পাউন্ড টেনশন সাপোর্টযুক্ত পাওয়ারফুল র‍্যাকেট।',
    price: 3450,
    compareAtPrice: 3900,
    stock: 55,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'sports-type': 'Badminton',
      'sports-skill-level': 'Intermediate',
      'sports-material': 'High-Modulus Carbon Graphite',
      'sports-weight-capacity': '77g (5U)',
      'sports-warranty': '1 Year Official Brand Warranty',
      'sports-country-of-origin': 'Japan',
    },
    variants: [
      wv('77g (5U)', 'SP-BM-YNX-77G-BLK', 3450, 35, { 'sports-size': 'Standard' }),
      wv('83g (4U)', 'SP-BM-YNX-83G-BLU', 3550, 20, { 'sports-size': 'Standard' }),
    ],
  },

  // 4. Gym & Fitness: Decathlon Domyos Hex Rubber Coated Dumbbell Pair
  {
    categoryPath: 'sports-fitness/sports-fitness-gym/sports-dumbbells',
    productTypeSlug: 'dumbbell-pair',
    nameEn: 'Demo Decathlon Domyos Ergonomic Hex Rubber Coated Dumbbell Pair',
    nameBn: 'ডেমো ডেক্যাথলন ডমিয়স হেক্স রাবার কোটেড ডাম্বেল পেয়ার',
    slug: 'demo-sports-decathlon-hex-dumbbells',
    sku: 'SP-GY-DEC-01',
    brand: 'Decathlon',
    manufacturer: 'Decathlon S.A.',
    shortDescriptionEn:
      'Anti-roll hexagonal rubber-coated solid cast iron dumbbells with knurled ergonomic chrome handles for home gym strength training and floor protection.',
    shortDescriptionBn:
      'মেঝে সুরক্ষিত রাখা ও রোলিং রোধ করার জন্য অ্যান্টি-রোল হেক্সাগোনাল রাবার কোটেড প্রিমিয়াম ডাম্বেল জোড়া।',
    price: 2400,
    compareAtPrice: 2700,
    stock: 80,
    unit: 'pair',
    isFeatured: true,
    specs: {
      'sports-type': 'Gym & Fitness',
      'sports-activity': 'Gym & Strength Training',
      'sports-material': 'Solid Cast Iron (Rubber Coated)',
      'sports-weight-capacity': '5 kg',
      'sports-pack-size': 'Pair of 2',
      'sports-warranty': '1 Year Official Brand Warranty',
      'sports-country-of-origin': 'France',
    },
    variants: [
      wv('5 kg', 'SP-GY-DEC-5KG', 2400, 35, { 'sports-pack-size': 'Pair of 2' }),
      wv('10 kg', 'SP-GY-DEC-10KG', 4500, 25, { 'sports-pack-size': 'Pair of 2' }),
      wv('15 kg', 'SP-GY-DEC-15KG', 6500, 20, { 'sports-pack-size': 'Pair of 2' }),
    ],
  },

  // 5. Footwear: Nike Air Zoom Pegasus Breathable Running Shoes
  {
    categoryPath: 'sports-fitness/sports-footwear/sports-running-shoes',
    productTypeSlug: 'running-shoe',
    nameEn: 'Demo Nike Air Zoom Pegasus Responsive Cushioning Running Shoes',
    nameBn: 'ডেমো নাইকি এয়ার জুম পেগাসাস রেসপনসিভ রানিং শু',
    slug: 'demo-sports-nike-air-zoom-pegasus',
    sku: 'SP-FW-NKE-01',
    brand: 'Nike',
    manufacturer: 'Nike, Inc.',
    shortDescriptionEn:
      'Engineered mesh upper with responsive Nike React foam and dual Zoom Air units delivering smooth transitions, high energy return, and secure midfoot fit.',
    shortDescriptionBn:
      'মাইলকে মাইল আরামদায়ক রানিংয়ের জন্য রেসপনসিভ কুশনিং ও ব্রিদাবল মেশ আপারের প্রিমিয়াম রানিং জুতা।',
    price: 7800,
    compareAtPrice: 8900,
    stock: 40,
    unit: 'pair',
    isFeatured: true,
    specs: {
      'sports-type': 'Running & Athletics',
      'sports-activity': 'Running',
      'sports-gender': 'Men',
      'sports-footwear-size': 'EU 42',
      'sports-material': 'Breathable Dry-Fit Polyester',
      'sports-warranty': '6 Months Official Warranty',
      'sports-country-of-origin': 'USA',
    },
    variants: [
      fv('EU 41', 'SP-FW-NKE-41', 7800, 10),
      fv('EU 42', 'SP-FW-NKE-42', 7800, 15),
      fv('EU 43', 'SP-FW-NKE-43', 7800, 10),
      fv('EU 44', 'SP-FW-NKE-44', 7800, 5),
    ],
  },

  // 6. Yoga: Decathlon Nyamba Eco Non-Slip TPE Yoga Mat 6mm
  {
    categoryPath: 'sports-fitness/sports-yoga-pilates/sports-yoga-mats',
    productTypeSlug: 'yoga-mat',
    nameEn: 'Demo Decathlon Nyamba Eco Non-Slip High-Density TPE Yoga Mat 6mm',
    nameBn: 'ডেমো ডেক্যাথলন নিয়াম্বা ইকো নন-স্লিপ ৬মিমি যোগ ম্যাট',
    slug: 'demo-sports-nyamba-yoga-mat',
    sku: 'SP-YG-DEC-01',
    brand: 'Decathlon',
    manufacturer: 'Decathlon S.A.',
    shortDescriptionEn:
      'Dual-texture non-slip surface made from recyclable non-toxic TPE with central alignment lines, 6mm joint cushioning, and included carry strap.',
    shortDescriptionBn:
      'দ্বৈত গ্রিপ ও ৬মিমি পুরু আরামদায়ক কুশনিংযুক্ত পরিবেশবান্ধব ও টেকসই অ্যান্টি-স্লিপ যোগাসন ম্যাট।',
    price: 1850,
    compareAtPrice: 2200,
    stock: 65,
    unit: 'piece',
    specs: {
      'sports-type': 'Yoga & Pilates',
      'sports-activity': 'Yoga & Stretching',
      'sports-material': 'High-Density Eco TPE',
      'sports-warranty': '1 Year Official Brand Warranty',
      'sports-country-of-origin': 'France',
    },
    variants: [
      pv('1 Piece', 'SP-YG-DEC-GRN', 1850, 35, 'Mint Green'),
      pv('1 Piece', 'SP-YG-DEC-GRY', 1850, 30, 'Slate Grey'),
    ],
  },

  // 7. Sportswear: Bangladesh National Cricket Team Official Fan Match Jersey
  {
    categoryPath: 'sports-fitness/sports-sportswear/sports-jerseys',
    productTypeSlug: 'sports-jersey',
    nameEn: 'Demo Bangladesh National Cricket Team Official Moisture-Wicking Match Jersey',
    nameBn: 'ডেমো বাংলাদেশ জাতীয় ক্রিকেট দল অফিসিয়াল ম্যাচ ফ্যান জার্সি',
    slug: 'demo-sports-bd-cricket-jersey',
    sku: 'SP-SW-BDC-01',
    brand: 'Nivia',
    manufacturer: 'Freewill Sports Pvt. Ltd.',
    shortDescriptionEn:
      'Engineered quick-dry jacquard fabric with antimicrobial finish, official tiger motif sublimation graphics, and stretch-comfort collar construction.',
    shortDescriptionBn:
      'ঘাম শোষণকারী ড্রাই-ফিট ফেব্রিক ও দৃষ্টিনন্দন টাইগার প্রিন্টে তৈরি অফিসিয়াল ম্যাচ ফ্যান জার্সি।',
    price: 1250,
    compareAtPrice: 1500,
    stock: 120,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'sports-type': 'Cricket',
      'sports-activity': 'Match & Tournament Play',
      'sports-gender': 'Unisex',
      'sports-size': 'L',
      'sports-material': 'Breathable Dry-Fit Polyester',
      'sports-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('M', 'SP-SW-BDC-M', 1250, 30),
      sv('L', 'SP-SW-BDC-L', 1250, 45),
      sv('XL', 'SP-SW-BDC-XL', 1250, 30),
      sv('XXL', 'SP-SW-BDC-XXL', 1250, 15),
    ],
  },

  // 8. Cardio Equipment: PowerMax Fitness Foldable Motorized Treadmill
  {
    categoryPath: 'sports-fitness/sports-fitness-gym/sports-cardio-machines',
    productTypeSlug: 'treadmill',
    nameEn: 'Demo PowerMax Fitness 2.0 HP Peak Motorized Foldable Smart Treadmill with LCD',
    nameBn: 'ডেমো পাওয়ারম্যাক্স ফিটনেস ফোল্ডেবল মোটরযুক্ত স্মার্ট ট্রেডমিল',
    slug: 'demo-sports-powermax-treadmill',
    sku: 'SP-GY-PWM-01',
    brand: 'PowerMax',
    manufacturer: 'PowerMax Fitness Pvt. Ltd.',
    shortDescriptionEn:
      'Space-saving hydraulic soft-drop folding treadmill with 2.0 HP continuous DC motor (up to 14 km/h), 12 preset training programs, and 110 kg user capacity.',
    shortDescriptionBn:
      'বাসায় শরীরচর্চার জন্য স্পেস-সেভিং হাইড্রোলিক ফোল্ডিং, এলসিডি ডিসপ্লে ও ২ বছরের ওয়ারেন্টিযুক্ত ট্রেডমিল।',
    price: 42500,
    compareAtPrice: 48000,
    stock: 15,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'sports-type': 'Gym & Fitness',
      'sports-activity': 'Cardio & Endurance',
      'sports-weight-capacity': 'Up to 120 kg',
      'sports-warranty': '2 Years Motor / Frame Service Warranty',
      'sports-country-of-origin': 'India',
    },
    variants: [
      wv('Up to 120 kg', 'SP-GY-PWM-120KG', 42500, 15),
    ],
  },

  // 9. Boxing: Everlast Pro Style Elite Training Boxing Gloves
  {
    categoryPath: 'sports-fitness/sports-boxing-martial-arts/sports-boxing-gloves',
    productTypeSlug: 'boxing-gloves',
    nameEn: 'Demo Everlast Pro Style Elite Hook-and-Loop Training Boxing Gloves',
    nameBn: 'ডেমো এভারলাস্ট প্রো স্টাইল এলিট ট্রেনিং বক্সিং গ্লাভস',
    slug: 'demo-sports-everlast-boxing-gloves',
    sku: 'SP-BX-EVR-01',
    brand: 'Everlast',
    manufacturer: 'Everlast Worldwide Inc.',
    shortDescriptionEn:
      'Premium synthetic leather gloves featuring dual-layer foam padding, full wraparound hook-and-loop wrist strap, and EverCool breathable mesh palm.',
    shortDescriptionBn:
      'উন্নত ডুয়েল-লেয়ার ফোম ও কব্জি সুরক্ষার জন্য র‍্যাপ-অ্যারাউন্ড স্ট্র্যাপযুক্ত আন্তর্জাতিক মানের বক্সিং গ্লাভস।',
    price: 3200,
    compareAtPrice: 3600,
    stock: 50,
    unit: 'pair',
    specs: {
      'sports-type': 'Boxing & Martial Arts',
      'sports-skill-level': 'Intermediate',
      'sports-material': 'High-Grade PU Synthetic Leather',
      'sports-glove-size': '12 oz',
      'sports-warranty': '6 Months Official Warranty',
      'sports-country-of-origin': 'USA',
    },
    variants: [
      gv('10 oz', 'SP-BX-EVR-10OZ', 3200, 15, 'Red / Black'),
      gv('12 oz', 'SP-BX-EVR-12OZ', 3200, 20, 'Matte Black'),
      gv('14 oz', 'SP-BX-EVR-14OZ', 3200, 15, 'Royal Blue'),
    ],
  },

  // 10. Cycling: Duranta Gladiator 26-Inch 21-Speed Mountain Bike
  {
    categoryPath: 'sports-fitness/sports-cycling/sports-bicycles',
    productTypeSlug: 'bicycle',
    nameEn: 'Demo Duranta Gladiator 26-Inch 21-Speed Alloy Suspension Mountain Bike',
    nameBn: 'ডেমো দুরন্ত গ্ল্যাডিয়েটর ২৬-ইঞ্চি ২১-স্পিড অ্যালয় মাউন্টেন বাইক',
    slug: 'demo-sports-duranta-gladiator-mtb',
    sku: 'SP-CY-DUR-01',
    brand: 'Duranta',
    manufacturer: 'PRAN-RFL Group',
    shortDescriptionEn:
      'Lightweight aluminum alloy frame equipped with front lock-out suspension fork, Shimano 21-speed gear system, and dual mechanical disc brakes.',
    shortDescriptionBn:
      'হালকা অ্যালয় ফ্রেম, ফ্রন্ট সাসপেনশন ও ২১-স্পিড গিয়ারযুক্ত টেকসই ও নির্ভরযোগ্য দুরন্ত মাউন্টেন বাইক।',
    price: 16500,
    compareAtPrice: 18500,
    stock: 25,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'sports-type': 'Cycling',
      'sports-activity': 'Outdoor Cycling',
      'sports-size': '26-Inch',
      'sports-material': 'Aircraft-Grade Aluminum Alloy',
      'sports-warranty': '2 Years Motor / Frame Service Warranty',
      'sports-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('26-Inch', 'SP-CY-DUR-MBK', 16500, 15, { 'sports-size': '26-Inch' }),
      sv('27.5-Inch', 'SP-CY-DUR-NVY', 17800, 10, { 'sports-size': '27.5-Inch' }),
    ],
  },
];

export const SPORTS_VERTICAL: SeedVertical = {
  key: 'sports-fitness',
  root: SPORTS_TAXONOMY,
  attributes: SPORTS_ATTRIBUTES,
  brands: SPORTS_BRANDS,
  manufacturers: SPORTS_MANUFACTURERS,
  products: SPORTS_PRODUCTS,
};
