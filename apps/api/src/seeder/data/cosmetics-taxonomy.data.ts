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

/** Shade variant for cosmetics */
const sv = (
  shade: string,
  sku: string,
  price: number,
  stock: number,
  volume?: string,
): SeedVerticalVariant => ({
  nameEn: volume ? `${shade} / ${volume}` : shade,
  nameBn: volume ? `${shade} / ${volume}` : shade,
  sku,
  price,
  stock,
  attributes: {
    'cosmetics-shade': shade,
    ...(volume ? { 'cosmetics-volume': volume } : {}),
  },
});

/** Volume-only variant for cosmetics */
const vv = (volume: string, sku: string, price: number, stock: number): SeedVerticalVariant => ({
  nameEn: volume,
  nameBn: volume,
  sku,
  price,
  stock,
  attributes: { 'cosmetics-volume': volume },
});

/**
 * Universal Cosmetics & Personal Care attributes.
 *
 * Shade, volume, skin type, hair type, finish, coverage, SPF, scent family,
 * form, claims and country of origin are ATTRIBUTES — never categories —
 * preventing category explosion.
 *
 * Shade options carry hexColor for visual circular swatches on PDP and listings.
 */
export const COSMETICS_ATTRIBUTES: SeedAttribute[] = [
  {
    slug: 'cosmetics-skin-type',
    nameEn: 'Skin Type',
    nameBn: 'ত্বকের ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Normal',
      'Dry',
      'Oily',
      'Combination',
      'Sensitive',
      'Acne-Prone',
      'All Skin Types',
    ),
  },
  {
    slug: 'cosmetics-hair-type',
    nameEn: 'Hair Type',
    nameBn: 'চুলের ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Straight',
      'Wavy',
      'Curly',
      'Coily',
      'Dry Hair',
      'Oily Hair',
      'Damaged Hair',
      'Color-Treated Hair',
      'All Hair Types',
    ),
  },
  {
    slug: 'cosmetics-concern',
    nameEn: 'Skin/Hair Concern',
    nameBn: 'সমস্যা / সমাধান',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Acne & Blemishes',
      'Anti-Aging & Wrinkles',
      'Dark Spots & Pigmentation',
      'Dryness & Dehydration',
      'Dullness & Uneven Tone',
      'Oil & Pores',
      'Hair Fall',
      'Dandruff',
      'Frizz Control',
    ),
  },
  {
    slug: 'cosmetics-benefit',
    nameEn: 'Benefit',
    nameBn: 'উপকারিতা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Hydrating',
      'Brightening',
      'Moisturizing',
      'Soothing',
      'Nourishing',
      'Deep Cleansing',
      'Long-Lasting',
      'Sun Protection',
      'Volumizing',
      'Repairs Damage',
    ),
  },
  {
    slug: 'cosmetics-finish',
    nameEn: 'Finish',
    nameBn: 'ফিনিশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Matte', 'Dewy', 'Satin', 'Glossy', 'Natural', 'Shimmer'),
  },
  {
    slug: 'cosmetics-coverage',
    nameEn: 'Coverage',
    nameBn: 'কাভারেজ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Light', 'Medium', 'Full', 'Sheer', 'Buildable'),
  },
  {
    slug: 'cosmetics-shade',
    nameEn: 'Shade / Color',
    nameBn: 'শেড / রঙ',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: swatchOpt([
      ['01 Ivory', '#f6ebd9'],
      ['02 Natural Ivory', '#f3e3ce'],
      ['03 Classic Nude', '#edd0b0'],
      ['04 Natural Beige', '#e4be96'],
      ['05 Pure Beige', '#dfb48b'],
      ['06 Sun Beige', '#d7a57a'],
      ['07 Warm Honey', '#cb915f'],
      ['Ruby Red', '#b31b2c'],
      ['Pink Rose', '#d94e77'],
      ['Nude Coral', '#d47a65'],
      ['Berry Plum', '#7d2248'],
      ['Velvet Crimson', '#8a1325'],
      ['Black Onyx', '#1a1a1a'],
    ]),
  },
  {
    slug: 'cosmetics-volume',
    nameEn: 'Volume / Net Weight',
    nameBn: 'পরিমাণ / ভলিউম',
    dataType: AttributeDataType.SELECT,
    isVariantAxis: true,
    isFilterable: true,
    options: opt(
      '15 ml',
      '30 ml',
      '50 ml',
      '100 ml',
      '150 ml',
      '200 ml',
      '250 ml',
      '400 ml',
      '500 ml',
    ),
  },
  {
    slug: 'cosmetics-scent-family',
    nameEn: 'Scent Family',
    nameBn: 'সুগন্ধির ধরন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Floral', 'Woody', 'Citrus', 'Oriental', 'Fresh', 'Fruity', 'Musk', 'Oud', 'Sweet'),
  },
  {
    slug: 'cosmetics-form',
    nameEn: 'Formulation / Texture',
    nameBn: 'টেক্সচার / গঠন',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Liquid',
      'Cream',
      'Gel',
      'Foam',
      'Powder',
      'Serum',
      'Oil',
      'Lotion',
      'Balm',
      'Bar',
      'Spray',
    ),
  },
  {
    slug: 'cosmetics-spf',
    nameEn: 'Sun Protection (SPF)',
    nameBn: 'সান প্রোটেকশন (SPF)',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('SPF 15', 'SPF 30', 'SPF 50', 'SPF 50+ PA++++', 'PA+++'),
  },
  {
    slug: 'cosmetics-claims',
    nameEn: 'Claims & Certifications',
    nameBn: 'দাবি ও সনদ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Vegan',
      'Cruelty-Free',
      'Paraben-Free',
      'Sulfate-Free',
      'Alcohol-Free',
      'Dermatologically Tested',
      'Waterproof',
      'Organic',
      'Natural',
    ),
  },
  {
    slug: 'cosmetics-country-of-origin',
    nameEn: 'Country of Origin',
    nameBn: 'উৎস দেশ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Bangladesh',
      'Korea',
      'India',
      'France',
      'USA',
      'UK',
      'Thailand',
      'Japan',
      'Germany',
    ),
  },
  {
    slug: 'cosmetics-gender',
    nameEn: 'Target Gender',
    nameBn: 'উদ্দিষ্ট লিঙ্গ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt('Women', 'Men', 'Unisex', 'Baby', 'Kids'),
  },
];

const COMMON_SKIN_ATTRS = [
  'cosmetics-skin-type',
  'cosmetics-concern',
  'cosmetics-benefit',
  'cosmetics-form',
  'cosmetics-volume',
  'cosmetics-claims',
  'cosmetics-country-of-origin',
];

const COMMON_HAIR_ATTRS = [
  'cosmetics-hair-type',
  'cosmetics-concern',
  'cosmetics-benefit',
  'cosmetics-form',
  'cosmetics-volume',
  'cosmetics-claims',
  'cosmetics-country-of-origin',
];

const COMMON_MAKEUP_ATTRS = [
  'cosmetics-shade',
  'cosmetics-finish',
  'cosmetics-coverage',
  'cosmetics-skin-type',
  'cosmetics-claims',
  'cosmetics-country-of-origin',
];

export const COSMETICS_TAXONOMY: SeedTaxonomyNode = {
  slug: 'cosmetics',
  nameEn: 'Cosmetics & Personal Care',
  nameBn: 'প্রসাধন ও ব্যক্তিগত যত্ন',
  icon: '✨',
  descriptionEn: 'Skincare, haircare, makeup, fragrance and daily personal care essentials.',
  descriptionBn: 'স্কিনকেয়ার, চুলের যত্ন, মেকআপ, সুগন্ধি ও প্রসাধন সামগ্রী।',
  children: [
    // ----------------- 1. Skin Care -----------------
    {
      slug: 'cosmetics-skin-care',
      nameEn: 'Skin Care',
      nameBn: 'স্কিন কেয়ার',
      icon: '🧴',
      children: [
        {
          slug: 'cosmetics-face-wash-cleanser',
          nameEn: 'Face Wash & Cleansers',
          nameBn: 'ফেস ওয়াশ ও ক্লিনজার',
          productTypes: [pt('cosmetics-facewash', COMMON_SKIN_ATTRS, 'Face Wash', 'ফেস ওয়াশ')],
        },
        {
          slug: 'cosmetics-face-moisturizer',
          nameEn: 'Face Moisturizers',
          nameBn: 'ফেস ময়েশ্চারাইজার',
          productTypes: [
            pt('cosmetics-moisturizer', COMMON_SKIN_ATTRS, 'Moisturizer', 'ময়েশ্চারাইজার'),
          ],
        },
        {
          slug: 'cosmetics-face-serum',
          nameEn: 'Face Serums',
          nameBn: 'ফেস সিরাম',
          productTypes: [pt('cosmetics-serum', COMMON_SKIN_ATTRS, 'Face Serum', 'ফেস সিরাম')],
        },
        {
          slug: 'cosmetics-face-cream',
          nameEn: 'Face Creams',
          nameBn: 'ফেস ক্রিম',
          productTypes: [pt('cosmetics-cream', COMMON_SKIN_ATTRS, 'Face Cream', 'ফেস ক্রিম')],
        },
        {
          slug: 'cosmetics-face-mask',
          nameEn: 'Face Masks & Sheet Masks',
          nameBn: 'ফেস মাস্ক',
          productTypes: [pt('cosmetics-mask', COMMON_SKIN_ATTRS, 'Face Mask', 'ফেস মাস্ক')],
        },
        {
          slug: 'cosmetics-toner',
          nameEn: 'Toners & Mists',
          nameBn: 'টোনার ও মিস্ট',
          productTypes: [pt('cosmetics-toner', COMMON_SKIN_ATTRS, 'Toner', 'টোনার')],
        },
        {
          slug: 'cosmetics-sunscreen',
          nameEn: 'Sunscreens & SPF Care',
          nameBn: 'সানস্ক্রিন ও সানব্লক',
          productTypes: [
            pt(
              'cosmetics-sunscreen',
              [...COMMON_SKIN_ATTRS, 'cosmetics-spf'],
              'Sunscreen',
              'সানস্ক্রিন',
            ),
          ],
        },
        {
          slug: 'cosmetics-acne-care',
          nameEn: 'Acne & Spot Care',
          nameBn: 'ব্রণ ও স্পট কেয়ার',
          productTypes: [
            pt('cosmetics-acne-care', COMMON_SKIN_ATTRS, 'Acne Treatment', 'ব্রণ প্রতিষেধক'),
          ],
        },
        {
          slug: 'cosmetics-lip-care',
          nameEn: 'Lip Care & Balms',
          nameBn: 'লিপ কেয়ার ও বাম',
          productTypes: [pt('cosmetics-lip-care', COMMON_SKIN_ATTRS, 'Lip Balm', 'লিপ বাম')],
        },
        {
          slug: 'cosmetics-eye-care',
          nameEn: 'Eye Creams & Serums',
          nameBn: 'আই ক্রিম ও সিরাম',
          productTypes: [pt('cosmetics-eye-care', COMMON_SKIN_ATTRS, 'Eye Cream', 'আই ক্রিম')],
        },
        {
          slug: 'cosmetics-body-care',
          nameEn: 'Body Lotions & Creams',
          nameBn: 'বডি লোশন ও ক্রিম',
          productTypes: [
            pt('cosmetics-bodylotion', COMMON_SKIN_ATTRS, 'Body Lotion', 'বডি লোশন'),
          ],
        },
      ],
    },

    // ----------------- 2. Hair Care -----------------
    {
      slug: 'cosmetics-hair-care',
      nameEn: 'Hair Care',
      nameBn: 'চুলের যত্ন',
      icon: '💇',
      children: [
        {
          slug: 'cosmetics-shampoo',
          nameEn: 'Shampoos',
          nameBn: 'শ্যাম্পু',
          productTypes: [pt('cosmetics-shampoo', COMMON_HAIR_ATTRS, 'Shampoo', 'শ্যাম্পু')],
        },
        {
          slug: 'cosmetics-conditioner',
          nameEn: 'Conditioners',
          nameBn: 'কন্ডিশনার',
          productTypes: [
            pt('cosmetics-conditioner', COMMON_HAIR_ATTRS, 'Conditioner', 'কন্ডিশনার'),
          ],
        },
        {
          slug: 'cosmetics-hair-oil',
          nameEn: 'Hair Oils',
          nameBn: 'হেয়ার অয়েল',
          productTypes: [pt('cosmetics-hairoil', COMMON_HAIR_ATTRS, 'Hair Oil', 'হেয়ার অয়েল')],
        },
        {
          slug: 'cosmetics-hair-serum',
          nameEn: 'Hair Serums & Treatments',
          nameBn: 'হেয়ার সিরাম',
          productTypes: [
            pt('cosmetics-hair-serum', COMMON_HAIR_ATTRS, 'Hair Serum', 'হেয়ার সিরাম'),
          ],
        },
        {
          slug: 'cosmetics-hair-color',
          nameEn: 'Hair Color & Henna',
          nameBn: 'হেয়ার কালার ও মেহেদি',
          productTypes: [
            pt('cosmetics-hair-color', COMMON_HAIR_ATTRS, 'Hair Color', 'হেয়ার কালার'),
          ],
        },
        {
          slug: 'cosmetics-hair-styling',
          nameEn: 'Hair Gels & Sprays',
          nameBn: 'হেয়ার জেল ও স্প্রে',
          productTypes: [
            pt('cosmetics-hair-styling', COMMON_HAIR_ATTRS, 'Styling Gel', 'স্টাইলিং জেল'),
          ],
        },
      ],
    },

    // ----------------- 3. Makeup -----------------
    {
      slug: 'cosmetics-makeup',
      nameEn: 'Makeup & Cosmetics',
      nameBn: 'রূপচর্চা ও মেকআপ',
      icon: '💄',
      children: [
        {
          slug: 'cosmetics-foundation',
          nameEn: 'Foundations & BB Creams',
          nameBn: 'ফাউন্ডেশন ও বিবি ক্রিম',
          productTypes: [
            pt(
              'cosmetics-foundation',
              [...COMMON_MAKEUP_ATTRS, 'cosmetics-volume'],
              'Foundation',
              'ফাউন্ডেশন',
            ),
          ],
        },
        {
          slug: 'cosmetics-concealer',
          nameEn: 'Concealers',
          nameBn: 'কনসিলার',
          productTypes: [pt('cosmetics-concealer', COMMON_MAKEUP_ATTRS, 'Concealer', 'কনসিলার')],
        },
        {
          slug: 'cosmetics-face-powder',
          nameEn: 'Face Powders & Compacts',
          nameBn: 'ফেস পাউডার ও কম্প্যাক্ট',
          productTypes: [
            pt('cosmetics-face-powder', COMMON_MAKEUP_ATTRS, 'Face Powder', 'ফেস পাউডার'),
          ],
        },
        {
          slug: 'cosmetics-blush',
          nameEn: 'Blushes & Highlighters',
          nameBn: 'ব্লাশ ও হাইলাইটার',
          productTypes: [pt('cosmetics-blush', COMMON_MAKEUP_ATTRS, 'Blush', 'ব্লাশ')],
        },
        {
          slug: 'cosmetics-primer',
          nameEn: 'Makeup Primers',
          nameBn: 'মেকআপ প্রাইমার',
          productTypes: [pt('cosmetics-primer', COMMON_MAKEUP_ATTRS, 'Primer', 'প্রাইমার')],
        },
        {
          slug: 'cosmetics-lipstick',
          nameEn: 'Lipsticks & Lip Colors',
          nameBn: 'লিপস্টিক ও লিপ কালার',
          productTypes: [pt('cosmetics-lipstick', COMMON_MAKEUP_ATTRS, 'Lipstick', 'লিপস্টিক')],
        },
        {
          slug: 'cosmetics-lip-gloss',
          nameEn: 'Lip Glosses & Tints',
          nameBn: 'লিপ গ্লস ও টিন্ট',
          productTypes: [pt('cosmetics-lip-gloss', COMMON_MAKEUP_ATTRS, 'Lip Gloss', 'লিপ গ্লস')],
        },
        {
          slug: 'cosmetics-eyeliner',
          nameEn: 'Eyeliners & Kajal',
          nameBn: 'আইলাইনার ও কাজল',
          productTypes: [pt('cosmetics-eyeliner', COMMON_MAKEUP_ATTRS, 'Eyeliner', 'আইলাইনার')],
        },
        {
          slug: 'cosmetics-mascara',
          nameEn: 'Mascaras',
          nameBn: 'মাসকারা',
          productTypes: [pt('cosmetics-mascara', COMMON_MAKEUP_ATTRS, 'Mascara', 'মাসকারা')],
        },
        {
          slug: 'cosmetics-eyeshadow',
          nameEn: 'Eyeshadow Palettes',
          nameBn: 'আইশ্যাডো প্যালেট',
          productTypes: [pt('cosmetics-eyeshadow', COMMON_MAKEUP_ATTRS, 'Eyeshadow', 'আইশ্যাডো')],
        },
        {
          slug: 'cosmetics-makeup-remover',
          nameEn: 'Makeup Removers & Micellar Water',
          nameBn: 'মেকআপ রিমুভার',
          productTypes: [
            pt(
              'cosmetics-makeup-remover',
              COMMON_SKIN_ATTRS,
              'Makeup Remover',
              'মেকআপ রিমুভার',
            ),
          ],
        },
      ],
    },

    // ----------------- 4. Fragrance -----------------
    {
      slug: 'cosmetics-fragrance',
      nameEn: 'Fragrances & Perfumes',
      nameBn: 'সুগন্ধি ও পারফিউম',
      icon: '🌸',
      children: [
        {
          slug: 'cosmetics-perfume',
          nameEn: 'Eau de Parfum & Perfumes',
          nameBn: 'পারফিউম',
          productTypes: [
            pt(
              'cosmetics-perfume',
              [
                'cosmetics-scent-family',
                'cosmetics-volume',
                'cosmetics-gender',
                'cosmetics-country-of-origin',
              ],
              'Perfume',
              'পারফিউম',
            ),
          ],
        },
        {
          slug: 'cosmetics-body-spray',
          nameEn: 'Body Sprays & Mists',
          nameBn: 'বডি স্প্রে ও মিস্ট',
          productTypes: [
            pt(
              'cosmetics-bodyspray',
              [
                'cosmetics-scent-family',
                'cosmetics-volume',
                'cosmetics-gender',
                'cosmetics-country-of-origin',
              ],
              'Body Spray',
              'বডি স্প্রে',
            ),
          ],
        },
        {
          slug: 'cosmetics-deodorant',
          nameEn: 'Deodorants & Roll-ons',
          nameBn: 'ডিওডোরেন্ট ও রোল-অন',
          productTypes: [
            pt(
              'cosmetics-deodorant',
              [
                'cosmetics-scent-family',
                'cosmetics-volume',
                'cosmetics-gender',
                'cosmetics-country-of-origin',
              ],
              'Deodorant',
              'ডিওডোরেন্ট',
            ),
          ],
        },
        {
          slug: 'cosmetics-attar',
          nameEn: 'Attars & Non-Alcoholic Fragrances',
          nameBn: 'আতোর ও নন-অ্যালকোহলিক সুবাস',
          productTypes: [
            pt(
              'cosmetics-attar',
              [
                'cosmetics-scent-family',
                'cosmetics-volume',
                'cosmetics-gender',
                'cosmetics-country-of-origin',
              ],
              'Attar',
              'আতর',
            ),
          ],
        },
      ],
    },

    // ----------------- 5. Bath & Body -----------------
    {
      slug: 'cosmetics-bath-body',
      nameEn: 'Bath & Body Care',
      nameBn: 'গোসল ও শরীর চর্চা',
      icon: '🧼',
      children: [
        {
          slug: 'cosmetics-body-wash',
          nameEn: 'Body Washes & Shower Gels',
          nameBn: 'বডি ওয়াশ ও শাওয়ার জেল',
          productTypes: [
            pt('cosmetics-bodywash', COMMON_SKIN_ATTRS, 'Body Wash', 'বডি ওয়াশ'),
          ],
        },
        {
          slug: 'cosmetics-bath-soap',
          nameEn: 'Bath Soaps & Bars',
          nameBn: 'সাবান',
          productTypes: [pt('cosmetics-soap', COMMON_SKIN_ATTRS, 'Soap', 'সাবান')],
        },
        {
          slug: 'cosmetics-hand-wash',
          nameEn: 'Hand Washes & Sanitizers',
          nameBn: 'হ্যান্ড ওয়াশ ও স্যানিটাইজার',
          productTypes: [
            pt('cosmetics-handwash', COMMON_SKIN_ATTRS, 'Hand Wash', 'হ্যান্ড ওয়াশ'),
          ],
        },
      ],
    },

    // ----------------- 6. Oral Care -----------------
    {
      slug: 'cosmetics-oral-care',
      nameEn: 'Oral Care & Hygiene',
      nameBn: 'দাঁতের যত্ন ও পরিচ্ছন্নতা',
      icon: '🪥',
      children: [
        {
          slug: 'cosmetics-toothpaste',
          nameEn: 'Toothpastes',
          nameBn: 'টুথপেস্ট',
          productTypes: [
            pt(
              'cosmetics-toothpaste',
              ['cosmetics-volume', 'cosmetics-benefit', 'cosmetics-country-of-origin'],
              'Toothpaste',
              'টুথপেস্ট',
            ),
          ],
        },
        {
          slug: 'cosmetics-toothbrush',
          nameEn: 'Toothbrushes',
          nameBn: 'টুথব্রাশ',
          productTypes: [
            pt('cosmetics-toothbrush', ['cosmetics-benefit'], 'Toothbrush', 'টুথব্রাশ'),
          ],
        },
        {
          slug: 'cosmetics-mouthwash',
          nameEn: 'Mouthwashes',
          nameBn: 'মাউথওয়াশ',
          productTypes: [
            pt(
              'cosmetics-mouthwash',
              ['cosmetics-volume', 'cosmetics-benefit'],
              'Mouthwash',
              'মাউথওয়াশ',
            ),
          ],
        },
      ],
    },

    // ----------------- 7. Men's Grooming -----------------
    {
      slug: 'cosmetics-mens-grooming',
      nameEn: "Men's Grooming",
      nameBn: 'পুরুষদের গ্রুমিং',
      icon: '🧔',
      children: [
        {
          slug: 'cosmetics-beard-care',
          nameEn: 'Beard Oils & Balms',
          nameBn: 'বিয়ার্ড অয়েল ও বাম',
          productTypes: [
            pt(
              'cosmetics-beardoil',
              ['cosmetics-volume', 'cosmetics-benefit', 'cosmetics-country-of-origin'],
              'Beard Oil',
              'বিয়ার্ড অয়েল',
            ),
          ],
        },
        {
          slug: 'cosmetics-aftershave',
          nameEn: 'Aftershaves & Shaving Creams',
          nameBn: 'আফটারশেভ ও শেভিং ক্রিম',
          productTypes: [
            pt(
              'cosmetics-aftershave',
              ['cosmetics-volume', 'cosmetics-benefit', 'cosmetics-country-of-origin'],
              'Aftershave',
              'আফটারশেভ',
            ),
          ],
        },
      ],
    },

    // ----------------- 8. Baby Personal Care -----------------
    {
      slug: 'cosmetics-baby-care',
      nameEn: 'Baby Personal Care',
      nameBn: 'শিশুদের প্রসাধন ও যত্ন',
      icon: '👶',
      children: [
        {
          slug: 'cosmetics-baby-lotion',
          nameEn: 'Baby Lotions & Creams',
          nameBn: 'বেবি লোশন ও ক্রিম',
          productTypes: [
            pt(
              'cosmetics-babylotion',
              [
                'cosmetics-volume',
                'cosmetics-benefit',
                'cosmetics-claims',
                'cosmetics-country-of-origin',
              ],
              'Baby Lotion',
              'বেবি লোশন',
            ),
          ],
        },
        {
          slug: 'cosmetics-baby-shampoo',
          nameEn: 'Baby Shampoos & Washes',
          nameBn: 'বেবি শ্যাম্পু ও ওয়াশ',
          productTypes: [
            pt(
              'cosmetics-babyshampoo',
              [
                'cosmetics-volume',
                'cosmetics-benefit',
                'cosmetics-claims',
                'cosmetics-country-of-origin',
              ],
              'Baby Shampoo',
              'বেবি শ্যাম্পু',
            ),
          ],
        },
        {
          slug: 'cosmetics-baby-soap',
          nameEn: 'Baby Soaps & Powders',
          nameBn: 'বেবি সোপ ও পাউডার',
          productTypes: [
            pt(
              'cosmetics-babysoap',
              [
                'cosmetics-volume',
                'cosmetics-benefit',
                'cosmetics-claims',
                'cosmetics-country-of-origin',
              ],
              'Baby Soap',
              'বেবি সোপ',
            ),
          ],
        },
      ],
    },
  ],
};

export const COSMETICS_BRANDS: SeedBrand[] = [
  // Local & Regional
  { name: 'Meril' },
  { name: 'Kool' },
  { name: 'Keya' },
  { name: 'Tibbet' },
  { name: 'Kumarika' },
  { name: 'Sandalina' },
  // International Leading Brands
  { name: 'The Body Shop' },
  { name: 'CeraVe' },
  { name: 'Maybelline' },
  { name: "L'Oréal" },
  { name: 'Nivea' },
  { name: 'COSRX' },
  { name: 'Neutrogena' },
  { name: 'Garnier' },
  { name: 'Vaseline' },
  { name: 'Dove' },
  { name: 'Tresemmé' },
  { name: 'Head & Shoulders' },
  { name: 'Colgate' },
  { name: 'Pepsodent' },
  { name: 'Al Haramain' },
];

export const COSMETICS_PRODUCTS: SeedVertical['products'] = [
  // 1. Skincare: The Body Shop Niacinamide Serum (Variants: 30ml, 50ml)
  {
    categoryPath: 'cosmetics/cosmetics-skin-care/cosmetics-face-serum',
    productTypeSlug: 'cosmetics-serum',
    nameEn: 'Demo The Body Shop Vitamin E Bi-Phase Serum',
    nameBn: 'ডেমো দ্য বডি শপ ভিটামিন ই বাই-ফেজ সিরাম',
    slug: 'demo-cosmetics-niacinamide-serum',
    sku: 'CSM-SRM-TBS-01',
    brand: 'The Body Shop',
    shortDescriptionEn:
      'Ultra-hydrating 48hr moisture serum enriched with natural hyaluronic acid and raspberry seed oil.',
    shortDescriptionBn:
      'প্রাকৃতিক হায়ালুরোনিক অ্যাসিড ও রাস্পবেরি সিড অয়েল সমৃদ্ধ গভীর ময়েশ্চারাইজিং সিরাম।',
    price: 1250,
    stock: 120,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'cosmetics-skin-type': 'All Skin Types',
      'cosmetics-concern': 'Dullness & Uneven Tone',
      'cosmetics-benefit': 'Hydrating',
      'cosmetics-form': 'Serum',
      'cosmetics-claims': 'Vegan',
      'cosmetics-country-of-origin': 'UK',
    },
    variants: [
      vv('30 ml', 'CSM-SRM-TBS-30ML', 1250, 80),
      vv('50 ml', 'CSM-SRM-TBS-50ML', 1850, 40),
    ],
  },

  // 2. Makeup: Maybelline Fit Me Matte Foundation (Variants: 4 Shades, 1 Out of Stock)
  {
    categoryPath: 'cosmetics/cosmetics-makeup/cosmetics-foundation',
    productTypeSlug: 'cosmetics-foundation',
    nameEn: 'Demo Maybelline Fit Me Matte + Poreless Foundation',
    nameBn: 'ডেমো মেবেলিন ফিট মি ম্যাট ফাউন্ডেশন',
    slug: 'demo-cosmetics-matte-foundation',
    sku: 'CSM-FND-MB-01',
    brand: 'Maybelline',
    shortDescriptionEn:
      'Natural seamless matte liquid foundation that refines pores and controls shine all day long.',
    shortDescriptionBn: 'প্রাকৃতিক ম্যাট লুক ও রোমকূপ মসৃণ করার দীর্ঘস্থায়ী লিকুইড ফাউন্ডেশন।',
    price: 950,
    stock: 150,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'cosmetics-finish': 'Matte',
      'cosmetics-coverage': 'Medium',
      'cosmetics-skin-type': 'Oily',
      'cosmetics-claims': 'Dermatologically Tested',
      'cosmetics-country-of-origin': 'USA',
    },
    variants: [
      sv('01 Ivory', 'CSM-FND-01-IVORY', 950, 50, '30 ml'),
      sv('02 Natural Ivory', 'CSM-FND-02-NATURAL', 950, 60, '30 ml'),
      sv('04 Natural Beige', 'CSM-FND-04-BEIGE', 950, 40, '30 ml'),
      sv('07 Warm Honey', 'CSM-FND-07-HONEY', 950, 0, '30 ml'), // Out of stock demo variant
    ],
  },

  // 3. Makeup: L'Oréal Rouge Signature Matte Lipstick (Variants: 4 Swatch Shades)
  {
    categoryPath: 'cosmetics/cosmetics-makeup/cosmetics-lipstick',
    productTypeSlug: 'cosmetics-lipstick',
    nameEn: "Demo L'Oréal Rouge Signature Lightweight Matte Lipstick",
    nameBn: 'ডেমো লরেল রুজ সিগনেচার ম্যাট লিপস্টিক',
    slug: 'demo-cosmetics-matte-lipstick',
    sku: 'CSM-LIP-LOR-01',
    brand: "L'Oréal",
    shortDescriptionEn:
      'Feather-light liquid lipstick with intense pigment and an all-day comfortable bare-lip sensation.',
    shortDescriptionBn: 'গাঢ় পিগমেন্ট ও সারাদিন ঠোঁট নরম রাখার প্রিমিয়াম ম্যাট লিকুইড লিপস্টিক।',
    price: 850,
    stock: 200,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'cosmetics-finish': 'Matte',
      'cosmetics-benefit': 'Long-Lasting',
      'cosmetics-claims': 'Waterproof',
      'cosmetics-country-of-origin': 'France',
    },
    variants: [
      sv('Ruby Red', 'CSM-LIP-RED', 850, 60),
      sv('Pink Rose', 'CSM-LIP-ROSE', 850, 55),
      sv('Nude Coral', 'CSM-LIP-CORAL', 850, 50),
      sv('Berry Plum', 'CSM-LIP-PLUM', 850, 35),
    ],
  },

  // 4. Skincare: COSRX Aloe Soothing Sun Cream SPF 50+
  {
    categoryPath: 'cosmetics/cosmetics-skin-care/cosmetics-sunscreen',
    productTypeSlug: 'cosmetics-sunscreen',
    nameEn: 'Demo COSRX Aloe Soothing Sun Cream SPF 50+ PA++++',
    nameBn: 'ডেমো কসরক্স অ্যালো সুদিং সানস্ক্রিন এসপিএফ ৫০+',
    slug: 'demo-cosmetics-sunscreen-spf50',
    sku: 'CSM-SUN-CSX-01',
    brand: 'COSRX',
    shortDescriptionEn:
      'Daily soothing UV shield formulated with aloe leaf extract to protect against UVA & UVB rays without white cast.',
    shortDescriptionBn:
      'হোয়াইট কাস্ট ছাড়া অ্যালোভেরা নির্যাস সমৃদ্ধ উন্নত ইউভি প্রটেকশন সানস্ক্রিন।',
    price: 1400,
    stock: 120,
    unit: 'tube',
    isFeatured: true,
    specs: {
      'cosmetics-spf': 'SPF 50+ PA++++',
      'cosmetics-skin-type': 'Sensitive',
      'cosmetics-benefit': 'Sun Protection',
      'cosmetics-form': 'Cream',
      'cosmetics-volume': '50 ml',
      'cosmetics-claims': 'Dermatologically Tested',
      'cosmetics-country-of-origin': 'Korea',
    },
    variants: [vv('50 ml', 'CSM-SUN-CSX-50ML', 1400, 120)],
  },

  // 5. Skincare: CeraVe Hydrating Cleanser (Variants: 100ml, 236ml)
  {
    categoryPath: 'cosmetics/cosmetics-skin-care/cosmetics-face-wash-cleanser',
    productTypeSlug: 'cosmetics-facewash',
    nameEn: 'Demo CeraVe Hydrating Facial Cleanser with Ceramides',
    nameBn: 'ডেমো সেরাভি হাইড্রেটিং ফেসিয়াল ক্লিনজার',
    slug: 'demo-cosmetics-gentle-facewash',
    sku: 'CSM-CLN-CRV-01',
    brand: 'CeraVe',
    shortDescriptionEn:
      'Gentle lotion-like face wash with 3 essential ceramides and hyaluronic acid to restore skin barrier.',
    shortDescriptionBn: 'ত্বকের প্রাকৃতিক আর্দ্রতা রক্ষা করে এমন জেন্টল ফেসিয়াল ক্লিনজার।',
    price: 850,
    stock: 140,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'cosmetics-skin-type': 'Dry',
      'cosmetics-benefit': 'Hydrating',
      'cosmetics-form': 'Lotion',
      'cosmetics-claims': 'Paraben-Free',
      'cosmetics-country-of-origin': 'USA',
    },
    variants: [
      vv('100 ml', 'CSM-CLN-CRV-100ML', 850, 80),
      vv('236 ml', 'CSM-CLN-CRV-236ML', 1650, 60),
    ],
  },

  // 6. Haircare: Tresemmé Keratin Smooth Shampoo (Variants: 200ml, 400ml)
  {
    categoryPath: 'cosmetics/cosmetics-hair-care/cosmetics-shampoo',
    productTypeSlug: 'cosmetics-shampoo',
    nameEn: 'Demo Tresemmé Keratin Smooth Anti-Frizz Shampoo',
    nameBn: 'ডেমো ট্রেসেমে কেরাটিন স্মুথ শ্যাম্পু',
    slug: 'demo-cosmetics-keratin-shampoo',
    sku: 'CSM-SHM-TRS-01',
    brand: 'Tresemmé',
    shortDescriptionEn:
      'Formulated with Keratin and Argan oil for up to 72 hours of frizz control and silky salon-smooth hair.',
    shortDescriptionBn: 'কেরাটিন ও আরগান অয়েল সমৃদ্ধ সিল্কি স্মুথ শ্যাম্পু যা চুলকে করে রেশমি কোমল।',
    price: 550,
    stock: 180,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'cosmetics-hair-type': 'Damaged Hair',
      'cosmetics-benefit': 'Repairs Damage',
      'cosmetics-concern': 'Frizz Control',
      'cosmetics-form': 'Liquid',
      'cosmetics-country-of-origin': 'USA',
    },
    variants: [
      vv('200 ml', 'CSM-SHM-TRS-200ML', 550, 100),
      vv('400 ml', 'CSM-SHM-TRS-400ML', 950, 80),
    ],
  },

  // 7. Fragrance: Al Haramain Amber Oud Eau de Parfum
  {
    categoryPath: 'cosmetics/cosmetics-fragrance/cosmetics-perfume',
    productTypeSlug: 'cosmetics-perfume',
    nameEn: 'Demo Al Haramain Amber Oud Gold Edition Eau de Parfum',
    nameBn: 'ডেমো আল হারামাইন আম্বার উদ গোল্ড এডিশন পারফিউম',
    slug: 'demo-cosmetics-perfume-oud',
    sku: 'CSM-PRF-ALH-01',
    brand: 'Al Haramain',
    shortDescriptionEn:
      'Exquisite oriental fragrance opening with bergamot and green notes, drying down to sweet melon, pineapple and rich amber.',
    shortDescriptionBn: 'আম্বার, মিষ্টি মেলন ও পাইনঅ্যাপলের রাজকীয় সুবাসের দীর্ঘস্থায়ী লাক্সারি পারফিউম।',
    price: 2400,
    stock: 90,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'cosmetics-scent-family': 'Oud',
      'cosmetics-gender': 'Unisex',
      'cosmetics-claims': 'Long-Lasting',
      'cosmetics-country-of-origin': 'UAE',
    },
    variants: [
      vv('50 ml', 'CSM-PRF-ALH-50ML', 2400, 50),
      vv('100 ml', 'CSM-PRF-ALH-100ML', 3900, 40),
    ],
  },

  // 8. Bodycare: Vaseline Intensive Care Deep Restore Body Lotion
  {
    categoryPath: 'cosmetics/cosmetics-bath-body/cosmetics-body-lotion',
    productTypeSlug: 'cosmetics-bodylotion',
    nameEn: 'Demo Vaseline Intensive Care Deep Restore Body Lotion',
    nameBn: 'ডেমো ভ্যাসলিন ডিপ রিস্টোর বডি লোশন',
    slug: 'demo-cosmetics-deep-body-lotion',
    sku: 'CSM-LTN-VAS-01',
    brand: 'Vaseline',
    shortDescriptionEn:
      'Infused with micro-droplets of Vaseline jelly and pure oat extract for fast-absorbing non-greasy 48hr skin recovery.',
    shortDescriptionBn:
      'খাঁটি ওট এক্সট্র্যাক্ট সমৃদ্ধ নন-স্টিকি বডি লোশন যা ত্বককে সারাদিন রাখে নরম ও সতেজ।',
    price: 380,
    stock: 220,
    unit: 'bottle',
    isFeatured: true,
    specs: {
      'cosmetics-skin-type': 'Dry',
      'cosmetics-benefit': 'Moisturizing',
      'cosmetics-form': 'Lotion',
      'cosmetics-country-of-origin': 'Bangladesh',
    },
    variants: [
      vv('200 ml', 'CSM-LTN-VAS-200ML', 380, 120),
      vv('400 ml', 'CSM-LTN-VAS-400ML', 650, 100),
    ],
  },

  // 9. Men's Grooming: Kool Organic Beard Oil
  {
    categoryPath: 'cosmetics/cosmetics-mens-grooming/cosmetics-beard-care',
    productTypeSlug: 'cosmetics-beardoil',
    nameEn: 'Demo Kool Herbal & Vitamin E Beard Nourishing Oil',
    nameBn: 'ডেমো কুল ভিটামিন ই সমৃদ্ধ বিয়ার্ড অয়েল',
    slug: 'demo-cosmetics-organic-beard-oil',
    sku: 'CSM-BRD-KOL-01',
    brand: 'Kool',
    shortDescriptionEn:
      'Non-greasy blend of almond, argan and castor oils to condition coarse beard hair and soothe skin underneath.',
    shortDescriptionBn:
      'আমন্ড ও আরগান অয়েল সমৃদ্ধ দাড়ি নরম, সিল্কি ও সুস্থ রাখার হারবাল বিয়ার্ড অয়েল।',
    price: 420,
    stock: 80,
    unit: 'bottle',
    specs: {
      'cosmetics-gender': 'Men',
      'cosmetics-benefit': 'Nourishing',
      'cosmetics-volume': '30 ml',
      'cosmetics-form': 'Oil',
      'cosmetics-country-of-origin': 'Bangladesh',
    },
    variants: [vv('30 ml', 'CSM-BRD-KOL-30ML', 420, 80)],
  },

  // 10. Baby Care: Meril Baby Mild Moisture Lotion
  {
    categoryPath: 'cosmetics/cosmetics-baby-care/cosmetics-baby-lotion',
    productTypeSlug: 'cosmetics-babylotion',
    nameEn: 'Demo Meril Baby Mild Moisture Daily Body Lotion',
    nameBn: 'ডেমো মেরিল বেবি মাইল্ড ময়েশ্চারাইজিং লোশন',
    slug: 'demo-cosmetics-baby-mild-lotion',
    sku: 'CSM-BBY-MRL-01',
    brand: 'Meril',
    shortDescriptionEn:
      'Ultra-mild, hypoallergenic lotion formulated specifically for delicate infant skin with pure chamomile.',
    shortDescriptionBn: 'ক্যামোমাইল সমৃদ্ধ হাইপোঅ্যালার্জেনিক শিশুদের কোমল ত্বকের নিরাপদ বডি লোশন।',
    price: 280,
    stock: 150,
    unit: 'bottle',
    specs: {
      'cosmetics-gender': 'Baby',
      'cosmetics-benefit': 'Soothing',
      'cosmetics-claims': 'Dermatologically Tested',
      'cosmetics-country-of-origin': 'Bangladesh',
    },
    variants: [
      vv('100 ml', 'CSM-BBY-MRL-100ML', 280, 90),
      vv('200 ml', 'CSM-BBY-MRL-200ML', 480, 60),
    ],
  },
];

export const COSMETICS_VERTICAL: SeedVertical = {
  key: 'cosmetics',
  root: COSMETICS_TAXONOMY,
  attributes: COSMETICS_ATTRIBUTES,
  brands: COSMETICS_BRANDS,
  products: COSMETICS_PRODUCTS,
};
