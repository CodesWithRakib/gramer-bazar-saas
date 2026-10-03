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

/** Volume variant helper for oils, fluids, and cleaners */
const vv = (
  volume: string,
  sku: string,
  price: number,
  stock: number,
  viscosity?: string,
): SeedVerticalVariant => ({
  nameEn: viscosity ? `${volume} (${viscosity})` : volume,
  nameBn: viscosity ? `${volume} (${viscosity})` : volume,
  sku,
  price,
  stock,
  attributes: {
    'auto-volume': volume,
    ...(viscosity ? { 'auto-oil-viscosity': viscosity } : {}),
  },
});

/** Tire Size variant helper */
const tv = (
  tireSize: string,
  sku: string,
  price: number,
  stock: number,
): SeedVerticalVariant => ({
  nameEn: tireSize,
  nameBn: tireSize,
  sku,
  price,
  stock,
  attributes: {
    'auto-tire-size': tireSize,
  },
});

/** Battery Capacity variant helper */
const bv = (
  capacity: string,
  sku: string,
  price: number,
  stock: number,
): SeedVerticalVariant => ({
  nameEn: capacity,
  nameBn: capacity,
  sku,
  price,
  stock,
  attributes: {
    'auto-battery-capacity': capacity,
  },
});

/** Pack or Component variant helper */
const pv = (
  packSize: string,
  sku: string,
  price: number,
  stock: number,
  colorOrType?: string,
): SeedVerticalVariant => ({
  nameEn: colorOrType ? `${packSize} / ${colorOrType}` : packSize,
  nameBn: colorOrType ? `${packSize} / ${colorOrType}` : packSize,
  sku,
  price,
  stock,
  attributes: {
    'auto-pack-size': packSize,
  },
});

/**
 * Universal Automotive & Fitment attributes.
 *
 * Vehicle Make, Model, Fitment Type, OEM Classification, Part Number, Position,
 * Viscosity, Tire Size, and Battery Capacity are structured attributes — never categories.
 */
export const AUTOMOTIVE_ATTRIBUTES: SeedAttribute[] = [
  {
    slug: 'auto-vehicle-type',
    nameEn: 'Vehicle Category',
    nameBn: 'যানবাহনের ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Passenger Car / Sedan',
      'SUV / Crossover',
      'Microbus / Van',
      'Motorcycle / Scooter',
      'Commercial Truck / Pickup',
      'Universal Fit',
    ),
  },
  {
    slug: 'auto-compatible-make',
    nameEn: 'Compatible Vehicle Make',
    nameBn: 'উপযোগী গাড়ির ব্র্যান্ড',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Toyota',
      'Honda',
      'Nissan',
      'Mitsubishi',
      'Suzuki',
      'Hyundai',
      'Mazda',
      'Yamaha',
      'Bajaj',
      'TVS',
      'Hero',
      'Universal',
    ),
  },
  {
    slug: 'auto-compatible-model',
    nameEn: 'Compatible Model & Year',
    nameBn: 'উপযোগী মডেল ও সাল',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Toyota Corolla / Axio (2012–2020)',
      'Toyota Allion / Premio (2007–2018)',
      'Toyota Noah / Voxy (2014–2021)',
      'Honda Civic (2016–2021)',
      'Honda Vezel / HR-V (2013–2020)',
      'Nissan X-Trail T32 (2013–2020)',
      'Suzuki Swift / Dzire (2017–2024)',
      'Yamaha FZ / FZS V2/V3',
      'Bajaj Pulsar 150',
      'Universal Fit for All Vehicles',
    ),
  },
  {
    slug: 'auto-fitment-type',
    nameEn: 'Fitment Compatibility',
    nameBn: 'ফিটমেন্টের ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Direct OEM Fit (Vehicle-Specific)',
      'Universal Fit (All Models)',
      'Performance Upgrade',
    ),
  },
  {
    slug: 'auto-oem-classification',
    nameEn: 'Part Grade / Classification',
    nameBn: 'পার্টসের মান ও ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'OEM Genuine Factory Part',
      'OEM Equivalent Specification',
      'Premium Aftermarket',
      'Universal Fitment',
    ),
  },
  {
    slug: 'auto-position',
    nameEn: 'Installation Position',
    nameBn: 'ইনস্টলেশন পজিশন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Front Axle',
      'Rear Axle',
      'Front & Rear',
      'Left (Passenger Side)',
      'Right (Driver Side)',
      'Engine Bay',
      'Interior Cabin',
      'Universal',
    ),
  },
  {
    slug: 'auto-oil-viscosity',
    nameEn: 'Oil Viscosity Grade',
    nameBn: 'অয়েলের সান্দ্রতা (Viscosity)',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt('0W-20', '5W-30', '5W-40', '10W-30', '10W-40', '20W-50'),
  },
  {
    slug: 'auto-volume',
    nameEn: 'Volume / Fluid Capacity',
    nameBn: 'পরিমাণ / ধারণক্ষমতা',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      '1 Liter',
      '3 Liters',
      '4 Liters',
      '5 Liters',
      '200 ml',
      '500 ml',
      '1 Gallon (3.78L)',
    ),
  },
  {
    slug: 'auto-tire-size',
    nameEn: 'Tire Specification Size',
    nameBn: 'টায়ার সাইজ',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      '185/65 R15',
      '195/65 R15',
      '205/55 R16',
      '215/55 R17',
      '225/65 R17',
      '100/90-17',
      '140/70-17',
    ),
  },
  {
    slug: 'auto-battery-capacity',
    nameEn: 'Battery Capacity (Ah)',
    nameBn: 'ব্যাটারির ধারণক্ষমতা (Ah)',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt('35 Ah', '45 Ah', '55 Ah', '65 Ah', '75 Ah', '5 Ah (Bike)', '7 Ah (Bike)', '9 Ah (Bike)'),
  },
  {
    slug: 'auto-pack-size',
    nameEn: 'Pack Configuration',
    nameBn: 'প্যাক কনফিগারেশন',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt('1 Piece', 'Set of 4', 'Pair of 2', 'Complete Kit', 'Single Front Cam', 'Dual Front + Rear Cam Set'),
  },
  {
    slug: 'auto-warranty',
    nameEn: 'Official Warranty',
    nameBn: 'অফিশিয়াল ওয়ারেন্টি',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'No Warranty',
      '6 Months Replacement',
      '12 Months Official Warranty',
      '18 Months Warranty',
      '24 Months Warranty',
    ),
  },
  {
    slug: 'auto-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎপাদনকারী দেশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Japan',
      'Germany',
      'USA',
      'Bangladesh',
      'India',
      'Thailand',
      'Indonesia',
      'China',
      'Italy',
    ),
  },
];

/**
 * Full Automotive taxonomy tree with 10 primary branches.
 */
export const AUTOMOTIVE_TAXONOMY: SeedTaxonomyNode = {
  slug: 'automotive',
  nameEn: 'Automotive',
  nameBn: 'অটোমোটিভ ও মোটর পার্টস',
  icon: '🚗',
  descriptionEn:
    'Genuine auto spare parts, vehicle-specific fitments, engine oils, car batteries, radial tires, motorcycle gear, and electronic accessories.',
  descriptionBn:
    'গাড়ির আসল পার্টস, নির্দিষ্ট মডেলের ফিটমেন্ট, ইঞ্জিন অয়েল, ব্যাটারি, টায়ার ও বাইকের বিশ্বস্ত সামগ্রী।',
  children: [
    // 1. Car Parts
    {
      slug: 'auto-car-parts',
      nameEn: 'Car Parts',
      nameBn: 'গাড়ির পার্টস',
      icon: '🔧',
      children: [
        {
          slug: 'auto-brakes',
          nameEn: 'Brake System',
          nameBn: 'ব্রেক সিস্টেম',
          productTypes: [
            pt('brake-pad', [
              'auto-vehicle-type',
              'auto-compatible-make',
              'auto-compatible-model',
              'auto-fitment-type',
              'auto-oem-classification',
              'auto-position',
              'auto-pack-size',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Brake Pad Set', 'ব্রেক প্যাড সেট'),
          ],
        },
        {
          slug: 'auto-engine-parts',
          nameEn: 'Engine Parts & Ignition',
          nameBn: 'ইঞ্জিন পার্টস ও ইগনিশন',
          productTypes: [
            pt('spark-plug', [
              'auto-vehicle-type',
              'auto-compatible-make',
              'auto-compatible-model',
              'auto-fitment-type',
              'auto-pack-size',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Spark Plug', 'স্পার্ক প্লাগ'),
          ],
        },
        {
          slug: 'auto-filters',
          nameEn: 'Automotive Filters',
          nameBn: 'অটোমোটিভ ফিল্টার',
          productTypes: [
            pt('car-filter', [
              'auto-vehicle-type',
              'auto-compatible-make',
              'auto-compatible-model',
              'auto-fitment-type',
              'auto-pack-size',
              'auto-country-of-origin',
            ], 'Automotive Filter', 'গাড়ির ফিল্টার'),
          ],
        },
        {
          slug: 'auto-suspension',
          nameEn: 'Suspension & Steering',
          nameBn: 'সাসপেনশন ও স্টিয়ারিং',
          productTypes: [
            pt('shock-absorber', [
              'auto-compatible-make',
              'auto-compatible-model',
              'auto-position',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Shock Absorber', 'শক অ্যাবজরবার'),
          ],
        },
      ],
    },

    // 2. Motorcycle Parts
    {
      slug: 'auto-motorcycle-parts',
      nameEn: 'Motorcycle Parts',
      nameBn: 'মোটরসাইকেল পার্টস',
      icon: '🏍️',
      children: [
        {
          slug: 'auto-moto-brakes',
          nameEn: 'Motorcycle Brakes & Cables',
          nameBn: 'বাইক ব্রেক ও ক্যাবল',
          productTypes: [
            pt('moto-brake-pad', [
              'auto-compatible-make',
              'auto-compatible-model',
              'auto-position',
              'auto-country-of-origin',
            ], 'Motorcycle Brake Pad', 'বাইক ব্রেক প্যাড'),
          ],
        },
        {
          slug: 'auto-moto-chain-sprocket',
          nameEn: 'Chain & Sprockets',
          nameBn: 'চেইন ও স্প্রকেট',
          productTypes: [
            pt('chain-sprocket-kit', [
              'auto-compatible-make',
              'auto-compatible-model',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Chain Sprocket Kit', 'চেইন স্প্রকেট কিট'),
          ],
        },
      ],
    },

    // 3. Car Accessories
    {
      slug: 'auto-car-accessories',
      nameEn: 'Car Accessories',
      nameBn: 'গাড়ির এক্সেসরিজ',
      icon: '✨',
      children: [
        {
          slug: 'auto-interior-accessories',
          nameEn: 'Interior Accessories & Mats',
          nameBn: 'ইন্টেরিয়র এক্সেসরিজ ও ম্যাট',
          productTypes: [
            pt('car-mat', [
              'auto-vehicle-type',
              'auto-compatible-make',
              'auto-compatible-model',
              'auto-pack-size',
              'auto-country-of-origin',
            ], 'Car Floor Mat', 'কার ফ্লোর ম্যাট'),
          ],
        },
        {
          slug: 'auto-holders-chargers',
          nameEn: 'Phone Holders & Fast Chargers',
          nameBn: 'ফোন হোল্ডার ও চার্জার',
          productTypes: [
            pt('car-charger-holder', [
              'auto-fitment-type',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Car Phone Holder & Charger', 'কার ফোন হোল্ডার ও চার্জার'),
          ],
        },
      ],
    },

    // 4. Motorcycle Accessories
    {
      slug: 'auto-motorcycle-accessories',
      nameEn: 'Motorcycle Accessories',
      nameBn: 'মোটরসাইকেল এক্সেসরিজ',
      icon: '🪖',
      children: [
        {
          slug: 'auto-helmets-riding-gear',
          nameEn: 'Helmets & Riding Gear',
          nameBn: 'হেলমেট ও রাইডিং গিয়ার',
          productTypes: [
            pt('moto-helmet', [
              'auto-pack-size',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Motorcycle Helmet', 'বাইক হেলমেট'),
          ],
        },
      ],
    },

    // 5. Tires & Wheels
    {
      slug: 'auto-tires-wheels',
      nameEn: 'Tires & Wheels',
      nameBn: 'টায়ার ও চাকা',
      icon: '🛞',
      children: [
        {
          slug: 'auto-car-tires',
          nameEn: 'Car Tires',
          nameBn: 'গাড়ির টায়ার',
          productTypes: [
            pt('car-tire-pt', [
              'auto-vehicle-type',
              'auto-tire-size',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Radial Car Tire', 'রেডিয়াল কার টায়ার'),
          ],
        },
        {
          slug: 'auto-moto-tires',
          nameEn: 'Motorcycle Tires',
          nameBn: 'মোটরসাইকেল টায়ার',
          productTypes: [
            pt('moto-tire-pt', [
              'auto-tire-size',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Motorcycle Tubeless Tire', 'মোটরসাইকেল টিউবলেস টায়ার'),
          ],
        },
      ],
    },

    // 6. Car Care & Detailing
    {
      slug: 'auto-car-care',
      nameEn: 'Car Care & Detailing',
      nameBn: 'গাড়ির যত্ন ও ক্লিনিং',
      icon: '🧼',
      children: [
        {
          slug: 'auto-wash-shampoo',
          nameEn: 'Car Wash & Foam Shampoo',
          nameBn: 'কার ওয়াশ ও শ্যাম্পু',
          productTypes: [
            pt('car-wash-shampoo-pt', [
              'auto-volume',
              'auto-country-of-origin',
            ], 'Car Shampoo & Wash', 'কার শ্যাম্পু ও ওয়াশ'),
          ],
        },
      ],
    },

    // 7. Oils & Lubricants
    {
      slug: 'auto-oils-fluids',
      nameEn: 'Oils & Lubricants',
      nameBn: 'ইঞ্জিন অয়েল ও লুব্রিকেন্ট',
      icon: '🛢️',
      children: [
        {
          slug: 'auto-engine-oil',
          nameEn: 'Synthetic Engine Oil',
          nameBn: 'সিন্থেটিক ইঞ্জিন অয়েল',
          productTypes: [
            pt('engine-oil-pt', [
              'auto-vehicle-type',
              'auto-oil-viscosity',
              'auto-volume',
              'auto-country-of-origin',
            ], 'Engine Oil', 'ইঞ্জিন অয়েল'),
          ],
        },
        {
          slug: 'auto-brake-fluids',
          nameEn: 'Brake Fluids & Coolants',
          nameBn: 'ব্রেক ফ্লুইড ও কুল্যান্ট',
          productTypes: [
            pt('brake-fluid-pt', [
              'auto-volume',
              'auto-country-of-origin',
            ], 'Brake Fluid & Coolant', 'ব্রেক ফ্লুইড ও কুল্যান্ট'),
          ],
        },
      ],
    },

    // 8. Automotive Batteries
    {
      slug: 'auto-batteries',
      nameEn: 'Automotive Batteries',
      nameBn: 'গাড়ি ও বাইকের ব্যাটারি',
      icon: '🔋',
      children: [
        {
          slug: 'auto-car-batteries',
          nameEn: 'Maintenance-Free Car Batteries',
          nameBn: 'কার ব্যাটারি',
          productTypes: [
            pt('car-battery-pt', [
              'auto-vehicle-type',
              'auto-battery-capacity',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Car Battery', 'কার ব্যাটারি'),
          ],
        },
      ],
    },

    // 9. Tools & Equipment
    {
      slug: 'auto-tools-equipment',
      nameEn: 'Tools & Equipment',
      nameBn: 'টুলস ও ডায়াগনস্টিক গ্যাজেট',
      icon: '🧰',
      children: [
        {
          slug: 'auto-diagnostic-scanners',
          nameEn: 'OBD2 Diagnostic Scanners',
          nameBn: 'ওবিডি২ স্ক্যানার ও গেজ',
          productTypes: [
            pt('obd-scanner-pt', [
              'auto-fitment-type',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'OBD2 Scanner', 'ওবিডি২ ডায়াগনস্টিক স্ক্যানার'),
          ],
        },
      ],
    },

    // 10. Automotive Electronics
    {
      slug: 'auto-electronics',
      nameEn: 'Automotive Electronics',
      nameBn: 'কার ইলেকট্রনিক্স',
      icon: '📹',
      children: [
        {
          slug: 'auto-dash-cams',
          nameEn: 'Smart Dash Cams & Reverse Cameras',
          nameBn: 'স্মার্ট ড্যাশ ক্যাম ও রিভার্স ক্যামেরা',
          productTypes: [
            pt('dash-cam-pt', [
              'auto-pack-size',
              'auto-fitment-type',
              'auto-warranty',
              'auto-country-of-origin',
            ], 'Smart Dash Cam', 'স্মার্ট ড্যাশ ক্যাম'),
          ],
        },
      ],
    },
  ],
};

/**
 * Authentic regional (Bangladesh) and international Automotive brands.
 */
export const AUTOMOTIVE_BRANDS: SeedBrand[] = [
  { name: 'Toyota Genuine Parts', manufacturer: 'Toyota Motor Corporation' },
  { name: 'Denso', manufacturer: 'Denso Corporation' },
  { name: 'NGK', manufacturer: 'Niterra Co., Ltd.' },
  { name: 'Bosch', manufacturer: 'Robert Bosch GmbH' },
  { name: 'Brembo', manufacturer: 'Brembo S.p.A.' },
  { name: 'Mobil 1', manufacturer: 'ExxonMobil Corporation' },
  { name: 'Castrol', manufacturer: 'BP p.l.c.' },
  { name: 'Motul', manufacturer: 'Motul S.A.' },
  { name: 'Shell Helix', manufacturer: 'Shell plc' },
  { name: 'Bridgestone', manufacturer: 'Bridgestone Corporation' },
  { name: 'Michelin', manufacturer: 'Michelin Group' },
  { name: 'Yokohama', manufacturer: 'The Yokohama Rubber Co., Ltd.' },
  { name: 'Rahimafrooz', manufacturer: 'Rahimafrooz Globatt Ltd.' },
  { name: 'Lucas', manufacturer: 'Lucas Batteries Bangladesh' },
  { name: '70mai', manufacturer: '70mai Co., Ltd.' },
  { name: 'Steelbird', manufacturer: 'Steelbird Hi-Tech India Ltd.' },
  { name: 'Meguiar’s', manufacturer: 'Meguiar’s / 3M' },
  { name: 'Baseus', manufacturer: 'Shenzhen Baseus Technology' },
  { name: 'Ancel', manufacturer: 'Ancel Technology Co.' },
  { name: 'Yamaha Genuine Parts', manufacturer: 'Yamaha Motor Co., Ltd.' },
  { name: 'Bajaj Genuine Parts', manufacturer: 'Bajaj Auto Ltd.' },
];

export const AUTOMOTIVE_MANUFACTURERS: SeedManufacturer[] = [
  { name: 'Toyota Motor Corporation', nameBn: 'টয়োটা মোটর কর্পোরেশন', country: 'Japan' },
  { name: 'Denso Corporation', nameBn: 'ডেনসো কর্পোরেশন', country: 'Japan' },
  { name: 'Niterra Co., Ltd.', nameBn: 'এনজিকে / নিতেত্রা', country: 'Japan' },
  { name: 'Robert Bosch GmbH', nameBn: 'রবার্ট বশ জিএমবিএইচ', country: 'Germany' },
  { name: 'Brembo S.p.A.', nameBn: 'ব্রেম্বো এস.পি.এ.', country: 'Italy' },
  { name: 'ExxonMobil Corporation', nameBn: 'এক্সনমবিল কর্পোরেশন', country: 'USA' },
  { name: 'BP p.l.c.', nameBn: 'বিপি পিএলসি', country: 'UK' },
  { name: 'Motul S.A.', nameBn: 'মতুল এস.এ.', country: 'France' },
  { name: 'Shell plc', nameBn: 'শেল পিএলসি', country: 'UK' },
  { name: 'Bridgestone Corporation', nameBn: 'ব্রিজস্টোন কর্পোরেশন', country: 'Japan' },
  { name: 'Michelin Group', nameBn: 'মিশেলিন গ্রুপ', country: 'France' },
  { name: 'The Yokohama Rubber Co., Ltd.', nameBn: 'ইয়োকোহামা রাবার কো.', country: 'Japan' },
  { name: 'Rahimafrooz Globatt Ltd.', nameBn: 'রহিমআফরোজ গ্লোব্যাট লি.', country: 'Bangladesh' },
  { name: 'Lucas Batteries Bangladesh', nameBn: 'লুকাস ব্যাটারিজ বাংলাদেশ', country: 'Bangladesh' },
  { name: '70mai Co., Ltd.', nameBn: '৭০মাই কো. লি.', country: 'China' },
  { name: 'Steelbird Hi-Tech India Ltd.', nameBn: 'স্টিলবার্ড হাই-টেক ইন্ডিয়া লি.', country: 'India' },
  { name: 'Meguiar’s / 3M', nameBn: 'মেগুয়ারস / ৩এম', country: 'USA' },
  { name: 'Shenzhen Baseus Technology', nameBn: 'বেসিয়াস টেকনোলজি', country: 'China' },
  { name: 'Ancel Technology Co.', nameBn: 'অ্যানসেল টেকনোলজি', country: 'USA' },
  { name: 'Yamaha Motor Co., Ltd.', nameBn: 'ইয়ামাহা মোটর কো.', country: 'Japan' },
  { name: 'Bajaj Auto Ltd.', nameBn: 'বাজাজ অটো লি.', country: 'India' },
];

/**
 * 10 Realistic Demo Products across the Automotive spectrum with structured vehicle fitments.
 */
export const AUTOMOTIVE_PRODUCTS: SeedVerticalProduct[] = [
  // 1. Brake Pads: Bosch Blue Premium Ceramic Front Brake Pads
  {
    categoryPath: 'automotive/auto-car-parts/auto-brakes',
    productTypeSlug: 'brake-pad',
    nameEn: 'Demo Bosch Blue Ceramic Disc Brake Pads Set (Front Axle)',
    nameBn: 'ডেমো বশ ব্লু সিরামিক ফ্রন্ট ডিস্ক ব্রেক প্যাড সেট',
    slug: 'demo-auto-bosch-ceramic-brake-pads',
    sku: 'AT-BP-BSH-01',
    brand: 'Bosch',
    manufacturer: 'Robert Bosch GmbH',
    shortDescriptionEn:
      'Advanced friction ceramic formulation delivering whisper-quiet, ultra-low dust braking performance. Engineered for direct OEM fitment on Toyota Corolla and Axio.',
    shortDescriptionBn:
      'শব্দহীন ও দীর্ঘস্থায়ী হাই-পারফরম্যান্স সিরামিক ফ্রন্ট ব্রেক প্যাড সেট (টয়োটা করোলা ও এক্সিও উপযোগী)।',
    price: 3600,
    compareAtPrice: 4200,
    stock: 45,
    unit: 'set',
    isFeatured: true,
    specs: {
      'auto-vehicle-type': 'Passenger Car / Sedan',
      'auto-compatible-make': 'Toyota',
      'auto-compatible-model': 'Toyota Corolla / Axio (2012–2020)',
      'auto-fitment-type': 'Direct OEM Fit (Vehicle-Specific)',
      'auto-oem-classification': 'OEM Equivalent Specification',
      'auto-position': 'Front Axle',
      'auto-warranty': '12 Months Official Warranty',
      'auto-country-of-origin': 'Germany',
    },
    variants: [
      pv('Set of 4', 'AT-BP-BSH-F4', 3600, 45, 'Front Axle'),
    ],
  },

  // 2. Engine Oil: Mobil 1 Advanced Full Synthetic 5W-30 Motor Oil
  {
    categoryPath: 'automotive/auto-oils-fluids/auto-engine-oil',
    productTypeSlug: 'engine-oil-pt',
    nameEn: 'Demo Mobil 1 Advanced Full Synthetic Engine Oil 5W-30 (API SP)',
    nameBn: 'ডেমো মবিল ১ অ্যাডভান্সড ফুল সিন্থেটিক ইঞ্জিন অয়েল ৫W-৩০',
    slug: 'demo-auto-mobil1-synthetic-engine-oil',
    sku: 'AT-OL-MBL-01',
    brand: 'Mobil 1',
    manufacturer: 'ExxonMobil Corporation',
    shortDescriptionEn:
      'Triple action formula engineered to clean, protect, and enhance high-mileage engine performance. Certified API SP and ILSAC GF-6A standards.',
    shortDescriptionBn:
      'ইঞ্জিন সুরক্ষায় বিশ্বের এক নম্বর সম্পূর্ণ সিন্থেটিক ৫W-৩০ মোটর অয়েল (এপিআই এসপি স্ট্যান্ডার্ড)।',
    price: 1350,
    compareAtPrice: 1500,
    stock: 120,
    unit: 'can',
    isFeatured: true,
    specs: {
      'auto-vehicle-type': 'Passenger Car / Sedan',
      'auto-compatible-make': 'Toyota',
      'auto-oil-viscosity': '5W-30',
      'auto-fitment-type': 'Universal Fit (All Models)',
      'auto-country-of-origin': 'USA',
    },
    variants: [
      vv('1 Liter', 'AT-OL-MBL-1L', 1350, 70, '5W-30'),
      vv('4 Liters', 'AT-OL-MBL-4L', 4950, 50, '5W-30'),
    ],
  },

  // 3. Spark Plugs: NGK Laser Iridium Long-Life Spark Plugs
  {
    categoryPath: 'automotive/auto-car-parts/auto-engine-parts',
    productTypeSlug: 'spark-plug',
    nameEn: 'Demo NGK Laser Iridium Long-Life Spark Plugs Set of 4 (DILZKR7B11GS)',
    nameBn: 'ডেমো এনজিকে লেজার ইরিডিয়াম স্পার্ক প্লাগ ৪টির সেট',
    slug: 'demo-auto-ngk-laser-iridium-spark-plugs',
    sku: 'AT-SP-NGK-01',
    brand: 'NGK',
    manufacturer: 'Niterra Co., Ltd.',
    shortDescriptionEn:
      'Ultra-fine 0.6mm laser-welded iridium center tip ensures superior ignitability, faster throttle response, and up to 100,000 km service longevity.',
    shortDescriptionBn:
      '১ লাখ কিমি পর্যন্ত দীর্ঘস্থায়ী হাই-ইগনিশন লেজার ইরিডিয়াম স্পার্ক প্লাগ সেট (হোন্ডা ও টয়োটা ইঞ্জিন)।',
    price: 3800,
    compareAtPrice: 4200,
    stock: 60,
    unit: 'set',
    isFeatured: true,
    specs: {
      'auto-vehicle-type': 'Passenger Car / Sedan',
      'auto-compatible-make': 'Honda',
      'auto-compatible-model': 'Honda Civic (2016–2021)',
      'auto-fitment-type': 'Direct OEM Fit (Vehicle-Specific)',
      'auto-oem-classification': 'OEM Genuine Factory Part',
      'auto-position': 'Engine Bay',
      'auto-warranty': '12 Months Official Warranty',
      'auto-country-of-origin': 'Japan',
    },
    variants: [
      pv('Set of 4', 'AT-SP-NGK-4PC', 3800, 60),
    ],
  },

  // 4. Filters: Denso High-Efficiency Engine Air & Cabin Filter
  {
    categoryPath: 'automotive/auto-car-parts/auto-filters',
    productTypeSlug: 'car-filter',
    nameEn: 'Demo Denso First Time Fit High-Efficiency Engine Air Filter',
    nameBn: 'ডেমো ডেনসো হাই-এফিশিয়েন্সি ইঞ্জিন এয়ার ফিল্টার',
    slug: 'demo-auto-denso-air-filter',
    sku: 'AT-FL-DNS-01',
    brand: 'Denso',
    manufacturer: 'Denso Corporation',
    shortDescriptionEn:
      'Precision pleating traps 99.5% of airborne particulate matter without restricting intake airflow, maximizing fuel efficiency and engine life.',
    shortDescriptionBn:
      '৯৯.৫% ধূলিকণা আটকিয়ে ইঞ্জিন সুরক্ষা ও মাইলেজ বৃদ্ধির অরিজিনাল এয়ার ফিল্টার।',
    price: 1200,
    compareAtPrice: 1400,
    stock: 80,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'auto-vehicle-type': 'Passenger Car / Sedan',
      'auto-compatible-make': 'Toyota',
      'auto-compatible-model': 'Toyota Allion / Premio (2007–2018)',
      'auto-fitment-type': 'Direct OEM Fit (Vehicle-Specific)',
      'auto-oem-classification': 'OEM Equivalent Specification',
      'auto-position': 'Engine Bay',
      'auto-country-of-origin': 'Japan',
    },
    variants: [
      pv('1 Piece', 'AT-FL-DNS-AIR', 1200, 50, 'Engine Air Filter'),
      pv('1 Piece', 'AT-FL-DNS-CBN', 1450, 30, 'Carbon Cabin Filter'),
    ],
  },

  // 5. Car Battery: Rahimafrooz Globatt Maintenance-Free Sealed Battery
  {
    categoryPath: 'automotive/auto-batteries/auto-car-batteries',
    productTypeSlug: 'car-battery-pt',
    nameEn: 'Demo Rahimafrooz Globatt Sealed Maintenance-Free Automotive Battery',
    nameBn: 'ডেমো রহিমআফরোজ গ্লোব্যাট সিল্ড মেইনটেন্যান্স-ফ্রি কার ব্যাটারি',
    slug: 'demo-auto-rahimafrooz-globatt-battery',
    sku: 'AT-BT-RHM-01',
    brand: 'Rahimafrooz',
    manufacturer: 'Rahimafrooz Globatt Ltd.',
    shortDescriptionEn:
      'High cold-cranking amp (CCA) calcium-tin alloy plates engineered for hot tropical climates with zero water top-up required and 18-month warranty.',
    shortDescriptionBn:
      'পানি দেওয়ার ঝামেলামুক্ত সিল্ড কার ব্যাটারি ও ১৮ মাসের অফিসিয়াল রিপ্লেসমেন্ট ওয়ারেন্টি।',
    price: 8500,
    compareAtPrice: 9200,
    stock: 35,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'auto-vehicle-type': 'Passenger Car / Sedan',
      'auto-compatible-make': 'Toyota',
      'auto-fitment-type': 'Direct OEM Fit (Vehicle-Specific)',
      'auto-position': 'Engine Bay',
      'auto-warranty': '18 Months Warranty',
      'auto-country-of-origin': 'Bangladesh',
    },
    variants: [
      bv('45 Ah', 'AT-BT-RHM-45AH', 8500, 15),
      bv('55 Ah', 'AT-BT-RHM-55AH', 9800, 12),
      bv('65 Ah', 'AT-BT-RHM-65AH', 11500, 8),
    ],
  },

  // 6. Car Care: Meguiar's Gold Class Rich Carnauba Wash & Wax
  {
    categoryPath: 'automotive/auto-car-care/auto-wash-shampoo',
    productTypeSlug: 'car-wash-shampoo-pt',
    nameEn: 'Demo Meguiar’s Gold Class Rich Carnauba Car Wash & Shampoo',
    nameBn: 'ডেমো মেগুয়ারস গোল্ড ক্লাস কার্নাউবা কার ওয়াশ ও শ্যাম্পু',
    slug: 'demo-auto-meguiars-gold-class-shampoo',
    sku: 'AT-CC-MG-01',
    brand: 'Meguiar’s',
    manufacturer: 'Meguiar’s / 3M',
    shortDescriptionEn:
      'Premium biodegradable conditioners nourish and enrich automotive clear coat paints while lifting dirt and road grime without stripping existing wax protection.',
    shortDescriptionBn:
      'গাড়ির রঙ অক্ষুণ্ণ রেখে গাড়ির বডি চকচকে পরিষ্কার করার প্রিমিয়াম কার্নাউবা শ্যাম্পু।',
    price: 1450,
    stock: 65,
    unit: 'bottle',
    specs: {
      'auto-volume': '500 ml',
      'auto-fitment-type': 'Universal Fit (All Models)',
      'auto-country-of-origin': 'USA',
    },
    variants: [
      vv('500 ml', 'AT-CC-MG-500ML', 1450, 40),
      vv('1 Gallon (3.78L)', 'AT-CC-MG-1GAL', 4800, 25),
    ],
  },

  // 7. Tires: Bridgestone Ecopia EP150 Fuel-Efficient Radial Tire
  {
    categoryPath: 'automotive/auto-tires-wheels/auto-car-tires',
    productTypeSlug: 'car-tire-pt',
    nameEn: 'Demo Bridgestone Ecopia EP150 Low Rolling Resistance Radial Tire',
    nameBn: 'ডেমো ব্রিজস্টোন ইকোপ্রিয়া জ্বালানি সাশ্রয়ী রেডিয়াল কার টায়ার',
    slug: 'demo-auto-bridgestone-ecopia-tire',
    sku: 'AT-TR-BRD-01',
    brand: 'Bridgestone',
    manufacturer: 'Bridgestone Corporation',
    shortDescriptionEn:
      'Nano-Pro Tech compound reduces rolling resistance to boost fuel economy while delivering exceptional wet grip and quiet road comfort.',
    shortDescriptionBn:
      'জাপানি প্রযুক্তির ফুয়েল সেভিং ও ভেজা রাস্তায় নিখুঁত গ্রিপযুক্ত রেডিয়াল কার টায়ার।',
    price: 7800,
    compareAtPrice: 8500,
    stock: 40,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'auto-vehicle-type': 'Passenger Car / Sedan',
      'auto-tire-size': '195/65 R15',
      'auto-warranty': '24 Months Warranty',
      'auto-country-of-origin': 'Japan',
    },
    variants: [
      tv('195/65 R15', 'AT-TR-BRD-1956515', 7800, 25),
      tv('205/55 R16', 'AT-TR-BRD-2055516', 9200, 15),
    ],
  },

  // 8. Electronics / Dashcam: 70mai Smart Dash Cam Pro Plus+ A500S Dual Vision
  {
    categoryPath: 'automotive/auto-electronics/auto-dash-cams',
    productTypeSlug: 'dash-cam-pt',
    nameEn: 'Demo 70mai Smart Dash Cam Pro Plus+ A500S Built-in GPS & ADAS',
    nameBn: 'ডেমো ৭০মাই স্মার্ট ড্যাশ ক্যাম প্রো প্লাস+ জিপিএস ও ডুয়াল ভিশন',
    slug: 'demo-auto-70mai-a500s-dash-cam',
    sku: 'AT-EL-70M-01',
    brand: '70mai',
    manufacturer: '70mai Co., Ltd.',
    shortDescriptionEn:
      '1944P Ultra HD front recording with Sony IMX335 sensor, built-in GPS, Advanced Driver Assistance System (ADAS), and 24-hour parking surveillance.',
    shortDescriptionBn:
      'সোনি সেন্সরযুক্ত ১৯৪৪পি আল্ট্রা এইচডি ড্যাশ ক্যামেরা ও ২৪ ঘণ্টা পার্কিং মনিটরিং সুবিধা।',
    price: 8900,
    compareAtPrice: 9900,
    stock: 30,
    unit: 'set',
    isFeatured: true,
    specs: {
      'auto-fitment-type': 'Universal Fit (All Models)',
      'auto-warranty': '12 Months Official Warranty',
      'auto-country-of-origin': 'China',
    },
    variants: [
      pv('Single Front Cam', 'AT-EL-70M-SGL', 8900, 18),
      pv('Dual Front + Rear Cam Set', 'AT-EL-70M-DUAL', 11500, 12),
    ],
  },

  // 9. Tools & Diagnostics: Ancel AD310 OBD2 Universal Diagnostic Engine Code Scanner
  {
    categoryPath: 'automotive/auto-tools-equipment/auto-diagnostic-scanners',
    productTypeSlug: 'obd-scanner-pt',
    nameEn: 'Demo Ancel AD310 Classic OBD2 Universal Car Engine Fault Code Reader',
    nameBn: 'ডেমো অ্যানসেল এডি৩১০ ক্লাসিক ওবিডি২ কার ইঞ্জিন ফল্ট স্ক্যানার',
    slug: 'demo-auto-ancel-ad310-obd-scanner',
    sku: 'AT-TL-ANC-01',
    brand: 'Ancel',
    manufacturer: 'Ancel Technology Co.',
    shortDescriptionEn:
      'Plug-and-play handheld scanner retrieves generic and manufacturer-specific diagnostic trouble codes (DTCs), displays live freeze frame data, and resets check engine lights.',
    shortDescriptionBn:
      'গাড়ির চেক ইঞ্জিন লাইট রিড ও রিসেট করার সহজ প্লাগ-অ্যান্ড-প্লে ওবিডি২ ডায়াগনস্টিক স্ক্যানার।',
    price: 3200,
    stock: 50,
    unit: 'piece',
    specs: {
      'auto-fitment-type': 'Universal Fit (All Models)',
      'auto-warranty': '12 Months Official Warranty',
      'auto-country-of-origin': 'USA',
    },
    variants: [
      pv('1 Piece', 'AT-TL-ANC-1PC', 3200, 50),
    ],
  },

  // 10. Motorcycle Accessories: Steelbird Air SBA-1 Full-Face Helmet
  {
    categoryPath: 'automotive/auto-motorcycle-accessories/auto-helmets-riding-gear',
    productTypeSlug: 'moto-helmet',
    nameEn: 'Demo Steelbird Air SBA-1 Full Face Aerodynamic ISI Certified Bike Helmet',
    nameBn: 'ডেমো স্টিলবার্ড এয়ার এসবিএ-১ ফুল-ফেস বাইক হেলমেট',
    slug: 'demo-auto-steelbird-air-helmet',
    sku: 'AT-MC-STB-01',
    brand: 'Steelbird',
    manufacturer: 'Steelbird Hi-Tech India Ltd.',
    shortDescriptionEn:
      'High-impact thermoplastic shell with dynamic airflow ventilation, quick-release micrometric buckle, and anti-scratch UV-resistant optical visor.',
    shortDescriptionBn:
      'হাই-ইমপ্যাক্ট এবিএস ও চমৎকার ভেন্টিলেশনযুক্ত নিরাপদ ফুল-ফেস আইএসআই সার্টিফাইড হেলমেট।',
    price: 2450,
    compareAtPrice: 2800,
    stock: 75,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'auto-vehicle-type': 'Motorcycle / Scooter',
      'auto-fitment-type': 'Universal Fit (All Models)',
      'auto-warranty': '12 Months Official Warranty',
      'auto-country-of-origin': 'India',
    },
    variants: [
      pv('1 Piece', 'AT-MC-STB-MBK-M', 2450, 25, 'Matte Black / M (580mm)'),
      pv('1 Piece', 'AT-MC-STB-MBK-L', 2450, 30, 'Matte Black / L (600mm)'),
      pv('1 Piece', 'AT-MC-STB-WHT-L', 2450, 20, 'Pearl White / L (600mm)'),
    ],
  },
];

export const AUTOMOTIVE_VERTICAL: SeedVertical = {
  key: 'automotive',
  root: AUTOMOTIVE_TAXONOMY,
  attributes: AUTOMOTIVE_ATTRIBUTES,
  brands: AUTOMOTIVE_BRANDS,
  manufacturers: AUTOMOTIVE_MANUFACTURERS,
  products: AUTOMOTIVE_PRODUCTS,
};
