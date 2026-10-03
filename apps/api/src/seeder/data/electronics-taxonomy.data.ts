import { AttributeDataType } from '../../catalog/enums/attribute-data-type.enum.js';

export interface SeedAttributeOption {
  value: string;
  valueBn?: string;
}

export interface SeedAttribute {
  slug: string;
  nameEn: string;
  nameBn: string;
  dataType: AttributeDataType;
  unit?: string;
  isFilterable?: boolean;
  isVariantAxis?: boolean;
  options?: SeedAttributeOption[];
}

const opt = (...values: string[]): SeedAttributeOption[] => values.map((value) => ({ value }));

/**
 * Global, reusable Electronics attribute definitions. The same attribute can be
 * mapped onto multiple product types (e.g. "warranty" everywhere, "socket" on
 * processors and motherboards) without duplication.
 */
export const ELECTRONICS_ATTRIBUTES: SeedAttribute[] = [
  // Processor ---------------------------------------------------------------
  {
    slug: 'series',
    nameEn: 'Series',
    nameBn: 'সিরিজ',
    dataType: AttributeDataType.TEXT,
  },
  {
    slug: 'generation',
    nameEn: 'Generation',
    nameBn: 'জেনারেশন',
    dataType: AttributeDataType.SELECT,
    options: opt('12th Gen', '13th Gen', '14th Gen', '5000 Series', '7000 Series', '9000 Series'),
  },
  {
    slug: 'socket',
    nameEn: 'Socket',
    nameBn: 'সকেট',
    dataType: AttributeDataType.SELECT,
    options: opt('AM4', 'AM5', 'LGA1200', 'LGA1700', 'LGA1851'),
  },
  {
    slug: 'architecture',
    nameEn: 'Architecture',
    nameBn: 'আর্কিটেকচার',
    dataType: AttributeDataType.TEXT,
  },
  {
    slug: 'cores',
    nameEn: 'Cores',
    nameBn: 'কোর',
    dataType: AttributeDataType.SELECT,
    options: opt('4', '6', '8', '10', '12', '16', '24'),
  },
  {
    slug: 'threads',
    nameEn: 'Threads',
    nameBn: 'থ্রেড',
    dataType: AttributeDataType.SELECT,
    options: opt('8', '12', '16', '20', '24', '32'),
  },
  {
    slug: 'base-clock',
    nameEn: 'Base Clock',
    nameBn: 'বেস ক্লক',
    dataType: AttributeDataType.NUMBER,
    unit: 'GHz',
  },
  {
    slug: 'boost-clock',
    nameEn: 'Boost Clock',
    nameBn: 'বুস্ট ক্লক',
    dataType: AttributeDataType.NUMBER,
    unit: 'GHz',
  },
  {
    slug: 'cache',
    nameEn: 'Cache',
    nameBn: 'ক্যাশ',
    dataType: AttributeDataType.NUMBER,
    unit: 'MB',
  },
  {
    slug: 'tdp',
    nameEn: 'TDP',
    nameBn: 'টিডিপি',
    dataType: AttributeDataType.NUMBER,
    unit: 'W',
  },
  {
    slug: 'integrated-graphics',
    nameEn: 'Integrated Graphics',
    nameBn: 'ইন্টিগ্রেটেড গ্রাফিক্স',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },
  {
    slug: 'box-type',
    nameEn: 'Box Type',
    nameBn: 'বক্স টাইপ',
    dataType: AttributeDataType.SELECT,
    options: opt('Boxed', 'Tray'),
  },

  // Motherboard -------------------------------------------------------------
  { slug: 'chipset', nameEn: 'Chipset', nameBn: 'চিপসেট', dataType: AttributeDataType.TEXT },
  {
    slug: 'form-factor',
    nameEn: 'Form Factor',
    nameBn: 'ফর্ম ফ্যাক্টর',
    dataType: AttributeDataType.SELECT,
    options: opt('ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX', 'M.2 2280', '2.5 inch', '3.5 inch'),
  },
  {
    slug: 'ram-type',
    nameEn: 'RAM Type',
    nameBn: 'র‍্যাম টাইপ',
    dataType: AttributeDataType.SELECT,
    options: opt('DDR4', 'DDR5'),
  },
  { slug: 'ram-slots', nameEn: 'RAM Slots', nameBn: 'র‍্যাম স্লট', dataType: AttributeDataType.NUMBER },
  {
    slug: 'max-ram',
    nameEn: 'Maximum RAM',
    nameBn: 'সর্বোচ্চ র‍্যাম',
    dataType: AttributeDataType.NUMBER,
    unit: 'GB',
  },
  { slug: 'm2-slots', nameEn: 'M.2 Slots', nameBn: 'এম.২ স্লট', dataType: AttributeDataType.NUMBER },
  {
    slug: 'pcie-version',
    nameEn: 'PCIe Version',
    nameBn: 'পিসিআইই ভার্সন',
    dataType: AttributeDataType.SELECT,
    options: opt('PCIe 3.0', 'PCIe 4.0', 'PCIe 5.0'),
  },
  {
    slug: 'wifi',
    nameEn: 'WiFi',
    nameBn: 'ওয়াইফাই',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },
  {
    slug: 'bluetooth',
    nameEn: 'Bluetooth',
    nameBn: 'ব্লুটুথ',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },
  {
    slug: 'lan',
    nameEn: 'LAN',
    nameBn: 'ল্যান',
    dataType: AttributeDataType.SELECT,
    options: opt('1G', '2.5G', '10G'),
  },

  // Graphics card -----------------------------------------------------------
  {
    slug: 'gpu-manufacturer',
    nameEn: 'GPU Manufacturer',
    nameBn: 'জিপিইউ নির্মাতা',
    dataType: AttributeDataType.SELECT,
    options: opt('NVIDIA', 'AMD', 'Intel'),
  },
  { slug: 'gpu-model', nameEn: 'GPU Model', nameBn: 'জিপিইউ মডেল', dataType: AttributeDataType.TEXT },
  { slug: 'vram', nameEn: 'VRAM', nameBn: 'ভিআরএম', dataType: AttributeDataType.NUMBER, unit: 'GB' },
  {
    slug: 'vram-type',
    nameEn: 'VRAM Type',
    nameBn: 'ভিআরএম টাইপ',
    dataType: AttributeDataType.SELECT,
    options: opt('GDDR6', 'GDDR6X', 'GDDR7'),
  },
  {
    slug: 'memory-bus',
    nameEn: 'Memory Bus',
    nameBn: 'মেমোরি বাস',
    dataType: AttributeDataType.NUMBER,
    unit: 'bit',
  },
  {
    slug: 'gpu-interface',
    nameEn: 'Interface',
    nameBn: 'ইন্টারফেস',
    dataType: AttributeDataType.SELECT,
    options: opt('PCIe 4.0 x16', 'PCIe 5.0 x16'),
  },
  {
    slug: 'power-requirement',
    nameEn: 'Power Requirement',
    nameBn: 'পাওয়ার প্রয়োজন',
    dataType: AttributeDataType.NUMBER,
    unit: 'W',
  },
  {
    slug: 'recommended-psu',
    nameEn: 'Recommended PSU',
    nameBn: 'প্রস্তাবিত পিএসইউ',
    dataType: AttributeDataType.NUMBER,
    unit: 'W',
  },
  { slug: 'length', nameEn: 'Length', nameBn: 'দৈর্ঘ্য', dataType: AttributeDataType.NUMBER, unit: 'mm' },
  {
    slug: 'cooling',
    nameEn: 'Cooling',
    nameBn: 'কুলিং',
    dataType: AttributeDataType.SELECT,
    options: opt('Single Fan', 'Dual Fan', 'Triple Fan', 'Liquid'),
  },

  // RAM ---------------------------------------------------------------------
  {
    slug: 'capacity',
    nameEn: 'Capacity',
    nameBn: 'ক্যাপাসিটি',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    options: opt('8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB', '8TB'),
  },
  { slug: 'speed', nameEn: 'Speed', nameBn: 'স্পিড', dataType: AttributeDataType.NUMBER, unit: 'MHz' },
  {
    slug: 'module-type',
    nameEn: 'Module Type',
    nameBn: 'মডিউল টাইপ',
    dataType: AttributeDataType.SELECT,
    options: opt('UDIMM', 'SODIMM', 'DIMM'),
  },
  {
    slug: 'kit',
    nameEn: 'Kit',
    nameBn: 'কিট',
    dataType: AttributeDataType.SELECT,
    options: opt('Single', 'Dual', 'Quad'),
  },
  { slug: 'cas-latency', nameEn: 'CAS Latency', nameBn: 'সিএএস লেটেন্সি', dataType: AttributeDataType.NUMBER },
  {
    slug: 'ecc',
    nameEn: 'ECC',
    nameBn: 'ইসিসি',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },
  {
    slug: 'rgb',
    nameEn: 'RGB',
    nameBn: 'আরজিবি',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },

  // Storage -----------------------------------------------------------------
  {
    slug: 'storage-interface',
    nameEn: 'Interface',
    nameBn: 'ইন্টারফেস',
    dataType: AttributeDataType.SELECT,
    options: opt('NVMe PCIe 4.0', 'NVMe PCIe 3.0', 'SATA III', 'USB 3.2', 'USB-C'),
  },
  {
    slug: 'read-speed',
    nameEn: 'Read Speed',
    nameBn: 'রিড স্পিড',
    dataType: AttributeDataType.NUMBER,
    unit: 'MB/s',
  },
  {
    slug: 'write-speed',
    nameEn: 'Write Speed',
    nameBn: 'রাইট স্পিড',
    dataType: AttributeDataType.NUMBER,
    unit: 'MB/s',
  },
  { slug: 'rpm', nameEn: 'RPM', nameBn: 'আরপিএম', dataType: AttributeDataType.NUMBER },
  {
    slug: 'nand-type',
    nameEn: 'NAND Type',
    nameBn: 'ন্যান্ড টাইপ',
    dataType: AttributeDataType.SELECT,
    options: opt('TLC', 'QLC', 'MLC', '3D NAND'),
  },
  { slug: 'tbw', nameEn: 'TBW', nameBn: 'টিবিডব্লিউ', dataType: AttributeDataType.NUMBER, unit: 'TB' },

  // Power supply ------------------------------------------------------------
  { slug: 'wattage', nameEn: 'Wattage', nameBn: 'ওয়াটেজ', dataType: AttributeDataType.NUMBER, unit: 'W' },
  {
    slug: 'efficiency',
    nameEn: 'Efficiency',
    nameBn: 'এফিসিয়েন্সি',
    dataType: AttributeDataType.SELECT,
    options: opt('80+ Bronze', '80+ Silver', '80+ Gold', '80+ Platinum'),
  },

  // Laptop ------------------------------------------------------------------
  { slug: 'processor', nameEn: 'Processor', nameBn: 'প্রসেসর', dataType: AttributeDataType.TEXT },
  { slug: 'ram', nameEn: 'RAM', nameBn: 'র‍্যাম', dataType: AttributeDataType.TEXT },
  { slug: 'storage', nameEn: 'Storage', nameBn: 'স্টোরেজ', dataType: AttributeDataType.TEXT },
  { slug: 'gpu', nameEn: 'GPU', nameBn: 'জিপিইউ', dataType: AttributeDataType.TEXT },
  {
    slug: 'operating-system',
    nameEn: 'Operating System',
    nameBn: 'অপারেটিং সিস্টেম',
    dataType: AttributeDataType.SELECT,
    options: opt('Windows 11', 'Windows 10', 'macOS', 'DOS', 'Linux'),
  },
  { slug: 'battery', nameEn: 'Battery', nameBn: 'ব্যাটারি', dataType: AttributeDataType.TEXT },
  { slug: 'weight', nameEn: 'Weight', nameBn: 'ওজন', dataType: AttributeDataType.NUMBER, unit: 'kg' },
  { slug: 'keyboard', nameEn: 'Keyboard', nameBn: 'কীবোর্ড', dataType: AttributeDataType.TEXT },

  // Monitor -----------------------------------------------------------------
  {
    slug: 'screen-size',
    nameEn: 'Screen Size',
    nameBn: 'স্ক্রিন সাইজ',
    dataType: AttributeDataType.SELECT,
    options: opt('13.3"', '14"', '15.6"', '16"', '17.3"', '23.8"', '24"', '27"', '32"', '34"'),
  },
  {
    slug: 'resolution',
    nameEn: 'Resolution',
    nameBn: 'রেজোলিউশন',
    dataType: AttributeDataType.SELECT,
    options: opt('HD', 'FHD', 'QHD', '2K', '4K', '8K'),
  },
  {
    slug: 'panel-type',
    nameEn: 'Panel Type',
    nameBn: 'প্যানেল টাইপ',
    dataType: AttributeDataType.SELECT,
    options: opt('IPS', 'VA', 'TN', 'OLED'),
  },
  {
    slug: 'refresh-rate',
    nameEn: 'Refresh Rate',
    nameBn: 'রিফ্রেশ রেট',
    dataType: AttributeDataType.SELECT,
    options: opt('60Hz', '75Hz', '100Hz', '144Hz', '165Hz', '240Hz'),
  },
  {
    slug: 'response-time',
    nameEn: 'Response Time',
    nameBn: 'রেসপন্স টাইম',
    dataType: AttributeDataType.NUMBER,
    unit: 'ms',
  },
  {
    slug: 'brightness',
    nameEn: 'Brightness',
    nameBn: 'ব্রাইটনেস',
    dataType: AttributeDataType.NUMBER,
    unit: 'nits',
  },
  {
    slug: 'hdr',
    nameEn: 'HDR',
    nameBn: 'এইচডিআর',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },
  {
    slug: 'adaptive-sync',
    nameEn: 'Adaptive Sync',
    nameBn: 'অ্যাডাপ্টিভ সিংক',
    dataType: AttributeDataType.SELECT,
    options: opt('FreeSync', 'G-Sync', 'None'),
  },
  { slug: 'color-gamut', nameEn: 'Color Gamut', nameBn: 'কালার গ্যামট', dataType: AttributeDataType.TEXT },
  {
    slug: 'curved',
    nameEn: 'Curved',
    nameBn: 'কার্ভড',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },
  {
    slug: 'vesa-mount',
    nameEn: 'VESA Mount',
    nameBn: 'ভেসা মাউন্ট',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },

  // Networking --------------------------------------------------------------
  {
    slug: 'wifi-generation',
    nameEn: 'WiFi Generation',
    nameBn: 'ওয়াইফাই জেনারেশন',
    dataType: AttributeDataType.SELECT,
    options: opt('WiFi 4', 'WiFi 5', 'WiFi 6', 'WiFi 6E', 'WiFi 7'),
  },
  {
    slug: 'data-rate',
    nameEn: 'Speed',
    nameBn: 'স্পিড',
    dataType: AttributeDataType.NUMBER,
    unit: 'Mbps',
  },
  {
    slug: 'bands',
    nameEn: 'Bands',
    nameBn: 'ব্যান্ড',
    dataType: AttributeDataType.SELECT,
    options: opt('Single Band', 'Dual Band', 'Tri Band'),
  },
  { slug: 'lan-ports', nameEn: 'LAN Ports', nameBn: 'ল্যান পোর্ট', dataType: AttributeDataType.NUMBER },
  { slug: 'wan-ports', nameEn: 'WAN Ports', nameBn: 'ওয়ান পোর্ট', dataType: AttributeDataType.NUMBER },
  {
    slug: 'poe',
    nameEn: 'PoE',
    nameBn: 'পিওই',
    dataType: AttributeDataType.SELECT,
    options: opt('Yes', 'No'),
  },
  { slug: 'coverage', nameEn: 'Coverage', nameBn: 'কভারেজ', dataType: AttributeDataType.NUMBER, unit: 'sq ft' },
  {
    slug: 'management',
    nameEn: 'Management',
    nameBn: 'ম্যানেজমেন্ট',
    dataType: AttributeDataType.SELECT,
    options: opt('Web UI', 'Mobile App', 'Cloud'),
  },

  // Shared ------------------------------------------------------------------
  {
    slug: 'ports',
    nameEn: 'Ports',
    nameBn: 'পোর্ট',
    dataType: AttributeDataType.MULTI_SELECT,
    options: opt('HDMI', 'DisplayPort', 'USB-C', 'USB-A', 'VGA', 'DVI', 'Ethernet', '3.5mm', 'Thunderbolt'),
  },
  { slug: 'color', nameEn: 'Color', nameBn: 'রঙ', dataType: AttributeDataType.TEXT },
  {
    slug: 'warranty',
    nameEn: 'Warranty',
    nameBn: 'ওয়ারেন্টি',
    dataType: AttributeDataType.SELECT,
    options: opt('No Warranty', '6 Months', '1 Year', '2 Years', '3 Years', '5 Years'),
  },
];

export interface SeedProductType {
  slug: string;
  nameEn?: string;
  nameBn?: string;
  /** Attribute slugs mapped onto this product type (all filterable). */
  attributes: string[];
}

export interface SeedTaxonomyNode {
  slug: string;
  nameEn: string;
  nameBn: string;
  icon?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  productTypes?: SeedProductType[];
  children?: SeedTaxonomyNode[];
}

const pt = (
  slug: string,
  attributes: string[],
  nameEn?: string,
  nameBn?: string,
): SeedProductType => ({ slug, attributes, nameEn, nameBn });

const PROC_ATTRS = [
  'series',
  'generation',
  'socket',
  'architecture',
  'cores',
  'threads',
  'base-clock',
  'boost-clock',
  'cache',
  'tdp',
  'integrated-graphics',
  'box-type',
  'warranty',
];
const MOBO_ATTRS = [
  'socket',
  'chipset',
  'form-factor',
  'ram-type',
  'ram-slots',
  'max-ram',
  'm2-slots',
  'pcie-version',
  'wifi',
  'bluetooth',
  'lan',
  'warranty',
];
const GPU_ATTRS = [
  'gpu-manufacturer',
  'gpu-model',
  'vram',
  'vram-type',
  'memory-bus',
  'boost-clock',
  'gpu-interface',
  'power-requirement',
  'recommended-psu',
  'length',
  'cooling',
  'warranty',
];
const RAM_ATTRS = [
  'generation',
  'capacity',
  'speed',
  'module-type',
  'kit',
  'cas-latency',
  'ecc',
  'rgb',
  'warranty',
];
const STORAGE_ATTRS = [
  'capacity',
  'storage-interface',
  'form-factor',
  'read-speed',
  'write-speed',
  'rpm',
  'nand-type',
  'tbw',
  'warranty',
];
const LAPTOP_ATTRS = [
  'processor',
  'generation',
  'ram',
  'ram-type',
  'storage',
  'gpu',
  'screen-size',
  'resolution',
  'panel-type',
  'refresh-rate',
  'operating-system',
  'battery',
  'weight',
  'ports',
  'keyboard',
  'warranty',
];
const MONITOR_ATTRS = [
  'screen-size',
  'resolution',
  'panel-type',
  'refresh-rate',
  'response-time',
  'brightness',
  'hdr',
  'adaptive-sync',
  'color-gamut',
  'ports',
  'curved',
  'vesa-mount',
  'warranty',
];
const ROUTER_ATTRS = [
  'wifi-generation',
  'data-rate',
  'bands',
  'lan-ports',
  'wan-ports',
  'poe',
  'coverage',
  'management',
  'warranty',
];

/**
 * The Electronics taxonomy. Category nodes may carry one or more product types,
 * each with its own attribute schema. Depth is unlimited and driven purely by
 * this data — no category-specific code anywhere in the app.
 */
export const ELECTRONICS_TAXONOMY: SeedTaxonomyNode = {
  slug: 'electronics',
  nameEn: 'Electronics',
  nameBn: 'ইলেকট্রনিক্স ও গ্যাজেট',
  icon: '⚡',
  descriptionEn: 'Computers, mobile, networking, audio, cameras and everything electronic.',
  descriptionBn: 'কম্পিউটার, মোবাইল, নেটওয়ার্কিং, অডিও, ক্যামেরা ও সকল ইলেকট্রনিক পণ্য।',
  children: [
    {
      slug: 'computers-pc',
      nameEn: 'Computers & PC',
      nameBn: 'কম্পিউটার ও পিসি',
      icon: '🖥️',
      children: [
        {
          slug: 'desktop-pc',
          nameEn: 'Desktop PC',
          nameBn: 'ডেস্কটপ পিসি',
          productTypes: [pt('desktop-pc', ['processor', 'generation', 'ram', 'ram-type', 'storage', 'gpu', 'operating-system', 'warranty'])],
          children: [
            { slug: 'gaming-pc', nameEn: 'Gaming PC', nameBn: 'গেমিং পিসি' },
            { slug: 'office-pc', nameEn: 'Office PC', nameBn: 'অফিস পিসি' },
            { slug: 'home-pc', nameEn: 'Home PC', nameBn: 'হোম পিসি' },
            { slug: 'workstation', nameEn: 'Workstation', nameBn: 'ওয়ার্কস্টেশন' },
            { slug: 'mini-pc', nameEn: 'Mini PC', nameBn: 'মিনি পিসি' },
            { slug: 'all-in-one-pc', nameEn: 'All-in-One PC', nameBn: 'অল-ইন-ওয়ান পিসি' },
          ],
        },
        {
          slug: 'pc-components',
          nameEn: 'PC Components',
          nameBn: 'পিসি কম্পোনেন্ট',
          children: [
            { slug: 'processor', nameEn: 'Processor', nameBn: 'প্রসেসর', productTypes: [pt('processor', PROC_ATTRS)] },
            { slug: 'motherboard', nameEn: 'Motherboard', nameBn: 'মাদারবোর্ড', productTypes: [pt('motherboard', MOBO_ATTRS)] },
            { slug: 'graphics-card', nameEn: 'Graphics Card', nameBn: 'গ্রাফিক্স কার্ড', productTypes: [pt('graphics-card', GPU_ATTRS)] },
            { slug: 'ram', nameEn: 'RAM', nameBn: 'র‍্যাম', productTypes: [pt('ram', RAM_ATTRS)] },
            { slug: 'ssd', nameEn: 'SSD', nameBn: 'এসএসডি', productTypes: [pt('ssd', STORAGE_ATTRS)] },
            { slug: 'hdd', nameEn: 'HDD', nameBn: 'এইচডিডি', productTypes: [pt('hdd', STORAGE_ATTRS)] },
            { slug: 'power-supply', nameEn: 'Power Supply', nameBn: 'পাওয়ার সাপ্লাই', productTypes: [pt('power-supply', ['wattage', 'efficiency', 'warranty'])] },
            { slug: 'pc-case', nameEn: 'PC Case', nameBn: 'পিসি কেস' },
            { slug: 'cpu-cooler', nameEn: 'CPU Cooler', nameBn: 'সিপিইউ কুলার' },
            { slug: 'case-fan', nameEn: 'Case Fan', nameBn: 'কেস ফ্যান' },
            { slug: 'thermal-accessories', nameEn: 'Thermal Accessories', nameBn: 'থার্মাল এক্সেসরিজ' },
          ],
        },
        {
          slug: 'laptop',
          nameEn: 'Laptop',
          nameBn: 'ল্যাপটপ',
          productTypes: [pt('laptop', LAPTOP_ATTRS)],
          children: [
            { slug: 'gaming-laptop', nameEn: 'Gaming Laptop', nameBn: 'গেমিং ল্যাপটপ' },
            { slug: 'business-laptop', nameEn: 'Business Laptop', nameBn: 'বিজনেস ল্যাপটপ' },
            { slug: 'student-laptop', nameEn: 'Student Laptop', nameBn: 'স্টুডেন্ট ল্যাপটপ' },
            { slug: 'ultrabook', nameEn: 'Ultrabook', nameBn: 'আল্ট্রাবুক' },
            { slug: '2-in-1-laptop', nameEn: '2-in-1 Laptop', nameBn: '২-ইন-১ ল্যাপটপ' },
            { slug: 'macbook', nameEn: 'MacBook', nameBn: 'ম্যাকবুক' },
            { slug: 'workstation-laptop', nameEn: 'Workstation Laptop', nameBn: 'ওয়ার্কস্টেশন ল্যাপটপ' },
          ],
        },
        {
          slug: 'monitor-display',
          nameEn: 'Monitor & Display',
          nameBn: 'মনিটর ও ডিসপ্লে',
          productTypes: [pt('monitor', MONITOR_ATTRS, 'Monitor', 'মনিটর')],
          children: [
            { slug: 'gaming-monitor', nameEn: 'Gaming Monitor', nameBn: 'গেমিং মনিটর' },
            { slug: 'office-monitor', nameEn: 'Office Monitor', nameBn: 'অফিস মনিটর' },
            { slug: 'professional-monitor', nameEn: 'Professional Monitor', nameBn: 'প্রফেশনাল মনিটর' },
            { slug: 'ultrawide-monitor', nameEn: 'Ultrawide Monitor', nameBn: 'আল্ট্রাওয়াইড মনিটর' },
            { slug: 'curved-monitor', nameEn: 'Curved Monitor', nameBn: 'কার্ভড মনিটর' },
            { slug: '4k-monitor', nameEn: '4K Monitor', nameBn: '৪কে মনিটর' },
            { slug: 'portable-monitor', nameEn: 'Portable Monitor', nameBn: 'পোর্টেবল মনিটর' },
          ],
        },
        {
          slug: 'storage',
          nameEn: 'Storage',
          nameBn: 'স্টোরেজ',
          children: [
            { slug: 'internal-ssd', nameEn: 'Internal SSD', nameBn: 'ইন্টারনাল এসএসডি', productTypes: [pt('internal-ssd', STORAGE_ATTRS)] },
            { slug: 'external-ssd', nameEn: 'External SSD', nameBn: 'এক্সটার্নাল এসএসডি', productTypes: [pt('external-ssd', STORAGE_ATTRS)] },
            { slug: 'internal-hdd', nameEn: 'Internal HDD', nameBn: 'ইন্টারনাল এইচডিডি', productTypes: [pt('internal-hdd', STORAGE_ATTRS)] },
            { slug: 'external-hdd', nameEn: 'External HDD', nameBn: 'এক্সটার্নাল এইচডিডি', productTypes: [pt('external-hdd', STORAGE_ATTRS)] },
            { slug: 'memory-card', nameEn: 'Memory Card', nameBn: 'মেমোরি কার্ড' },
            { slug: 'usb-flash-drive', nameEn: 'USB Flash Drive', nameBn: 'ইউএসবি ফ্ল্যাশ ড্রাইভ' },
          ],
        },
        { slug: 'computer-accessories', nameEn: 'Computer Accessories', nameBn: 'কম্পিউটার এক্সেসরিজ', icon: '⌨️' },
      ],
    },
    {
      slug: 'mobile-tablet',
      nameEn: 'Mobile & Tablet',
      nameBn: 'মোবাইল ও ট্যাবলেট',
      icon: '📱',
      children: [
        { slug: 'smartphone', nameEn: 'Smartphone', nameBn: 'স্মার্টফোন' },
        { slug: 'tablet', nameEn: 'Tablet', nameBn: 'ট্যাবলেট' },
        { slug: 'feature-phone', nameEn: 'Feature Phone', nameBn: 'ফিচার ফোন' },
        { slug: 'mobile-accessories', nameEn: 'Mobile Accessories', nameBn: 'মোবাইল এক্সেসরিজ' },
      ],
    },
    {
      slug: 'networking',
      nameEn: 'Networking',
      nameBn: 'নেটওয়ার্কিং',
      icon: '🌐',
      productTypes: [pt('router', ROUTER_ATTRS, 'Router', 'রাউটার')],
      children: [
        { slug: 'wifi-router', nameEn: 'WiFi Router', nameBn: 'ওয়াইফাই রাউটার' },
        { slug: 'mesh-wifi', nameEn: 'Mesh WiFi', nameBn: 'মেশ ওয়াইফাই' },
        { slug: 'network-switch', nameEn: 'Switch', nameBn: 'সুইচ' },
        { slug: 'network-card', nameEn: 'Network Card', nameBn: 'নেটওয়ার্ক কার্ড' },
        { slug: 'access-point', nameEn: 'Access Point', nameBn: 'অ্যাক্সেস পয়েন্ট' },
        { slug: 'modem', nameEn: 'Modem', nameBn: 'মডেম' },
        { slug: 'range-extender', nameEn: 'Range Extender', nameBn: 'রেঞ্জ এক্সটেন্ডার' },
        { slug: 'network-cable', nameEn: 'Network Cable', nameBn: 'নেটওয়ার্ক ক্যাবল' },
        { slug: 'poe-device', nameEn: 'PoE', nameBn: 'পিওই' },
        { slug: 'networking-accessories', nameEn: 'Networking Accessories', nameBn: 'নেটওয়ার্কিং এক্সেসরিজ' },
      ],
    },
    {
      slug: 'gaming',
      nameEn: 'Gaming',
      nameBn: 'গেমিং',
      icon: '🎮',
      children: [
        { slug: 'gaming-desktop', nameEn: 'Gaming PC', nameBn: 'গেমিং পিসি' },
        { slug: 'gaming-laptop-cat', nameEn: 'Gaming Laptop', nameBn: 'গেমিং ল্যাপটপ' },
        { slug: 'gaming-monitor-cat', nameEn: 'Gaming Monitor', nameBn: 'গেমিং মনিটর' },
        { slug: 'gaming-keyboard', nameEn: 'Gaming Keyboard', nameBn: 'গেমিং কীবোর্ড' },
        { slug: 'gaming-mouse', nameEn: 'Gaming Mouse', nameBn: 'গেমিং মাউস' },
        { slug: 'gaming-headset', nameEn: 'Gaming Headset', nameBn: 'গেমিং হেডসেট' },
        { slug: 'gamepad', nameEn: 'Gamepad', nameBn: 'গেমপ্যাড' },
        { slug: 'capture-card', nameEn: 'Capture Card', nameBn: 'ক্যাপচার কার্ড' },
        { slug: 'streaming-equipment', nameEn: 'Streaming Equipment', nameBn: 'স্ট্রিমিং সরঞ্জাম' },
        { slug: 'vr-headset', nameEn: 'VR', nameBn: 'ভিআর' },
        { slug: 'gaming-accessories', nameEn: 'Gaming Accessories', nameBn: 'গেমিং এক্সেসরিজ' },
      ],
    },
    {
      slug: 'audio',
      nameEn: 'Audio',
      nameBn: 'অডিও',
      icon: '🎧',
      children: [
        { slug: 'headphone', nameEn: 'Headphone', nameBn: 'হেডফোন' },
        { slug: 'earphone', nameEn: 'Earphone', nameBn: 'ইয়ারফোন' },
        { slug: 'tws', nameEn: 'TWS', nameBn: 'টিডব্লিউএস' },
        { slug: 'bluetooth-speaker', nameEn: 'Bluetooth Speaker', nameBn: 'ব্লুটুথ স্পিকার' },
        { slug: 'soundbar', nameEn: 'Soundbar', nameBn: 'সাউন্ডবার' },
        { slug: 'home-theater', nameEn: 'Home Theater', nameBn: 'হোম থিয়েটার' },
        { slug: 'microphone', nameEn: 'Microphone', nameBn: 'মাইক্রোফোন' },
        { slug: 'studio-equipment', nameEn: 'Studio Equipment', nameBn: 'স্টুডিও সরঞ্জাম' },
        { slug: 'audio-accessories', nameEn: 'Audio Accessories', nameBn: 'অডিও এক্সেসরিজ' },
      ],
    },
    {
      slug: 'tv-entertainment',
      nameEn: 'TV & Entertainment',
      nameBn: 'টিভি ও বিনোদন',
      icon: '📺',
      children: [
        { slug: 'smart-tv', nameEn: 'Smart TV', nameBn: 'স্মার্ট টিভি' },
        { slug: 'led-tv', nameEn: 'LED TV', nameBn: 'এলইডি টিভি' },
        { slug: 'google-tv', nameEn: 'Google TV', nameBn: 'গুগল টিভি' },
        { slug: 'tv-box', nameEn: 'TV Box', nameBn: 'টিভি বক্স' },
        { slug: 'projector', nameEn: 'Projector', nameBn: 'প্রজেক্টর' },
        { slug: 'projector-screen', nameEn: 'Projector Screen', nameBn: 'প্রজেক্টর স্ক্রিন' },
        { slug: 'media-player', nameEn: 'Media Player', nameBn: 'মিডিয়া প্লেয়ার' },
        { slug: 'tv-accessories', nameEn: 'TV Accessories', nameBn: 'টিভি এক্সেসরিজ' },
      ],
    },
    {
      slug: 'camera-photography',
      nameEn: 'Camera & Photography',
      nameBn: 'ক্যামেরা ও ফটোগ্রাফি',
      icon: '📷',
      children: [
        { slug: 'dslr', nameEn: 'DSLR', nameBn: 'ডিএসএলআর' },
        { slug: 'mirrorless', nameEn: 'Mirrorless', nameBn: 'মিররলেস' },
        { slug: 'compact-camera', nameEn: 'Compact Camera', nameBn: 'কমপ্যাক্ট ক্যামেরা' },
        { slug: 'action-camera', nameEn: 'Action Camera', nameBn: 'অ্যাকশন ক্যামেরা' },
        { slug: 'cctv-camera', nameEn: 'CCTV Camera', nameBn: 'সিসিটিভি ক্যামেরা' },
        { slug: 'ip-camera', nameEn: 'IP Camera', nameBn: 'আইপি ক্যামেরা' },
        { slug: 'camera-lens', nameEn: 'Lens', nameBn: 'লেন্স' },
        { slug: 'tripod', nameEn: 'Tripod', nameBn: 'ট্রাইপড' },
        { slug: 'gimbal', nameEn: 'Gimbal', nameBn: 'জিম্বাল' },
        { slug: 'camera-bag', nameEn: 'Camera Bag', nameBn: 'ক্যামেরা ব্যাগ' },
        { slug: 'camera-accessories', nameEn: 'Camera Accessories', nameBn: 'ক্যামেরা এক্সেসরিজ' },
      ],
    },
    {
      slug: 'smart-devices',
      nameEn: 'Smart Devices',
      nameBn: 'স্মার্ট ডিভাইস',
      icon: '⌚',
      children: [
        { slug: 'smart-watch', nameEn: 'Smart Watch', nameBn: 'স্মার্ট ওয়াচ' },
        { slug: 'smart-band', nameEn: 'Smart Band', nameBn: 'স্মার্ট ব্যান্ড' },
        { slug: 'smart-home', nameEn: 'Smart Home', nameBn: 'স্মার্ট হোম' },
        { slug: 'smart-plug', nameEn: 'Smart Plug', nameBn: 'স্মার্ট প্লাগ' },
        { slug: 'smart-bulb', nameEn: 'Smart Bulb', nameBn: 'স্মার্ট বাল্ব' },
        { slug: 'smart-doorbell', nameEn: 'Smart Doorbell', nameBn: 'স্মার্ট ডোরবেল' },
        { slug: 'smart-sensor', nameEn: 'Smart Sensor', nameBn: 'স্মার্ট সেন্সর' },
        { slug: 'smart-lock', nameEn: 'Smart Lock', nameBn: 'স্মার্ট লক' },
        { slug: 'iot-devices', nameEn: 'IoT Devices', nameBn: 'আইওটি ডিভাইস' },
      ],
    },
    {
      slug: 'office-electronics',
      nameEn: 'Office Electronics',
      nameBn: 'অফিস ইলেকট্রনিক্স',
      icon: '🖨️',
      children: [
        {
          slug: 'printer',
          nameEn: 'Printer',
          nameBn: 'প্রিন্টার',
          children: [
            { slug: 'inkjet-printer', nameEn: 'Inkjet', nameBn: 'ইনকজেট' },
            { slug: 'laser-printer', nameEn: 'Laser', nameBn: 'লেজার' },
            { slug: 'all-in-one-printer', nameEn: 'All-in-One', nameBn: 'অল-ইন-ওয়ান' },
            { slug: 'thermal-printer', nameEn: 'Thermal Printer', nameBn: 'থার্মাল প্রিন্টার' },
          ],
        },
        { slug: 'scanner', nameEn: 'Scanner', nameBn: 'স্ক্যানার' },
        { slug: 'office-projector', nameEn: 'Projector', nameBn: 'প্রজেক্টর' },
        { slug: 'pos-machine', nameEn: 'POS Machine', nameBn: 'পিওএস মেশিন' },
        { slug: 'barcode-scanner', nameEn: 'Barcode Scanner', nameBn: 'বারকোড স্ক্যানার' },
        { slug: 'label-printer', nameEn: 'Label Printer', nameBn: 'লেবেল প্রিন্টার' },
        { slug: 'office-accessories', nameEn: 'Office Accessories', nameBn: 'অফিস এক্সেসরিজ' },
      ],
    },
    {
      slug: 'power-electrical',
      nameEn: 'Power & Electrical',
      nameBn: 'পাওয়ার ও ইলেকট্রিক্যাল',
      icon: '🔌',
      children: [
        { slug: 'ups', nameEn: 'UPS', nameBn: 'ইউপিএস' },
        { slug: 'ips', nameEn: 'IPS', nameBn: 'আইপিএস' },
        { slug: 'inverter', nameEn: 'Inverter', nameBn: 'ইনভার্টার' },
        { slug: 'portable-power-station', nameEn: 'Portable Power Station', nameBn: 'পোর্টেবল পাওয়ার স্টেশন' },
        { slug: 'surge-protector', nameEn: 'Surge Protector', nameBn: 'সার্জ প্রোটেক্টর' },
        { slug: 'power-strip', nameEn: 'Power Strip', nameBn: 'পাওয়ার স্ট্রিপ' },
        { slug: 'power-adapter', nameEn: 'Adapter', nameBn: 'অ্যাডাপ্টার' },
        { slug: 'charger', nameEn: 'Charger', nameBn: 'চার্জার' },
        { slug: 'battery', nameEn: 'Battery', nameBn: 'ব্যাটারি' },
        { slug: 'power-accessories', nameEn: 'Power Accessories', nameBn: 'পাওয়ার এক্সেসরিজ' },
      ],
    },
    {
      slug: 'lighting',
      nameEn: 'Lighting',
      nameBn: 'লাইটিং',
      icon: '💡',
      children: [
        { slug: 'led-bulb', nameEn: 'LED Bulb', nameBn: 'এলইডি বাল্ব' },
        { slug: 'tube-light', nameEn: 'Tube Light', nameBn: 'টিউব লাইট' },
        { slug: 'ceiling-light', nameEn: 'Ceiling Light', nameBn: 'সিলিং লাইট' },
        { slug: 'emergency-light', nameEn: 'Emergency Light', nameBn: 'ইমার্জেন্সি লাইট' },
        { slug: 'torch-light', nameEn: 'Torch Light', nameBn: 'টর্চ লাইট' },
        { slug: 'lighting-accessories', nameEn: 'Lighting Accessories', nameBn: 'লাইটিং এক্সেসরিজ' },
      ],
    },
    {
      slug: 'cables-adapters',
      nameEn: 'Cables & Adapters',
      nameBn: 'ক্যাবল ও অ্যাডাপ্টার',
      icon: '🔗',
      children: [
        { slug: 'hdmi-cable', nameEn: 'HDMI', nameBn: 'এইচডিএমআই' },
        { slug: 'displayport-cable', nameEn: 'DisplayPort', nameBn: 'ডিসপ্লেপোর্ট' },
        { slug: 'usb-cable', nameEn: 'USB', nameBn: 'ইউএসবি' },
        { slug: 'usb-c-cable', nameEn: 'USB-C', nameBn: 'ইউএসবি-সি' },
        { slug: 'ethernet-cable', nameEn: 'Ethernet', nameBn: 'ইথারনেট' },
        { slug: 'audio-cable', nameEn: 'Audio Cable', nameBn: 'অডিও ক্যাবল' },
        { slug: 'power-cable', nameEn: 'Power Cable', nameBn: 'পাওয়ার ক্যাবল' },
        { slug: 'vga-cable', nameEn: 'VGA', nameBn: 'ভিজিএ' },
        { slug: 'dvi-cable', nameEn: 'DVI', nameBn: 'ডিভিআই' },
        { slug: 'converter', nameEn: 'Converter', nameBn: 'কনভার্টার' },
        { slug: 'adapter', nameEn: 'Adapter', nameBn: 'অ্যাডাপ্টার' },
      ],
    },
    {
      slug: 'home-appliances',
      nameEn: 'Home Appliances',
      nameBn: 'হোম অ্যাপ্লায়েন্স',
      icon: '🏠',
      children: [
        { slug: 'fan', nameEn: 'Fan', nameBn: 'ফ্যান' },
        { slug: 'iron', nameEn: 'Iron', nameBn: 'আয়রন' },
        { slug: 'blender', nameEn: 'Blender', nameBn: 'ব্লেন্ডার' },
        { slug: 'rice-cooker', nameEn: 'Rice Cooker', nameBn: 'রাইস কুকার' },
        { slug: 'electric-kettle', nameEn: 'Electric Kettle', nameBn: 'ইলেকট্রিক কেটলি' },
        { slug: 'home-appliance-accessories', nameEn: 'Home Appliance Accessories', nameBn: 'হোম অ্যাপ্লায়েন্স এক্সেসরিজ' },
      ],
    },
  ],
};

export const ELECTRONICS_BRANDS: string[] = [
  'AMD',
  'Intel',
  'ASUS',
  'MSI',
  'Gigabyte',
  'Corsair',
  'Samsung',
  'Xiaomi',
  'TP-Link',
  'Logitech',
  'Dell',
  'HP',
  'Lenovo',
  'Apple',
  'Walton',
];

export interface SeedElectronicsVariant {
  nameEn: string;
  nameBn: string;
  sku: string;
  /** Variant axis values keyed by attribute slug (e.g. { capacity: '1TB' }). */
  attributes?: Record<string, string>;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
}

export interface SeedElectronicsProduct {
  categoryPath: string;
  productTypeSlug: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  sku: string;
  brand: string;
  shortDescriptionEn: string;
  shortDescriptionBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  unit?: string;
  isFeatured?: boolean;
  /** Structured specs keyed by attribute slug (option value, number or boolean). */
  specs?: Record<string, string | number | boolean>;
  variants?: SeedElectronicsVariant[];
}

/** A curated, realistic set of representative Electronics products. */
export const ELECTRONICS_PRODUCTS: SeedElectronicsProduct[] = [
  {
    categoryPath: 'electronics/computers-pc/pc-components/processor',
    productTypeSlug: 'processor',
    nameEn: 'AMD Ryzen 5 7600 Desktop Processor',
    nameBn: 'এএমডি রাইজেন ৫ ৭৬০০ ডেস্কটপ প্রসেসর',
    slug: 'amd-ryzen-5-7600',
    sku: 'CPU-AMD-R5-7600',
    brand: 'AMD',
    shortDescriptionEn: '6 cores, 12 threads Zen 4 processor on the AM5 platform.',
    shortDescriptionBn: '৬ কোর, ১২ থ্রেড জেন ৪ প্রসেসর, এএম৫ প্ল্যাটফর্ম।',
    descriptionEn: 'Excellent all-round gaming and productivity processor with integrated Radeon graphics.',
    descriptionBn: 'গেমিং ও প্রোডাক্টিভিটির জন্য দুর্দান্ত পারফরম্যান্স, ইন্টিগ্রেটেড গ্রাফিক্স সহ।',
    price: 22500,
    compareAtPrice: 24500,
    stock: 40,
    unit: 'piece',
    isFeatured: true,
    specs: {
      series: 'Ryzen 5',
      generation: '7000 Series',
      socket: 'AM5',
      architecture: 'Zen 4',
      cores: '6',
      threads: '12',
      'base-clock': 3.8,
      'boost-clock': 5.1,
      cache: 32,
      tdp: 65,
      'integrated-graphics': 'Yes',
      'box-type': 'Boxed',
      warranty: '3 Years',
    },
  },
  {
    categoryPath: 'electronics/computers-pc/pc-components/processor',
    productTypeSlug: 'processor',
    nameEn: 'Intel Core i5-14400F Processor',
    nameBn: 'ইন্টেল কোর আই৫-১৪৪০০এফ প্রসেসর',
    slug: 'intel-core-i5-14400f',
    sku: 'CPU-INT-I5-14400F',
    brand: 'Intel',
    shortDescriptionEn: '10 cores, 16 threads 14th Gen processor for gaming builds.',
    shortDescriptionBn: '১০ কোর, ১৬ থ্রেড ১৪তম জেনারেশন প্রসেসর।',
    price: 21500,
    compareAtPrice: 23000,
    stock: 35,
    unit: 'piece',
    isFeatured: true,
    specs: {
      series: 'Core i5',
      generation: '14th Gen',
      socket: 'LGA1700',
      cores: '10',
      threads: '16',
      'base-clock': 2.5,
      'boost-clock': 4.7,
      cache: 24,
      tdp: 65,
      'integrated-graphics': 'No',
      'box-type': 'Boxed',
      warranty: '3 Years',
    },
  },
  {
    categoryPath: 'electronics/computers-pc/pc-components/motherboard',
    productTypeSlug: 'motherboard',
    nameEn: 'ASUS PRIME B650M-A WIFI Motherboard',
    nameBn: 'আসুস প্রাইম বি৬৫০এম-এ ওয়াইফাই মাদারবোর্ড',
    slug: 'asus-prime-b650m-a-wifi',
    sku: 'MBD-ASUS-B650MA',
    brand: 'ASUS',
    shortDescriptionEn: 'Micro-ATX AM5 motherboard with WiFi 6 and DDR5 support.',
    shortDescriptionBn: 'মাইক্রো-এটিএক্স এএম৫ মাদারবোর্ড, ওয়াইফাই ৬ ও ডিডিআর৫ সাপোর্ট।',
    price: 24500,
    stock: 20,
    unit: 'piece',
    specs: {
      socket: 'AM5',
      chipset: 'B650',
      'form-factor': 'Micro-ATX',
      'ram-type': 'DDR5',
      'ram-slots': 4,
      'max-ram': 128,
      'm2-slots': 2,
      'pcie-version': 'PCIe 4.0',
      wifi: 'Yes',
      bluetooth: 'Yes',
      lan: '2.5G',
      warranty: '3 Years',
    },
  },
  {
    categoryPath: 'electronics/computers-pc/pc-components/graphics-card',
    productTypeSlug: 'graphics-card',
    nameEn: 'MSI GeForce RTX 4060 VENTUS 2X 8GB Graphics Card',
    nameBn: 'এমএসআই জিফোর্স আরটিএক্স ৪০৬০ ভেন্টাস ২এক্স ৮জিবি গ্রাফিক্স কার্ড',
    slug: 'msi-rtx-4060-ventus-2x',
    sku: 'GPU-MSI-RTX4060-V2X',
    brand: 'MSI',
    shortDescriptionEn: '8GB GDDR6 RTX 4060 graphics card with dual-fan cooling.',
    shortDescriptionBn: '৮জিবি জিডিডিআর৬ আরটিএক্স ৪০৬০ গ্রাফিক্স কার্ড।',
    price: 42000,
    compareAtPrice: 45000,
    stock: 15,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'gpu-manufacturer': 'NVIDIA',
      'gpu-model': 'RTX 4060',
      vram: 8,
      'vram-type': 'GDDR6',
      'memory-bus': 128,
      'boost-clock': 2.49,
      'gpu-interface': 'PCIe 4.0 x16',
      'power-requirement': 115,
      'recommended-psu': 550,
      length: 199,
      cooling: 'Dual Fan',
      warranty: '3 Years',
    },
  },
  {
    categoryPath: 'electronics/computers-pc/pc-components/ram',
    productTypeSlug: 'ram',
    nameEn: 'Corsair Vengeance DDR5 16GB 5600MHz Desktop RAM',
    nameBn: 'কর্সেইর ভেঞ্জেন্স ডিডিআর৫ ১৬জিবি ৫৬০০MHz ডেস্কটপ র‍্যাম',
    slug: 'corsair-vengeance-ddr5-16gb-5600',
    sku: 'RAM-COR-DDR5-16-5600',
    brand: 'Corsair',
    shortDescriptionEn: 'DDR5 16GB single module running at 5600MHz with CL36 latency.',
    shortDescriptionBn: 'ডিডিআর৫ ১৬জিবি ৫৬০০MHz সিএল৩৬ ডেস্কটপ র‍্যাম।',
    price: 7500,
    stock: 50,
    unit: 'piece',
    specs: {
      generation: '7000 Series',
      capacity: '16GB',
      speed: 5600,
      'module-type': 'UDIMM',
      kit: 'Single',
      'cas-latency': 36,
      ecc: 'No',
      rgb: 'No',
      warranty: '2 Years',
    },
  },
  {
    categoryPath: 'electronics/computers-pc/pc-components/ssd',
    productTypeSlug: 'ssd',
    nameEn: 'Samsung 980 PRO 1TB NVMe PCIe 4.0 SSD',
    nameBn: 'স্যামসাং ৯৮০ প্রো ১টিবি এনভিএমই পিসিআইই ৪.০ এসএসডি',
    slug: 'samsung-980-pro-nvme-ssd',
    sku: 'SSD-SAM-980PRO',
    brand: 'Samsung',
    shortDescriptionEn: 'Up to 7000MB/s sequential read speed PCIe 4.0 NVMe SSD.',
    shortDescriptionBn: '৭০০০MB/s পর্যন্ত রিড স্পিডের পিসিআইই ৪.০ এনভিএমই এসএসডি।',
    price: 12500,
    compareAtPrice: 14500,
    stock: 30,
    unit: 'piece',
    isFeatured: true,
    specs: {
      capacity: '1TB',
      'storage-interface': 'NVMe PCIe 4.0',
      'form-factor': 'M.2 2280',
      'read-speed': 7000,
      'write-speed': 5000,
      'nand-type': 'TLC',
      tbw: 600,
      warranty: '5 Years',
    },
    variants: [
      {
        nameEn: '1TB',
        nameBn: '১টিবি',
        sku: 'SSD-SAM-980PRO-1TB',
        attributes: { capacity: '1TB' },
        price: 12500,
        compareAtPrice: 14500,
        stock: 30,
      },
      {
        nameEn: '2TB',
        nameBn: '২টিবি',
        sku: 'SSD-SAM-980PRO-2TB',
        attributes: { capacity: '2TB' },
        price: 23500,
        compareAtPrice: 26000,
        stock: 15,
      },
    ],
  },
  {
    categoryPath: 'electronics/computers-pc/laptop/gaming-laptop',
    productTypeSlug: 'laptop',
    nameEn: 'ASUS TUF Gaming A15 (Ryzen 7 7435HS, RTX 4050)',
    nameBn: 'আসুস টাফ গেমিং এ১৫ (রাইজেন ৭ ৭৪৩৫এইচএস, আরটিএক্স ৪০৫০)',
    slug: 'asus-tuf-gaming-a15-rtx4050',
    sku: 'LAP-ASUS-TUFA15',
    brand: 'ASUS',
    shortDescriptionEn: '15.6-inch FHD 144Hz gaming laptop with RTX 4050 graphics.',
    shortDescriptionBn: '১৫.৬ ইঞ্চি এফএইচডি ১৪৪Hz গেমিং ল্যাপটপ, আরটিএক্স ৪০৫০ গ্রাফিক্স।',
    price: 118000,
    compareAtPrice: 125000,
    stock: 10,
    unit: 'piece',
    isFeatured: true,
    specs: {
      processor: 'AMD Ryzen 7 7435HS',
      generation: '7000 Series',
      ram: '16GB',
      'ram-type': 'DDR5',
      storage: '512GB NVMe SSD',
      gpu: 'NVIDIA GeForce RTX 4050 6GB',
      'screen-size': '15.6"',
      resolution: 'FHD',
      'panel-type': 'IPS',
      'refresh-rate': '144Hz',
      'operating-system': 'Windows 11',
      battery: '90Wh',
      weight: 2.2,
      ports: 'HDMI',
      keyboard: 'Backlit RGB',
      warranty: '2 Years',
    },
    variants: [
      {
        nameEn: '16GB RAM + 512GB SSD',
        nameBn: '১৬জিবি র‍্যাম + ৫১২জিবি এসএসডি',
        sku: 'LAP-ASUS-TUFA15-16-512',
        attributes: { ram: '16GB', storage: '512GB' },
        price: 118000,
        stock: 10,
      },
      {
        nameEn: '16GB RAM + 1TB SSD',
        nameBn: '১৬জিবি র‍্যাম + ১টিবি এসএসডি',
        sku: 'LAP-ASUS-TUFA15-16-1TB',
        attributes: { ram: '16GB', storage: '1TB' },
        price: 128000,
        stock: 6,
      },
    ],
  },
  {
    categoryPath: 'electronics/computers-pc/monitor-display/gaming-monitor',
    productTypeSlug: 'monitor',
    nameEn: 'Samsung Odyssey G5 27" QHD 165Hz Gaming Monitor',
    nameBn: 'স্যামসাং ওডিসি জি৫ ২৭" কিউএইচডি ১৬৫Hz গেমিং মনিটর',
    slug: 'samsung-odyssey-g5-27-qhd-165hz',
    sku: 'MON-SAM-G5-27',
    brand: 'Samsung',
    shortDescriptionEn: '27-inch QHD 165Hz curved VA gaming monitor with FreeSync.',
    shortDescriptionBn: '২৭ ইঞ্চি কিউএইচডি ১৬৫Hz কার্ভড ভিএ গেমিং মনিটর।',
    price: 38500,
    compareAtPrice: 42000,
    stock: 12,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'screen-size': '27"',
      resolution: 'QHD',
      'panel-type': 'VA',
      'refresh-rate': '165Hz',
      'response-time': 1,
      brightness: 300,
      hdr: 'Yes',
      'adaptive-sync': 'FreeSync',
      'color-gamut': 'sRGB 99%',
      ports: 'HDMI, DisplayPort',
      curved: 'Yes',
      'vesa-mount': 'Yes',
      warranty: '3 Years',
    },
  },
  {
    categoryPath: 'electronics/networking/wifi-router',
    productTypeSlug: 'router',
    nameEn: 'TP-Link Archer AX55 WiFi 6 Router',
    nameBn: 'টিপি-লিংক আর্চার AX55 ওয়াইফাই ৬ রাউটার',
    slug: 'tp-link-archer-ax55',
    sku: 'NET-TPL-AX55',
    brand: 'TP-Link',
    shortDescriptionEn: 'Dual-band WiFi 6 router with 3000Mbps combined speed.',
    shortDescriptionBn: 'ডুয়াল-ব্যান্ড ওয়াইফাই ৬ রাউটার, ৩০০০Mbps স্পিড।',
    price: 8500,
    compareAtPrice: 9500,
    stock: 25,
    unit: 'piece',
    specs: {
      'wifi-generation': 'WiFi 6',
      'data-rate': 3000,
      bands: 'Dual Band',
      'lan-ports': 4,
      'wan-ports': 1,
      poe: 'No',
      coverage: 2500,
      management: 'Mobile App',
      warranty: '3 Years',
    },
  },
];

