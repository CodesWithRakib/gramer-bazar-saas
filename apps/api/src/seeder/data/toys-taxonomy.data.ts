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

/** Color variant helper */
const cv = (
  color: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: color,
  nameBn: color,
  sku,
  price,
  stock,
  attributes: {
    color,
    ...(extraAttr ?? {}),
  },
});

/** Theme or Character variant helper */
const tv = (
  theme: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: theme,
  nameBn: theme,
  sku,
  price,
  stock,
  attributes: {
    'toys-character': theme,
    ...(extraAttr ?? {}),
  },
});

/** Piece count variant helper for building blocks and puzzles */
const pv = (
  piecesDesc: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: piecesDesc,
  nameBn: piecesDesc,
  sku,
  price,
  stock,
  attributes: {
    'toys-pack-size': piecesDesc,
    ...(extraAttr ?? {}),
  },
});

/** Size variant helper for plush, tents, ride-ons */
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
    size: sizeDesc,
    ...(extraAttr ?? {}),
  },
});

/**
 * Universal dynamic attributes for Toys, Games & Hobbies.
 *
 * Age Group, Safety Warning, Choking Hazard, Adult Supervision, Battery Requirements,
 * Safety Certifications, Learning & STEM Areas, Piece Counts, RC Specifications,
 * Game Players & Playtime, Puzzle Dimensions, Max Weight Capacity, and Official Warranty
 * are structured attributes — never separate database entities.
 */
export const TOYS_ATTRIBUTES: SeedAttribute[] = [
  // 1. Age & Demographic Attributes
  {
    slug: 'toys-age-group',
    nameEn: 'Age Group',
    nameBn: 'বয়স সীমা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '0–6 Months',
      '6–12 Months',
      '1–2 Years',
      '2–3 Years',
      '3–5 Years',
      '5–8 Years',
      '8–12 Years',
      '12+ Years',
      'Teen',
      'Adult',
      'All Ages',
    ),
  },
  {
    slug: 'toys-min-age-years',
    nameEn: 'Minimum Age (Years)',
    nameBn: 'সর্বনিম্ন বয়স (বছর)',
    dataType: AttributeDataType.NUMBER,
    unit: 'years',
    isFilterable: true,
  },
  {
    slug: 'toys-max-age-years',
    nameEn: 'Maximum Age (Years)',
    nameBn: 'সর্বোচ্চ বয়স (বছর)',
    dataType: AttributeDataType.NUMBER,
    unit: 'years',
    isFilterable: true,
  },

  // 2. Material & Build Safety
  {
    slug: 'toys-material',
    nameEn: 'Material',
    nameBn: 'উপাদান',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'BPA-Free ABS Plastic',
      'Natural Solid Wood',
      'Super Soft Plush & PP Cotton',
      'Die-Cast Metal & ABS',
      'Food-Grade Silicone',
      'High-Density Cardboard',
      'Non-Toxic Modeling Dough',
      'Carbon Fiber & ABS',
      'Reinforced Polyester Fabric',
    ),
  },

  // 3. Safety Standards, Warnings & Certifications
  {
    slug: 'toys-safety-warning',
    nameEn: 'Safety Warning',
    nameBn: 'নিরাপত্তা সতর্কতা',
    dataType: AttributeDataType.TEXT,
  },
  {
    slug: 'toys-choking-hazard',
    nameEn: 'Choking Hazard (Small Parts)',
    nameBn: 'শ্বাসরোধের ঝুঁকি (ছোট পার্টস)',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'toys-adult-supervision',
    nameEn: 'Adult Supervision Required',
    nameBn: 'অভিভাবকের উপস্থিতি প্রয়োজন',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'toys-safety-certification',
    nameEn: 'Safety Certification',
    nameBn: 'নিরাপত্তা সার্টিফিকেশন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'EN71 European Safety Standard',
      'ASTM F963 US Standard',
      'BSTI Certified',
      'CE Certified',
      'BPA-Free Certified',
      'Non-Toxic & Washable Certified',
      'ISO 8124 Safety Standard',
    ),
  },

  // 4. Power & Battery Specifications
  {
    slug: 'toys-battery-required',
    nameEn: 'Battery Required',
    nameBn: 'ব্যাটারি প্রয়োজন',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'toys-battery-included',
    nameEn: 'Battery Included',
    nameBn: 'ব্যাটারি সংযুক্ত',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'toys-battery-type',
    nameEn: 'Battery Type',
    nameBn: 'ব্যাটারির ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'AA Batteries',
      'AAA Batteries',
      'Built-in Rechargeable Li-Ion (3.7V/7.4V)',
      '12V Rechargeable Lead-Acid',
      'Button Cell LR44/CR2032',
      '9V Battery',
      'None / Not Required',
    ),
  },

  // 5. Educational, STEM & Cognitive Skills
  {
    slug: 'toys-learning-area',
    nameEn: 'Learning Area',
    nameBn: 'শিক্ষণ ক্ষেত্র',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'STEM',
      'Science & Robotics',
      'Math & Numbers',
      'Language & Literacy',
      'Logic & Problem Solving',
      'Fine Motor Skills',
      'Creative Arts',
      'Sensory Development',
      'Spatial & Engineering',
    ),
  },
  {
    slug: 'toys-stem-area',
    nameEn: 'STEM Area',
    nameBn: 'স্টেম ক্ষেত্র',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Science', 'Technology', 'Engineering', 'Mathematics', 'Robotics', 'Coding'),
  },
  {
    slug: 'toys-skill-development',
    nameEn: 'Skill Development',
    nameBn: 'দক্ষতা উন্নয়ন',
    dataType: AttributeDataType.TEXT,
  },

  // 6. Construction, Pieces & Assembly
  {
    slug: 'toys-pieces',
    nameEn: 'Number of Pieces',
    nameBn: 'মোট পার্টস বা পিস',
    dataType: AttributeDataType.NUMBER,
    unit: 'pieces',
    isFilterable: true,
  },
  {
    slug: 'toys-assembly-required',
    nameEn: 'Assembly Required',
    nameBn: 'সংযোজন প্রয়োজন',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },

  // 7. Theme, Character & Series
  {
    slug: 'toys-character',
    nameEn: 'Character / Franchise',
    nameBn: 'চরিত্র বা ফ্র্যাঞ্চাইজি',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },

  // 8. Remote Control (RC) & Drones
  {
    slug: 'toys-rc-control-type',
    nameEn: 'RC Control Method',
    nameBn: 'আরসি কন্ট্রোল পদ্ধতি',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '2.4GHz Wireless Remote Controller',
      'Infrared (IR) Remote',
      'Smartphone Bluetooth / Wi-Fi App',
      'Motion Gesture Sensor',
    ),
  },
  {
    slug: 'toys-rc-range-meters',
    nameEn: 'Control Range (Meters)',
    nameBn: 'নিয়ন্ত্রণ সীমা (মিটার)',
    dataType: AttributeDataType.NUMBER,
    unit: 'm',
    isFilterable: true,
  },
  {
    slug: 'toys-operating-time-mins',
    nameEn: 'Operating / Play Time (Minutes)',
    nameBn: 'প্লে টাইম বা রান টাইম (মিনিট)',
    dataType: AttributeDataType.NUMBER,
    unit: 'mins',
  },
  {
    slug: 'toys-charging-time-mins',
    nameEn: 'Charging Time (Minutes)',
    nameBn: 'চার্জিং সময় (মিনিট)',
    dataType: AttributeDataType.NUMBER,
    unit: 'mins',
  },
  {
    slug: 'toys-max-speed-kmh',
    nameEn: 'Maximum Speed (km/h)',
    nameBn: 'সর্বোচ্চ গতি (কিমি/ঘণ্টা)',
    dataType: AttributeDataType.NUMBER,
    unit: 'km/h',
    isFilterable: true,
  },

  // 9. Board Games & Card Games
  {
    slug: 'toys-game-players',
    nameEn: 'Number of Players',
    nameBn: 'খেলোয়াড়ের সংখ্যা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '1–2 Players',
      '2–4 Players',
      '2–6 Players',
      '2–8 Players',
      '3–10 Players',
      '4+ Players',
      'Solo / 1 Player',
    ),
  },
  {
    slug: 'toys-game-playtime-mins',
    nameEn: 'Average Play Time',
    nameBn: 'খেলার সময়কাল',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('10–20 Mins', '15–30 Mins', '30–60 Mins', '60–90 Mins', '90–120 Mins'),
  },
  {
    slug: 'toys-game-type',
    nameEn: 'Game Type',
    nameBn: 'খেলার ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Family Board Game',
      'Strategy Game',
      'Party Game',
      'Educational Game',
      'Card Game',
      'Classic Game',
      'Logic Puzzle Game',
    ),
  },

  // 10. Puzzles
  {
    slug: 'toys-puzzle-type',
    nameEn: 'Puzzle Type',
    nameBn: 'ধাঁধার ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Jigsaw Puzzle',
      'Wooden Shape Sorter',
      '3D Mechanical Wooden Puzzle',
      'Brain Teaser Logic Puzzle',
      'Giant Floor Educational Puzzle',
    ),
  },
  {
    slug: 'toys-puzzle-pieces',
    nameEn: 'Puzzle Piece Count',
    nameBn: 'পাজল পিস সংখ্যা',
    dataType: AttributeDataType.NUMBER,
    unit: 'pieces',
    isFilterable: true,
  },

  // 11. Outdoor & Ride-On Toys
  {
    slug: 'toys-max-weight-capacity-kg',
    nameEn: 'Maximum User Weight (kg)',
    nameBn: 'সর্বোচ্চ ওজন ধারণ ক্ষমতা (কেজি)',
    dataType: AttributeDataType.NUMBER,
    unit: 'kg',
    isFilterable: true,
  },

  // 12. Washable, Pack & Warranty
  {
    slug: 'toys-washable-non-toxic',
    nameEn: 'Washable & Non-Toxic Standard',
    nameBn: 'ওয়াশেবল ও নন-টক্সিক মান',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '100% Non-Toxic & Machine Washable',
      'Non-Toxic & Surface Wipe Clean',
      'Non-Toxic Washable Dough',
      'Non-Toxic Certified',
    ),
  },
  {
    slug: 'toys-pack-size',
    nameEn: 'Pack Size / Unit Count',
    nameBn: 'প্যাক সাইজ বা ইউনিট',
    dataType: AttributeDataType.TEXT,
  },
  {
    slug: 'toys-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎপাদনকারী দেশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Bangladesh', 'Denmark', 'USA', 'Germany', 'Japan', 'China', 'India', 'Vietnam'),
  },
  {
    slug: 'toys-warranty',
    nameEn: 'Warranty Period',
    nameBn: 'ওয়ারেন্টি',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'No Warranty',
      '7 Days Replacement Warranty',
      '1 Month Motor & Electronics Warranty',
      '6 Months Brand Warranty',
      '1 Year Service Warranty',
    ),
  },
];

// Product Types definitions mapped to attribute slugs
const SOFT_TOY_PT = pt(
  'soft-toy',
  [
    'toys-age-group',
    'toys-material',
    'toys-washable-non-toxic',
    'toys-safety-certification',
    'toys-country-of-origin',
  ],
  'Soft & Plush Toy',
  'সফট ও প্লাশ টয়',
);

const STEM_KIT_PT = pt(
  'stem-kit',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-stem-area',
    'toys-learning-area',
    'toys-skill-development',
    'toys-pieces',
    'toys-assembly-required',
    'toys-battery-required',
    'toys-choking-hazard',
    'toys-safety-warning',
    'toys-safety-certification',
    'toys-warranty',
  ],
  'STEM & Science Kit',
  'স্টেম ও সায়েন্স কিট',
);

const MONTESSORI_TOY_PT = pt(
  'montessori-toy',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-learning-area',
    'toys-skill-development',
    'toys-material',
    'toys-pieces',
    'toys-safety-certification',
    'toys-country-of-origin',
  ],
  'Montessori Learning Toy',
  'মন্টেসরি লার্নিং টয়',
);

const BABY_RATTLE_PT = pt(
  'baby-rattle',
  [
    'toys-age-group',
    'toys-material',
    'toys-washable-non-toxic',
    'toys-safety-certification',
    'toys-country-of-origin',
  ],
  'Baby Rattle & Teether',
  'শিশুদের ঝুনঝুনি ও টিদার',
);

const BUILDING_BLOCK_PT = pt(
  'building-block',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-pieces',
    'toys-material',
    'toys-choking-hazard',
    'toys-safety-warning',
    'toys-safety-certification',
    'toys-skill-development',
  ],
  'Building Blocks & Construction Set',
  'বিল্ডিং ব্লক ও কনস্ট্রাকশন সেট',
);

const DOLL_PT = pt(
  'doll-toy',
  [
    'toys-age-group',
    'toys-character',
    'toys-material',
    'toys-pieces',
    'toys-choking-hazard',
    'toys-safety-certification',
  ],
  'Fashion & Baby Doll',
  'ফ্যাশন ও বেবি ডল',
);

const ACTION_FIGURE_PT = pt(
  'action-figure',
  [
    'toys-age-group',
    'toys-character',
    'toys-material',
    'toys-choking-hazard',
    'toys-safety-warning',
    'toys-safety-certification',
  ],
  'Action Figure & Collectible',
  'অ্যাকশন ফিগার ও কালেক্টেবল',
);

const RC_CAR_PT = pt(
  'rc-car',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-rc-control-type',
    'toys-rc-range-meters',
    'toys-operating-time-mins',
    'toys-charging-time-mins',
    'toys-max-speed-kmh',
    'toys-battery-required',
    'toys-battery-included',
    'toys-battery-type',
    'toys-warranty',
  ],
  'Remote Control RC Car',
  'রিমোট কন্ট্রোল আরসি কার',
);

const RC_DRONE_PT = pt(
  'rc-drone',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-rc-control-type',
    'toys-rc-range-meters',
    'toys-operating-time-mins',
    'toys-charging-time-mins',
    'toys-battery-required',
    'toys-battery-included',
    'toys-battery-type',
    'toys-adult-supervision',
    'toys-warranty',
  ],
  'Remote Control Quadcopter Drone',
  'আরসি কোয়াডকপ্টার ড্রোন',
);

const DIECAST_CAR_PT = pt(
  'toy-car',
  ['toys-age-group', 'toys-material', 'toys-choking-hazard', 'toys-pack-size', 'toys-country-of-origin'],
  'Die-Cast Toy Vehicle',
  'ডাই-কাস্ট খেলনা গাড়ি',
);

const RIDE_ON_CAR_PT = pt(
  'ride-on-car',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-max-age-years',
    'toys-max-weight-capacity-kg',
    'toys-battery-required',
    'toys-battery-type',
    'toys-operating-time-mins',
    'toys-charging-time-mins',
    'toys-rc-control-type',
    'toys-warranty',
  ],
  'Electric Ride-On Car',
  'ইলেকট্রিক রাইড-অন কার',
);

const SCOOTER_PT = pt(
  'kids-scooter',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-max-age-years',
    'toys-max-weight-capacity-kg',
    'toys-material',
    'toys-warranty',
  ],
  'Kids Kick Scooter',
  'বাচ্চাদের কিক স্কুটার',
);

const BOARD_GAME_PT = pt(
  'board-game',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-game-players',
    'toys-game-playtime-mins',
    'toys-game-type',
    'toys-learning-area',
    'toys-choking-hazard',
  ],
  'Board Game',
  'বোর্ড গেম',
);

const CARD_GAME_PT = pt(
  'card-game',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-game-players',
    'toys-game-playtime-mins',
    'toys-game-type',
  ],
  'Family Card Game',
  'ফ্যামিলি কার্ড গেম',
);

const JIGSAW_PUZZLE_PT = pt(
  'jigsaw-puzzle',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-puzzle-type',
    'toys-puzzle-pieces',
    'toys-material',
    'toys-learning-area',
    'toys-choking-hazard',
  ],
  'Jigsaw Puzzle',
  'জিগস পাজল',
);

const THREE_D_PUZZLE_PT = pt(
  '3d-puzzle',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-puzzle-type',
    'toys-pieces',
    'toys-assembly-required',
    'toys-material',
    'toys-choking-hazard',
  ],
  '3D Mechanical Puzzle',
  'থ্রি-ডি মেকানিক্যাল পাজল',
);

const PLAY_TENT_PT = pt(
  'play-tent',
  ['toys-age-group', 'toys-material', 'toys-assembly-required', 'toys-country-of-origin'],
  'Kids Play Tent & Castle',
  'প্লে টেন্ট ও ক্যাসেল',
);

const ART_KIT_PT = pt(
  'art-kit',
  [
    'toys-age-group',
    'toys-pieces',
    'toys-washable-non-toxic',
    'toys-safety-certification',
    'toys-learning-area',
  ],
  'Art & Painting Studio Kit',
  'আর্ট ও কালারিং স্টুডিও কিট',
);

const CLAY_KIT_PT = pt(
  'clay-kit',
  [
    'toys-age-group',
    'toys-pieces',
    'toys-material',
    'toys-washable-non-toxic',
    'toys-safety-certification',
    'toys-choking-hazard',
  ],
  'Modeling Dough & Clay Kit',
  'মডেলিং ক্লে ও ডো কিট',
);

const TOY_KEYBOARD_PT = pt(
  'toy-keyboard',
  [
    'toys-age-group',
    'toys-battery-required',
    'toys-battery-type',
    'toys-learning-area',
    'toys-material',
    'toys-warranty',
  ],
  'Electronic Learning Keyboard',
  'ইলেকট্রনিক লার্নিং কীবোর্ড',
);

const PRETEND_PLAY_PT = pt(
  'pretend-kitchen-set',
  [
    'toys-age-group',
    'toys-pieces',
    'toys-material',
    'toys-battery-required',
    'toys-choking-hazard',
    'toys-safety-certification',
  ],
  'Pretend Play Kitchen & Doctor Set',
  'প্রিটেন্ড প্লে কিচেন ও ডক্টর সেট',
);

const SCALE_MODEL_PT = pt(
  'scale-model-kit',
  [
    'toys-age-group',
    'toys-min-age-years',
    'toys-pieces',
    'toys-assembly-required',
    'toys-material',
    'toys-choking-hazard',
    'toys-adult-supervision',
  ],
  'Scale Model Building Kit',
  'স্কেল মডেল বিল্ডিং কিট',
);

/**
 * 15 primary category branches with full L3 hierarchy.
 */
export const TOYS_TAXONOMY: SeedTaxonomyNode = {
  slug: 'toys-games-hobbies',
  nameEn: 'Toys, Games & Hobbies',
  nameBn: 'খেলনা, গেমস ও শখের জিনিস',
  icon: '🧸',
  descriptionEn:
    'Comprehensive range of verified baby toys, STEM science kits, building blocks, dolls, action figures, RC cars, board games, puzzles, outdoor play, arts and crafts, and hobbies.',
  descriptionBn:
    'শিশুদের নিরাপদ খেলনা, স্টেম সায়েন্স কিট, বিল্ডিং ব্লক, পুতুল, অ্যাকশন ফিগার, রিমোট কন্ট্রোল গাড়ি, বোর্ড গেম, পাজল ও শখের সামগ্রীর সেরা সমাহার।',
  children: [
    // 1. Baby Toys
    {
      slug: 'baby-toys',
      nameEn: 'Baby Toys',
      nameBn: 'শিশুদের খেলনা',
      icon: '👶',
      children: [
        { slug: 'rattles', nameEn: 'Rattles & Teethers', nameBn: 'ঝুনঝুনি ও টিদার', productTypes: [BABY_RATTLE_PT] },
        { slug: 'soft-toys', nameEn: 'Soft & Plush Toys', nameBn: 'নরম পুতুল ও সফট টয়', productTypes: [SOFT_TOY_PT] },
        { slug: 'musical-baby-toys', nameEn: 'Musical Baby Toys', nameBn: 'সুরের খেলনা', productTypes: [BABY_RATTLE_PT] },
        { slug: 'stacking-toys', nameEn: 'Stacking & Sensory Toys', nameBn: 'স্ট্যাকিং ও সেন্সরি খেলনা', productTypes: [MONTESSORI_TOY_PT] },
      ],
    },

    // 2. Educational Toys
    {
      slug: 'educational-toys',
      nameEn: 'Educational Toys',
      nameBn: 'শিক্ষামূলক খেলনা',
      icon: '🧠',
      children: [
        { slug: 'stem-toys', nameEn: 'STEM & Science Kits', nameBn: 'স্টেম ও সায়েন্স কিট', productTypes: [STEM_KIT_PT] },
        { slug: 'montessori-toys', nameEn: 'Montessori Learning Toys', nameBn: 'মন্টেসরি লার্নিং টয়', productTypes: [MONTESSORI_TOY_PT] },
        { slug: 'math-alphabet-toys', nameEn: 'Math, Alphabet & Number Toys', nameBn: 'গণিত ও বর্ণমালার খেলনা', productTypes: [MONTESSORI_TOY_PT] },
        { slug: 'educational-games', nameEn: 'Educational Learning Games', nameBn: 'শিক্ষামূলক লার্নিং গেমস', productTypes: [BOARD_GAME_PT] },
      ],
    },

    // 3. Dolls & Dollhouses
    {
      slug: 'dolls-dollhouses',
      nameEn: 'Dolls & Dollhouses',
      nameBn: 'পুতুল ও ডলহাউস',
      icon: '🎀',
      children: [
        { slug: 'fashion-dolls', nameEn: 'Fashion & Baby Dolls', nameBn: 'ফ্যাশন ও বেবি ডল', productTypes: [DOLL_PT] },
        { slug: 'dollhouses-furniture', nameEn: 'Dollhouses & Furniture', nameBn: 'ডলহাউস ও ফার্নিচার', productTypes: [DOLL_PT] },
        { slug: 'doll-accessories', nameEn: 'Doll Clothing & Accessories', nameBn: 'ডল পোশাক ও অ্যাকসেসরিজ', productTypes: [DOLL_PT] },
      ],
    },

    // 4. Action Figures & Collectibles
    {
      slug: 'action-figures-collectibles',
      nameEn: 'Action Figures & Collectibles',
      nameBn: 'অ্যাকশন ফিগার ও সংগ্রাহক বস্তু',
      icon: '🦸',
      children: [
        { slug: 'superhero-action-figures', nameEn: 'Superhero & Character Figures', nameBn: 'সুপারহিরো ও মুভি ফিগার', productTypes: [ACTION_FIGURE_PT] },
        { slug: 'collectible-statues', nameEn: 'Collectible Figures & Statues', nameBn: 'কালেক্টেবল ফিগার ও স্ট্যাচু', productTypes: [ACTION_FIGURE_PT] },
      ],
    },

    // 5. Building & Construction
    {
      slug: 'building-construction',
      nameEn: 'Building & Construction',
      nameBn: 'বিল্ডিং ও কনস্ট্রাকশন ব্লক',
      icon: '🧱',
      children: [
        { slug: 'building-blocks', nameEn: 'Classic Building Blocks', nameBn: 'ক্লাসিক বিল্ডিং ব্লক', productTypes: [BUILDING_BLOCK_PT] },
        { slug: 'engineering-kits', nameEn: 'Mechanical Engineering Sets', nameBn: 'মেকানিক্যাল ইঞ্জিনিয়ারিং সেট', productTypes: [BUILDING_BLOCK_PT, STEM_KIT_PT] },
        { slug: 'magnetic-building-sets', nameEn: 'Magnetic Tiles & Blocks', nameBn: 'ম্যাগনেটিক টাইলস ও ব্লক', productTypes: [BUILDING_BLOCK_PT] },
      ],
    },

    // 6. Remote Control Toys
    {
      slug: 'remote-control-toys',
      nameEn: 'Remote Control Toys',
      nameBn: 'রিমোট কন্ট্রোল খেলনা',
      icon: '🎮',
      children: [
        { slug: 'rc-cars', nameEn: 'RC Racing Cars & Monster Trucks', nameBn: 'আরসি রেসিং কার ও ট্রাক', productTypes: [RC_CAR_PT] },
        { slug: 'rc-drones', nameEn: 'RC Quadcopter Drones & Helicopters', nameBn: 'আরসি ড্রোন ও হেলিকপ্টার', productTypes: [RC_DRONE_PT] },
        { slug: 'rc-boats-accessories', nameEn: 'RC Boats & Spare Accessories', nameBn: 'আরসি বোট ও ব্যাটারি পার্টস', productTypes: [RC_CAR_PT] },
      ],
    },

    // 7. Vehicles & Ride-On Toys
    {
      slug: 'vehicles-ride-on-toys',
      nameEn: 'Vehicles & Ride-On Toys',
      nameBn: 'যানবাহন ও রাইড-অন টয়',
      icon: '🚗',
      children: [
        { slug: 'toy-cars', nameEn: 'Die-Cast Cars & Trucks', nameBn: 'ডাই-কাস্ট গাড়ি ও ট্রাক', productTypes: [DIECAST_CAR_PT] },
        { slug: 'ride-on-cars', nameEn: 'Electric & Push Ride-On Cars', nameBn: 'ইলেকট্রিক রাইড-অন কার', productTypes: [RIDE_ON_CAR_PT] },
        { slug: 'scooters', nameEn: 'Kids Kick Scooters & Tricycles', nameBn: 'বাচ্চাদের স্কুটার ও ট্রাইসাইকেল', productTypes: [SCOOTER_PT] },
        { slug: 'toy-trains', nameEn: 'Electric Trains & Tracks', nameBn: 'খেলনা ট্রেন ও রেললাইন সেট', productTypes: [DIECAST_CAR_PT] },
      ],
    },

    // 8. Board Games
    {
      slug: 'board-games',
      nameEn: 'Board Games',
      nameBn: 'বোর্ড গেমস',
      icon: '🎲',
      children: [
        { slug: 'family-games', nameEn: 'Family Board Games', nameBn: 'ফ্যামিলি বোর্ড গেমস', productTypes: [BOARD_GAME_PT] },
        { slug: 'strategy-games', nameEn: 'Strategy & Chess Games', nameBn: 'কৌশলগত ও দাবা খেলা', productTypes: [BOARD_GAME_PT] },
        { slug: 'card-games', nameEn: 'Card Games & Flashcards', nameBn: 'কার্ড গেমস ও ফ্ল্যাশকার্ড', productTypes: [CARD_GAME_PT] },
      ],
    },

    // 9. Puzzles
    {
      slug: 'puzzles',
      nameEn: 'Puzzles & Brain Teasers',
      nameBn: 'ধাঁধা ও পাজল',
      icon: '🧩',
      children: [
        { slug: 'jigsaw-puzzles', nameEn: 'Jigsaw Puzzles', nameBn: 'জিগস পাজল', productTypes: [JIGSAW_PUZZLE_PT] },
        { slug: '3d-puzzles', nameEn: '3D Wooden Mechanical Puzzles', nameBn: 'থ্রি-ডি মেকানিক্যাল পাজল', productTypes: [THREE_D_PUZZLE_PT] },
        { slug: 'wooden-puzzles', nameEn: 'Wooden Educational Puzzles', nameBn: 'কাঠের শিক্ষামূলক পাজল', productTypes: [MONTESSORI_TOY_PT] },
      ],
    },

    // 10. Outdoor Toys
    {
      slug: 'outdoor-toys',
      nameEn: 'Outdoor Toys & Play Equipment',
      nameBn: 'আউটডোর ও খেলাধুলার খেলনা',
      icon: '🎪',
      children: [
        { slug: 'play-tents', nameEn: 'Play Tents & Tunnels', nameBn: 'প্লে টেন্ট ও টানেল', productTypes: [PLAY_TENT_PT] },
        { slug: 'swings-slides', nameEn: 'Swings, Slides & Trampolines', nameBn: 'দোলনা, স্লাইড ও ট্রাম্পোলিন', productTypes: [SCOOTER_PT] },
      ],
    },

    // 11. Arts & Crafts
    {
      slug: 'arts-crafts-toys',
      nameEn: 'Arts & Crafts',
      nameBn: 'আর্ট ও ক্রাফট খেলনা',
      icon: '🎨',
      children: [
        { slug: 'painting-kits', nameEn: 'Drawing & Painting Sets', nameBn: 'ড্রয়িং ও পেইন্টিং সেট', productTypes: [ART_KIT_PT] },
        { slug: 'clay-modeling', nameEn: 'Clay & Modeling Dough Sets', nameBn: 'মডেলিং ক্লে ও ডো সেট', productTypes: [CLAY_KIT_PT] },
        { slug: 'diy-craft-kits', nameEn: 'DIY Craft & Origami Kits', nameBn: 'ডিআইওয়াই ক্রাফট ও অরিগামি', productTypes: [ART_KIT_PT] },
      ],
    },

    // 12. Musical Toys
    {
      slug: 'musical-toys',
      nameEn: 'Musical Toys',
      nameBn: 'বাদ্যযন্ত্র ও সুরের খেলনা',
      icon: '🎹',
      children: [
        { slug: 'toy-keyboard', nameEn: 'Toy Keyboards & Pianos', nameBn: 'খেলনা কীবোর্ড ও পিয়ানো', productTypes: [TOY_KEYBOARD_PT] },
        { slug: 'toy-drums-guitars', nameEn: 'Toy Drums, Guitars & Percussion', nameBn: 'খেলনা ড্রাম ও গিটার', productTypes: [TOY_KEYBOARD_PT] },
      ],
    },

    // 13. Pretend Play
    {
      slug: 'pretend-play',
      nameEn: 'Pretend Play & Role Play',
      nameBn: 'রোল প্লে ও প্রিটেন্ড প্লে',
      icon: '🍳',
      children: [
        { slug: 'kitchen-sets', nameEn: 'Cooking & Kitchen Play Sets', nameBn: 'রান্না ও কিচেন সেট', productTypes: [PRETEND_PLAY_PT] },
        { slug: 'doctor-sets', nameEn: 'Doctor & Medical Case Sets', nameBn: 'ডাক্তার ও মেডিকেল কিট', productTypes: [PRETEND_PLAY_PT] },
        { slug: 'tool-sets', nameEn: 'Mechanic Tool & Workshop Sets', nameBn: 'টুল ও ওয়ার্কশপ সেট', productTypes: [PRETEND_PLAY_PT] },
      ],
    },

    // 14. Hobbies
    {
      slug: 'hobbies',
      nameEn: 'Hobbies & Scale Models',
      nameBn: 'শখ ও স্কেল মডেল',
      icon: '✈️',
      children: [
        { slug: 'scale-model-kits', nameEn: 'Aircraft & Vehicle Scale Model Kits', nameBn: 'বিমান ও যানবাহনের স্কেল মডেল', productTypes: [SCALE_MODEL_PT] },
      ],
    },

    // 15. Party & Celebration Toys
    {
      slug: 'party-celebration-toys',
      nameEn: 'Party & Celebration Toys',
      nameBn: 'উৎসব ও পার্টি টয়',
      icon: '🎉',
      children: [
        { slug: 'party-games', nameEn: 'Party Games & Bubble Guns', nameBn: 'পার্টি গেমস ও বাবল গান', productTypes: [BOARD_GAME_PT] },
      ],
    },
  ],
};

/**
 * Authentic international and Bangladeshi toy brands.
 */
export const TOYS_BRANDS: SeedBrand[] = [
  { name: 'LEGO', manufacturer: 'LEGO System A/S' },
  { name: 'Mattel', manufacturer: 'Mattel, Inc.' },
  { name: 'Hasbro', manufacturer: 'Hasbro, Inc.' },
  { name: 'Barbie', manufacturer: 'Mattel, Inc.' },
  { name: 'Hot Wheels', manufacturer: 'Mattel, Inc.' },
  { name: 'Fisher-Price', manufacturer: 'Mattel, Inc.' },
  { name: 'Play-Doh', manufacturer: 'Hasbro, Inc.' },
  { name: 'Nerf', manufacturer: 'Hasbro, Inc.' },
  { name: 'Ravensburger', manufacturer: 'Ravensburger Verlag GmbH' },
  { name: 'Hasbro Gaming', manufacturer: 'Hasbro, Inc.' },
  { name: 'SYMA', manufacturer: 'Guangdong Syma Model Aircraft Industrial Co., Ltd.' },
  { name: 'Rastar', manufacturer: 'Rastar Group' },
  { name: 'Funskool', manufacturer: 'Funskool India Ltd.' },
  { name: 'Casio', manufacturer: 'Casio Computer Co., Ltd.' },
  { name: 'Shonali Shilpa Toys', manufacturer: 'Shonali Shilpa Handicrafts Bangladesh' },
  { name: 'Monalisa Craft & Toy BD', manufacturer: 'Monalisa Enterprise Bangladesh' },
];

/**
 * Verified manufacturers for Toys & Games.
 */
export const TOYS_MANUFACTURERS: SeedManufacturer[] = [
  {
    name: 'LEGO System A/S',
    nameBn: 'লেগো সিস্টেম এ/এস',
    country: 'Denmark',
    website: 'https://www.lego.com',
  },
  {
    name: 'Mattel, Inc.',
    nameBn: 'ম্যাটেল ইনকর্পোরেটেড',
    country: 'USA',
    website: 'https://www.mattel.com',
  },
  {
    name: 'Hasbro, Inc.',
    nameBn: 'হ্যাজব্রো ইনকর্পোরেটেড',
    country: 'USA',
    website: 'https://www.hasbro.com',
  },
  {
    name: 'Ravensburger Verlag GmbH',
    nameBn: 'রাভেন্সবার্গার ভারলাগ জিএমবিএইচ',
    country: 'Germany',
    website: 'https://www.ravensburger.com',
  },
  {
    name: 'Guangdong Syma Model Aircraft Industrial Co., Ltd.',
    nameBn: 'গুয়াংডং সাইমা মডেল এয়ারক্রাফট ইন্ডাস্ট্রিয়াল কোং লিমিটেড',
    country: 'China',
    website: 'https://www.symatoys.com',
  },
  {
    name: 'Rastar Group',
    nameBn: 'রাস্টার গ্রুপ',
    country: 'China',
    website: 'https://www.rastar.com',
  },
  {
    name: 'Funskool India Ltd.',
    nameBn: 'ফানস্কুল ইন্ডিয়া লিমিটেড',
    country: 'India',
    website: 'https://www.funskool.com',
  },
  {
    name: 'Casio Computer Co., Ltd.',
    nameBn: 'ক্যাসিও কম্পিউটার কোং লিমিটেড',
    country: 'Japan',
    website: 'https://www.casio.com',
  },
  {
    name: 'Shonali Shilpa Handicrafts Bangladesh',
    nameBn: 'সোনালী শিল্প হ্যান্ডিক্রাফটস বাংলাদেশ',
    country: 'Bangladesh',
    website: 'https://www.shonalishilpabd.com',
  },
  {
    name: 'Monalisa Enterprise Bangladesh',
    nameBn: 'মোনালিসা এন্টারপ্রাইজ বাংলাদেশ',
    country: 'Bangladesh',
    website: 'https://www.monalisabd.com',
  },
];

/**
 * 22 realistic, rich seed demo products covering all key subcategories and product types.
 */
export const TOYS_PRODUCTS: SeedVerticalProduct[] = [
  // 1. LEGO City Police Station Building Set (Building & Construction)
  {
    categoryPath: 'toys-games-hobbies/building-construction/building-blocks',
    productTypeSlug: 'building-block',
    nameEn: 'Demo LEGO City Police Station Construction Building Set (668 Pieces)',
    nameBn: 'ডেমো লেগো সিটি পুলিশ স্টেশন কনস্ট্রাকশন বিল্ডিং সেট (৬৬৮ পিস)',
    slug: 'demo-toys-lego-police-station',
    sku: 'TY-LEGO-PS-01',
    brand: 'LEGO',
    manufacturer: 'LEGO System A/S',
    shortDescriptionEn:
      '3-level police station with patrol car, helicopter, garbage truck, 5 minifigures, and dog figure for imaginative roleplay.',
    shortDescriptionBn:
      '৬৬৮ পিসের ৩ তলা বিশিষ্ট বিস্তারিত পুলিশ স্টেশন, পেট্রোল কার, হেলিকপ্টার ও ৫টি মিনিফিগার সমৃদ্ধ প্রিমিয়াম লেগো সেট।',
    price: 8500,
    compareAtPrice: 9200,
    stock: 25,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '5–8 Years',
      'toys-min-age-years': 6,
      'toys-pieces': 668,
      'toys-material': 'BPA-Free ABS Plastic',
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Choking Hazard: Small parts. Not suitable for children under 3 years.',
      'toys-safety-certification': 'EN71 European Safety Standard',
      'toys-country-of-origin': 'Denmark',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      pv('Standard Police Station (668 Pcs)', 'TY-LEGO-PS-STD', 8500, 20),
      pv('Deluxe Police & Fire Brigade Bundle (1120 Pcs)', 'TY-LEGO-PS-DLX', 14200, 5),
    ],
  },

  // 2. 12-in-1 Solar Powered Robot STEM Science Kit (Educational Toys)
  {
    categoryPath: 'toys-games-hobbies/educational-toys/stem-toys',
    productTypeSlug: 'stem-kit',
    nameEn: 'Demo 12-in-1 Solar Powered Hydraulic Robot STEM Science Kit',
    nameBn: 'ডেমো ১২-ইন-১ সোলার চালিত রোবট স্টেম সায়েন্স কিট',
    slug: 'demo-toys-stem-solar-robot-kit',
    sku: 'TY-STEM-ROBO-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Green energy educational robotics kit that builds 12 different operational robot models powered directly by sunlight or halogen light.',
    shortDescriptionBn:
      'সরাসরি সৌরশক্তিতে চালিত ১২ ধরনের বিভিন্ন মডেলের রোবট তৈরির আধুনিক শিক্ষামূলক স্টেম সায়েন্স কিট।',
    price: 1850,
    compareAtPrice: 2200,
    stock: 40,
    unit: 'kit',
    isFeatured: true,
    specs: {
      'toys-age-group': '8–12 Years',
      'toys-min-age-years': 8,
      'toys-stem-area': 'Robotics',
      'toys-learning-area': 'STEM',
      'toys-skill-development': 'Engineering Logic, Mechanical Assembly, Solar Energy Principles',
      'toys-pieces': 190,
      'toys-assembly-required': true,
      'toys-battery-required': false,
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Contains small gears and mechanical joints. Recommended age 8+.',
      'toys-safety-certification': 'CE Certified',
      'toys-country-of-origin': 'Bangladesh',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      tv('12-in-1 Solar Robot Kit', 'TY-STEM-ROBO-12', 1850, 30),
      tv('14-in-1 Advanced Solar & Hydraulic Kit', 'TY-STEM-ROBO-14', 2450, 10),
    ],
  },

  // 3. Wooden Geometric Shape Sorting & Stacking Board (Montessori Toys)
  {
    categoryPath: 'toys-games-hobbies/educational-toys/montessori-toys',
    productTypeSlug: 'montessori-toy',
    nameEn: 'Demo Shonali Shilpa Wooden Geometric Shape Sorting & Stacking Montessori Board',
    nameBn: 'ডেমো সোনালী শিল্প কাঠের জ্যামিতিক শেপ সর্টিং মন্টেসরি বোর্ড',
    slug: 'demo-toys-montessori-shape-sorter',
    sku: 'TY-MONT-SHAPE-01',
    brand: 'Shonali Shilpa Toys',
    manufacturer: 'Shonali Shilpa Handicrafts Bangladesh',
    shortDescriptionEn:
      'Handcrafted natural wood educational shape sorter with smooth non-toxic organic dyes for toddler sensory and fine motor coordination.',
    shortDescriptionBn:
      'প্রাকৃতিক টেকসই কাঠে তৈরি এবং পরিবেশবান্ধব ভেষজ রঙে রাঙানো শিশুদের মেধা ও হাত-চোখের সমন্বয় বিকাশের মন্টেসরি খেলনা।',
    price: 950,
    compareAtPrice: 1150,
    stock: 60,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'toys-age-group': '1–2 Years',
      'toys-min-age-years': 1,
      'toys-learning-area': 'Fine Motor Skills',
      'toys-skill-development': 'Color Recognition, Shape Sorting, Hand-Eye Coordination',
      'toys-material': 'Natural Solid Wood',
      'toys-pieces': 16,
      'toys-safety-certification': 'Non-Toxic & Washable Certified',
      'toys-country-of-origin': 'Bangladesh',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      pv('4-Column Geometric Board', 'TY-MONT-SHAPE-4COL', 950, 40),
      pv('5-Column Deluxe Shape & Number Board', 'TY-MONT-SHAPE-5COL', 1350, 20),
    ],
  },

  // 4. Ultra Soft Cuddle Teddy Bear Plush Toy 45cm (Baby Toys)
  {
    categoryPath: 'toys-games-hobbies/baby-toys/soft-toys',
    productTypeSlug: 'soft-toy',
    nameEn: 'Demo Ultra Soft Cuddle Teddy Bear Plush Toy (45 cm)',
    nameBn: 'ডেমো আল্ট্রা সফট কাডল টেডি বিয়ার প্লাশ টয় (৪৫ সেমি)',
    slug: 'demo-toys-plush-cuddle-teddy-bear',
    sku: 'TY-PLUSH-BEAR-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Hypoallergenic super soft plush fabric filled with high-grade PP cotton, featuring lock-stitched secure eyes and cute embroidered paws.',
    shortDescriptionBn:
      'শিশুর জন্য সম্পূর্ণ নিরাপদ, হাইপোঅ্যালার্জেনিক ও মেশিনে ধোয়া উপযোগী অতি নরম কাডলি টেডি বিয়ার।',
    price: 1250,
    compareAtPrice: 1450,
    stock: 50,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'toys-age-group': '0–6 Months',
      'toys-material': 'Super Soft Plush & PP Cotton',
      'toys-washable-non-toxic': '100% Non-Toxic & Machine Washable',
      'toys-safety-certification': 'EN71 European Safety Standard',
      'toys-country-of-origin': 'Bangladesh',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      cv('Caramel Brown', 'TY-PLUSH-BEAR-BRN', 1250, 25),
      cv('Creamy White', 'TY-PLUSH-BEAR-WHT', 1250, 15),
      cv('Soft Pink', 'TY-PLUSH-BEAR-PNK', 1250, 10),
    ],
  },

  // 5. Fisher-Price Rainforest Musical Rattle & Teether Set (Baby Toys)
  {
    categoryPath: 'toys-games-hobbies/baby-toys/rattles',
    productTypeSlug: 'baby-rattle',
    nameEn: 'Demo Fisher-Price Rainforest Sensory Musical Rattle & Teether Gift Set',
    nameBn: 'ডেমো ফিশার-প্রাইস রেইনফরেস্ট মিউজিক্যাল র‍্যাটেল ও টিদার সেট',
    slug: 'demo-toys-fisher-price-rattle-set',
    sku: 'TY-FP-RATTLE-01',
    brand: 'Fisher-Price',
    manufacturer: 'Mattel, Inc.',
    shortDescriptionEn:
      'Set of 3 easy-grasp teething rings and rattling animal characters with textured teethable surfaces and gentle chime sounds.',
    shortDescriptionBn:
      'দাঁত ওঠার সময়ে শিশুর মাড়ির আরাম দিতে ফুড-গ্রেড সিলিকন ও মসৃণ প্লাস্টিকে তৈরি ৩টি ঝুনঝুনি ও টিদারের প্রিমিয়াম গিফট প্যাক।',
    price: 1450,
    compareAtPrice: 1650,
    stock: 35,
    unit: 'set',
    isFeatured: false,
    specs: {
      'toys-age-group': '0–6 Months',
      'toys-material': 'Food-Grade Silicone',
      'toys-washable-non-toxic': 'Non-Toxic & Surface Wipe Clean',
      'toys-safety-certification': 'BPA-Free Certified',
      'toys-country-of-origin': 'USA',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      pv('Set of 3 Rainforest Animals', 'TY-FP-RATTLE-3PC', 1450, 25),
      pv('Set of 5 Deluxe Animal Safari', 'TY-FP-RATTLE-5PC', 2150, 10),
    ],
  },

  // 6. Barbie Fashionista Deluxe Doll with Interchangeable Outfits (Dolls & Dollhouses)
  {
    categoryPath: 'toys-games-hobbies/dolls-dollhouses/fashion-dolls',
    productTypeSlug: 'doll-toy',
    nameEn: 'Demo Barbie Fashionista Deluxe Doll with 3 Trendy Outfits & Accessories',
    nameBn: 'ডেমো বার্বি ফ্যাশনিস্তা ডিলাক্স ডল ৩টি পোশাক ও এক্সেসরিজ সহ',
    slug: 'demo-toys-barbie-fashionista-doll',
    sku: 'TY-BARBIE-FD-01',
    brand: 'Barbie',
    manufacturer: 'Mattel, Inc.',
    shortDescriptionEn:
      'Authentic 11.5-inch articulated Barbie doll featuring stylish blonde hair, 3 interchangeable runway outfits, shoes, and handbags.',
    shortDescriptionBn:
      'আসল ১১.৫ ইঞ্চি বার্বি ডল যাতে রয়েছে আধুনিক ৩টি রঙিন ড্রেস, হাই হিল জুতো, ব্যাগ ও স্টাইলিং অ্যাকসেসরিজ।',
    price: 2450,
    compareAtPrice: 2800,
    stock: 30,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '3–5 Years',
      'toys-character': 'Barbie',
      'toys-material': 'BPA-Free ABS Plastic',
      'toys-pieces': 12,
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Choking Hazard: Small shoes and jewelry. Not for children under 3 years.',
      'toys-safety-certification': 'ASTM F963 US Standard',
      'toys-country-of-origin': 'USA',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      tv('Blonde Glamour Style', 'TY-BARBIE-BLND', 2450, 18),
      tv('Brunette Floral Style', 'TY-BARBIE-BRNT', 2450, 12),
    ],
  },

  // 7. Marvel Avengers Iron Man Mark 85 Articulated Action Figure (Action Figures)
  {
    categoryPath: 'toys-games-hobbies/action-figures-collectibles/superhero-action-figures',
    productTypeSlug: 'action-figure',
    nameEn: 'Demo Marvel Avengers Iron Man Mark 85 7-Inch Articulated Action Figure',
    nameBn: 'ডেমো মার্ভেল অ্যাভেঞ্জার্স আয়রন ম্যান মার্ক ৮৫ অ্যাকশন ফিগার',
    slug: 'demo-toys-marvel-iron-man-action-figure',
    sku: 'TY-HAS-IRONMAN-01',
    brand: 'Hasbro',
    manufacturer: 'Hasbro, Inc.',
    shortDescriptionEn:
      'Highly detailed 7-inch collectible Iron Man figure with 16 points of articulation, interchangeable repulsor hands, and blast effects.',
    shortDescriptionBn:
      '১৬টি মুভেবল জয়েন্ট এবং রিপ্রেসার ব্লাস্ট ইফেক্ট সমৃদ্ধ মার্ভেল এন্ডগেমের অফিসিয়াল আয়রন ম্যান মার্ক ৮৫ অ্যাকশন ফিগার।',
    price: 2950,
    compareAtPrice: 3400,
    stock: 25,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '5–8 Years',
      'toys-character': 'Marvel Avengers',
      'toys-material': 'BPA-Free ABS Plastic',
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Choking Hazard: Small interchangeable hands and blast parts.',
      'toys-safety-certification': 'CE Certified',
      'toys-country-of-origin': 'USA',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      tv('Iron Man Mark 85', 'TY-HAS-IRONMAN-MK85', 2950, 15),
      tv('Captain America with Shield', 'TY-HAS-CAPAM-SHD', 2950, 10),
    ],
  },

  // 8. Rastar 1:14 Scale Ferrari F8 Tributo Remote Control RC Car (Remote Control)
  {
    categoryPath: 'toys-games-hobbies/remote-control-toys/rc-cars',
    productTypeSlug: 'rc-car',
    nameEn: 'Demo Rastar 1:14 Scale Ferrari F8 Tributo 2.4GHz RC Sports Car',
    nameBn: 'ডেমো রাস্টার ১:১৪ স্কেল ফেরারি এফ৮ ট্রিবিউটো আরসি স্পোর্টস কার',
    slug: 'demo-toys-rastar-ferrari-rc-car',
    sku: 'TY-RASTAR-F8-01',
    brand: 'Rastar',
    manufacturer: 'Rastar Group',
    shortDescriptionEn:
      'Officially licensed 1:14 scale Ferrari with opening butterfly doors, LED headlights, independent suspension, and 2.4GHz gun controller.',
    shortDescriptionBn:
      'অফিসিয়াল লাইসেন্সপ্রাপ্ত ১:১৪ স্কেল ফেরারি স্পোর্টস কার, ওপেনিং ডোর ও এলইডি হেডলাইট সহ ৩০ মিটার রিমোট কন্ট্রোল রেঞ্জ।',
    price: 3850,
    compareAtPrice: 4500,
    stock: 20,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '5–8 Years',
      'toys-min-age-years': 6,
      'toys-rc-control-type': '2.4GHz Wireless Remote Controller',
      'toys-rc-range-meters': 35,
      'toys-operating-time-mins': 25,
      'toys-charging-time-mins': 90,
      'toys-max-speed-kmh': 12,
      'toys-battery-required': true,
      'toys-battery-included': true,
      'toys-battery-type': 'Built-in Rechargeable Li-Ion (3.7V/7.4V)',
      'toys-warranty': '1 Month Motor & Electronics Warranty',
    },
    variants: [
      cv('Ferrari Corsa Red', 'TY-RASTAR-F8-RED', 3850, 12),
      cv('Modena Yellow', 'TY-RASTAR-F8-YLW', 3850, 8),
    ],
  },

  // 9. SYMA X20 Mini Pocket Quadcopter 2.4GHz RC Drone (Remote Control)
  {
    categoryPath: 'toys-games-hobbies/remote-control-toys/rc-drones',
    productTypeSlug: 'rc-drone',
    nameEn: 'Demo SYMA X20 Mini Pocket Quadcopter 2.4GHz Drone with Altitude Hold',
    nameBn: 'ডেমো সাইমা এক্স২০ মিনি পকেট কোয়াডকপ্টার ২.৪ গিগাহার্টজ ড্রোন',
    slug: 'demo-toys-syma-x20-mini-drone',
    sku: 'TY-SYMA-X20-01',
    brand: 'SYMA',
    manufacturer: 'Guangdong Syma Model Aircraft Industrial Co., Ltd.',
    shortDescriptionEn:
      'Pocket-sized aerobatic drone featuring one-key takeoff/landing, 360-degree 3D stunt flips, altitude hold sensor, and headless mode.',
    shortDescriptionBn:
      'ওয়ান-কি টেকঅফ ও ৩৬০ ডিগ্রি ফ্লিপ সুবিধা সহ ঘরের ভেতরে ও বাইরে ওড়ানোর উপযোগী স্থিতিশীল পকেট সাইজ ড্রোন।',
    price: 3200,
    compareAtPrice: 3800,
    stock: 22,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '8–12 Years',
      'toys-min-age-years': 8,
      'toys-rc-control-type': '2.4GHz Wireless Remote Controller',
      'toys-rc-range-meters': 50,
      'toys-operating-time-mins': 10,
      'toys-charging-time-mins': 50,
      'toys-battery-required': true,
      'toys-battery-included': true,
      'toys-battery-type': 'Built-in Rechargeable Li-Ion (3.7V/7.4V)',
      'toys-adult-supervision': true,
      'toys-warranty': '1 Month Motor & Electronics Warranty',
    },
    variants: [
      cv('Matte Black', 'TY-SYMA-X20-BLK', 3200, 14),
      cv('Arctic White', 'TY-SYMA-X20-WHT', 3200, 8),
    ],
  },

  // 10. Hot Wheels 1:64 Scale Die-Cast Toy Racing Cars 5-Pack (Vehicles)
  {
    categoryPath: 'toys-games-hobbies/vehicles-ride-on-toys/toy-cars',
    productTypeSlug: 'toy-car',
    nameEn: 'Demo Hot Wheels 1:64 Scale Die-Cast Metal Supercars 5-Pack',
    nameBn: 'ডেমো হট হুইলস ১:৬৪ স্কেল ডাই-কাস্ট মেটাল সুপারকার ৫-প্যাক',
    slug: 'demo-toys-hot-wheels-diecast-5pack',
    sku: 'TY-HW-5PK-01',
    brand: 'Hot Wheels',
    manufacturer: 'Mattel, Inc.',
    shortDescriptionEn:
      'Collection of 5 authentic 1:64 scale die-cast sports vehicles with realistic rolling wheels and signature aerodynamic racing decos.',
    shortDescriptionBn:
      'আসল ডাই-কাস্ট মেটালে তৈরি হট হুইলস ৫টি রেসিং কারের কমপ্লিট সুপারকার গিফট সেট।',
    price: 950,
    compareAtPrice: 1100,
    stock: 55,
    unit: 'pack',
    isFeatured: false,
    specs: {
      'toys-age-group': '3–5 Years',
      'toys-material': 'Die-Cast Metal & ABS',
      'toys-choking-hazard': true,
      'toys-pack-size': 'Set of 5 Cars',
      'toys-country-of-origin': 'USA',
    },
    variants: [
      tv('Exotics Supercar 5-Pack', 'TY-HW-5PK-EXO', 950, 35),
      tv('Nightburnerz Speed 5-Pack', 'TY-HW-5PK-NGT', 950, 20),
    ],
  },

  // 11. Mercedes-Benz AMG 12V Electric Kids Ride-On Car (Vehicles & Ride-Ons)
  {
    categoryPath: 'toys-games-hobbies/vehicles-ride-on-toys/ride-on-cars',
    productTypeSlug: 'ride-on-car',
    nameEn: 'Demo Mercedes-Benz AMG G63 12V Battery Electric Kids Ride-On SUV with Remote',
    nameBn: 'ডেমো মার্সিডিজ-বেঞ্জ এএমজি ১২ ভোল্ট ব্যাটারি ইলেকট্রিক বাচ্চাদের রাইড-অন কার',
    slug: 'demo-toys-mercedes-electric-ride-on-car',
    sku: 'TY-MERC-RIDEON-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Licensed 12V rechargeable battery kids ride-on with leather seat, MP3 music player, spring suspension, and 2.4G parental override remote.',
    shortDescriptionBn:
      'অভিভাবকের জন্য ওয়্যারলেস রিমোট কন্ট্রোল এবং বাচ্চার সেলফ ড্রাইভ সুবিধা সমৃদ্ধ ১২ ভোল্ট রিচার্জেবল মার্সিডিজ এএমজি জিপ।',
    price: 18500,
    compareAtPrice: 21000,
    stock: 10,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '3–5 Years',
      'toys-min-age-years': 3,
      'toys-max-age-years': 8,
      'toys-max-weight-capacity-kg': 40,
      'toys-battery-required': true,
      'toys-battery-type': '12V Rechargeable Lead-Acid',
      'toys-operating-time-mins': 60,
      'toys-charging-time-mins': 360,
      'toys-rc-control-type': '2.4GHz Wireless Remote Controller',
      'toys-warranty': '6 Months Brand Warranty',
    },
    variants: [
      cv('Glossy Obsidian Black', 'TY-MERC-G63-BLK', 18500, 6),
      cv('Bright Alpine White', 'TY-MERC-G63-WHT', 18500, 4),
    ],
  },

  // 12. 3-Wheel Adjustable Height LED Light-Up Kids Kick Scooter (Vehicles)
  {
    categoryPath: 'toys-games-hobbies/vehicles-ride-on-toys/scooters',
    productTypeSlug: 'kids-scooter',
    nameEn: 'Demo 3-Wheel Adjustable Height LED Flashing Wheels Kids Kick Scooter',
    nameBn: 'ডেমো ৩-হুইল অ্যাডজাস্টেবল হাইট এলইডি লাইট বাচ্চাদের কিক স্কুটার',
    slug: 'demo-toys-3wheel-led-kick-scooter',
    sku: 'TY-SCOOT-3W-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Lean-to-steer balancing kick scooter with PU light-up wheels, anti-slip wide deck, rear foot brake, and 4 adjustable handlebar heights.',
    shortDescriptionBn:
      'চাকা ঘোরার সাথে সাথে এলইডি লাইট জ্বলে ওঠে, গ্রিপ ও ব্রেক সমৃদ্ধ বাচ্চাদের ব্যালান্সিং কিক স্কুটার।',
    price: 2650,
    compareAtPrice: 3100,
    stock: 30,
    unit: 'piece',
    isFeatured: false,
    specs: {
      'toys-age-group': '3–5 Years',
      'toys-min-age-years': 3,
      'toys-max-age-years': 10,
      'toys-max-weight-capacity-kg': 60,
      'toys-material': 'Reinforced Polyester Fabric',
      'toys-warranty': '1 Month Motor & Electronics Warranty',
    },
    variants: [
      cv('Electric Blue', 'TY-SCOOT-BLU', 2650, 15),
      cv('Vibrant Pink', 'TY-SCOOT-PNK', 2650, 10),
      cv('Neon Green', 'TY-SCOOT-GRN', 2650, 5),
    ],
  },

  // 13. Hasbro Gaming Monopoly Bangladesh Edition Board Game (Board Games)
  {
    categoryPath: 'toys-games-hobbies/board-games/family-games',
    productTypeSlug: 'board-game',
    nameEn: 'Demo Hasbro Gaming Monopoly Bangladesh Edition Property Trading Board Game',
    nameBn: 'ডেমো হ্যাজব্রো মনোপলি বাংলাদেশ এডিশন ফ্যামিলি বোর্ড গেম',
    slug: 'demo-toys-monopoly-bangladesh-edition',
    sku: 'TY-HAS-MONO-01',
    brand: 'Hasbro Gaming',
    manufacturer: 'Hasbro, Inc.',
    shortDescriptionEn:
      'Classic fast-dealing property trading game localized with famous Bangladeshi districts, Coxs Bazar, Sylhet, and Dhaka landmarks.',
    shortDescriptionBn:
      'ঢাকার ধানমন্ডি, গুলশান ও কক্সবাজারের জনপ্রিয় স্থান নিয়ে সাজানো সম্পূর্ণ বাংলা ও ইংরেজি দ্বিভাষিক অফিশিয়াল মনোপলি গেম।',
    price: 1850,
    compareAtPrice: 2200,
    stock: 45,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '8–12 Years',
      'toys-min-age-years': 8,
      'toys-game-players': '2–6 Players',
      'toys-game-playtime-mins': '60–90 Mins',
      'toys-game-type': 'Family Board Game',
      'toys-learning-area': 'Math & Numbers',
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Contains game tokens and dice. Not suitable for children under 3 years.',
    },
    variants: [
      tv('Monopoly Bangladesh Bilingual Edition', 'TY-HAS-MONO-BD', 1850, 35),
      tv('Monopoly Junior Kids Edition', 'TY-HAS-MONO-JR', 1550, 10),
    ],
  },

  // 14. Mattel UNO Classic Family Card Game (Board Games)
  {
    categoryPath: 'toys-games-hobbies/board-games/card-games',
    productTypeSlug: 'card-game',
    nameEn: 'Demo Mattel UNO Classic Family Card Game (112 Cards with Wild Cards)',
    nameBn: 'ডেমো ম্যাটেল ইউনো ক্লাসিক ফ্যামিলি কার্ড গেম (১১২টি কার্ড)',
    slug: 'demo-toys-uno-classic-card-game',
    sku: 'TY-MAT-UNO-01',
    brand: 'Mattel',
    manufacturer: 'Mattel, Inc.',
    shortDescriptionEn:
      'The worlds favorite number and color matching card game with Draw 4, Skip, Reverse, and customizable Wild Action Cards.',
    shortDescriptionBn:
      'বন্ধু ও পরিবারের সবাইকে নিয়ে খেলার জন্য বিশ্বের সবচেয়ে জনপ্রিয় রঙ ও সংখ্যার কার্ড ম্যাচিং গেম ইউনো।',
    price: 450,
    compareAtPrice: 550,
    stock: 120,
    unit: 'deck',
    isFeatured: true,
    specs: {
      'toys-age-group': '5–8 Years',
      'toys-min-age-years': 7,
      'toys-game-players': '2–10 Players',
      'toys-game-playtime-mins': '15–30 Mins',
      'toys-game-type': 'Card Game',
    },
    variants: [
      tv('UNO Classic Original', 'TY-MAT-UNO-STD', 450, 80),
      tv('UNO Flip Double-Sided Edition', 'TY-MAT-UNO-FLP', 650, 40),
    ],
  },

  // 15. Ravensburger 500-Piece World Map Educational Geography Jigsaw Puzzle (Puzzles)
  {
    categoryPath: 'toys-games-hobbies/puzzles/jigsaw-puzzles',
    productTypeSlug: 'jigsaw-puzzle',
    nameEn: 'Demo Ravensburger 500-Piece World Map Educational Geography Jigsaw Puzzle',
    nameBn: 'ডেমো রাভেন্সবার্গার ৫০০-পিস বিশ্ব মানচিত্র শিক্ষামূলক জিগস পাজল',
    slug: 'demo-toys-ravensburger-world-map-puzzle',
    sku: 'TY-RAV-MAP500-01',
    brand: 'Ravensburger',
    manufacturer: 'Ravensburger Verlag GmbH',
    shortDescriptionEn:
      'Premium Softclick technology precision-cut puzzle showing continental geography, oceans, landmarks, and national flags.',
    shortDescriptionBn:
      'নিখুঁত কাটিং এবং উচ্চমানের ভারী কার্ডবোর্ডে মুদ্রিত বিশ্বের মানচিত্র ও পতাকার ৫০০ পিসের শিক্ষামূলক জিগস পাজল।',
    price: 1950,
    compareAtPrice: 2300,
    stock: 30,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '8–12 Years',
      'toys-min-age-years': 9,
      'toys-puzzle-type': 'Jigsaw Puzzle',
      'toys-puzzle-pieces': 500,
      'toys-material': 'High-Density Cardboard',
      'toys-learning-area': 'Geography & Spatial Cognition',
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Choking Hazard: Small puzzle pieces.',
      'toys-country-of-origin': 'Germany',
    },
    variants: [
      pv('500 Pieces World Map', 'TY-RAV-500-MAP', 1950, 20),
      pv('1000 Pieces Solar System & Galaxy', 'TY-RAV-1000-SOL', 2850, 10),
    ],
  },

  // 16. ROKR 3D Mechanical Wooden Marble Run Construction Puzzle (Puzzles)
  {
    categoryPath: 'toys-games-hobbies/puzzles/3d-puzzles',
    productTypeSlug: '3d-puzzle',
    nameEn: 'Demo ROKR 3D Mechanical Wooden Marble Run Waterwheel Coaster Puzzle (254 Pcs)',
    nameBn: 'ডেমো রোকার থ্রি-ডি মেকানিক্যাল কাঠের মার্বেল রান পাজল (২৫৪ পিস)',
    slug: 'demo-toys-rokr-3d-wooden-marble-run',
    sku: 'TY-ROKR-MARBLE-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Laser-cut precision plywood mechanical puzzle with hand-cranked gear system that sends 10 steel marbles down spiral roller coaster tracks.',
    shortDescriptionBn:
      'কোন প্রকার আঠা ছাড়া নিখুঁত খাঁজে খাঁজে জোড়া লাগানোর মেকানিক্যাল হ্যান্ড-ক্র্যাংক কাঠের মার্বেল কোস্টার পাজল।',
    price: 2850,
    compareAtPrice: 3400,
    stock: 18,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '12+ Years',
      'toys-min-age-years': 12,
      'toys-puzzle-type': '3D Mechanical Wooden Puzzle',
      'toys-pieces': 254,
      'toys-assembly-required': true,
      'toys-material': 'Natural Solid Wood',
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Contains small steel balls and laser-cut wooden gears. Age 12+.',
      'toys-country-of-origin': 'Bangladesh',
    },
    variants: [
      tv('Waterwheel Coaster Marble Run', 'TY-ROKR-WTR-RUN', 2850, 12),
      tv('Cog Roller Marble Park', 'TY-ROKR-COG-PARK', 3250, 6),
    ],
  },

  // 17. Castle Kingdom Indoor & Outdoor Foldable Pop-Up Kids Play Tent (Outdoor Toys)
  {
    categoryPath: 'toys-games-hobbies/outdoor-toys/play-tents',
    productTypeSlug: 'play-tent',
    nameEn: 'Demo Castle Kingdom Pop-Up Foldable Indoor & Outdoor Kids Play Tent',
    nameBn: 'ডেমো ক্যাসেল কিংডম পপ-আপ ফোল্ডিং ইনডোর ও আউটডোর প্লে টেন্ট',
    slug: 'demo-toys-inflatable-kids-play-tent',
    sku: 'TY-TENT-CASTLE-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Breathable polyester pop-up castle with roll-up doorway, mesh windows for ventilation, and quick-fold compact carry bag.',
    shortDescriptionBn:
      'বাচ্চাদের ব্যক্তিগত খেলাধুলা ও কল্পনার রাজ্য গড়ে তোলার জন্য সহজে ভাঁজযোগ্য ক্যাসেল প্লে টেন্ট।',
    price: 1650,
    compareAtPrice: 1950,
    stock: 35,
    unit: 'piece',
    isFeatured: false,
    specs: {
      'toys-age-group': '2–3 Years',
      'toys-material': 'Reinforced Polyester Fabric',
      'toys-assembly-required': true,
      'toys-country-of-origin': 'Bangladesh',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      cv('Princess Pink Castle', 'TY-TENT-PNK-CST', 1650, 20),
      cv('Wizard Blue Castle', 'TY-TENT-BLU-CST', 1650, 15),
    ],
  },

  // 18. Kids 120-Piece Deluxe Art Drawing & Water Color Painting Studio Kit (Arts & Crafts)
  {
    categoryPath: 'toys-games-hobbies/arts-crafts-toys/painting-kits',
    productTypeSlug: 'art-kit',
    nameEn: 'Demo Deluxe Kids 120-Piece Art Studio Drawing & Water Color Painting Wooden Box',
    nameBn: 'ডেমো ডিলাক্স ১২০-পিস আর্ট স্টুডিও ড্রয়িং ও ওয়াটার কালার পেইন্টিং বক্স',
    slug: 'demo-toys-deluxe-kids-art-painting-set',
    sku: 'TY-ART-120PC-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Comprehensive art set containing 24 oil pastels, 24 colored pencils, 24 watercolor cakes, brushes, sketch pencils, eraser, and ruler in a mahogany-style wooden carry case.',
    shortDescriptionBn:
      'তেল রঙ, প্যাস্টেল, জলরং, ব্রাশ এবং স্কেচ সামগ্রী সম্বলিত কাঠের বাক্সে সুসজ্জিত ১২০ পিসের আর্ট স্টুডিও সেট।',
    price: 1850,
    compareAtPrice: 2200,
    stock: 40,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '5–8 Years',
      'toys-pieces': 120,
      'toys-washable-non-toxic': '100% Non-Toxic & Washable',
      'toys-safety-certification': 'EN71 European Safety Standard',
      'toys-learning-area': 'Creative Arts',
      'toys-country-of-origin': 'Bangladesh',
    },
    variants: [
      pv('120-Piece Wooden Case', 'TY-ART-120-WDN', 1850, 25),
      pv('168-Piece Studio Mega Set', 'TY-ART-168-MGA', 2550, 15),
    ],
  },

  // 19. Play-Doh Modeling Compound 12-Color Creative Starter Pack (Arts & Crafts)
  {
    categoryPath: 'toys-games-hobbies/arts-crafts-toys/clay-modeling',
    productTypeSlug: 'clay-kit',
    nameEn: 'Demo Play-Doh Modeling Compound 12-Color Creative Non-Toxic Dough Starter Pack',
    nameBn: 'ডেমো প্লে-ডো ১২-কালার ক্রিয়েটিভ নন-টক্সিক মডেলিং ডো স্টার্টার প্যাক',
    slug: 'demo-toys-play-doh-creative-dough-set',
    sku: 'TY-HAS-DOH12-01',
    brand: 'Play-Doh',
    manufacturer: 'Hasbro, Inc.',
    shortDescriptionEn:
      '12 vibrant 4-ounce cans of squishy, non-toxic Play-Doh modeling compound for sculpting, rolling, shaping, and open-ended creative fun.',
    shortDescriptionBn:
      'শিশুর হাতের মোটর স্কিল ও কল্পনাশক্তির বিকাশে ১২টি আকর্ষণীয় রঙের ১০০% নন-টক্সিক ও নিরাপদ প্লে-ডো ক্লে সেট।',
    price: 1350,
    compareAtPrice: 1600,
    stock: 50,
    unit: 'pack',
    isFeatured: false,
    specs: {
      'toys-age-group': '2–3 Years',
      'toys-pieces': 12,
      'toys-material': 'Non-Toxic Modeling Dough',
      'toys-washable-non-toxic': 'Non-Toxic Washable Dough',
      'toys-safety-certification': 'ASTM F963 US Standard',
      'toys-choking-hazard': false,
    },
    variants: [
      pv('12-Color Rainbow Cans (48 oz total)', 'TY-HAS-DOH-12CAN', 1350, 35),
      pv('24-Color Rainbow Mega Pack', 'TY-HAS-DOH-24CAN', 2450, 15),
    ],
  },

  // 20. Casio SA-46 Mini 32-Key Educational Electronic Keyboard (Musical Toys)
  {
    categoryPath: 'toys-games-hobbies/musical-toys/toy-keyboard',
    productTypeSlug: 'toy-keyboard',
    nameEn: 'Demo Casio SA-46 Mini 32-Key Educational Electronic Musical Keyboard',
    nameBn: 'ডেমো ক্যাসিও এসএ-৪৬ মিনি ৩২-কি শিক্ষামূলক ইলেকট্রনিক কীবোর্ড',
    slug: 'demo-toys-casio-mini-electronic-keyboard',
    sku: 'TY-CASIO-SA46-01',
    brand: 'Casio',
    manufacturer: 'Casio Computer Co., Ltd.',
    shortDescriptionEn:
      '32 mini keys ideal for small fingers, 100 tones, 50 rhythms, 10 built-in songs, clear LCD screen, and 5 percussion drum pads.',
    shortDescriptionBn:
      'শিশুদের আঙুলের উপযোগী ৩২টি মিনি কি, ১০০টি সাউন্ড টোন এবং ৫টি ড্রাম প্যাড সমৃদ্ধ বিশ্বস্ত ক্যাসিও ইলেকট্রনিক কীবোর্ড।',
    price: 4950,
    compareAtPrice: 5600,
    stock: 15,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '3–5 Years',
      'toys-battery-required': true,
      'toys-battery-type': 'AA Batteries',
      'toys-learning-area': 'Sensory Development',
      'toys-material': 'BPA-Free ABS Plastic',
      'toys-warranty': '1 Year Service Warranty',
      'toys-country-of-origin': 'Japan',
    },
    variants: [
      tv('Casio SA-46 (Green Back Base)', 'TY-CASIO-SA46', 4950, 10),
      tv('Casio SA-47 (Orange Back Base)', 'TY-CASIO-SA47', 4950, 5),
    ],
  },

  // 21. Kids Deluxe Cooking Kitchen Play Set with Real Steam, Light & Sound 42-Pcs (Pretend Play)
  {
    categoryPath: 'toys-games-hobbies/pretend-play/kitchen-sets',
    productTypeSlug: 'pretend-kitchen-set',
    nameEn: 'Demo Kids Deluxe Cooking Kitchen Play Set with Real Steam, Water Sink & Sound (42 Pcs)',
    nameBn: 'ডেমো বাচ্চাদের ৪২-পিস ডিলাক্স কিচেন প্লে সেট (বাষ্প, সাউন্ড ও ওয়াটার সিঙ্ক সহ)',
    slug: 'demo-toys-deluxe-chef-kitchen-playset',
    sku: 'TY-KIT-STEAM-01',
    brand: 'Monalisa Craft & Toy BD',
    manufacturer: 'Monalisa Enterprise Bangladesh',
    shortDescriptionEn:
      'Interactive standing kitchen set with working running water faucet, realistic cooking steam, boiling sound burner, utensils, pots, and play food.',
    shortDescriptionBn:
      'আসল রান্নার শব্দ, বাষ্প এবং চালু পানির সিঙ্ক সমৃদ্ধ ৪২ পিসের আকর্ষণীয় ও বাস্তবমুখী বাচ্চাদের কিচেন সেট।',
    price: 3650,
    compareAtPrice: 4200,
    stock: 20,
    unit: 'box',
    isFeatured: true,
    specs: {
      'toys-age-group': '3–5 Years',
      'toys-pieces': 42,
      'toys-material': 'BPA-Free ABS Plastic',
      'toys-battery-required': true,
      'toys-battery-type': 'AA Batteries',
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Contains small plastic food and cutlery. Adult supervision recommended.',
      'toys-safety-certification': 'CE Certified',
      'toys-warranty': '7 Days Replacement Warranty',
    },
    variants: [
      cv('Pastel Pink & White', 'TY-KIT-42-PNK', 3650, 12),
      cv('Nordic Aqua Blue', 'TY-KIT-42-BLU', 3650, 8),
    ],
  },

  // 22. Little Medic 18-Piece Realistic Kids Doctor Pretend Play Medical Case (Pretend Play)
  {
    categoryPath: 'toys-games-hobbies/pretend-play/doctor-sets',
    productTypeSlug: 'pretend-kitchen-set',
    nameEn: 'Demo Little Medic 18-Piece Realistic Kids Doctor Pretend Play Medical Briefcase',
    nameBn: 'ডেমো লিটল মেডিক ১৮-পিস বাচ্চাদের ডক্টর প্লে মেডিকেল ব্রিফকেস',
    slug: 'demo-toys-little-medic-doctor-playset',
    sku: 'TY-DOC-CASE-01',
    brand: 'Funskool',
    manufacturer: 'Funskool India Ltd.',
    shortDescriptionEn:
      'Roleplay medical kit with glowing electronic stethoscope, heartbeat sound, blood pressure cuff, syringe, thermometer, and portable carry case.',
    shortDescriptionBn:
      'হার্টবিট সাউন্ড ও লাইট সমৃদ্ধ স্টেথোস্কোপ, থার্মোমিটার ও সিরিঞ্জ সহ সহজে বহনযোগ্য ১৮ পিসের ডক্টর কিট।',
    price: 1550,
    compareAtPrice: 1850,
    stock: 40,
    unit: 'case',
    isFeatured: false,
    specs: {
      'toys-age-group': '3–5 Years',
      'toys-pieces': 18,
      'toys-material': 'BPA-Free ABS Plastic',
      'toys-battery-required': true,
      'toys-battery-type': 'Button Cell LR44/CR2032',
      'toys-choking-hazard': true,
      'toys-safety-warning': 'Choking Hazard: Small medical caps and parts.',
      'toys-safety-certification': 'EN71 European Safety Standard',
      'toys-country-of-origin': 'India',
    },
    variants: [
      cv('Doctor Teal Blue Case', 'TY-DOC-18-BLU', 1550, 25),
      cv('Nurse Rose Pink Case', 'TY-DOC-18-PNK', 1550, 15),
    ],
  },
];

/**
 * Toys, Games & Hobbies vertical definition.
 */
export const TOYS_VERTICAL: SeedVertical = {
  key: 'toys',
  root: TOYS_TAXONOMY,
  attributes: TOYS_ATTRIBUTES,
  brands: TOYS_BRANDS,
  manufacturers: TOYS_MANUFACTURERS,
  products: TOYS_PRODUCTS,
};
