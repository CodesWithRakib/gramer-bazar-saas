import { AttributeDataType } from '../../catalog/enums/attribute-data-type.enum.js';
import type {
  SeedAttribute,
  SeedAttributeOption,
  SeedBrand,
  SeedProductType,
  SeedTaxonomyNode,
  SeedVertical,
  SeedVerticalVariant,
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

/** Capacity variant for appliances / cookware */
const cv = (
  capacity: string,
  sku: string,
  price: number,
  stock: number,
  color?: string,
): SeedVerticalVariant => ({
  nameEn: color ? `${capacity} / ${color}` : capacity,
  nameBn: color ? `${capacity} / ${color}` : capacity,
  sku,
  price,
  stock,
  attributes: {
    'home-capacity': capacity,
    ...(color ? { 'home-color': color } : {}),
  },
});

/** Size / Pack variant for bedding, furniture, or home essentials */
const pv = (
  sizeOrPack: string,
  sku: string,
  price: number,
  stock: number,
  color?: string,
): SeedVerticalVariant => ({
  nameEn: color ? `${sizeOrPack} / ${color}` : sizeOrPack,
  nameBn: color ? `${sizeOrPack} / ${color}` : sizeOrPack,
  sku,
  price,
  stock,
  attributes: {
    'home-pack-size': sizeOrPack,
    ...(color ? { 'home-color': color } : {}),
  },
});

/**
 * Universal Home & Kitchen attributes.
 *
 * Material, capacity, dimensions, power, warranty, room, and pack size
 * are structured attributes — never categories — preventing category explosion.
 */
export const HOME_KITCHEN_ATTRIBUTES: SeedAttribute[] = [
  {
    slug: 'home-material',
    nameEn: 'Primary Material',
    nameBn: 'প্রধান উপাদান',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Stainless Steel',
      'Aluminum',
      'Cast Iron',
      'Non-Stick Granite',
      'Glass',
      'Ceramic',
      'Porcelain',
      'Plastic',
      'Silicone',
      'Wood',
      'Bamboo',
      'Cotton',
      'Polyester',
      'Microfiber',
      'Leather',
      'Marble',
    ),
  },
  {
    slug: 'home-capacity',
    nameEn: 'Capacity / Volume',
    nameBn: 'ধারণক্ষমতা / ধারণভলিউম',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      '500 ml',
      '750 ml',
      '1 L',
      '1.2 L',
      '1.5 L',
      '1.8 L',
      '2.2 L',
      '2.8 L',
      '5 L',
      '8 L',
      '8 kg',
      '10 kg',
      '220 L',
      '250 L',
    ),
  },
  {
    slug: 'home-dimensions',
    nameEn: 'Dimensions / Diameter',
    nameBn: 'মাত্রা / ব্যাস',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '20 cm',
      '24 cm',
      '28 cm',
      '32 cm',
      '120 × 60 × 75 cm',
      '150 × 80 × 75 cm',
      'Queen: 228 × 254 cm',
      'King: 254 × 274 cm',
    ),
  },
  {
    slug: 'home-power',
    nameEn: 'Power Consumption',
    nameBn: 'বিদ্যুৎ খরচ / ওয়াট',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('12W', '40W', '75W', '250W', '500W', '750W', '1000W', '1200W', '1500W', '1800W', '2000W'),
  },
  {
    slug: 'home-voltage',
    nameEn: 'Voltage',
    nameBn: 'ভোল্টেজ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('220-240V', '110-120V'),
  },
  {
    slug: 'home-energy-rating',
    nameEn: 'Energy Rating',
    nameBn: 'এনার্জি রেটিং',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('3 Star', '4 Star', '5 Star', 'Inverter Class A+++'),
  },
  {
    slug: 'home-room',
    nameEn: 'Usage Room / Space',
    nameBn: 'ব্যবহারের স্থান',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Kitchen',
      'Dining Room',
      'Living Room',
      'Bedroom',
      'Bathroom',
      'Home Office',
      'Balcony',
      'Outdoor',
    ),
  },
  {
    slug: 'home-finish',
    nameEn: 'Surface Finish',
    nameBn: 'সারফেস ফিনিশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Matte', 'Glossy', 'Polished', 'Wood Grain', 'Brushed', 'Textured'),
  },
  {
    slug: 'home-assembly',
    nameEn: 'Assembly Required',
    nameBn: 'অ্যাসেম্বলি প্রয়োজন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Pre-Assembled', 'Assembly Required', 'Tool-Free DIY Assembly'),
  },
  {
    slug: 'home-warranty',
    nameEn: 'Warranty Period',
    nameBn: 'ওয়ারেন্টি মেয়াদ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'No Warranty',
      '6 Months',
      '1 Year',
      '2 Years',
      '3 Years',
      '5 Years',
      '10 Years Motor Warranty',
    ),
  },
  {
    slug: 'home-pack-size',
    nameEn: 'Pack Size / Set Quantity',
    nameBn: 'প্যাক সাইজ / সেটের পরিমাণ',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      '1 Piece',
      '2 Pieces',
      '3-Piece Set',
      '4 Pieces',
      '6-Piece Set',
      '12-Piece Set',
      '24-Piece Dinner Set',
      'Single Pack',
      'Value Pack of 3',
    ),
  },
  {
    slug: 'home-bed-size',
    nameEn: 'Bedding Size',
    nameBn: 'বিছানার মাপ',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt('Single', 'Semi Double', 'Double', 'Queen', 'King'),
  },
  {
    slug: 'home-color',
    nameEn: 'Color',
    nameBn: 'রঙ',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: swatchOpt([
      ['Black', '#1a1a1a'],
      ['White', '#ffffff'],
      ['Silver', '#c0c0c0'],
      ['Grey', '#757575'],
      ['Red', '#b31b2c'],
      ['Navy Blue', '#1a237e'],
      ['Natural Wood', '#d7c4a3'],
      ['Walnut Brown', '#5c4033'],
      ['Beige', '#f5f5dc'],
      ['Gold', '#d4af37'],
    ]),
  },
  {
    slug: 'home-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎস দেশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Bangladesh', 'India', 'China', 'Japan', 'France', 'Germany', 'USA', 'Malaysia'),
  },
];

const COMMON_APPLIANCE_ATTRS = [
  'home-power',
  'home-voltage',
  'home-capacity',
  'home-warranty',
  'home-material',
  'home-color',
  'home-energy-rating',
  'home-country-of-origin',
];

const COMMON_COOKWARE_ATTRS = [
  'home-material',
  'home-dimensions',
  'home-capacity',
  'home-finish',
  'home-color',
  'home-country-of-origin',
];

const COMMON_FURNITURE_ATTRS = [
  'home-material',
  'home-dimensions',
  'home-room',
  'home-finish',
  'home-assembly',
  'home-color',
  'home-warranty',
  'home-country-of-origin',
];

const COMMON_BEDDING_ATTRS = [
  'home-material',
  'home-bed-size',
  'home-dimensions',
  'home-color',
  'home-pack-size',
  'home-country-of-origin',
];

export const HOME_KITCHEN_TAXONOMY: SeedTaxonomyNode = {
  slug: 'home-kitchen',
  nameEn: 'Home & Kitchen',
  nameBn: 'হোম ও কিচেন',
  icon: '🏠',
  descriptionEn: 'Cookware, kitchen appliances, home electronics, furniture, bedding and household essentials.',
  descriptionBn: 'রান্নাঘরের সামগ্রী, হোম অ্যাপ্লায়েন্স, আসবাবপত্র, বেডিং ও গৃহস্থালির দরকারি পণ্য।',
  children: [
    // ----------------- 1. Kitchen & Dining -----------------
    {
      slug: 'home-kitchen-dining',
      nameEn: 'Kitchen & Dining',
      nameBn: 'রান্নাঘর ও ডাইনিং',
      icon: '🍳',
      children: [
        {
          slug: 'home-cookware',
          nameEn: 'Cookware & Pans',
          nameBn: 'রান্নার পাত্র ও প্যান',
          productTypes: [
            pt('home-cookware', COMMON_COOKWARE_ATTRS, 'Cookware & Frying Pan', 'রান্নার পাত্র ও ফ্রাই প্যান'),
          ],
        },
        {
          slug: 'home-dinnerware',
          nameEn: 'Dinnerware & Sets',
          nameBn: 'ডিনার সেট ও প্লেট',
          productTypes: [
            pt(
              'home-dinnerware',
              ['home-material', 'home-pack-size', 'home-color', 'home-country-of-origin'],
              'Dinner Set',
              'ডিনার সেট',
            ),
          ],
        },
        {
          slug: 'home-water-bottles',
          nameEn: 'Water Bottles & Flasks',
          nameBn: 'পানির বোতল ও ফ্লাস্ক',
          productTypes: [
            pt(
              'home-waterbottle',
              ['home-capacity', 'home-material', 'home-color', 'home-country-of-origin'],
              'Water Bottle & Flask',
              'পানির বোতল ও ফ্লাস্ক',
            ),
          ],
        },
        {
          slug: 'home-food-storage',
          nameEn: 'Food Storage & Containers',
          nameBn: 'ফুড স্টোরেজ ও কন্টেইনার',
          productTypes: [
            pt(
              'home-container',
              ['home-capacity', 'home-pack-size', 'home-material', 'home-country-of-origin'],
              'Storage Container',
              'স্টোরেজ কন্টেইনার',
            ),
          ],
        },
      ],
    },

    // ----------------- 2. Kitchen Appliances -----------------
    {
      slug: 'home-kitchen-appliances',
      nameEn: 'Kitchen Appliances',
      nameBn: 'রান্নাঘরের যন্ত্রপাতি',
      icon: '⚡',
      children: [
        {
          slug: 'home-rice-cooker',
          nameEn: 'Rice Cookers',
          nameBn: 'রাইস কুকার',
          productTypes: [
            pt('home-ricecooker', COMMON_APPLIANCE_ATTRS, 'Rice Cooker', 'রাইস কুকার'),
          ],
        },
        {
          slug: 'home-electric-kettle',
          nameEn: 'Electric Kettles',
          nameBn: 'ইলেকট্রিক কেটলি',
          productTypes: [
            pt('home-electrickettle', COMMON_APPLIANCE_ATTRS, 'Electric Kettle', 'ইলেকট্রিক কেটলি'),
          ],
        },
        {
          slug: 'home-blender-grinder',
          nameEn: 'Blenders & Grinders',
          nameBn: 'ব্লেন্ডার ও গ্রাইন্ডার',
          productTypes: [
            pt('home-blender', COMMON_APPLIANCE_ATTRS, 'Blender & Grinder', 'ব্লেন্ডার ও গ্রাইন্ডার'),
          ],
        },
        {
          slug: 'home-microwave-oven',
          nameEn: 'Microwave & Electric Ovens',
          nameBn: 'মাইক্রোওয়েভ ও ওভেন',
          productTypes: [
            pt('home-microwave', COMMON_APPLIANCE_ATTRS, 'Microwave Oven', 'মাইক্রোওয়েভ ওভেন'),
          ],
        },
        {
          slug: 'home-air-fryer',
          nameEn: 'Air Fryers',
          nameBn: 'এয়ার ফ্রায়ার',
          productTypes: [
            pt('home-airfryer', COMMON_APPLIANCE_ATTRS, 'Air Fryer', 'এয়ার ফ্রায়ার'),
          ],
        },
      ],
    },

    // ----------------- 3. Home Appliances -----------------
    {
      slug: 'home-home-appliances',
      nameEn: 'Home Appliances',
      nameBn: 'গৃহস্থালি যন্ত্রপাতি',
      icon: '❄️',
      children: [
        {
          slug: 'home-fans',
          nameEn: 'Electric Fans',
          nameBn: 'ফ্যান',
          productTypes: [
            pt('home-fan', COMMON_APPLIANCE_ATTRS, 'Electric Fan', 'বৈদ্যুতিক ফ্যান'),
          ],
        },
        {
          slug: 'home-refrigerators',
          nameEn: 'Refrigerators & Freezers',
          nameBn: 'রেফ্রিজারেটর ও ফ্রিজ',
          productTypes: [
            pt('home-refrigerator', COMMON_APPLIANCE_ATTRS, 'Refrigerator', 'রেফ্রিজারেটর'),
          ],
        },
        {
          slug: 'home-washing-machines',
          nameEn: 'Washing Machines',
          nameBn: 'ওয়াশিং মেশিন',
          productTypes: [
            pt('home-washingmachine', COMMON_APPLIANCE_ATTRS, 'Washing Machine', 'ওয়াশিং মেশিন'),
          ],
        },
        {
          slug: 'home-irons',
          nameEn: 'Electric Irons',
          nameBn: 'ইস্ত্রি',
          productTypes: [
            pt('home-iron', COMMON_APPLIANCE_ATTRS, 'Electric Iron', 'ইস্ত্রি'),
          ],
        },
      ],
    },

    // ----------------- 4. Home Decor -----------------
    {
      slug: 'home-decor',
      nameEn: 'Home Decor',
      nameBn: 'গৃহসজ্জা',
      icon: '🖼️',
      children: [
        {
          slug: 'home-wall-decor',
          nameEn: 'Wall Decor & Clocks',
          nameBn: 'দেয়াল সজ্জা ও ঘড়ি',
          productTypes: [
            pt(
              'home-walldecor',
              ['home-material', 'home-dimensions', 'home-room', 'home-color'],
              'Wall Decor & Clock',
              'দেয়াল সজ্জা ও ঘড়ি',
            ),
          ],
        },
        {
          slug: 'home-vases-plants',
          nameEn: 'Vases & Artificial Plants',
          nameBn: 'ফুলদানি ও কৃত্রিম গাছ',
          productTypes: [
            pt(
              'home-vase',
              ['home-material', 'home-dimensions', 'home-room', 'home-color'],
              'Vase & Decor Plant',
              'ফুলদানি ও ডেকোরেশন গাছ',
            ),
          ],
        },
      ],
    },

    // ----------------- 5. Furniture -----------------
    {
      slug: 'home-furniture',
      nameEn: 'Furniture',
      nameBn: 'আসবাবপত্র',
      icon: '🪑',
      children: [
        {
          slug: 'home-tables-desks',
          nameEn: 'Tables & Desks',
          nameBn: 'টেবিল ও ডেস্ক',
          productTypes: [pt('home-table', COMMON_FURNITURE_ATTRS, 'Table & Desk', 'টেবিল ও ডেস্ক')],
        },
        {
          slug: 'home-chairs',
          nameEn: 'Chairs & Stools',
          nameBn: 'চেয়ার ও টুল',
          productTypes: [pt('home-chair', COMMON_FURNITURE_ATTRS, 'Chair & Stool', 'চেয়ার ও টুল')],
        },
        {
          slug: 'home-shelves-cabinets',
          nameEn: 'Shelves & Storage Cabinets',
          nameBn: 'তাক ও কেবিনেট',
          productTypes: [
            pt('home-cabinet', COMMON_FURNITURE_ATTRS, 'Shelf & Cabinet', 'তাক ও কেবিনেট'),
          ],
        },
      ],
    },

    // ----------------- 6. Bedding & Bath -----------------
    {
      slug: 'home-bedding-bath',
      nameEn: 'Bedding & Bath',
      nameBn: 'বেডিং ও বাথ',
      icon: '🛏️',
      children: [
        {
          slug: 'home-bedsheets',
          nameEn: 'Bedsheets & Pillow Covers',
          nameBn: 'বিছানার চাদর ও কভার',
          productTypes: [pt('home-bedsheet', COMMON_BEDDING_ATTRS, 'Bedsheet Set', 'বিছানার চাদর সেট')],
        },
        {
          slug: 'home-blankets',
          nameEn: 'Blankets & Comforters',
          nameBn: 'কম্বল ও কমফোর্টার',
          productTypes: [pt('home-blanket', COMMON_BEDDING_ATTRS, 'Blanket & Comforter', 'কম্বল ও কমফোর্টার')],
        },
        {
          slug: 'home-towels',
          nameEn: 'Bath Towels & Mats',
          nameBn: 'তোয়ালে ও বাথ ম্যাট',
          productTypes: [
            pt(
              'home-towel',
              ['home-material', 'home-dimensions', 'home-pack-size', 'home-color'],
              'Bath Towel',
              'গোসলের তোয়ালে',
            ),
          ],
        },
        {
          slug: 'home-curtains',
          nameEn: 'Curtains & Drapes',
          nameBn: 'পর্দা',
          productTypes: [
            pt(
              'home-curtain',
              ['home-material', 'home-dimensions', 'home-room', 'home-color', 'home-pack-size'],
              'Curtain',
              'পর্দা',
            ),
          ],
        },
      ],
    },

    // ----------------- 7. Cleaning & Laundry -----------------
    {
      slug: 'home-cleaning-laundry',
      nameEn: 'Cleaning & Laundry',
      nameBn: 'পরিচ্ছন্নতা ও লন্ড্রি',
      icon: '🧹',
      children: [
        {
          slug: 'home-mops-brooms',
          nameEn: 'Mops, Brooms & Brushes',
          nameBn: 'মপ, ঝাড়ু ও ব্রাশ',
          productTypes: [
            pt(
              'home-mop',
              ['home-material', 'home-color', 'home-pack-size', 'home-country-of-origin'],
              'Cleaning Mop & Broom',
              'মপ ও ঝাড়ু',
            ),
          ],
        },
        {
          slug: 'home-laundry-baskets',
          nameEn: 'Laundry Baskets & Dryers',
          nameBn: 'লন্ড্রি ঝুড়ি ও ড্রায়ার',
          productTypes: [
            pt(
              'home-laundry',
              ['home-material', 'home-capacity', 'home-color'],
              'Laundry Basket',
              'লন্ড্রি ঝুড়ি',
            ),
          ],
        },
      ],
    },

    // ----------------- 8. Storage & Organization -----------------
    {
      slug: 'home-storage-org',
      nameEn: 'Storage & Organization',
      nameBn: 'স্টোরেজ ও অর্গানাইজার',
      icon: '📦',
      children: [
        {
          slug: 'home-storage-boxes',
          nameEn: 'Storage Boxes & Baskets',
          nameBn: 'স্টোরেজ বক্স ও ঝুড়ি',
          productTypes: [
            pt(
              'home-storagebox',
              ['home-material', 'home-capacity', 'home-dimensions', 'home-color', 'home-pack-size'],
              'Storage Box',
              'স্টোরেজ বক্স',
            ),
          ],
        },
        {
          slug: 'home-shoe-racks',
          nameEn: 'Shoe Racks & Wardrobes',
          nameBn: 'জুতার র‍্যাক ও ওয়ারড্রব',
          productTypes: [
            pt(
              'home-shoerack',
              ['home-material', 'home-capacity', 'home-dimensions', 'home-color', 'home-assembly'],
              'Shoe Rack',
              'জুতার র‍্যাক',
            ),
          ],
        },
      ],
    },

    // ----------------- 9. Lighting -----------------
    {
      slug: 'home-lighting',
      nameEn: 'Lighting & Lamps',
      nameBn: 'লাইটিং ও আলোকসজ্জা',
      icon: '💡',
      children: [
        {
          slug: 'home-led-bulbs',
          nameEn: 'LED Bulbs & Tube Lights',
          nameBn: 'এলইডি বাল্ব ও টিউব লাইট',
          productTypes: [
            pt(
              'home-ledbulb',
              ['home-power', 'home-voltage', 'home-pack-size', 'home-warranty', 'home-country-of-origin'],
              'LED Bulb',
              'এলইডি বাল্ব',
            ),
          ],
        },
        {
          slug: 'home-lamps',
          nameEn: 'Table Lamps & Ceiling Lights',
          nameBn: 'টেবিল ল্যাম্প ও সিলিং লাইট',
          productTypes: [
            pt(
              'home-lamp',
              ['home-power', 'home-room', 'home-material', 'home-color', 'home-warranty'],
              'Lamp & Light Fixture',
              'ল্যাম্প ও লাইট',
            ),
          ],
        },
      ],
    },

    // ----------------- 10. Home Improvement -----------------
    {
      slug: 'home-improvement',
      nameEn: 'Home Improvement & Tools',
      nameBn: 'হোম ইমপ্রুভমেন্ট ও টুলস',
      icon: '🔧',
      children: [
        {
          slug: 'home-hardware-tools',
          nameEn: 'Hardware & Hand Tools',
          nameBn: 'হার্ডওয়্যার ও হ্যান্ড টুল',
          productTypes: [
            pt(
              'home-hardware',
              ['home-material', 'home-pack-size', 'home-country-of-origin'],
              'Hand Tool & Hardware',
              'হ্যান্ড টুল ও হার্ডওয়্যার',
            ),
          ],
        },
        {
          slug: 'home-bathroom-fixtures',
          nameEn: 'Bathroom Fixtures & Hooks',
          nameBn: 'বাথরুম ফিটিংস ও হুক',
          productTypes: [
            pt(
              'home-bathfixture',
              ['home-material', 'home-finish', 'home-color', 'home-pack-size'],
              'Bathroom Fixture',
              'বাথরুম ফিটিংস',
            ),
          ],
        },
      ],
    },
  ],
};

export const HOME_KITCHEN_BRANDS: SeedBrand[] = [
  // Local Leaders & Manufacturers
  { name: 'Walton' },
  { name: 'Vision' },
  { name: 'RFL' },
  { name: 'Gazi' },
  { name: 'Regal' },
  { name: 'Kiam' },
  { name: 'Singer' },
  { name: 'Minister' },
  { name: 'Hatil' },
  { name: 'Otobi' },
  { name: 'Bengal' },
  { name: 'Pran Plastics' },
  // Leading Global Brands
  { name: 'Philips' },
  { name: 'Panasonic' },
  { name: 'Prestige' },
  { name: 'Hawkins' },
  { name: 'Tefal' },
  { name: 'Havells' },
  { name: 'LG' },
  { name: 'Samsung' },
];

export const HOME_KITCHEN_PRODUCTS: SeedVertical['products'] = [
  // 1. Kitchen Appliance: Walton Smart Inverter Rice Cooker (Variants: 1.8 L, 2.8 L)
  {
    categoryPath: 'home-kitchen/home-kitchen-appliances/home-rice-cooker',
    productTypeSlug: 'home-ricecooker',
    nameEn: 'Demo Walton Smart Non-Stick Automatic Rice Cooker',
    nameBn: 'ডেমো ওয়ালটন স্মার্ট নন-স্টিক অটোমেটিক রাইস কুকার',
    slug: 'demo-home-walton-rice-cooker',
    sku: 'HM-RC-WLT-01',
    brand: 'Walton',
    shortDescriptionEn:
      'High-efficiency automatic electric rice cooker with dual warm & cook modes and durable non-stick inner pot.',
    shortDescriptionBn:
      'ডুয়াল অটো-কুক ও কিপ-ওয়ার্ম সুবিধা সমৃদ্ধ নন-স্টিক টেকসই ইলেকট্রিক রাইস কুকার।',
    price: 2450,
    stock: 90,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'home-power': '750W',
      'home-voltage': '220-240V',
      'home-material': 'Stainless Steel',
      'home-warranty': '2 Years',
      'home-energy-rating': '4 Star',
      'home-country-of-origin': 'Bangladesh',
    },
    variants: [
      cv('1.8 L', 'HM-RC-WLT-18L', 2450, 50, 'White'),
      cv('2.8 L', 'HM-RC-WLT-28L', 3150, 40, 'White'),
    ],
  },

  // 2. Kitchen Appliance: Philips Daily Collection Electric Kettle (Variants: 1.5 L Black, 1.5 L White)
  {
    categoryPath: 'home-kitchen/home-kitchen-appliances/home-electric-kettle',
    productTypeSlug: 'home-electrickettle',
    nameEn: 'Demo Philips Daily Collection Fast-Boil Electric Kettle 1.5L',
    nameBn: 'ডেমো ফিলিপস ফাস্ট-বয়েল ইলেকট্রিক কেটলি ১.৫ লিটার',
    slug: 'demo-home-philips-electric-kettle',
    sku: 'HM-KT-PHL-01',
    brand: 'Philips',
    shortDescriptionEn:
      'Fast water boiling with food-grade stainless steel body, multi-safety system and 360-degree cordless pirouette base.',
    shortDescriptionBn:
      'ফুড-গ্রেড স্টেইনলেস স্টিল ও ৩৬০ ডিগ্রি কর্ডলেস বেসযুক্ত দ্রুত পানি ফুটানোর নিরাপদ কেটলি।',
    price: 2850,
    stock: 110,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'home-capacity': '1.5 L',
      'home-power': '1800W',
      'home-voltage': '220-240V',
      'home-material': 'Stainless Steel',
      'home-warranty': '2 Years',
      'home-country-of-origin': 'China',
    },
    variants: [
      cv('1.5 L', 'HM-KT-PHL-BLK', 2850, 60, 'Black'),
      cv('1.5 L', 'HM-KT-PHL-WHT', 2850, 50, 'White'),
    ],
  },

  // 3. Cookware: Kiam Classic Die-Cast Non-Stick Frying Pan (Variants: 24 cm, 28 cm)
  {
    categoryPath: 'home-kitchen/home-kitchen-dining/home-cookware',
    productTypeSlug: 'home-cookware',
    nameEn: 'Demo Kiam Classic Die-Cast Granite Non-Stick Frying Pan',
    nameBn: 'ডেমো কিয়াম ক্লাসিক ডাই-কাস্ট গ্রানাইট নন-স্টিক ফ্রাইং প্যান',
    slug: 'demo-home-kiam-frying-pan',
    sku: 'HM-CW-KIM-01',
    brand: 'Kiam',
    shortDescriptionEn:
      'Heavy-duty die-cast aluminum fry pan with 5-layer scratch-resistant granite non-stick coating and induction bottom.',
    shortDescriptionBn:
      'ইনডাকশন বটম ও ৫-লেয়ার স্ক্র্যাচ-প্রতিরোধী গ্রানাইট কোটিংযুক্ত মজবুত ফ্রাইং প্যান।',
    price: 1150,
    stock: 140,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'home-material': 'Non-Stick Granite',
      'home-finish': 'Matte',
      'home-color': 'Black',
      'home-warranty': '1 Year',
      'home-country-of-origin': 'Bangladesh',
    },
    variants: [
      pv('24 cm', 'HM-CW-KIM-24CM', 1150, 80, 'Black'),
      pv('28 cm', 'HM-CW-KIM-28CM', 1450, 60, 'Black'),
    ],
  },

  // 4. Kitchen Appliance: Panasonic Super Mixer Grinder 750W with 3 Jars
  {
    categoryPath: 'home-kitchen/home-kitchen-appliances/home-blender-grinder',
    productTypeSlug: 'home-blender',
    nameEn: 'Demo Panasonic Super Mixer Grinder 750W with 3 Stainless Jars',
    nameBn: 'ডেমো প্যানাসনিক সুপার মিক্সার গ্রাইন্ডার ৭৫০ ওয়াট ৩টি জার সহ',
    slug: 'demo-home-panasonic-mixer-grinder',
    sku: 'HM-BL-PAN-01',
    brand: 'Panasonic',
    shortDescriptionEn:
      'Heavy-duty 750W copper motor with hardened stainless steel samurai blades for wet, dry and chutney grinding.',
    shortDescriptionBn:
      'শক্তিশালী ৭৫০ ওয়াট কপার মোটর ও ৩টি স্টেইনলেস স্টিল জারসহ মসলা ও জুস তৈরির নিখুঁত গ্রাইন্ডার।',
    price: 6500,
    stock: 65,
    unit: 'set',
    isFeatured: true,
    specs: {
      'home-power': '750W',
      'home-voltage': '220-240V',
      'home-material': 'Stainless Steel',
      'home-warranty': '5 Years',
      'home-pack-size': '3-Piece Set',
      'home-country-of-origin': 'India',
    },
    variants: [pv('3-Piece Set', 'HM-BL-PAN-3JAR', 6500, 65, 'White')],
  },

  // 5. Food Storage: RFL Airtight Food Container Set (Variants: 3-Piece Set, 6-Piece Set)
  {
    categoryPath: 'home-kitchen/home-kitchen-dining/home-food-storage',
    productTypeSlug: 'home-container',
    nameEn: 'Demo RFL Royal Fresh Airtight Food Storage Container Set',
    nameBn: 'ডেমো আরএফএল রয়্যাল ফ্রেশ এয়ারটাইট ফুড কন্টেইনার সেট',
    slug: 'demo-home-rfl-food-container',
    sku: 'HM-ST-RFL-01',
    brand: 'RFL',
    shortDescriptionEn:
      '100% BPA-free, leakproof, silicone-sealed modular storage containers safe for microwave, dishwasher and freezer.',
    shortDescriptionBn:
      'বিপিএ-মুক্ত ও লিকপ্রুফ সিলিকন সিলযুক্ত নিরাপদ ও টেকসই এয়ারটাইট ফুড কন্টেইনার বক্স।',
    price: 480,
    stock: 200,
    unit: 'set',
    isFeatured: true,
    specs: {
      'home-material': 'Plastic',
      'home-room': 'Kitchen',
      'home-finish': 'Glossy',
      'home-country-of-origin': 'Bangladesh',
    },
    variants: [
      pv('3-Piece Set', 'HM-ST-RFL-3PC', 480, 120),
      pv('6-Piece Set', 'HM-ST-RFL-6PC', 880, 80),
    ],
  },

  // 6. Bedding: Regal Home Luxury Cotton King Bedsheet (Variants: Queen, King)
  {
    categoryPath: 'home-kitchen/home-bedding-bath/home-bedsheets',
    productTypeSlug: 'home-bedsheet',
    nameEn: 'Demo Regal Home Luxury 100% Cotton Bedsheet with 2 Pillow Covers',
    nameBn: 'ডেমো রিগ্যাল হোম ১০০% সুতি বিছানার চাদর ২টি বালিশের কভারসহ',
    slug: 'demo-home-regal-cotton-bedsheet',
    sku: 'HM-BD-RGL-01',
    brand: 'Regal',
    shortDescriptionEn:
      'Breathable, ultra-soft pure cotton bedsheet with 300 thread count, fade-resistant reactive dyes and matching pillow covers.',
    shortDescriptionBn:
      '৩০০ থ্রেড কাউন্টের প্রিমিয়াম খাঁটি সুতি চাদর যা কোমল, আরামদায়ক ও স্থায়ী রঙের গ্যারান্টিযুক্ত।',
    price: 1350,
    stock: 150,
    unit: 'set',
    isFeatured: true,
    specs: {
      'home-material': 'Cotton',
      'home-room': 'Bedroom',
      'home-pack-size': '3-Piece Set',
      'home-country-of-origin': 'Bangladesh',
    },
    variants: [
      pv('Queen', 'HM-BD-RGL-QN-BLU', 1350, 80, 'Navy Blue'),
      pv('King', 'HM-BD-RGL-KG-BLU', 1650, 70, 'Navy Blue'),
    ],
  },

  // 7. Furniture: Hatil Solid Teak Wood Dining Chair (Variants: Natural Wood, Walnut Brown)
  {
    categoryPath: 'home-kitchen/home-furniture/home-chairs',
    productTypeSlug: 'home-chair',
    nameEn: 'Demo Hatil Solid Seasoned Wood Ergonomic Dining Chair',
    nameBn: 'ডেমো হাতিল সলিড কাঠ ডাইনিং চেয়ার',
    slug: 'demo-home-hatil-dining-chair',
    sku: 'HM-FN-HTL-01',
    brand: 'Hatil',
    shortDescriptionEn:
      'Artfully crafted from seasoned kiln-dried beech and teak wood with environmentally friendly lacquer finish and cushioned seat.',
    shortDescriptionBn:
      'অভিজাত নকশা ও আধুনিক ফিনিশিংযুক্ত সিজন্ড কাঠের আরামদায়ক ডাইনিং চেয়ার।',
    price: 4500,
    stock: 40,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'home-material': 'Wood',
      'home-room': 'Dining Room',
      'home-finish': 'Wood Grain',
      'home-assembly': 'Pre-Assembled',
      'home-warranty': '1 Year',
      'home-country-of-origin': 'Bangladesh',
    },
    variants: [
      pv('Natural Wood', 'HM-FN-HTL-NAT', 4500, 25, 'Natural Wood'),
      pv('Walnut Brown', 'HM-FN-HTL-WLN', 4500, 15, 'Walnut Brown'),
    ],
  },

  // 8. Home Appliance: Vision 16-Inch High-Velocity Pedestal Standing Fan (Variants: Black, White)
  {
    categoryPath: 'home-kitchen/home-home-appliances/home-fans',
    productTypeSlug: 'home-fan',
    nameEn: 'Demo Vision 16-Inch High-Velocity Stand Pedestal Fan',
    nameBn: 'ডেমো ভিশন ১৬ ইঞ্চি হাই-স্পিড স্ট্যান্ডিং ফ্যান',
    slug: 'demo-home-vision-pedestal-fan',
    sku: 'HM-FN-VSN-01',
    brand: 'Vision',
    shortDescriptionEn:
      'Aerodynamically balanced blades delivering whisper-quiet powerful airflow with 3-speed control and thermal cutoff safety.',
    shortDescriptionBn:
      'শব্দহীন শক্তিশালী বাতাস ও থার্মাল সেফটিযুক্ত ১৬ ইঞ্চি স্ট্যান্ড ফ্যান।',
    price: 3200,
    stock: 80,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'home-power': '75W',
      'home-voltage': '220-240V',
      'home-warranty': '2 Years',
      'home-room': 'Living Room',
      'home-country-of-origin': 'Bangladesh',
    },
    variants: [
      pv('Black', 'HM-FN-VSN-BLK', 3200, 45, 'Black'),
      pv('White', 'HM-FN-VSN-WHT', 3200, 35, 'White'),
    ],
  },

  // 9. Cleaning: RFL Microfiber Spin Mop Bucket Set (Variants: 1 Mop, Family Pack with 2 Refills)
  {
    categoryPath: 'home-kitchen/home-cleaning-laundry/home-mops-brooms',
    productTypeSlug: 'home-mop',
    nameEn: 'Demo RFL Easy Squeeze 360 Microfiber Spin Mop Bucket Set',
    nameBn: 'ডেমো আরএফএল ৩৬০ স্পিন মপ ও বাকেট সেট',
    slug: 'demo-home-rfl-spin-mop',
    sku: 'HM-CL-RFL-01',
    brand: 'RFL',
    shortDescriptionEn:
      '360-degree rotating super-absorbent microfiber mop head with stainless steel spin dry basket and drainage outlet.',
    shortDescriptionBn:
      'স্টেইনলেস স্টিল ড্রাই বাস্কেট ও ৩৬০ ডিগ্রি সহজে ঘোরার মাইক্রোফাইবার ফ্লোর ক্লিনিং মপ।',
    price: 1250,
    stock: 95,
    unit: 'set',
    specs: {
      'home-material': 'Microfiber',
      'home-room': 'Living Room',
      'home-color': 'Navy Blue',
      'home-country-of-origin': 'Bangladesh',
    },
    variants: [
      pv('1 Piece', 'HM-CL-RFL-1PC', 1250, 60),
      pv('Value Pack of 3', 'HM-CL-RFL-VAL', 1650, 35),
    ],
  },

  // 10. Lighting: Philips 12W Smart LED Bulb (Variants: Single Pack, Value Pack of 3)
  {
    categoryPath: 'home-kitchen/home-lighting/home-led-bulbs',
    productTypeSlug: 'home-ledbulb',
    nameEn: 'Demo Philips 12W Cool Daylight EyeComfort LED Bulb (B22)',
    nameBn: 'ডেমো ফিলিপস ১২ ওয়াট কুল ডেইলাইট আইকমফোর্ট এলইডি বাল্ব',
    slug: 'demo-home-philips-led-bulb',
    sku: 'HM-LT-PHL-01',
    brand: 'Philips',
    shortDescriptionEn:
      'Energy-saving 12W LED bulb with EyeComfort technology delivering 1200 lumens of natural flicker-free bright light.',
    shortDescriptionBn:
      'চোখের সুরক্ষায় আইকমফোর্ট প্রযুক্তি ও ১২০০ লুমেন্সের দীর্ঘস্থায়ী বিদ্যুৎ সাশ্রয়ী এলইডি বাল্ব।',
    price: 240,
    stock: 300,
    unit: 'piece',
    specs: {
      'home-power': '12W',
      'home-voltage': '220-240V',
      'home-warranty': '2 Years',
      'home-country-of-origin': 'India',
    },
    variants: [
      pv('Single Pack', 'HM-LT-PHL-1PK', 240, 200),
      pv('Value Pack of 3', 'HM-LT-PHL-3PK', 680, 100),
    ],
  },
];

export const HOME_KITCHEN_VERTICAL: SeedVertical = {
  key: 'home-kitchen',
  root: HOME_KITCHEN_TAXONOMY,
  attributes: HOME_KITCHEN_ATTRIBUTES,
  brands: HOME_KITCHEN_BRANDS,
  products: HOME_KITCHEN_PRODUCTS,
};
