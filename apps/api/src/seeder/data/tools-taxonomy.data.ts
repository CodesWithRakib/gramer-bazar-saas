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

/** Configuration / Kit Variant helper for power tools */
const kv = (
  kitDesc: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: kitDesc,
  nameBn: kitDesc,
  sku,
  price,
  stock,
  attributes: {
    'tools-pack-quantity': kitDesc,
    ...(extraAttr ?? {}),
  },
});

/** Size / Dimension variant helper for hand tools, fasteners, ladders, gloves, boots */
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
    'tools-fastener-length': sizeDesc,
    ...(extraAttr ?? {}),
  },
});

/** Consumable volume/batch variant helper for paints and sealants */
const cv = (
  volumeDesc: string,
  sku: string,
  price: number,
  stock: number,
  batches?: SeedProductBatch[],
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: volumeDesc,
  nameBn: volumeDesc,
  sku,
  price,
  stock,
  batches,
  attributes: {
    'tools-paint-volume': volumeDesc,
    ...(extraAttr ?? {}),
  },
});

// ---------------------------------------------------------------------------
// 1. Dynamic Attribute Schemas
// ---------------------------------------------------------------------------
const TOOLS_ATTRIBUTES: SeedAttribute[] = [
  {
    slug: 'tools-power-source',
    nameEn: 'Power Source',
    nameBn: 'পাওয়ার সোর্স',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Cordless Battery', 'Corded Electric', 'Manual Hand-Operated', 'Pneumatic (Air)', 'Petrol Engine'),
  },
  {
    slug: 'tools-voltage',
    nameEn: 'Voltage',
    nameBn: 'ভোল্টেজ',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-wattage',
    nameEn: 'Power Rating (Watt)',
    nameBn: 'পাওয়ার (ওয়াট)',
    dataType: AttributeDataType.NUMBER,
    unit: 'W',
    isFilterable: true,
  },
  {
    slug: 'tools-battery-capacity',
    nameEn: 'Battery Capacity',
    nameBn: 'ব্যাটারির ধারণক্ষমতা',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-battery-included',
    nameEn: 'Battery Included',
    nameBn: 'ব্যাটারি অন্তর্ভুক্ত',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'tools-charger-included',
    nameEn: 'Charger Included',
    nameBn: 'চার্জার অন্তর্ভুক্ত',
    dataType: AttributeDataType.BOOLEAN,
    isFilterable: true,
  },
  {
    slug: 'tools-no-load-speed-rpm',
    nameEn: 'No-Load Speed (RPM)',
    nameBn: 'গতিবেগ (RPM)',
    dataType: AttributeDataType.NUMBER,
    unit: 'RPM',
    isFilterable: true,
  },
  {
    slug: 'tools-max-torque-nm',
    nameEn: 'Max Torque (Nm)',
    nameBn: 'সর্বোচ্চ টর্ক (Nm)',
    dataType: AttributeDataType.NUMBER,
    unit: 'Nm',
    isFilterable: true,
  },
  {
    slug: 'tools-chuck-size',
    nameEn: 'Chuck / Collet Size',
    nameBn: 'চক সাইজ',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-disc-diameter-mm',
    nameEn: 'Disc Diameter (mm)',
    nameBn: 'ডিস্ক ব্যাস (মিমি)',
    dataType: AttributeDataType.NUMBER,
    unit: 'mm',
    isFilterable: true,
  },
  {
    slug: 'tools-blade-diameter-mm',
    nameEn: 'Blade Diameter (mm)',
    nameBn: 'ব্লেড ব্যাস (মিমি)',
    dataType: AttributeDataType.NUMBER,
    unit: 'mm',
    isFilterable: true,
  },
  {
    slug: 'tools-drive-size',
    nameEn: 'Socket Drive Size',
    nameBn: 'ড্রাইভ সাইজ',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-material',
    nameEn: 'Material / Construction',
    nameBn: 'উপাদান ও ধাতু',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-handle-grip',
    nameEn: 'Handle & Grip Type',
    nameBn: 'হ্যান্ডেল ও গ্রিপ',
    dataType: AttributeDataType.TEXT,
    isFilterable: false,
  },
  {
    slug: 'tools-measurement-range',
    nameEn: 'Measurement Range',
    nameBn: 'পরিমাপ পরিসীমা',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-fastener-diameter',
    nameEn: 'Fastener Diameter / Gauge',
    nameBn: 'ফাস্টেনার ব্যাস',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-fastener-length',
    nameEn: 'Fastener Length / Size',
    nameBn: 'দৈর্ঘ্য / সাইজ',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
    isVariantAxis: true,
  },
  {
    slug: 'tools-thread-type',
    nameEn: 'Thread Type',
    nameBn: 'থ্রেডের ধরন',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-head-type',
    nameEn: 'Head Style',
    nameBn: 'মাথার ধরন',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-drive-type',
    nameEn: 'Drive Style',
    nameBn: 'ড্রাইভ স্টাইল',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-pack-quantity',
    nameEn: 'Pack Quantity / Kit Option',
    nameBn: 'প্যাক সংখ্যা / কিট বিকল্প',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
    isVariantAxis: true,
  },
  {
    slug: 'tools-electrical-rated-current',
    nameEn: 'Rated Current (Amps)',
    nameBn: 'বিদ্যুৎ প্রবাহ (অ্যাম্পিয়ার)',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-number-of-gangs-sockets',
    nameEn: 'Number of Gangs / Sockets',
    nameBn: 'সকেট সংখ্যা',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-pipe-diameter',
    nameEn: 'Pipe Diameter / Bore',
    nameBn: 'পাইপের ব্যাস',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-paint-finish',
    nameEn: 'Paint Sheen / Finish',
    nameBn: 'পেইন্ট ফিনিশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Matte', 'Eggshell', 'Silk / Satin', 'Semi-Gloss', 'High Gloss'),
  },
  {
    slug: 'tools-paint-volume',
    nameEn: 'Paint / Chemical Volume',
    nameBn: 'পরিমাণ / ভলিউম',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
    isVariantAxis: true,
  },
  {
    slug: 'tools-safety-certification',
    nameEn: 'Safety Standard / Cert',
    nameBn: 'নিরাপত্তা মানদণ্ড',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎপাদনকারী দেশ',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
  {
    slug: 'tools-warranty',
    nameEn: 'Warranty Period',
    nameBn: 'ওয়ারেন্টি',
    dataType: AttributeDataType.TEXT,
    isFilterable: true,
  },
];

// ---------------------------------------------------------------------------
// 2. Product Types Directory
// ---------------------------------------------------------------------------
const POWER_TOOL_COMMON = [
  'tools-power-source',
  'tools-voltage',
  'tools-wattage',
  'tools-no-load-speed-rpm',
  'tools-country-of-origin',
  'tools-warranty',
];

const CORDLESS_DRILL_ATTRS = [
  ...POWER_TOOL_COMMON,
  'tools-battery-capacity',
  'tools-battery-included',
  'tools-charger-included',
  'tools-max-torque-nm',
  'tools-chuck-size',
  'tools-pack-quantity',
];

const ANGLE_GRINDER_ATTRS = [
  ...POWER_TOOL_COMMON,
  'tools-disc-diameter-mm',
  'tools-pack-quantity',
];

const CIRCULAR_SAW_ATTRS = [
  ...POWER_TOOL_COMMON,
  'tools-blade-diameter-mm',
  'tools-pack-quantity',
];

const HAND_TOOL_COMMON = [
  'tools-material',
  'tools-handle-grip',
  'tools-country-of-origin',
  'tools-warranty',
];

const FASTENER_ATTRS = [
  'tools-fastener-diameter',
  'tools-fastener-length',
  'tools-material',
  'tools-thread-type',
  'tools-head-type',
  'tools-drive-type',
  'tools-pack-quantity',
  'tools-country-of-origin',
];

const ELECTRICAL_ATTRS = [
  'tools-voltage',
  'tools-electrical-rated-current',
  'tools-number-of-gangs-sockets',
  'tools-material',
  'tools-country-of-origin',
  'tools-warranty',
];

const PLUMBING_ATTRS = [
  'tools-pipe-diameter',
  'tools-material',
  'tools-country-of-origin',
  'tools-warranty',
];

const PAINT_ATTRS = [
  'tools-paint-finish',
  'tools-paint-volume',
  'tools-country-of-origin',
];

const PPE_ATTRS = [
  'tools-material',
  'tools-safety-certification',
  'tools-fastener-length',
  'tools-country-of-origin',
];

const MEASURING_ATTRS = [
  'tools-measurement-range',
  'tools-material',
  'tools-country-of-origin',
  'tools-warranty',
];

// ---------------------------------------------------------------------------
// 3. Taxonomy Tree (11 Primary Branches + L3 Subcategories)
// ---------------------------------------------------------------------------
const TOOLS_TAXONOMY: SeedTaxonomyNode = {
  slug: 'tools-hardware',
  nameEn: 'Tools & Hardware',
  nameBn: 'যন্ত্রপাতি ও হার্ডওয়্যার',
  icon: '🔧',
  descriptionEn:
    'Industrial power tools, professional hand tools, electrical supplies, plumbing fittings, fasteners, safety gear, and workshop equipment.',
  descriptionBn:
    'পেশাদার পাওয়ার টুলস, হ্যান্ড টুলস, ইলেকট্রিক্যাল ওয়্যারিং, প্লাম্বিং সামগ্রী, নাট-বল্টু ও সেফটি ইকুইপমেন্ট।',
  children: [
    // 1. Hand Tools
    {
      slug: 'hand-tools',
      nameEn: 'Hand Tools',
      nameBn: 'হস্তচালিত যন্ত্রপাতি',
      children: [
        {
          slug: 'screwdrivers-wrenches',
          nameEn: 'Screwdrivers & Wrenches',
          nameBn: 'স্ক্রু-ড্রাইভার ও রেঞ্জ',
          productTypes: [
            pt('screwdriver-set', [...HAND_TOOL_COMMON, 'tools-drive-type', 'tools-pack-quantity'], 'Screwdriver Set', 'স্ক্রু-ড্রাইভার সেট'),
            pt('combination-wrench', [...HAND_TOOL_COMMON, 'tools-drive-size', 'tools-fastener-length'], 'Combination Wrench', 'কম্বিনেশন রেঞ্জ'),
            pt('adjustable-wrench', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Adjustable Wrench', 'এডজাস্টেবল রেঞ্জ'),
            pt('socket-wrench-set', [...HAND_TOOL_COMMON, 'tools-drive-size', 'tools-pack-quantity'], 'Socket Wrench Set', 'সকেট রেঞ্জ সেট'),
          ],
        },
        {
          slug: 'pliers-cutters',
          nameEn: 'Pliers & Cutters',
          nameBn: 'প্লায়ার্স ও কাটার',
          productTypes: [
            pt('combination-pliers', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Combination Pliers', 'কম্বিনেশন প্লায়ার্স'),
            pt('wire-stripper', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Wire Stripper & Cutter', 'ওয়্যার স্ট্রিপার ও কাটার'),
          ],
        },
        {
          slug: 'hammers-chisels',
          nameEn: 'Hammers & Chisels',
          nameBn: 'হাতুড়ি ও বাটালি',
          productTypes: [
            pt('claw-hammer', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Claw Hammer', 'ক্ল হ্যামার / হাতুড়ি'),
          ],
        },
        {
          slug: 'hand-saws',
          nameEn: 'Hand Saws & Cutting',
          nameBn: 'করাত ও কাটিং টুলস',
          productTypes: [
            pt('hand-saw', [...HAND_TOOL_COMMON, 'tools-blade-diameter-mm'], 'Hand Saw & Hacksaw', 'হ্যান্ড স ও হ্যাকস'),
          ],
        },
        {
          slug: 'measuring-tapes-rules',
          nameEn: 'Measuring Tapes & Rules',
          nameBn: 'পরিমাপক ফিতা ও রুলার',
          productTypes: [
            pt('measuring-tape', [...MEASURING_ATTRS, 'tools-fastener-length'], 'Measuring Tape', 'মেজারমেন্ট টেপ'),
          ],
        },
        {
          slug: 'hand-tool-sets',
          nameEn: 'Tool Sets & Combos',
          nameBn: 'টুল সেট ও কম্বো কিট',
          productTypes: [
            pt('general-tool-set', [...HAND_TOOL_COMMON, 'tools-pack-quantity'], 'Mechanic & Household Tool Set', 'টুল সেট কম্বো'),
          ],
        },
      ],
    },

    // 2. Power Tools
    {
      slug: 'power-tools',
      nameEn: 'Power Tools',
      nameBn: 'পাওয়ার টুলস ও বৈদ্যুতিক যন্ত্রপাতি',
      children: [
        {
          slug: 'drills-drivers',
          nameEn: 'Drills & Drivers',
          nameBn: 'ড্রিল ও ড্রাইভার',
          productTypes: [
            pt('cordless-drill', CORDLESS_DRILL_ATTRS, 'Cordless Drill & Driver', 'কর্ডলেস ড্রিল ও ড্রাইভার'),
            pt('corded-hammer-drill', POWER_TOOL_COMMON, 'Corded Hammer Drill', 'কর্ডযুক্ত হ্যামার ড্রিল'),
          ],
        },
        {
          slug: 'angle-grinders-cutters',
          nameEn: 'Angle Grinders & Cutters',
          nameBn: 'অ্যাঙ্গেল গ্রাইন্ডার ও কাটার',
          productTypes: [
            pt('angle-grinder', ANGLE_GRINDER_ATTRS, 'Angle Grinder', 'অ্যাঙ্গেল গ্রাইন্ডার'),
            pt('marble-tile-cutter', POWER_TOOL_COMMON, 'Tile & Marble Cutter', 'মার্বেল ও টাইলস কাটার'),
          ],
        },
        {
          slug: 'power-saws',
          nameEn: 'Power Saws',
          nameBn: 'পাওয়ার করাত',
          productTypes: [
            pt('circular-saw', CIRCULAR_SAW_ATTRS, 'Circular Saw', 'সার্কুলার স'),
            pt('jigsaw', POWER_TOOL_COMMON, 'Electric Jigsaw', 'ইলেকট্রিক জিগস'),
          ],
        },
        {
          slug: 'heat-guns-blowers',
          nameEn: 'Heat Guns & Blowers',
          nameBn: 'হিট গান ও ব্লোয়ার',
          productTypes: [
            pt('heat-gun', POWER_TOOL_COMMON, 'Variable Heat Gun', 'হিট গান'),
          ],
        },
      ],
    },

    // 3. Workshop & Garage
    {
      slug: 'workshop-garage',
      nameEn: 'Workshop & Garage Equipment',
      nameBn: 'ওয়ার্কশপ ও গ্যারেজ সরঞ্জাম',
      children: [
        {
          slug: 'tool-boxes-storage',
          nameEn: 'Tool Boxes & Storage',
          nameBn: 'টুল বক্স ও স্টোরেজ',
          productTypes: [
            pt('tool-box', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Tool Box & Chest', 'টুল বক্স ও অর্গানাইজার'),
          ],
        },
        {
          slug: 'vises-clamps',
          nameEn: 'Vises & Clamps',
          nameBn: 'ভাইস ও ক্ল্যাম্প',
          productTypes: [
            pt('bench-vise', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Bench Vise & Clamps', 'বেঞ্চ ভাইস ও ক্ল্যাম্প'),
          ],
        },
        {
          slug: 'ladders-access',
          nameEn: 'Ladders & Step Stools',
          nameBn: 'মই ও স্টেপ ল্যাডার',
          productTypes: [
            pt('step-ladder', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Heavy-Duty Ladder', 'অ্যালুমিনিয়াম মই'),
          ],
        },
        {
          slug: 'air-compressors-washers',
          nameEn: 'Air Compressors & Washers',
          nameBn: 'কম্প্রেসর ও প্রেশার ওয়াশার',
          productTypes: [
            pt('pressure-washer', POWER_TOOL_COMMON, 'High Pressure Washer', 'হাই প্রেশার ওয়াশার'),
          ],
        },
      ],
    },

    // 4. Hardware & Fasteners
    {
      slug: 'hardware-fasteners',
      nameEn: 'Hardware & Fasteners',
      nameBn: 'হার্ডওয়্যার ও নাট-বল্টু',
      children: [
        {
          slug: 'screws-drywall',
          nameEn: 'Screws & Drywall Fasteners',
          nameBn: 'স্ক্রু ও ড্রাইভাল ফাস্টেনার',
          productTypes: [
            pt('drywall-screw', FASTENER_ATTRS, 'Drywall & Wood Screw', 'ড্রাইওয়াল ও কাঠ স্ক্রু'),
          ],
        },
        {
          slug: 'bolts-nuts-washers',
          nameEn: 'Bolts, Nuts & Washers',
          nameBn: 'বোল্ট, নাট ও ওয়াশার',
          productTypes: [
            pt('hex-bolt', FASTENER_ATTRS, 'Hex Bolt & Nut', 'হেক্স বোল্ট ও নাট'),
          ],
        },
        {
          slug: 'wall-anchors-plugs',
          nameEn: 'Wall Anchors & Plugs',
          nameBn: 'ওয়াল অ্যাঙ্কর ও প্লাগ',
          productTypes: [
            pt('wall-anchor', FASTENER_ATTRS, 'Expansion Wall Anchor', 'ওয়াল প্লাগ ও রয়্যাল প্লাগ'),
          ],
        },
        {
          slug: 'locks-latches-padlocks',
          nameEn: 'Locks, Latches & Padlocks',
          nameBn: 'তালা ও সিকিউরিটি লক',
          productTypes: [
            pt('padlock', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Heavy Padlock & Door Lock', 'প্যাডলক ও ডোর লক'),
          ],
        },
        {
          slug: 'brackets-hinges',
          nameEn: 'Hinges & Brackets',
          nameBn: 'কব্জা ও ব্র্যাকেট',
          productTypes: [
            pt('door-hinge', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Stainless Steel Hinge', 'স্টেইনলেস স্টিল কব্জা'),
          ],
        },
      ],
    },

    // 5. Electrical Supplies
    {
      slug: 'electrical-supplies',
      nameEn: 'Electrical Supplies & Wiring',
      nameBn: 'বৈদ্যুতিক সরঞ্জাম ও ওয়্যারিং',
      children: [
        {
          slug: 'switches-sockets',
          nameEn: 'Switches & Sockets',
          nameBn: 'সুইচ ও সকেট',
          productTypes: [
            pt('light-switch', ELECTRICAL_ATTRS, 'Modular Switch & Socket', 'মডুলার সুইচ ও সকেট'),
          ],
        },
        {
          slug: 'extension-power-strips',
          nameEn: 'Extension Boards & Strips',
          nameBn: 'মাল্টিপ্লাগ ও পাওয়ার স্ট্রিপ',
          productTypes: [
            pt('extension-board', [...ELECTRICAL_ATTRS, 'tools-fastener-length'], 'Power Strip & Extension Board', 'মাল্টিপ্লাগ এক্সটেনশন'),
          ],
        },
        {
          slug: 'wires-cables',
          nameEn: 'Wires & Cables',
          nameBn: 'তার ও ক্যাবল',
          productTypes: [
            pt('electrical-wire', [...ELECTRICAL_ATTRS, 'tools-fastener-length'], 'Building Wire & Cable', 'বিল্ডিং ওয়্যার ও ক্যাবল'),
          ],
        },
        {
          slug: 'circuit-breakers-mcb',
          nameEn: 'Circuit Breakers & Distribution',
          nameBn: 'সার্কিট ব্রেকার ও এমসিবি',
          productTypes: [
            pt('circuit-breaker-mcb', ELECTRICAL_ATTRS, 'Miniature Circuit Breaker (MCB)', 'সার্কিট ব্রেকার (MCB)'),
          ],
        },
      ],
    },

    // 6. Plumbing & Sanitary
    {
      slug: 'plumbing-sanitary',
      nameEn: 'Plumbing & Sanitary',
      nameBn: 'প্লাম্বিং ও পাইপ ফিটিংস',
      children: [
        {
          slug: 'pipes-conduits',
          nameEn: 'Pipes & Conduits',
          nameBn: 'পিভিসি ও পিপিআর পাইপ',
          productTypes: [
            pt('pvc-pipe', PLUMBING_ATTRS, 'PVC & PPR Pipe', 'ইউপিভিসি ও পিপিআর পাইপ'),
          ],
        },
        {
          slug: 'pipe-fittings-elbows',
          nameEn: 'Pipe Fittings, Elbows & Tees',
          nameBn: 'ফিটিংস, এলবো ও টি',
          productTypes: [
            pt('pipe-fitting', PLUMBING_ATTRS, 'Pipe Elbow, Tee & Union', 'পাইপ ফিটিংস ও এলবো'),
          ],
        },
        {
          slug: 'valves-taps',
          nameEn: 'Valves & Brass Taps',
          nameBn: 'বাল্ব ও ব্রাস ট্যাপ',
          productTypes: [
            pt('ball-valve', PLUMBING_ATTRS, 'PVC & Brass Ball Valve', 'বল ভাল্ব ও গেট ভাল্ব'),
          ],
        },
        {
          slug: 'thread-tapes-sealants',
          nameEn: 'Thread Seal Tapes & Adhesives',
          nameBn: 'থ্রেড সিল টেপ ও পাইপ গ্লু',
          productTypes: [
            pt('thread-seal-tape', [...PLUMBING_ATTRS, 'tools-pack-quantity'], 'PTFE Thread Seal Tape', 'ট্রেড সিল টেপ'),
          ],
        },
      ],
    },

    // 7. Paint & Decorating
    {
      slug: 'paint-decorating',
      nameEn: 'Paint & Decorating',
      nameBn: 'রং ও দেয়াল সাজসজ্জা',
      children: [
        {
          slug: 'wall-paints-enamels',
          nameEn: 'Interior & Exterior Paints',
          nameBn: 'দেয়াল ও মেটাল পেইন্ট',
          productTypes: [
            pt('wall-paint', PAINT_ATTRS, 'Wall Paint & Emulsion', 'ওয়াল পেইন্ট ও প্লাস্টিক পেইন্ট'),
          ],
        },
        {
          slug: 'paint-brushes-rollers',
          nameEn: 'Paint Brushes & Rollers',
          nameBn: 'পেইন্ট ব্রাশ ও রোলার',
          productTypes: [
            pt('paint-brush', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Paint Brush & Roller', 'পেইন্ট ব্রাশ ও রোলার'),
          ],
        },
      ],
    },

    // 8. Safety & PPE
    {
      slug: 'safety-ppe',
      nameEn: 'Safety Gear & PPE',
      nameBn: 'নিরাপত্তা ও সুরক্ষা সরঞ্জাম',
      children: [
        {
          slug: 'safety-gloves',
          nameEn: 'Heavy-Duty Work Gloves',
          nameBn: 'সেফটি গ্লাভস',
          productTypes: [
            pt('work-gloves', PPE_ATTRS, 'Cut-Resistant Work Gloves', 'কাট-রেজিস্ট্যান্ট সেফটি গ্লাভস'),
          ],
        },
        {
          slug: 'safety-shoes-boots',
          nameEn: 'Safety Shoes & Steel Toe Boots',
          nameBn: 'সেফটি সু ও বুট',
          productTypes: [
            pt('safety-shoes', PPE_ATTRS, 'Steel Toe Safety Shoes', 'স্টিল টো সেফটি জুতা'),
          ],
        },
        {
          slug: 'safety-goggles-helmets',
          nameEn: 'Helmets & Eye Protection',
          nameBn: 'হেলমেট ও সেফটি গগলস',
          productTypes: [
            pt('safety-goggles', PPE_ATTRS, 'Industrial Safety Goggles', 'সেফটি গগলস ও চশমা'),
            pt('safety-helmet', PPE_ATTRS, 'Construction Hard Hat', 'কনস্ট্রাকশন সেফটি হেলমেট'),
          ],
        },
      ],
    },

    // 9. Building & Construction Supplies
    {
      slug: 'building-construction-supplies',
      nameEn: 'Building & Construction Supplies',
      nameBn: 'নির্মাণ সামগ্রী ও কেমিক্যাল',
      children: [
        {
          slug: 'silicone-waterproofing',
          nameEn: 'Silicone Sealants & Adhesives',
          nameBn: 'সিলিকন সিলেন্ট ও আঠা',
          productTypes: [
            pt('silicone-sealant', [...PAINT_ATTRS, 'tools-pack-quantity'], 'General Purpose Silicone Sealant', 'সিলিকন সিলেন্ট'),
          ],
        },
      ],
    },

    // 10. Garden & Outdoor Tools
    {
      slug: 'garden-outdoor-tools',
      nameEn: 'Garden & Outdoor Tools',
      nameBn: 'বাগান ও বহিরঙ্গন যন্ত্রপাতি',
      children: [
        {
          slug: 'pruning-shears-cutters',
          nameEn: 'Pruners & Garden Shears',
          nameBn: 'ছাঁটাই কাঁচি ও প্রুনার',
          productTypes: [
            pt('pruning-shears', [...HAND_TOOL_COMMON, 'tools-fastener-length'], 'Bypass Pruning Shears', 'গার্ডেন প্রুনিং কাঁচি'),
          ],
        },
      ],
    },

    // 11. Measuring & Leveling
    {
      slug: 'measuring-leveling',
      nameEn: 'Measuring & Testing Instruments',
      nameBn: 'পরিমাপ ও টেস্টিং সরঞ্জাম',
      children: [
        {
          slug: 'spirit-laser-levels',
          nameEn: 'Spirit & Laser Levels',
          nameBn: 'স্পিরিট ও লেজার লেভেল',
          productTypes: [
            pt('spirit-level', MEASURING_ATTRS, 'Magnetic Spirit Level', 'স্পিরিট লেভেল'),
          ],
        },
        {
          slug: 'calipers-multimeters',
          nameEn: 'Calipers & Multimeters',
          nameBn: 'ক্যালিপার ও ডিজিটাল মিটার',
          productTypes: [
            pt('digital-caliper', MEASURING_ATTRS, 'Digital Vernier Caliper', 'ডিজিটাল ভার্নিয়ার ক্যালিপার'),
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 4. Authentic Brands & Manufacturers
// ---------------------------------------------------------------------------
const TOOLS_MANUFACTURERS: SeedManufacturer[] = [
  { name: 'Robert Bosch GmbH', country: 'Germany', website: 'https://www.bosch-pt.com' },
  { name: 'Makita Corporation', country: 'Japan', website: 'https://www.makita.biz' },
  { name: 'Stanley Black & Decker', country: 'USA', website: 'https://www.stanleytools.com' },
  { name: 'Total Tools Co., Ltd.', country: 'China', website: 'https://www.totaltools.com' },
  { name: 'Ingco Tools Co., Ltd.', country: 'China', website: 'https://www.ingco.com' },
  { name: 'Berger Paints Bangladesh Ltd.', country: 'Bangladesh', website: 'https://www.bergerbd.com' },
  { name: 'BRB Cable Industries Ltd.', country: 'Bangladesh', website: 'https://www.brbcable.com' },
  { name: 'Super Star Group (SSG)', country: 'Bangladesh', website: 'https://www.ssgbd.com' },
  { name: 'RFL Plastics & Pipes', country: 'Bangladesh', website: 'https://www.rflbd.com' },
  { name: 'Gazi Group', country: 'Bangladesh', website: 'https://www.gazigroup.com' },
];

const TOOLS_BRANDS: SeedBrand[] = [
  { name: 'Bosch', manufacturer: 'Robert Bosch GmbH' },
  { name: 'Makita', manufacturer: 'Makita Corporation' },
  { name: 'DeWalt', manufacturer: 'Stanley Black & Decker' },
  { name: 'Stanley', manufacturer: 'Stanley Black & Decker' },
  { name: 'Total Tools', manufacturer: 'Total Tools Co., Ltd.' },
  { name: 'Ingco', manufacturer: 'Ingco Tools Co., Ltd.' },
  { name: 'Crown', manufacturer: 'Total Tools Co., Ltd.' },
  { name: 'Berger Paints', manufacturer: 'Berger Paints Bangladesh Ltd.' },
  { name: 'BRB Cable', manufacturer: 'BRB Cable Industries Ltd.' },
  { name: 'Super Star', manufacturer: 'Super Star Group (SSG)' },
  { name: 'RFL', manufacturer: 'RFL Plastics & Pipes' },
  { name: 'Gazi', manufacturer: 'Gazi Group' },
  { name: 'Dowsil', manufacturer: 'Stanley Black & Decker' },
];

// ---------------------------------------------------------------------------
// 5. 24 Seed Demo Products
// ---------------------------------------------------------------------------
const TOOLS_PRODUCTS: SeedVerticalProduct[] = [
  // 1. Bosch GSB 185-LI Cordless Hammer Drill
  {
    nameEn: 'Bosch GSB 185-LI Brushless Cordless Impact Drill 18V',
    nameBn: 'বশ জিএসবি ১৮৫-এলআই ব্রাশলেস কর্ডলেস ইমপ্যাক্ট ড্রিল ১৮ ভোল্ট',
    slug: 'demo-tools-bosch-gsb-185-li',
    sku: 'TL-BOSCH-GSB-01',
    price: 8200,
    compareAtPrice: 9500,
    stock: 37,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/power-tools/drills-drivers',
    productTypeSlug: 'cordless-drill',
    brand: 'Bosch',
    manufacturer: 'Robert Bosch GmbH',
    shortDescriptionEn:
      'The Bosch GSB 185-LI Professional cordless combi drill offers compact handling with an efficient brushless motor. Provides 50 Nm of torque and up to 1,900 RPM for heavy masonry, metal, and woodworking.',
    descriptionEn:
      'The Bosch GSB 185-LI Professional cordless combi drill offers compact handling with an efficient brushless motor. Provides 50 Nm of torque and up to 1,900 RPM for heavy masonry, metal, and woodworking.',
    shortDescriptionBn:
      'বশ জিএসবি ১৮৫-এলআই ব্রাশলেস ইমপ্যাক্ট ড্রিল ১৮ ভোল্ট ব্যাটারিতে চালিত। কংক্রিট ওয়াল, মেটাল শিট এবং কাঠের কাজে অত্যন্ত শক্তিশালী ৫০ নিউটন মিটার টর্ক প্রদান করে।',
    descriptionBn:
      'বশ জিএসবি ১৮৫-এলআই ব্রাশলেস ইমপ্যাক্ট ড্রিল ১৮ ভোল্ট ব্যাটারিতে চালিত। কংক্রিট ওয়াল, মেটাল শিট এবং কাঠের কাজে অত্যন্ত শক্তিশালী ৫০ নিউটন মিটার টর্ক প্রদান করে।',
    specs: {
      'tools-power-source': 'Cordless Battery',
      'tools-voltage': '18V Li-ion',
      'tools-no-load-speed-rpm': 1900,
      'tools-max-torque-nm': 50,
      'tools-chuck-size': '13mm (1/2")',
      'tools-material': 'Impact-Resistant Polyamide & Steel Gearbox',
      'tools-country-of-origin': 'Germany / Malaysia',
      'tools-warranty': '1 Year Official Bosch Warranty',
    },
    variants: [
      kv('Bare Tool (Without Battery & Charger)', 'BOSCH-GSB185-SOLO', 8200, 15, {
        'tools-battery-included': 'false',
        'tools-charger-included': 'false',
      }),
      kv('Kit with 2x 2.0Ah Batteries & Fast Charger', 'BOSCH-GSB185-KIT', 14500, 22, {
        'tools-battery-capacity': '2.0Ah Li-ion',
        'tools-battery-included': 'true',
        'tools-charger-included': 'true',
      }),
    ],
  },

  // 2. Makita 9557HNG Angle Grinder 840W
  {
    nameEn: 'Makita 9557HNG Heavy Duty Angle Grinder 840W 100mm',
    nameBn: 'মাকিতা ৯৫৫৭এইচএনজি হেভি ডিউটি অ্যাঙ্গেল গ্রাইন্ডার ৮৪০ ওয়াট',
    slug: 'demo-tools-makita-angle-grinder',
    sku: 'TL-MAK-9557-01',
    price: 5400,
    compareAtPrice: 6200,
    stock: 43,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/power-tools/angle-grinders-cutters',
    productTypeSlug: 'angle-grinder',
    brand: 'Makita',
    manufacturer: 'Makita Corporation',
    shortDescriptionEn:
      'The Makita 9557HNG 100mm (4") angle grinder is built with a labyrinth construction that seals the motor and bearings from dust and debris. Ideal for metal fabrication, rebar cutting, and weld grinding.',
    descriptionEn:
      'The Makita 9557HNG 100mm (4") angle grinder is built with a labyrinth construction that seals the motor and bearings from dust and debris. Ideal for metal fabrication, rebar cutting, and weld grinding.',
    shortDescriptionBn:
      'মাকিতা ৯৫৫৭এইচএনজি ৪ ইঞ্চি অ্যাঙ্গেল গ্রাইন্ডার ৮৪০ ওয়াট ক্ষমতা সম্পন্ন। ধুলো-বালি ও লোহার কণা প্রতিরোধক লেবিরিন্থ মোটর প্রযুক্তি সমৃদ্ধ।',
    descriptionBn:
      'মাকিতা ৯৫৫৭এইচএনজি ৪ ইঞ্চি অ্যাঙ্গেল গ্রাইন্ডার ৮৪০ ওয়াট ক্ষমতা সম্পন্ন। ধুলো-বালি ও লোহার কণা প্রতিরোধক লেবিরিন্থ মোটর প্রযুক্তি সমৃদ্ধ।',
    specs: {
      'tools-power-source': 'Corded Electric',
      'tools-voltage': '220V–240V AC',
      'tools-wattage': 840,
      'tools-no-load-speed-rpm': 11000,
      'tools-disc-diameter-mm': 100,
      'tools-country-of-origin': 'Japan / Thailand',
      'tools-warranty': '6 Months Service Warranty',
    },
    variants: [
      kv('Standard Grinder with Wheel Guard', 'MAK-9557-STD', 5400, 25),
      kv('Deluxe Pack (+ 5 Pcs Cutting Discs & Handle)', 'MAK-9557-DLX', 6100, 18),
    ],
  },

  // 3. DeWalt DWE560 Compact Circular Saw 1350W
  {
    nameEn: 'DeWalt DWE560 Heavy-Duty Compact Circular Saw 1350W',
    nameBn: 'ডিওয়ল্ট ডিডব্লিউই৫৬০ হেভি ডিউটি সার্কুলার স ১৩৫০ ওয়াট',
    slug: 'demo-tools-dewalt-circular-saw',
    sku: 'TL-DEW-DWE560-01',
    price: 12800,
    compareAtPrice: 14500,
    stock: 12,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/power-tools/power-saws',
    productTypeSlug: 'circular-saw',
    brand: 'DeWalt',
    manufacturer: 'Stanley Black & Decker',
    shortDescriptionEn:
      'The DeWalt DWE560 circular saw features a high-power 1350W motor delivering a 65mm cut depth. Cutaway inner guard gives improved line of sight to cutting line with integrated dust blower.',
    descriptionEn:
      'The DeWalt DWE560 circular saw features a high-power 1350W motor delivering a 65mm cut depth. Cutaway inner guard gives improved line of sight to cutting line with integrated dust blower.',
    shortDescriptionBn:
      'ডিওয়ল্ট ১৩৫০ ওয়াট সার্কুলার করাত কাঠের কাজে ৬৫ মিমি গভীরতা পর্যন্ত কাটার উপযোগী। ডাস্ট ব্লোয়ার যুক্ত থাকায় কাজের স্পষ্ট দৃশ্যমানতা বজায় থাকে।',
    descriptionBn:
      'ডিওয়ল্ট ১৩৫০ ওয়াট সার্কুলার করাত কাঠের কাজে ৬৫ মিমি গভীরতা পর্যন্ত কাটার উপযোগী। ডাস্ট ব্লোয়ার যুক্ত থাকায় কাজের স্পষ্ট দৃশ্যমানতা বজায় থাকে।',
    specs: {
      'tools-power-source': 'Corded Electric',
      'tools-voltage': '220V–240V AC',
      'tools-wattage': 1350,
      'tools-no-load-speed-rpm': 5500,
      'tools-blade-diameter-mm': 184,
      'tools-country-of-origin': 'USA / China',
      'tools-warranty': '1 Year Official Warranty',
    },
    variants: [
      kv('Standard Kit with 24T Carbide Blade', 'DEW-DWE560-184', 12800, 12),
    ],
  },

  // 4. Total Tools 20V Li-Ion Cordless Jigsaw
  {
    nameEn: 'Total Tools 20V Li-Ion Cordless Orbital Jigsaw',
    nameBn: 'টোটাল টুলস ২০ ভোল্ট কর্ডলেস অরবিটাল জিগস',
    slug: 'demo-tools-total-cordless-jigsaw',
    sku: 'TL-TOT-JIG-01',
    price: 3900,
    compareAtPrice: 4500,
    stock: 34,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/power-tools/power-saws',
    productTypeSlug: 'jigsaw',
    brand: 'Total Tools',
    manufacturer: 'Total Tools Co., Ltd.',
    shortDescriptionEn:
      'Total 20V Cordless Jigsaw with 4-stage orbital action, tool-free blade clamp, and 45-degree bevel cutting base. Slices through wood, aluminium, and sheet steel with smooth agility.',
    descriptionEn:
      'Total 20V Cordless Jigsaw with 4-stage orbital action, tool-free blade clamp, and 45-degree bevel cutting base. Slices through wood, aluminium, and sheet steel with smooth agility.',
    shortDescriptionBn:
      'টোটাল ২০ ভোল্ট লিথিয়াম-আয়ন জিগস ৪-ধাপের পেন্ডুলাম কাটিং মোড সহ। কাঠ ও অ্যালুমিনিয়াম ৪৫ ডিগ্রি কোণে কাটার সুবিধা।',
    descriptionBn:
      'টোটাল ২০ ভোল্ট লিথিয়াম-আয়ন জিগস ৪-ধাপের পেন্ডুলাম কাটিং মোড সহ। কাঠ ও অ্যালুমিনিয়াম ৪৫ ডিগ্রি কোণে কাটার সুবিধা।',
    specs: {
      'tools-power-source': 'Cordless Battery',
      'tools-voltage': '20V Max',
      'tools-no-load-speed-rpm': 2600,
      'tools-country-of-origin': 'China',
      'tools-warranty': '6 Months Warranty',
    },
    variants: [
      kv('Bare Tool (Without Battery)', 'TOT-TJIG-SOLO', 3900, 20, {
        'tools-battery-included': 'false',
      }),
      kv('Full Kit with 4.0Ah Battery & Fast Charger', 'TOT-TJIG-4AH', 7200, 14, {
        'tools-battery-capacity': '4.0Ah Li-ion',
        'tools-battery-included': 'true',
        'tools-charger-included': 'true',
      }),
    ],
  },

  // 5. Ingco 2000W Variable Temperature Heat Gun
  {
    nameEn: 'Ingco 2000W Dual Temperature Industrial Heat Gun',
    nameBn: 'ইংকো ২০০০ ওয়াট ইন্ডাস্ট্রিয়াল হিট গান',
    slug: 'demo-tools-ingco-heat-gun',
    sku: 'TL-ING-HG2000-01',
    price: 2450,
    compareAtPrice: 2800,
    stock: 30,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/power-tools/heat-guns-blowers',
    productTypeSlug: 'heat-gun',
    brand: 'Ingco',
    manufacturer: 'Ingco Tools Co., Ltd.',
    shortDescriptionEn:
      'The Ingco 2000W heat gun offers dual airflow settings and temperature adjustment from 50°C to 600°C. Ideal for paint stripping, heat shrink tubing, pipe bending, and vinyl wrap application.',
    descriptionEn:
      'The Ingco 2000W heat gun offers dual airflow settings and temperature adjustment from 50°C to 600°C. Ideal for paint stripping, heat shrink tubing, pipe bending, and vinyl wrap application.',
    shortDescriptionBn:
      'ইংকো ২০০০ ওয়াট ইলেকট্রিক হিট গান ৫০° থেকে ৬০০° সেলসিয়াস তাপমাত্রা তৈরি করতে পারে। তারের হিট শ্রিংক ও পেইন্ট তোলার জন্য কার্যকর।',
    descriptionBn:
      'ইংকো ২০০০ ওয়াট ইলেকট্রিক হিট গান ৫০° থেকে ৬০০° সেলসিয়াস তাপমাত্রা তৈরি করতে পারে। তারের হিট শ্রিংক ও পেইন্ট তোলার জন্য কার্যকর।',
    specs: {
      'tools-power-source': 'Corded Electric',
      'tools-voltage': '220V–240V AC',
      'tools-wattage': 2000,
      'tools-country-of-origin': 'China',
      'tools-warranty': '6 Months Warranty',
    },
    variants: [
      kv('Standard Kit with 4 Nozzle Attachments', 'ING-HG20008-STD', 2450, 30),
    ],
  },

  // 6. Stanley FatMax 16oz AntiVibe Claw Hammer
  {
    nameEn: 'Stanley FatMax 16oz Steel AntiVibe Curved Claw Hammer',
    nameBn: 'স্ট্যানলি ফ্যাটম্যাক্স ১৬ আউন্স অ্যান্টি-ভাইব ক্ল হ্যামার',
    slug: 'demo-tools-stanley-claw-hammer',
    sku: 'TL-STAN-HAM-01',
    price: 1650,
    compareAtPrice: 1900,
    stock: 55,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/hand-tools/hammers-chisels',
    productTypeSlug: 'claw-hammer',
    brand: 'Stanley',
    manufacturer: 'Stanley Black & Decker',
    shortDescriptionEn:
      'Crafted from a single piece of forged carbon steel, the Stanley FatMax AntiVibe Claw Hammer dampens vibration and reduces arm strain during heavy carpentry and nail extraction.',
    descriptionEn:
      'Crafted from a single piece of forged carbon steel, the Stanley FatMax AntiVibe Claw Hammer dampens vibration and reduces arm strain during heavy carpentry and nail extraction.',
    shortDescriptionBn:
      'একক টুকরো কার্বন স্টিল থেকে নির্মিত স্ট্যানলি ফ্যাটম্যাক্স হাতুড়ি। অ্যান্টি-ভাইব গ্রিপ থাকায় আঘাতের ঝাঁকুনি শোষণ করে হাতে ব্যথা হওয়া রোধ করে।',
    descriptionBn:
      'একক টুকরো কার্বন স্টিল থেকে নির্মিত স্ট্যানলি ফ্যাটম্যাক্স হাতুড়ি। অ্যান্টি-ভাইব গ্রিপ থাকায় আঘাতের ঝাঁকুনি শোষণ করে হাতে ব্যথা হওয়া রোধ করে।',
    specs: {
      'tools-material': 'One-Piece Forged High Carbon Steel',
      'tools-handle-grip': 'AntiVibe Ergonomic Rubber Grip',
      'tools-country-of-origin': 'USA / Taiwan',
      'tools-warranty': 'Limited Lifetime Warranty',
    },
    variants: [
      sv('16oz (450g) Standard', 'STAN-HAM-16OZ', 1650, 35),
      sv('20oz (570g) Heavy Framing', 'STAN-HAM-20OZ', 1950, 20),
    ],
  },

  // 7. Total Tools 24-Piece 1/2" Socket Wrench Set
  {
    nameEn: 'Total Tools 24-Piece 1/2" Dr. Chrome Vanadium Socket Set',
    nameBn: 'টোটাল টুলস ২৪ পিস ১/২ ইঞ্চি ক্রোম ভ্যানাডিয়াম সকেট রেঞ্জ সেট',
    slug: 'demo-tools-total-socket-set',
    sku: 'TL-TOT-SCK-01',
    price: 4800,
    compareAtPrice: 5500,
    stock: 18,
    unit: 'set',
    isFeatured: true,
    categoryPath: 'tools-hardware/hand-tools/screwdrivers-wrenches',
    productTypeSlug: 'socket-wrench-set',
    brand: 'Total Tools',
    manufacturer: 'Total Tools Co., Ltd.',
    shortDescriptionEn:
      'Complete 24-piece automotive socket set featuring 1/2" quick-release 72-tooth ratchet, universal joint, sliding T-bar, extensions, and metric Cr-V sockets from 10mm to 32mm in a sturdy steel carry case.',
    descriptionEn:
      'Complete 24-piece automotive socket set featuring 1/2" quick-release 72-tooth ratchet, universal joint, sliding T-bar, extensions, and metric Cr-V sockets from 10mm to 32mm in a sturdy steel carry case.',
    shortDescriptionBn:
      '২৪ পিসের অটোমোবাইল মেকানিক সকেট সেট। ১০ মিমি থেকে ৩২ মিমি ক্রোম ভ্যানাডিয়াম সকেট, দ্রুত রিলিজ র্যাচেট ও মেটাল ক্যারি কেস সহ।',
    descriptionBn:
      '২৪ পিসের অটোমোবাইল মেকানিক সকেট সেট। ১০ মিমি থেকে ৩২ মিমি ক্রোম ভ্যানাডিয়াম সকেট, দ্রুত রিলিজ র্যাচেট ও মেটাল ক্যারি কেস সহ।',
    specs: {
      'tools-material': 'Chrome Vanadium Steel (Cr-V) 50BV30',
      'tools-drive-size': '1/2" Drive',
      'tools-country-of-origin': 'China',
      'tools-warranty': '1 Year Brand Warranty',
    },
    variants: [
      kv('24-Piece Set in Heavy Steel Case', 'TOT-THTST-24PC', 4800, 18),
    ],
  },

  // 8. Ingco 8-Piece Magnetic Screwdriver Set
  {
    nameEn: 'Ingco 8-Piece Industrial Cr-V Magnetic Screwdriver Set',
    nameBn: 'ইংকো ৮ পিস ম্যাগনেটিক স্ক্রু-ড্রাইভার সেট',
    slug: 'demo-tools-ingco-screwdriver-set',
    sku: 'TL-ING-SCR-01',
    price: 1250,
    compareAtPrice: 1450,
    stock: 40,
    unit: 'set',
    isFeatured: true,
    categoryPath: 'tools-hardware/hand-tools/screwdrivers-wrenches',
    productTypeSlug: 'screwdriver-set',
    brand: 'Ingco',
    manufacturer: 'Ingco Tools Co., Ltd.',
    shortDescriptionEn:
      'Set of 8 heavy-duty screwdrivers with magnetic blackened tips and comfortable ergonomic handles. Includes Phillips (PH0, PH1, PH2) and Slotted (SL3, SL5.5, SL6.5) drivers with wall mount rack.',
    descriptionEn:
      'Set of 8 heavy-duty screwdrivers with magnetic blackened tips and comfortable ergonomic handles. Includes Phillips (PH0, PH1, PH2) and Slotted (SL3, SL5.5, SL6.5) drivers with wall mount rack.',
    shortDescriptionBn:
      'শক্তিশালী ম্যাগনেটিক টিপ সমৃদ্ধ ৮ পিস স্ক্রু ড্রাইভার সেট। ফ্ল্যাট এবং স্টার উভয় ধরণের স্ক্রুর কাজের জন্য প্রযোজ্য।',
    descriptionBn:
      'শক্তিশালী ম্যাগনেটিক টিপ সমৃদ্ধ ৮ পিস স্ক্রু ড্রাইভার সেট। ফ্ল্যাট এবং স্টার উভয় ধরণের স্ক্রুর কাজের জন্য প্রযোজ্য।',
    specs: {
      'tools-material': 'Round Shank Chrome Vanadium (Cr-V)',
      'tools-handle-grip': 'Ergonomic TPR Non-Slip Grip',
      'tools-country-of-origin': 'China',
    },
    variants: [
      kv('8-Piece Screwdriver Set with Wall Mount', 'ING-HKSD0828', 1250, 40),
    ],
  },

  // 9. Stanley 8m / 26ft PowerLock Measuring Tape
  {
    nameEn: 'Stanley PowerLock 8m / 26ft Heavy-Duty Measuring Tape',
    nameBn: 'স্ট্যানলি পাওয়ার-লক ৮ মিটার মেজারিং টেপ',
    slug: 'demo-tools-stanley-measuring-tape',
    sku: 'TL-STAN-TP-01',
    price: 650,
    compareAtPrice: 750,
    stock: 105,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/hand-tools/measuring-tapes-rules',
    productTypeSlug: 'measuring-tape',
    brand: 'Stanley',
    manufacturer: 'Stanley Black & Decker',
    shortDescriptionEn:
      'The classic Stanley PowerLock steel tape measure with Mylar polyester coated blade for 10x longer blade life. Features positive blade lock, belt clip, and Tru-Zero hook for exact inside/outside measurements.',
    descriptionEn:
      'The classic Stanley PowerLock steel tape measure with Mylar polyester coated blade for 10x longer blade life. Features positive blade lock, belt clip, and Tru-Zero hook for exact inside/outside measurements.',
    shortDescriptionBn:
      'স্ট্যানলি পাওয়ারলক স্টিল মেজারিং টেপ। পলিয়েস্টার কোটিং ব্লেড দীর্ঘস্থায়ী ও ট্রু-জিরো হুক সঠিক পরিমাপের নিশ্চয়তা দেয়।',
    descriptionBn:
      'স্ট্যানলি পাওয়ারলক স্টিল মেজারিং টেপ। পলিয়েস্টার কোটিং ব্লেড দীর্ঘস্থায়ী ও ট্রু-জিরো হুক সঠিক পরিমাপের নিশ্চয়তা দেয়।',
    specs: {
      'tools-material': 'Chrome ABS Case with Carbon Steel Blade',
      'tools-country-of-origin': 'USA / Thailand',
    },
    variants: [
      sv('5m / 16ft Pocket Size', 'STAN-PL-5M', 650, 60, { 'tools-measurement-range': '5 Meters' }),
      sv('8m / 26ft Contractor Size', 'STAN-PL-8M', 950, 45, { 'tools-measurement-range': '8 Meters' }),
    ],
  },

  // 10. Crown Heavy Duty 19-Inch Metal Tool Box
  {
    nameEn: 'Crown Heavy-Duty 19-Inch 3-Tier Cantilever Metal Tool Box',
    nameBn: 'ক্রাউন হেভি ডিউটি ১৯ ইঞ্চি ৩-টায়ার মেটাল টুল বক্স',
    slug: 'demo-tools-crown-tool-box',
    sku: 'TL-CRN-TB-01',
    price: 3200,
    compareAtPrice: 3800,
    stock: 32,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/workshop-garage/tool-boxes-storage',
    productTypeSlug: 'tool-box',
    brand: 'Crown',
    manufacturer: 'Total Tools Co., Ltd.',
    shortDescriptionEn:
      'Heavy gauge steel construction with electro-powder rustproof coating. 3-tier cantilever opening mechanism gives immediate view and access to all tools, sockets, and hardware components.',
    descriptionEn:
      'Heavy gauge steel construction with electro-powder rustproof coating. 3-tier cantilever opening mechanism gives immediate view and access to all tools, sockets, and hardware components.',
    shortDescriptionBn:
      'পাউডার কোটেড অ্যান্টি-রাস্ট মেটাল টুল বক্স। ৩ স্তরের ক্যান্টিলিভার ড্রয়ার মেকানিজম থাকায় সব যন্ত্রপাতি সুন্দরভাবে সাজিয়ে রাখা যায়।',
    descriptionBn:
      'পাউডার কোটেড অ্যান্টি-রাস্ট মেটাল টুল বক্স। ৩ স্তরের ক্যান্টিলিভার ড্রয়ার মেকানিজম থাকায় সব যন্ত্রপাতি সুন্দরভাবে সাজিয়ে রাখা যায়।',
    specs: {
      'tools-material': 'Cold-Rolled Sheet Steel (0.8mm Gauge)',
      'tools-handle-grip': 'Tubular Full-Length Steel Handle',
      'tools-country-of-origin': 'China',
    },
    variants: [
      sv('19" 3-Tier Cantilever Box', 'CRN-TB-19', 3200, 20),
      sv('21" 5-Tier Industrial Box', 'CRN-TB-21', 4500, 12),
    ],
  },

  // 11. Total Tools 6-Inch Cast Iron Swivel Bench Vise
  {
    nameEn: 'Total Tools 6-Inch Heavy Cast Iron Swivel Base Bench Vise',
    nameBn: 'টোটাল টুলস ৬ ইঞ্চি কাস্ট আয়রন সুইভেল বেঞ্চ ভাইস',
    slug: 'demo-tools-total-bench-vise',
    sku: 'TL-TOT-VISE-01',
    price: 6500,
    compareAtPrice: 7500,
    stock: 10,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/workshop-garage/vises-clamps',
    productTypeSlug: 'bench-vise',
    brand: 'Total Tools',
    manufacturer: 'Total Tools Co., Ltd.',
    shortDescriptionEn:
      'Cast ductile iron construction with forged steel serrated jaws and 360-degree rotating swivel base with double lockdown bolts. Generates up to 3,500 kg clamping force for machining and metalwork.',
    descriptionEn:
      'Cast ductile iron construction with forged steel serrated jaws and 360-degree rotating swivel base with double lockdown bolts. Generates up to 3,500 kg clamping force for machining and metalwork.',
    shortDescriptionBn:
      'কাস্ট আয়রন বডি ও শক্ত স্টিল জ সমৃদ্ধ হেভি বেঞ্চ ভাইস। ৩৬০ ডিগ্রি ঘোরানোর সুবিধা ও ৩৫০০ কেজি পর্যন্ত ক্ল্যাম্পিং বল প্রদান করে।',
    descriptionBn:
      'কাস্ট আয়রন বডি ও শক্ত স্টিল জ সমৃদ্ধ হেভি বেঞ্চ ভাইস। ৩৬০ ডিগ্রি ঘোরানোর সুবিধা ও ৩৫০০ কেজি পর্যন্ত ক্ল্যাম্পিং বল প্রদান করে।',
    specs: {
      'tools-material': 'Ductile Cast Iron with Hardened Steel Jaws',
      'tools-country-of-origin': 'China',
      'tools-warranty': '1 Year Brand Warranty',
    },
    variants: [
      sv('6-Inch (150mm) Swivel Vise', 'TOT-VISE-6IN', 6500, 10),
    ],
  },

  // 12. Gazi 6-Step Heavy-Duty Aluminum Ladder
  {
    nameEn: 'Gazi 6-Step A-Type Heavy-Duty Aluminium Ladder 6ft',
    nameBn: 'গাজী ৬-স্টেপ এ-টাইপ হেভি অ্যালুমিনিয়াম মই ৬ ফুট',
    slug: 'demo-tools-gazi-aluminum-ladder',
    sku: 'TL-GAZI-LAD-01',
    price: 3800,
    compareAtPrice: 4400,
    stock: 51,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/workshop-garage/ladders-access',
    productTypeSlug: 'step-ladder',
    brand: 'Gazi',
    manufacturer: 'Gazi Group',
    shortDescriptionEn:
      'High-grade anodized aluminium step ladder with slip-resistant serrated rungs, reinforced spreader braces, and heavy-duty rubber feet. Certified 150 kg maximum load capacity for home and construction use.',
    descriptionEn:
      'High-grade anodized aluminium step ladder with slip-resistant serrated rungs, reinforced spreader braces, and heavy-duty rubber feet. Certified 150 kg maximum load capacity for home and construction use.',
    shortDescriptionBn:
      'উন্নত অ্যালুমিনিয়াম দ্বারা তৈরি এ-টাইপ ফোল্ডিং মই। অ্যান্টি-স্লিপ রাবার ফিট সহ ১৫০ কেজি পর্যন্ত ওজন বহনে সক্ষম।',
    descriptionBn:
      'উন্নত অ্যালুমিনিয়াম দ্বারা তৈরি এ-টাইপ ফোল্ডিং মই। অ্যান্টি-স্লিপ রাবার ফিট সহ ১৫০ কেজি পর্যন্ত ওজন বহনে সক্ষম।',
    specs: {
      'tools-material': 'Aircraft Grade Anodized Aluminium 6063-T6',
      'tools-safety-certification': 'EN 131 Certified (150kg)',
      'tools-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('5-Step (5 Feet)', 'GAZI-LAD-5ST', 3800, 16),
      sv('6-Step (6 Feet)', 'GAZI-LAD-6ST', 4600, 25),
      sv('8-Step (8 Feet)', 'GAZI-LAD-8ST', 6200, 10),
    ],
  },

  // 13. Ingco 1400W High Pressure Washer 130 Bar
  {
    nameEn: 'Ingco 1400W High Pressure Car & Yard Washer 130 Bar',
    nameBn: 'ইংকো ১৪০০ ওয়াট হাই প্রেশার ওয়াশার ১৩০ বার',
    slug: 'demo-tools-ingco-pressure-washer',
    sku: 'TL-ING-HPWR-01',
    price: 8900,
    compareAtPrice: 9900,
    stock: 15,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/workshop-garage/air-compressors-washers',
    productTypeSlug: 'pressure-washer',
    brand: 'Ingco',
    manufacturer: 'Ingco Tools Co., Ltd.',
    shortDescriptionEn:
      'High pressure water cleaner generating 130 Bar maximum pressure with 5.5 L/min flow rate. Complete with 5m high-pressure steel-braided hose, adjustable spray gun, and auto-stop pump system.',
    descriptionEn:
      'High pressure water cleaner generating 130 Bar maximum pressure with 5.5 L/min flow rate. Complete with 5m high-pressure steel-braided hose, adjustable spray gun, and auto-stop pump system.',
    shortDescriptionBn:
      'ইংকো ১৪০০ ওয়াট পাওয়ার ওয়াশার গাড়ি ধোয়া ও উঠোন পরিষ্কারের জন্য আদর্শ। ১৩০ বার প্রেশার ও ৫ মিটার পাইপ সহ সম্পূর্ণ কিট।',
    descriptionBn:
      'ইংকো ১৪০০ ওয়াট পাওয়ার ওয়াশার গাড়ি ধোয়া ও উঠোন পরিষ্কারের জন্য আদর্শ। ১৩০ বার প্রেশার ও ৫ মিটার পাইপ সহ সম্পূর্ণ কিট।',
    specs: {
      'tools-power-source': 'Corded Electric',
      'tools-voltage': '220V–240V AC',
      'tools-wattage': 1400,
      'tools-country-of-origin': 'China',
      'tools-warranty': '1 Year Warranty',
    },
    variants: [
      kv('Complete Kit with Gun, 5m Hose & Soap Bottle', 'ING-HPWR-1400', 8900, 15),
    ],
  },

  // 14. Black Carbon Steel Bugle Head Drywall Screws
  {
    nameEn: 'Hardened Black Phosphate Bugle Head Drywall Screws 3.5mm',
    nameBn: 'কালো ফসফেট ড্রাইভাল স্ক্রু ৩.৫ মিমি',
    slug: 'demo-tools-drywall-screws',
    sku: 'TL-DRY-SCRW-01',
    price: 450,
    compareAtPrice: 550,
    stock: 200,
    unit: 'box',
    isFeatured: true,
    categoryPath: 'tools-hardware/hardware-fasteners/screws-drywall',
    productTypeSlug: 'drywall-screw',
    brand: 'Total Tools',
    manufacturer: 'Total Tools Co., Ltd.',
    shortDescriptionEn:
      'Sharp-point hardened carbon steel drywall screws with black phosphate anti-corrosion coating and countersunk bugle head. Fast bite into drywall, timber studs, and light steel framing.',
    descriptionEn:
      'Sharp-point hardened carbon steel drywall screws with black phosphate anti-corrosion coating and countersunk bugle head. Fast bite into drywall, timber studs, and light steel framing.',
    shortDescriptionBn:
      'কালো ফসফেট কোটিং যুক্ত ধারালো কার্বন স্টিল স্ক্রু। জিপসাম বোর্ড, কাঠ ও সিলিং শিট ফিটিং এর জন্য নির্ভরযোগ্য।',
    descriptionBn:
      'কালো ফসফেট কোটিং যুক্ত ধারালো কার্বন স্টিল স্ক্রু। জিপসাম বোর্ড, কাঠ ও সিলিং শিট ফিটিং এর জন্য নির্ভরযোগ্য।',
    specs: {
      'tools-fastener-diameter': '3.5mm (#6)',
      'tools-head-type': 'Countersunk Bugle Head',
      'tools-drive-type': 'Phillips #2',
      'tools-material': 'Case-Hardened Carbon Steel C1022',
      'tools-thread-type': 'Coarse Thread',
      'tools-country-of-origin': 'China',
    },
    variants: [
      sv('25mm (1 Inch) — Box of 500', 'DRY-SCRW-25MM-500', 450, 80),
      sv('38mm (1.5 Inch) — Box of 500', 'DRY-SCRW-38MM-500', 650, 70),
      sv('50mm (2 Inch) — Box of 500', 'DRY-SCRW-50MM-500', 850, 50),
    ],
  },

  // 15. Grade 8.8 High-Tensile Zinc Hex Bolts with Nuts
  {
    nameEn: 'Grade 8.8 High-Tensile Zinc Plated Hex Head Bolts with Nuts',
    nameBn: 'গ্রেড ৮.৮ হাই-টেনসিল হেক্স নাট-বোল্ট সেট',
    slug: 'demo-tools-hex-bolts-nuts',
    sku: 'TL-HEX-BLT-01',
    price: 600,
    compareAtPrice: 700,
    stock: 70,
    unit: 'box',
    isFeatured: true,
    categoryPath: 'tools-hardware/hardware-fasteners/bolts-nuts-washers',
    productTypeSlug: 'hex-bolt',
    brand: 'Stanley',
    manufacturer: 'Stanley Black & Decker',
    shortDescriptionEn:
      'Precision metric ISO pitch grade 8.8 high-tensile structural bolts. Zinc electroplated finish provides superior resistance to outdoor corrosion and moisture in mechanical assemblies.',
    descriptionEn:
      'Precision metric ISO pitch grade 8.8 high-tensile structural bolts. Zinc electroplated finish provides superior resistance to outdoor corrosion and moisture in mechanical assemblies.',
    shortDescriptionBn:
      'উচ্চ ধারণক্ষমতার গ্রেড ৮.৮ স্টিল হেক্স বোল্ট এবং নাট। মেকানিকাল জয়েন্ট ও কনস্ট্রাকশনের কাজে উপযোগী।',
    descriptionBn:
      'উচ্চ ধারণক্ষমতার গ্রেড ৮.৮ স্টিল হেক্স বোল্ট এবং নাট। মেকানিকাল জয়েন্ট ও কনস্ট্রাকশনের কাজে উপযোগী।',
    specs: {
      'tools-head-type': 'Hexagonal Head',
      'tools-material': 'Grade 8.8 Medium Carbon Steel',
      'tools-thread-type': 'Metric ISO Coarse',
      'tools-country-of-origin': 'Taiwan / China',
    },
    variants: [
      sv('M8 x 50mm (Box of 50 Pcs)', 'HEX-M8-50-50PC', 600, 40, { 'tools-fastener-diameter': 'M8 (8mm)' }),
      sv('M10 x 75mm (Box of 50 Pcs)', 'HEX-M10-75-50PC', 950, 30, { 'tools-fastener-diameter': 'M10 (10mm)' }),
    ],
  },

  // 16. Nylon Universal Expansion Wall Anchors with Screws
  {
    nameEn: 'Heavy Duty Nylon Expansion Wall Plug Anchors with Screws',
    nameBn: 'হেভি ডিউটি নাইলন ওয়াল প্লাগ ও অ্যাঙ্কর সেট',
    slug: 'demo-tools-wall-anchors',
    sku: 'TL-NYL-PLG-01',
    price: 280,
    compareAtPrice: 350,
    stock: 190,
    unit: 'box',
    isFeatured: true,
    categoryPath: 'tools-hardware/hardware-fasteners/wall-anchors-plugs',
    productTypeSlug: 'wall-anchor',
    brand: 'Ingco',
    manufacturer: 'Ingco Tools Co., Ltd.',
    shortDescriptionEn:
      'Universal nylon expansion plugs featuring anti-rotation wings for solid brick, concrete, hollow block, and plasterboard. Includes matched zinc-plated countersunk tapping screws.',
    descriptionEn:
      'Universal nylon expansion plugs featuring anti-rotation wings for solid brick, concrete, hollow block, and plasterboard. Includes matched zinc-plated countersunk tapping screws.',
    shortDescriptionBn:
      'ইট, কংক্রিট ও দেওয়ালের সাথে ভারী মালামাল শক্তভাবে ফিটিং করার জন্য প্রিমিয়াম নাইলন রয়্যাল প্লাগ ও স্ক্রু।',
    descriptionBn:
      'ইট, কংক্রিট ও দেওয়ালের সাথে ভারী মালামাল শক্তভাবে ফিটিং করার জন্য প্রিমিয়াম নাইলন রয়্যাল প্লাগ ও স্ক্রু।',
    specs: {
      'tools-material': 'Virgin Polyamide Nylon (PA6) + Zinc Screw',
      'tools-country-of-origin': 'China',
    },
    variants: [
      sv('6mm x 30mm (Box of 100 Pcs)', 'PLUG-6X30-100', 280, 100, { 'tools-fastener-diameter': '6mm' }),
      sv('8mm x 40mm (Box of 100 Pcs)', 'PLUG-8X40-100', 420, 90, { 'tools-fastener-diameter': '8mm' }),
    ],
  },

  // 17. Super Star 10A 1-Way Modular Light Switch
  {
    nameEn: 'Super Star Ultra Glossy 10A Modular Wall Light Switch',
    nameBn: 'সুপার স্টার ১০ অ্যাম্পিয়ার মডুলার লাইট সুইচ',
    slug: 'demo-tools-ssg-modular-switch',
    sku: 'TL-SSG-SW-01',
    price: 180,
    compareAtPrice: 220,
    stock: 350,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/electrical-supplies/switches-sockets',
    productTypeSlug: 'light-switch',
    brand: 'Super Star',
    manufacturer: 'Super Star Group (SSG)',
    shortDescriptionEn:
      'Flame-retardant virgin polycarbonate modular piano switch with high-grade silver alloy contacts. Engineered for smooth click operation and over 40,000 switching cycles.',
    descriptionEn:
      'Flame-retardant virgin polycarbonate modular piano switch with high-grade silver alloy contacts. Engineered for smooth click operation and over 40,000 switching cycles.',
    shortDescriptionBn:
      'সুপার স্টার অগ্নিনিরোধক পলিকার্বোনেট মডুলার সুইচ। সিলভার অ্যালয় কন্টাক্ট থাকায় দীর্ঘস্থায়ী ও নিরাপদ।',
    descriptionBn:
      'সুপার স্টার অগ্নিনিরোধক পলিকার্বোনেট মডুলার সুইচ। সিলভার অ্যালয় কন্টাক্ট থাকায় দীর্ঘস্থায়ী ও নিরাপদ।',
    specs: {
      'tools-voltage': '220V–250V AC',
      'tools-electrical-rated-current': '10A',
      'tools-material': 'Fire-Retardant Polycarbonate (PC)',
      'tools-country-of-origin': 'Bangladesh',
      'tools-warranty': '5 Years Replacement Warranty',
    },
    variants: [
      sv('1-Gang Switch White', 'SSG-SW-1G', 180, 150, { 'tools-number-of-gangs-sockets': '1-Gang' }),
      sv('2-Gang Switch White', 'SSG-SW-2G', 280, 120, { 'tools-number-of-gangs-sockets': '2-Gang' }),
      sv('4-Gang Switch White', 'SSG-SW-4G', 520, 80, { 'tools-number-of-gangs-sockets': '4-Gang' }),
    ],
  },

  // 18. Super Star 4-Way Surge Protected Power Strip
  {
    nameEn: 'Super Star 4-Way Universal Surge Protected Power Strip',
    nameBn: 'সুপার স্টার ৪-ঘাট মাল্টিপ্লাগ এক্সটেনশন বোর্ড',
    slug: 'demo-tools-ssg-power-strip',
    sku: 'TL-SSG-EXT-01',
    price: 850,
    compareAtPrice: 980,
    stock: 90,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/electrical-supplies/extension-power-strips',
    productTypeSlug: 'extension-board',
    brand: 'Super Star',
    manufacturer: 'Super Star Group (SSG)',
    shortDescriptionEn:
      'Four universal multi-country sockets with individual neon indicator switches and built-in spike/surge suppressor. Features 100% pure copper internal busbars and heavy duty fire-retardant cord.',
    descriptionEn:
      'Four universal multi-country sockets with individual neon indicator switches and built-in spike/surge suppressor. Features 100% pure copper internal busbars and heavy duty fire-retardant cord.',
    shortDescriptionBn:
      'পৃথক সুইচ ও ইন্ডিকেটর লাইট সমৃদ্ধ ৪-ঘাট ইউনিভার্সাল মাল্টিপ্লাগ। হাই ভোল্টেজ সার্জ প্রটেকশন সহ ১০০% কপার ওয়্যারিং।',
    descriptionBn:
      'পৃথক সুইচ ও ইন্ডিকেটর লাইট সমৃদ্ধ ৪-ঘাট ইউনিভার্সাল মাল্টিপ্লাগ। হাই ভোল্টেজ সার্জ প্রটেকশন সহ ১০০% কপার ওয়্যারিং।',
    specs: {
      'tools-voltage': '220V–250V AC',
      'tools-electrical-rated-current': '13A (2500W Max)',
      'tools-number-of-gangs-sockets': '4 Universal Sockets',
      'tools-material': 'Flame Retardant ABS + Pure Copper Busbar',
      'tools-country-of-origin': 'Bangladesh',
      'tools-warranty': '1 Year Warranty',
    },
    variants: [
      sv('3-Meter Heavy Copper Cable', 'SSG-EXT-3M', 850, 50, { 'tools-fastener-length': '3 Meters' }),
      sv('5-Meter Heavy Copper Cable', 'SSG-EXT-5M', 1150, 40, { 'tools-fastener-length': '5 Meters' }),
    ],
  },

  // 19. BRB 1.5 RM Single Core PVC Insulated Cable 90m
  {
    nameEn: 'BRB 1.5 RM Single Core Flame Retardant PVC Cable 90m',
    nameBn: 'বিআরবি ১.৫ আরএম সিঙ্গেল কোর পিভিসি কপার ক্যাবল ৯০ মিটার',
    slug: 'demo-tools-brb-cable-1-5',
    sku: 'TL-BRB-CBL-01',
    price: 2650,
    compareAtPrice: 2950,
    stock: 85,
    unit: 'coil',
    isFeatured: true,
    categoryPath: 'tools-hardware/electrical-supplies/wires-cables',
    productTypeSlug: 'electrical-wire',
    brand: 'BRB Cable',
    manufacturer: 'BRB Cable Industries Ltd.',
    shortDescriptionEn:
      'Standard 1.5 RM (7/0.029) 100% electrolytic annealed copper conductor with lead-free flame-retardant PVC insulation. Meets BSTI BDS 900 standards for domestic wiring and lighting circuits.',
    descriptionEn:
      'Standard 1.5 RM (7/0.029) 100% electrolytic annealed copper conductor with lead-free flame-retardant PVC insulation. Meets BSTI BDS 900 standards for domestic wiring and lighting circuits.',
    shortDescriptionBn:
      'বিআরবি ১.৫ আরএম ৯৯.৯৯% খাঁটি তামার তার। বিএসটিআই সনদপ্রাপ্ত ও নিরাপদ হাউজ ওয়্যারিংয়ের জন্য এক নম্বর পছন্দ।',
    descriptionBn:
      'বিআরবি ১.৫ আরএম ৯৯.৯৯% খাঁটি তামার তার। বিএসটিআই সনদপ্রাপ্ত ও নিরাপদ হাউজ ওয়্যারিংয়ের জন্য এক নম্বর পছন্দ।',
    specs: {
      'tools-voltage': '450/750V Grade',
      'tools-electrical-rated-current': '15A Continuous',
      'tools-material': '99.99% Electrolytic Copper + FR PVC',
      'tools-safety-certification': 'BSTI BDS 900 / IEC 60227',
      'tools-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('Red (Live Phase) — 90m Coil', 'BRB-1.5RM-RED', 2650, 30, { 'tools-fastener-length': '90 Meters' }),
      sv('Black (Neutral) — 90m Coil', 'BRB-1.5RM-BLK', 2650, 30, { 'tools-fastener-length': '90 Meters' }),
      sv('Green (Earth) — 90m Coil', 'BRB-1.5RM-GRN', 2650, 25, { 'tools-fastener-length': '90 Meters' }),
    ],
  },

  // 20. RFL 1-Inch PVC Compact Ball Valve Socket
  {
    nameEn: 'RFL uPVC Heavy Compact Threaded Ball Valve',
    nameBn: 'আরএফএল ইউপিভিসি হেভি কমপ্যাক্ট বল ভাল্ব',
    slug: 'demo-tools-rfl-pvc-ball-valve',
    sku: 'TL-RFL-BV-01',
    price: 140,
    compareAtPrice: 170,
    stock: 240,
    unit: 'piece',
    isFeatured: true,
    categoryPath: 'tools-hardware/plumbing-sanitary/valves-taps',
    productTypeSlug: 'ball-valve',
    brand: 'RFL',
    manufacturer: 'RFL Plastics & Pipes',
    shortDescriptionEn:
      'Solid virgin uPVC ball valve with stainless steel screw and smooth quarter-turn ergonomic lever handle. Leakproof EPDM O-ring seals rated to 150 PSI for residential water supply control.',
    descriptionEn:
      'Solid virgin uPVC ball valve with stainless steel screw and smooth quarter-turn ergonomic lever handle. Leakproof EPDM O-ring seals rated to 150 PSI for residential water supply control.',
    shortDescriptionBn:
      'আরএফএল ইউপিভিসি কম্প্যাক্ট বল ভাল্ব। ১০০% লিকপ্রুফ রাবার সিলিং এবং ১৫০ পিএসআই পর্যন্ত পানির চাপ সহ্য করতে পারে।',
    descriptionBn:
      'আরএফএল ইউপিভিসি কম্প্যাক্ট বল ভাল্ব। ১০০% লিকপ্রুফ রাবার সিলিং এবং ১৫০ পিএসআই পর্যন্ত পানির চাপ সহ্য করতে পারে।',
    specs: {
      'tools-material': 'Virgin Unplasticized PVC (uPVC) + EPDM O-Ring',
      'tools-country-of-origin': 'Bangladesh',
    },
    variants: [
      sv('1/2" Socket (15mm)', 'RFL-BV-0.5IN', 140, 100, { 'tools-pipe-diameter': '1/2" (15mm)' }),
      sv('3/4" Socket (20mm)', 'RFL-BV-0.75IN', 190, 80, { 'tools-pipe-diameter': '3/4" (20mm)' }),
      sv('1" Socket (25mm)', 'RFL-BV-1.0IN', 270, 60, { 'tools-pipe-diameter': '1" (25mm)' }),
    ],
  },

  // 21. Berger Luxury Silk Interior Wall Paint
  {
    nameEn: 'Berger Luxury Silk Anti-Bacterial Interior Emulsion Paint',
    nameBn: 'বার্জার লাক্সারি সিল্ক অ্যান্টি-ব্যাকটেরিয়াল ইন্টেরিয়র পেইন্ট',
    slug: 'demo-tools-berger-luxury-silk',
    sku: 'TL-BRG-SLK-01',
    price: 820,
    compareAtPrice: 950,
    stock: 80,
    unit: 'can',
    isFeatured: true,
    categoryPath: 'tools-hardware/paint-decorating/wall-paints-enamels',
    productTypeSlug: 'wall-paint',
    brand: 'Berger Paints',
    manufacturer: 'Berger Paints Bangladesh Ltd.',
    shortDescriptionEn:
      'Berger Luxury Silk provides an ultra-smooth silken finish with rich sheen and anti-bacterial hygiene protection. Stain-resistant, wipe-clean technology ensures walls remain brilliant for years.',
    descriptionEn:
      'Berger Luxury Silk provides an ultra-smooth silken finish with rich sheen and anti-bacterial hygiene protection. Stain-resistant, wipe-clean technology ensures walls remain brilliant for years.',
    shortDescriptionBn:
      'বার্জার লাক্সারি সিল্ক ইমালশন পেইন্ট দেয়ালে নিয়ে আসে আকর্ষণীয় সিল্কি আভা। অ্যান্টি-ব্যাকটেরিয়াল এবং সহজে দাগ মোছা যায়।',
    descriptionBn:
      'বার্জার লাক্সারি সিল্ক ইমালশন পেইন্ট দেয়ালে নিয়ে আসে আকর্ষণীয় সিল্কি আভা। অ্যান্টি-ব্যাকটেরিয়াল এবং সহজে দাগ মোছা যায়।',
    specs: {
      'tools-paint-finish': 'Silk / Satin',
      'tools-material': 'Pure Acrylic Latex Emulsion',
      'tools-country-of-origin': 'Bangladesh',
    },
    variants: [
      cv('1 Liter Can', 'BRG-SILK-1L', 820, 40, [
        { batchNumber: 'LOT-BRG-2601', manufacturingDate: '2026-01-10', expiryDate: '2028-01-10', quantity: 40 },
      ]),
      cv('1 Gallon (3.64 Liters)', 'BRG-SILK-1GL', 2850, 30, [
        { batchNumber: 'LOT-BRG-2602', manufacturingDate: '2026-01-15', expiryDate: '2028-01-15', quantity: 30 },
      ]),
      cv('18 Liters Master Drum', 'BRG-SILK-18L', 12900, 10, [
        { batchNumber: 'LOT-BRG-2603', manufacturingDate: '2026-02-01', expiryDate: '2028-02-01', quantity: 10 },
      ]),
    ],
  },

  // 22. Dowsil General Purpose Silicone Sealant
  {
    nameEn: 'Dowsil GP Silicone Sealant Waterproof Acetoxy 300ml',
    nameBn: 'ডাউসিল জেনারেল পারপাস সিলিকন সিলেন্ট ৩০০ মিলি',
    slug: 'demo-tools-silicone-sealant',
    sku: 'TL-DOW-SIL-01',
    price: 340,
    compareAtPrice: 400,
    stock: 260,
    unit: 'cartridge',
    isFeatured: true,
    categoryPath: 'tools-hardware/building-construction-supplies/silicone-waterproofing',
    productTypeSlug: 'silicone-sealant',
    brand: 'Dowsil',
    manufacturer: 'Stanley Black & Decker',
    shortDescriptionEn:
      'Fast-curing 100% silicone sealant for glass, aluminium, ceramic tile, sanitary fixtures, and window glazing. Forms a tough, flexible, and UV-resistant watertight seal that will not crack or shrink.',
    descriptionEn:
      'Fast-curing 100% silicone sealant for glass, aluminium, ceramic tile, sanitary fixtures, and window glazing. Forms a tough, flexible, and UV-resistant watertight seal that will not crack or shrink.',
    shortDescriptionBn:
      '১০০% খাঁটি সিলিকন সিলেন্ট গ্লাস, অ্যালুমিনিয়াম এবং বাথরুমের ফিটিংসের পানি প্রতিরোধক সিল করার জন্য বিশ্বমানের পছন্দ।',
    descriptionBn:
      '১০০% খাঁটি সিলিকন সিলেন্ট গ্লাস, অ্যালুমিনিয়াম এবং বাথরুমের ফিটিংসের পানি প্রতিরোধক সিল করার জন্য বিশ্বমানের পছন্দ।',
    specs: {
      'tools-material': '100% Acetoxy Silicone Elastomer',
      'tools-country-of-origin': 'USA / Belgium',
    },
    variants: [
      cv('300ml Cartridge — Clear Translucent', 'DOW-SIL-CLR', 340, 120, [
        { batchNumber: 'LOT-DOW-26A', manufacturingDate: '2026-01-05', expiryDate: '2027-07-05', quantity: 120 },
      ]),
      cv('300ml Cartridge — Solid White', 'DOW-SIL-WHT', 340, 80, [
        { batchNumber: 'LOT-DOW-26B', manufacturingDate: '2026-01-05', expiryDate: '2027-07-05', quantity: 80 },
      ]),
      cv('300ml Cartridge — Solid Black', 'DOW-SIL-BLK', 340, 60, [
        { batchNumber: 'LOT-DOW-26C', manufacturingDate: '2026-01-05', expiryDate: '2027-07-05', quantity: 60 },
      ]),
    ],
  },

  // 23. Total Tools Level 5 Cut-Resistant PU Work Gloves
  {
    nameEn: 'Total Tools Level 5 High Protection Cut-Resistant Work Gloves',
    nameBn: 'টোটাল টুলস লেভেল ৫ কাট-রেজিস্ট্যান্ট সেফটি গ্লাভস',
    slug: 'demo-tools-total-cut-gloves',
    sku: 'TL-TOT-GLV-01',
    price: 350,
    compareAtPrice: 420,
    stock: 190,
    unit: 'pair',
    isFeatured: true,
    categoryPath: 'tools-hardware/safety-ppe/safety-gloves',
    productTypeSlug: 'work-gloves',
    brand: 'Total Tools',
    manufacturer: 'Total Tools Co., Ltd.',
    shortDescriptionEn:
      'Engineered with high performance polyethylene (HPPE) fibers with polyurethane coated palm. Delivers EN 388 Level 5 cut resistance while retaining maximum tactile sensitivity and grip.',
    descriptionEn:
      'Engineered with high performance polyethylene (HPPE) fibers with polyurethane coated palm. Delivers EN 388 Level 5 cut resistance while retaining maximum tactile sensitivity and grip.',
    shortDescriptionBn:
      'ধারালো কাচ, লোহা ও ধাতব শিট হ্যান্ডলিং এর জন্য সর্বোচ্চ লেভেল ৫ কাট প্রতিরোধী গ্লাভস। আরামদায়ক ও হাতের পূর্ণ নিয়ন্ত্রণ দেয়।',
    descriptionBn:
      'ধারালো কাচ, লোহা ও ধাতব শিট হ্যান্ডলিং এর জন্য সর্বোচ্চ লেভেল ৫ কাট প্রতিরোধী গ্লাভস। আরামদায়ক ও হাতের পূর্ণ নিয়ন্ত্রণ দেয়।',
    specs: {
      'tools-material': 'HPPE Seamless Knit + Polyurethane (PU) Palm',
      'tools-safety-certification': 'EN 388 4543D Cut Level 5',
      'tools-country-of-origin': 'China',
    },
    variants: [
      sv('Medium (Size 8)', 'TOT-GLV-CUT5-M', 350, 60),
      sv('Large (Size 9)', 'TOT-GLV-CUT5-L', 350, 80),
      sv('Extra Large (Size 10)', 'TOT-GLV-CUT5-XL', 350, 50),
    ],
  },

  // 24. Ingco Steel Toe Heavy-Duty Industrial Safety Boots
  {
    nameEn: 'Ingco S1P Steel Toe Cap Genuine Leather Industrial Safety Boots',
    nameBn: 'ইংকো এস১পি স্টিল টো লেদার সেফটি বুট',
    slug: 'demo-tools-ingco-safety-boots',
    sku: 'TL-ING-BOOT-01',
    price: 2800,
    compareAtPrice: 3300,
    stock: 105,
    unit: 'pair',
    isFeatured: true,
    categoryPath: 'tools-hardware/safety-ppe/safety-shoes-boots',
    productTypeSlug: 'safety-shoes',
    brand: 'Ingco',
    manufacturer: 'Ingco Tools Co., Ltd.',
    shortDescriptionEn:
      'Certified S1P genuine split leather work boots featuring 200J steel toe impact protection, puncture-resistant steel midsole, oil-resistant PU/PU sole, and anti-static heel shock absorption.',
    descriptionEn:
      'Certified S1P genuine split leather work boots featuring 200J steel toe impact protection, puncture-resistant steel midsole, oil-resistant PU/PU sole, and anti-static heel shock absorption.',
    shortDescriptionBn:
      '২০০ জুল শক প্রতিরোধক স্টিল টো ক্যাপ ও কাঁটা/পেরেক রোধী স্টিল প্লেট যুক্ত জেনুইন লেদার সেফটি বুট। নির্মাণ ও ফ্যাক্টরি কাজের জন্য অপরিহার্য।',
    descriptionBn:
      '২০০ জুল শক প্রতিরোধক স্টিল টো ক্যাপ ও কাঁটা/পেরেক রোধী স্টিল প্লেট যুক্ত জেনুইন লেদার সেফটি বুট। নির্মাণ ও ফ্যাক্টরি কাজের জন্য অপরিহার্য।',
    specs: {
      'tools-material': 'Genuine Split Cow Leather + Dual Density PU Sole',
      'tools-safety-certification': 'CE EN ISO 20345:2011 S1P',
      'tools-country-of-origin': 'China',
    },
    variants: [
      sv('Size 41 (UK 7)', 'ING-BOOT-41', 2800, 25),
      sv('Size 42 (UK 8)', 'ING-BOOT-42', 2800, 35),
      sv('Size 43 (UK 9)', 'ING-BOOT-43', 2800, 30),
      sv('Size 44 (UK 10)', 'ING-BOOT-44', 2800, 20),
    ],
  },
];

// ---------------------------------------------------------------------------
// 6. Vertical Master Export
// ---------------------------------------------------------------------------
export const TOOLS_VERTICAL: SeedVertical = {
  key: 'tools',
  root: TOOLS_TAXONOMY,
  attributes: TOOLS_ATTRIBUTES,
  brands: TOOLS_BRANDS,
  manufacturers: TOOLS_MANUFACTURERS,
  products: TOOLS_PRODUCTS,
};
