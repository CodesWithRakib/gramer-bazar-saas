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

/** Book Format variant helper (Paperback, Hardcover) */
const bv = (
  format: string,
  sku: string,
  price: number,
  stock: number,
  isbn?: string,
): SeedVerticalVariant => ({
  nameEn: format,
  nameBn: format === 'Hardcover' ? 'হার্ডকভার' : 'পেপারব্যাক',
  sku,
  price,
  stock,
  attributes: {
    'book-format': format,
    ...(isbn ? { 'book-isbn': isbn } : {}),
  },
});

/** Stationery Paper Size & GSM variant helper */
const nv = (
  paperSize: string,
  sku: string,
  price: number,
  stock: number,
  extraAttr?: Record<string, string>,
): SeedVerticalVariant => ({
  nameEn: paperSize,
  nameBn: paperSize,
  sku,
  price,
  stock,
  attributes: {
    'book-paper-size': paperSize,
    ...(extraAttr ?? {}),
  },
});

/** Pen or Writing Instrument Variant helper (Ink Color & Pack Size) */
const iv = (
  inkColor: string,
  packSize: string,
  sku: string,
  price: number,
  stock: number,
): SeedVerticalVariant => ({
  nameEn: `${inkColor} (${packSize})`,
  nameBn: `${inkColor} (${packSize})`,
  sku,
  price,
  stock,
  attributes: {
    'book-ink-color': inkColor,
    'book-pack-size': packSize,
  },
});

/** Pack Quantity variant helper */
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
    'book-pack-size': packSize,
  },
});

/**
 * Universal Books & Stationery attributes.
 *
 * Author, Publisher, ISBN, Format, Language, Edition, Pages, Genre, Paper Size,
 * GSM, Paper Type, Ink Color, and Pack Size are structured attributes — never categories.
 */
export const BOOKS_ATTRIBUTES: SeedAttribute[] = [
  {
    slug: 'book-author',
    nameEn: 'Author / Writer',
    nameBn: 'লেখক / রচয়িতা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Humayun Ahmed',
      'Tamim Shahriar Subeen',
      'James Clear',
      'Muhammad Zafar Iqbal',
      'Imam Ghazali',
      'George Series Editorial',
      'Kazi Nazrul Islam',
      'Rabindranath Tagore',
      'Various Authors',
    ),
  },
  {
    slug: 'book-publisher',
    nameEn: 'Publisher / Publication House',
    nameBn: 'প্রকাশনী',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Prothoma Prokashon',
      'Batighar',
      'Tamralipi',
      'Anupam Prokashani',
      'Dimik Prokashoni',
      'George Series Publications',
      'Rahmaniya Publications',
      'Guardian Publications',
      'O’Reilly Media',
      'Penguin Random House',
    ),
  },
  {
    slug: 'book-isbn',
    nameEn: 'ISBN (International Standard Book Number)',
    nameBn: 'আইএসবিএন (ISBN)',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '9789849025801',
      '9789849133506',
      '9789849472612',
      '9789849312154',
      '9789848901234',
      '9781491957660',
      'Not Applicable',
    ),
  },
  {
    slug: 'book-language',
    nameEn: 'Language',
    nameBn: 'ভাষা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Bangla',
      'English',
      'Arabic',
      'Bilingual (Bangla + English)',
    ),
  },
  {
    slug: 'book-format',
    nameEn: 'Book Format / Binding',
    nameBn: 'বইয়ের বাঁধাই ও ফরম্যাট',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      'Paperback',
      'Hardcover',
      'Board Book',
      'Spiral Bound',
    ),
  },
  {
    slug: 'book-edition',
    nameEn: 'Edition / Year',
    nameBn: 'সংস্করণ / প্রকাশ সাল',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '1st Edition',
      '2nd Edition',
      '3rd Edition',
      'Revised Edition (2026)',
      'Student Edition',
      'Collector’s Edition',
    ),
  },
  {
    slug: 'book-pages',
    nameEn: 'Page Count',
    nameBn: 'পৃষ্ঠা সংখ্যা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      '64 Pages',
      '128 Pages',
      '160 Pages',
      '192 Pages',
      '256 Pages',
      '320 Pages',
      '384 Pages',
      '450 Pages',
      '512 Pages',
    ),
  },
  {
    slug: 'book-genre',
    nameEn: 'Genre / Topic',
    nameBn: 'বইয়ের ধরন বা জনরা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Fiction & Novel',
      'Non-Fiction',
      'Computer & Programming',
      'Self-Development & Habits',
      'Academic & Exam Guides',
      'Islamic Literature',
      'Science & Mathematics',
      'Children & Comics',
      'Poetry & Drama',
    ),
  },
  {
    slug: 'book-paper-size',
    nameEn: 'Paper / Page Size',
    nameBn: 'কাগজ বা পাতার সাইজ',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      'A4',
      'A5',
      'B5',
      'Legal',
      'Letter',
      'Standard Book Size',
    ),
  },
  {
    slug: 'book-paper-gsm',
    nameEn: 'Paper Weight (GSM)',
    nameBn: 'কাগজের ঘনত্ব (জিএসএম)',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      '65 GSM',
      '70 GSM',
      '80 GSM',
      '100 GSM',
      '120 GSM',
      '200 GSM',
      '300 GSM',
    ),
  },
  {
    slug: 'book-paper-type',
    nameEn: 'Paper Type / Ruling',
    nameBn: 'কাগজের ধরন ও রুলিং',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    options: opt(
      'Ruled / Lined',
      'Plain / Unruled',
      'Grid / Graph',
      'Dot Grid',
      'Offset Premium Paper',
      'Art Board / Canvas',
    ),
  },
  {
    slug: 'book-pack-size',
    nameEn: 'Pack Quantity',
    nameBn: 'প্যাক বা সেটের সংখ্যা',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      '1 Piece',
      'Pack of 3',
      'Pack of 5',
      'Pack of 10',
      'Box of 12',
      'Pack of 24',
      'Ream of 500 Sheets',
      'Box of 5 Reams',
    ),
  },
  {
    slug: 'book-ink-color',
    nameEn: 'Ink Color',
    nameBn: 'কালির রং',
    dataType: AttributeDataType.SELECT,
    isFilterable: true,
    isVariantAxis: true,
    options: opt(
      'Blue Ink',
      'Black Ink',
      'Red Ink',
      'Green Ink',
      'Assorted / Multicolor',
    ),
  },
];

// Product Types definitions
const BOOK_PT = pt(
  'book',
  ['book-author', 'book-publisher', 'book-isbn', 'book-language', 'book-format', 'book-edition', 'book-pages', 'book-genre'],
  'Printed Book',
  'মুদ্রিত বই',
);
const PROGRAMMING_BOOK_PT = pt(
  'programming-book',
  ['book-author', 'book-publisher', 'book-isbn', 'book-language', 'book-format', 'book-edition', 'book-pages', 'book-genre'],
  'Programming & Tech Book',
  'প্রোগ্রামিং ও প্রযুক্তি বই',
);
const ACADEMIC_TEXTBOOK_PT = pt(
  'academic-textbook',
  ['book-author', 'book-publisher', 'book-isbn', 'book-language', 'book-format', 'book-edition', 'book-pages', 'book-genre'],
  'Academic Textbook',
  'পাঠ্যবই ও গাইড',
);
const NOTEBOOK_PT = pt(
  'notebook',
  ['book-paper-size', 'book-paper-gsm', 'book-paper-type', 'book-pages', 'book-pack-size'],
  'Notebook & Khata',
  'খাতা ও নোটবুক',
);
const PEN_SET_PT = pt(
  'pen-set',
  ['book-ink-color', 'book-pack-size'],
  'Ball & Gel Pen Set',
  'কলম ও মার্কার সেট',
);
const PENCIL_SET_PT = pt(
  'pencil-set',
  ['book-pack-size'],
  'Pencil & Sketching Set',
  'পেন্সিল সেট',
);
const PRINTER_PAPER_PT = pt(
  'printer-paper',
  ['book-paper-size', 'book-paper-gsm', 'book-pack-size'],
  'Copier & Printer Paper',
  'প্রিন্টার পেপার',
);
const GEOMETRY_BOX_PT = pt(
  'geometry-box',
  ['book-pack-size'],
  'Mathematical Geometry Box',
  'জ্যামিতি বক্স',
);
const ART_PAINT_SET_PT = pt(
  'art-paint-set',
  ['book-pack-size'],
  'Art & Paint Supplies',
  'আর্ট ও কালার সামগ্রী',
);
const FILE_FOLDER_PT = pt(
  'file-folder',
  ['book-paper-size', 'book-pack-size'],
  'Office File & Folder',
  'ফাইল ও ফোল্ডার',
);

/**
 * 5 Primary Categories representing the Books & Stationery taxonomy.
 */
export const BOOKS_TAXONOMY: SeedTaxonomyNode = {
  slug: 'books-stationery',
  nameEn: 'Books & Stationery',
  nameBn: 'বই ও স্টেশনারি',
  icon: '📚',
  descriptionEn:
    'Vast collection of academic textbooks, literature novels, programming books, premium stationery, paper, and writing instruments.',
  descriptionBn:
    'সেরা লেখকের উপন্যাস, পাঠ্যবই, প্রোগ্রামিং বই, উন্নত মানের খাতা, কলম ও প্রয়োজনীয় স্টেশনারি সামগ্রী।',
  children: [
    // 1. Academic & Educational Books
    {
      slug: 'books-academic',
      nameEn: 'Academic & Educational Books',
      nameBn: 'পাঠ্যবই ও শিক্ষামূলক বই',
      icon: '🎓',
      children: [
        {
          slug: 'books-school-college',
          nameEn: 'School & College Textbooks',
          nameBn: 'স্কুল ও কলেজ পাঠ্যবই',
          productTypes: [ACADEMIC_TEXTBOOK_PT],
        },
        {
          slug: 'books-university-admission',
          nameEn: 'University & Admission Tests',
          nameBn: 'বিশ্ববিদ্যালয় ও ভর্তি পরীক্ষা',
          productTypes: [ACADEMIC_TEXTBOOK_PT],
        },
        {
          slug: 'books-competitive-exams',
          nameEn: 'BCS & Competitive Exam Guides',
          nameBn: 'বিসিএস ও চাকরির পরীক্ষার বই',
          productTypes: [ACADEMIC_TEXTBOOK_PT],
        },
      ],
    },

    // 2. Literature & Fiction
    {
      slug: 'books-literature-fiction',
      nameEn: 'Literature & Fiction',
      nameBn: 'সাহিত্য ও উপন্যাস',
      icon: '📖',
      children: [
        {
          slug: 'books-bangla-novels',
          nameEn: 'Bangla Literature & Novels',
          nameBn: 'বাংলা উপন্যাস ও কথাসাহিত্য',
          productTypes: [BOOK_PT],
        },
        {
          slug: 'books-english-literature',
          nameEn: 'English Literature & Classics',
          nameBn: 'ইংরেজি সাহিত্য ও ক্লাসিক',
          productTypes: [BOOK_PT],
        },
        {
          slug: 'books-thriller-mystery',
          nameEn: 'Mystery, Thriller & Sci-Fi',
          nameBn: 'থ্রিলার ও রহস্য উপন্যাস',
          productTypes: [BOOK_PT],
        },
      ],
    },

    // 3. Non-Fiction & Self-Development
    {
      slug: 'books-non-fiction-self-help',
      nameEn: 'Non-Fiction & Self-Development',
      nameBn: 'নন-ফিকশন ও আত্মউন্নয়ন',
      icon: '💡',
      children: [
        {
          slug: 'books-programming-tech',
          nameEn: 'Computer & Programming Books',
          nameBn: 'কম্পিউটার ও প্রোগ্রামিং বই',
          productTypes: [PROGRAMMING_BOOK_PT],
        },
        {
          slug: 'books-business-career',
          nameEn: 'Business, Leadership & Finance',
          nameBn: 'ব্যবসা, অর্থনীতি ও ক্যারিয়ার',
          productTypes: [BOOK_PT],
        },
        {
          slug: 'books-biography-history',
          nameEn: 'Biography & History',
          nameBn: 'জীবনী ও ইতিহাস',
          productTypes: [BOOK_PT],
        },
        {
          slug: 'books-islamic-religious',
          nameEn: 'Islamic & Religious Books',
          nameBn: 'ইসলামিক ও ধর্মীয় বই',
          productTypes: [BOOK_PT],
        },
      ],
    },

    // 4. Stationery & Paper Supplies
    {
      slug: 'books-stationery-paper',
      nameEn: 'Stationery & Paper Supplies',
      nameBn: 'স্টেশনারি ও খাতা-কাগজ',
      icon: '📝',
      children: [
        {
          slug: 'books-notebooks-diaries',
          nameEn: 'Notebooks, Khata & Journals',
          nameBn: 'নোটবুক, খাতা ও ডায়েরি',
          productTypes: [NOTEBOOK_PT],
        },
        {
          slug: 'books-printer-craft-paper',
          nameEn: 'Printer & Craft Paper',
          nameBn: 'প্রিন্টার ও আর্ট পেপার',
          productTypes: [PRINTER_PAPER_PT],
        },
        {
          slug: 'books-files-folders',
          nameEn: 'Files, Folders & Binders',
          nameBn: 'ফাইল ও ফোল্ডার',
          productTypes: [FILE_FOLDER_PT],
        },
      ],
    },

    // 5. Writing Instruments & Art Supplies
    {
      slug: 'books-writing-art-supplies',
      nameEn: 'Writing Instruments & Art Supplies',
      nameBn: 'কলম ও আর্ট সামগ্রী',
      icon: '🎨',
      children: [
        {
          slug: 'books-pens-markers',
          nameEn: 'Pens, Markers & Highlighters',
          nameBn: 'বলপেন, জেলপেন ও মার্কার',
          productTypes: [PEN_SET_PT],
        },
        {
          slug: 'books-pencils-geometry',
          nameEn: 'Pencils & Geometry Boxes',
          nameBn: 'পেন্সিল ও জ্যামিতি বক্স',
          productTypes: [PENCIL_SET_PT, GEOMETRY_BOX_PT],
        },
        {
          slug: 'books-art-craft-paint',
          nameEn: 'Colors, Brushes & Sketchbooks',
          nameBn: 'রং, তুলি ও স্কেচবুক',
          productTypes: [ART_PAINT_SET_PT],
        },
      ],
    },
  ],
};

/**
 * Authentic regional and global publishers and stationery brands.
 */
export const BOOKS_BRANDS: SeedBrand[] = [
  { name: 'Prothoma Prokashon', manufacturer: 'Prothoma Prokashon Ltd.' },
  { name: 'Dimik Prokashoni', manufacturer: 'Dimik Computing Ltd.' },
  { name: 'Batighar', manufacturer: 'Batighar Prokashani' },
  { name: 'George Series', manufacturer: 'George Series Publications' },
  { name: 'Rahmaniya', manufacturer: 'Rahmaniya Publications' },
  { name: 'Faber-Castell', manufacturer: 'Faber-Castell AG' },
  { name: 'Matador', manufacturer: 'Matador Ballpen Industries Ltd.' },
  { name: 'Bashundhara Paper', manufacturer: 'Bashundhara Paper Mills Ltd.' },
  { name: 'Deli', manufacturer: 'Deli Group Co., Ltd.' },
  { name: 'Pilot', manufacturer: 'Pilot Corporation' },
  { name: 'Parker', manufacturer: 'Newell Brands' },
  { name: 'Kangaro', manufacturer: 'Kangaro Industries Ltd.' },
  { name: 'Staedtler', manufacturer: 'Staedtler Mars GmbH & Co. KG' },
];

/**
 * Verified publishers and stationery manufacturers.
 */
export const BOOKS_MANUFACTURERS: SeedManufacturer[] = [
  {
    name: 'Prothoma Prokashon Ltd.',
    nameBn: 'প্রথমা প্রকাশন লিমিটেড',
    country: 'Bangladesh',
    website: 'https://prothoma.com',
  },
  {
    name: 'Dimik Computing Ltd.',
    nameBn: 'দ্বিমিক কম্পিউটিং লিমিটেড',
    country: 'Bangladesh',
    website: 'https://dimik.pub',
  },
  {
    name: 'Batighar Prokashani',
    nameBn: 'বাতিঘর প্রকাশনী',
    country: 'Bangladesh',
    website: 'https://batighar.com',
  },
  {
    name: 'George Series Publications',
    nameBn: 'জর্জ সিরিজ পাবলিকেশন্স',
    country: 'Bangladesh',
    website: 'https://georgeseries.com',
  },
  {
    name: 'Rahmaniya Publications',
    nameBn: 'রহমানিয়া প্রকাশনী',
    country: 'Bangladesh',
  },
  {
    name: 'Faber-Castell AG',
    nameBn: 'ফেবার-ক্যাস্টেল এজি',
    country: 'Germany',
    website: 'https://www.faber-castell.com',
  },
  {
    name: 'Matador Ballpen Industries Ltd.',
    nameBn: 'ম্যাটাডোর বলপেন ইন্ডাস্ট্রিজ লি.',
    country: 'Bangladesh',
    website: 'https://matadorgroup.com',
  },
  {
    name: 'Bashundhara Paper Mills Ltd.',
    nameBn: 'বসুন্ধরা পেপার মিলস লি.',
    country: 'Bangladesh',
    website: 'https://www.bashundharapaper.com',
  },
  {
    name: 'Deli Group Co., Ltd.',
    nameBn: 'ডেলি গ্রুপ কোং লিমিটেড',
    country: 'China',
    website: 'https://www.deliglobal.com',
  },
];

/**
 * 10 Rich, production-grade demo products spanning novels, programming,
 * self-help, competitive exam guides, religious literature, notebooks,
 * pens, copier paper, colored pencils, and geometry boxes.
 */
export const BOOKS_PRODUCTS: SeedVerticalProduct[] = [
  // 1. Bangla Classic Novel: 'দেয়াল' (Deyal) by Humayun Ahmed
  {
    categoryPath: 'books-stationery/books-literature-fiction/books-bangla-novels',
    productTypeSlug: 'book',
    nameEn: 'Demo Deyal (দেয়াল) by Humayun Ahmed',
    nameBn: 'ডেমো দেয়াল — হুমায়ূন আহমেদ',
    slug: 'demo-book-deyal-humayun-ahmed',
    sku: 'BK-NV-HUM-01',
    brand: 'Prothoma Prokashon',
    manufacturer: 'Prothoma Prokashon Ltd.',
    shortDescriptionEn:
      'Historic political masterpiece by renowned author Humayun Ahmed depicting post-1975 national turbulence with deep human drama.',
    shortDescriptionBn:
      'স্বাধীনতোত্তর বাংলাদেশের পটভূমিতে হুমায়ূন আহমেদের রচিত পাঠকনন্দিত কালজয়ী ঐতিহাসিক রাজনৈতিক উপন্যাস।',
    price: 450,
    compareAtPrice: 500,
    stock: 85,
    unit: 'book',
    isFeatured: true,
    specs: {
      'book-author': 'Humayun Ahmed',
      'book-publisher': 'Prothoma Prokashon',
      'book-isbn': '9789849025801',
      'book-language': 'Bangla',
      'book-format': 'Hardcover',
      'book-edition': '1st Edition',
      'book-pages': '256 Pages',
      'book-genre': 'Fiction & Novel',
    },
    variants: [
      bv('Hardcover', 'BK-NV-HUM-HC', 450, 50, '9789849025801'),
      bv('Paperback', 'BK-NV-HUM-PB', 380, 35, '9789849025802'),
    ],
  },

  // 2. Programming Book: 'Computer Programming (1st Part)' by Tamim Shahriar Subeen
  {
    categoryPath: 'books-stationery/books-non-fiction-self-help/books-programming-tech',
    productTypeSlug: 'programming-book',
    nameEn: 'Demo Computer Programming (1st Part: C Language) by Tamim Shahriar Subeen',
    nameBn: 'ডেমো কম্পিউটার প্রোগ্রামিং (১ম খণ্ড: সি ভাষা) — তামিম শাহরিয়ার সুবিন',
    slug: 'demo-book-computer-programming-subeen',
    sku: 'BK-PR-SUB-01',
    brand: 'Dimik Prokashoni',
    manufacturer: 'Dimik Computing Ltd.',
    shortDescriptionEn:
      'Best-selling foundational programming guide in Bengali covering fundamental C syntax, algorithms, loops, and logic development for beginners.',
    shortDescriptionBn:
      'প্রোগ্রামিংয়ের হাতেখড়ি ও সি ভাষায় সহজভাবে সমস্যা সমাধানের জন্য বাংলাদেশে সর্বাধিক পঠিত দিকনির্দেশনামূলক বই।',
    price: 240,
    compareAtPrice: 280,
    stock: 120,
    unit: 'book',
    isFeatured: true,
    specs: {
      'book-author': 'Tamim Shahriar Subeen',
      'book-publisher': 'Dimik Prokashoni',
      'book-isbn': '9789849133506',
      'book-language': 'Bangla',
      'book-format': 'Paperback',
      'book-edition': 'Revised Edition (2026)',
      'book-pages': '160 Pages',
      'book-genre': 'Computer & Programming',
    },
    variants: [
      bv('Paperback', 'BK-PR-SUB-PB', 240, 120, '9789849133506'),
    ],
  },

  // 3. Self-Development Book: 'Atomic Habits' (Bangla Translation) by James Clear
  {
    categoryPath: 'books-stationery/books-non-fiction-self-help/books-business-career',
    productTypeSlug: 'book',
    nameEn: 'Demo Atomic Habits (Bangla Translation) by James Clear',
    nameBn: 'ডেমো অ্যাটমিক হ্যাবিটস (বাংলা অনুবাদ) — জেমস ক্লিয়ার',
    slug: 'demo-book-atomic-habits-bangla',
    sku: 'BK-SH-JMC-01',
    brand: 'Batighar',
    manufacturer: 'Batighar Prokashani',
    shortDescriptionEn:
      'Internationally acclaimed framework on building good daily habits, breaking bad routines, and mastering tiny behavioral changes for remarkable results.',
    shortDescriptionBn:
      'দৈনন্দিন ছোট ছোট অভ্যাসের বৈপ্লবিক পরিবর্তনের মাধ্যমে সাফল্য ও উৎপাদনশীলতা অর্জনের আন্তর্জাতিক সেরা বই।',
    price: 380,
    compareAtPrice: 450,
    stock: 90,
    unit: 'book',
    isFeatured: true,
    specs: {
      'book-author': 'James Clear',
      'book-publisher': 'Batighar',
      'book-isbn': '9789849472612',
      'book-language': 'Bangla',
      'book-format': 'Paperback',
      'book-edition': '1st Edition',
      'book-pages': '320 Pages',
      'book-genre': 'Self-Development & Habits',
    },
    variants: [
      bv('Paperback', 'BK-SH-JMC-PB', 380, 60, '9789849472612'),
      bv('Hardcover', 'BK-SH-JMC-HC', 480, 30, '9789849472613'),
    ],
  },

  // 4. Academic / Competitive Exam: 'MP3 Daily BCS Bangladesh Affairs'
  {
    categoryPath: 'books-stationery/books-academic/books-competitive-exams',
    productTypeSlug: 'academic-textbook',
    nameEn: 'Demo MP3 Daily BCS Bangladesh Affairs Comprehensive Guide (2026 Edition)',
    nameBn: 'ডেমো এমপিথ্রি ডেইলি বিসিএস বাংলাদেশ বিষয়াবলি (২০২৬ সংস্করণ)',
    slug: 'demo-book-mp3-bcs-bangladesh-affairs',
    sku: 'BK-EX-MP3-01',
    brand: 'George Series',
    manufacturer: 'George Series Publications',
    shortDescriptionEn:
      'Exhaustive, syllabus-oriented preparation manual covering constitution, geography, historical movements, and economics for BCS and bank job aspirants.',
    shortDescriptionBn:
      'বিসিএস প্রিলিমিনারি ও অন্যান্য সরকারি চাকরির পরীক্ষার জন্য রচিত পূর্ণাঙ্গ বাংলাদেশ বিষয়াবলি সহায়িকা।',
    price: 520,
    compareAtPrice: 580,
    stock: 75,
    unit: 'book',
    specs: {
      'book-author': 'George Series Editorial',
      'book-publisher': 'George Series Publications',
      'book-isbn': '9789849312154',
      'book-language': 'Bangla',
      'book-format': 'Paperback',
      'book-edition': 'Revised Edition (2026)',
      'book-pages': '512 Pages',
      'book-genre': 'Academic & Exam Guides',
    },
    variants: [
      bv('Paperback', 'BK-EX-MP3-PB', 520, 75, '9789849312154'),
    ],
  },

  // 5. Islamic Literature: 'পরশমণি' (Parashmoni) by Imam Ghazali
  {
    categoryPath: 'books-stationery/books-non-fiction-self-help/books-islamic-religious',
    productTypeSlug: 'book',
    nameEn: 'Demo Parashmoni (পরশমণি) by Imam Abu Hamid Al-Ghazali (R)',
    nameBn: 'ডেমো পরশমণি — ইমাম আবু হামিদ আল-গাজ্জালী (রহ.)',
    slug: 'demo-book-parashmoni-imam-ghazali',
    sku: 'BK-IS-GHZ-01',
    brand: 'Rahmaniya',
    manufacturer: 'Rahmaniya Publications',
    shortDescriptionEn:
      'Classic spiritual treatise (Kimiya-yi Sa\'adat) exploring self-knowledge, devotion, purification of heart, and moral ethics in pristine Bengali translation.',
    shortDescriptionBn:
      'আত্মশুদ্ধি, নীতিশিক্ষা ও আল্লাহর নৈকট্য অর্জনের কালজয়ী আধ্যাত্মিক গ্রন্থ কিমিয়ায়ে সায়াদাত-এর অনবদ্য অনুবাদ।',
    price: 360,
    compareAtPrice: 420,
    stock: 60,
    unit: 'book',
    specs: {
      'book-author': 'Imam Ghazali',
      'book-publisher': 'Rahmaniya Publications',
      'book-isbn': '9789848901234',
      'book-language': 'Bangla',
      'book-format': 'Hardcover',
      'book-edition': '1st Edition',
      'book-pages': '384 Pages',
      'book-genre': 'Islamic Literature',
    },
    variants: [
      bv('Hardcover', 'BK-IS-GHZ-HC', 360, 60, '9789848901234'),
    ],
  },

  // 6. Notebook / Khata: Bashundhara Premium Spiral Ruled Notebook
  {
    categoryPath: 'books-stationery/books-stationery-paper/books-notebooks-diaries',
    productTypeSlug: 'notebook',
    nameEn: 'Demo Bashundhara Premium Wire-O Spiral Ruled Exercise Notebook',
    nameBn: 'ডেমো বসুন্ধরা প্রিমিয়াম স্পাইরাল রুল্ড খাতা ও নোটবুক',
    slug: 'demo-st-bashundhara-spiral-notebook',
    sku: 'ST-NB-BSH-01',
    brand: 'Bashundhara Paper',
    manufacturer: 'Bashundhara Paper Mills Ltd.',
    shortDescriptionEn:
      'Micro-perforated bleed-resistant 80 GSM offset pages with durable water-resistant poly cover and twin-ring wire binding for students and professionals.',
    shortDescriptionBn:
      'মসৃণ ৮০ জিএসএম অফসেট পেপার ও মজবুত স্পাইরাল বাইন্ডিংযুক্ত টেকসই প্র্যাকটিক্যাল নোটবুক।',
    price: 180,
    compareAtPrice: 210,
    stock: 150,
    unit: 'piece',
    isFeatured: true,
    specs: {
      'book-paper-size': 'A4',
      'book-paper-gsm': '80 GSM',
      'book-paper-type': 'Ruled / Lined',
      'book-pages': '160 Pages',
      'book-pack-size': '1 Piece',
    },
    variants: [
      nv('A4', 'ST-NB-BSH-A4', 180, 80, { 'book-pages': '160 Pages', 'book-paper-gsm': '80 GSM' }),
      nv('A5', 'ST-NB-BSH-A5', 130, 70, { 'book-pages': '160 Pages', 'book-paper-gsm': '80 GSM' }),
    ],
  },

  // 7. Pen & Writing: Matador Pinpoint 0.5mm Smooth Ball Pen Jar
  {
    categoryPath: 'books-stationery/books-writing-art-supplies/books-pens-markers',
    productTypeSlug: 'pen-set',
    nameEn: 'Demo Matador Pinpoint 0.5mm Ultra-Smooth Writing Ball Pen (Pack of 10)',
    nameBn: 'ডেমো ম্যাটাডোর পিনপয়েন্ট ০.৫মিমি বলপেন (১০টির প্যাক)',
    slug: 'demo-st-matador-pinpoint-pens',
    sku: 'ST-PN-MAT-01',
    brand: 'Matador',
    manufacturer: 'Matador Ballpen Industries Ltd.',
    shortDescriptionEn:
      'Smooth-flow German oil-based ink with fine nickel-silver needle tip ensuring smudge-free exam writing and effortless page glide.',
    shortDescriptionBn:
      'পরীক্ষা ও প্রতিদিনের লেখার জন্য দ্রুত ড্রাই হওয়া স্মুথ ফ্লো পিনপয়েন্ট নিডল টিপ বলপেন।',
    price: 100,
    compareAtPrice: 120,
    stock: 200,
    unit: 'pack',
    isFeatured: true,
    specs: {
      'book-ink-color': 'Blue Ink',
      'book-pack-size': 'Pack of 10',
    },
    variants: [
      iv('Blue Ink', 'Pack of 10', 'ST-PN-MAT-BLU', 100, 120),
      iv('Black Ink', 'Pack of 10', 'ST-PN-MAT-BLK', 100, 80),
    ],
  },

  // 8. Copy / Printer Paper: Bashundhara A4 80 GSM Premium Copier Paper
  {
    categoryPath: 'books-stationery/books-stationery-paper/books-printer-craft-paper',
    productTypeSlug: 'printer-paper',
    nameEn: 'Demo Bashundhara A4 80 GSM High-Brightness Copier & Printer Paper (1 Ream)',
    nameBn: 'ডেমো বসুন্ধরা এ৪ ৮০ জিএসএম প্রিমিয়াম প্রিন্টার পেপার (১ রিম / ৫০০ পাতা)',
    slug: 'demo-st-bashundhara-a4-printer-paper',
    sku: 'ST-PP-BSH-01',
    brand: 'Bashundhara Paper',
    manufacturer: 'Bashundhara Paper Mills Ltd.',
    shortDescriptionEn:
      'Jam-free 98% whiteness premium 80 GSM paper engineered for high-speed laser printers, inkjet multi-color documents, and double-sided copying.',
    shortDescriptionBn:
      'ঝকঝকে সাদা ও জ্যাম-ফ্রি উন্নতমানের ৮০ জিএসএম অফিস প্রিন্টার ও ফটোকপি পেপার রিম।',
    price: 490,
    compareAtPrice: 530,
    stock: 90,
    unit: 'ream',
    isFeatured: true,
    specs: {
      'book-paper-size': 'A4',
      'book-paper-gsm': '80 GSM',
      'book-pack-size': 'Ream of 500 Sheets',
    },
    variants: [
      pv('Ream of 500 Sheets', 'ST-PP-BSH-1RM', 490, 60),
      pv('Box of 5 Reams', 'ST-PP-BSH-5RM', 2380, 30),
    ],
  },

  // 9. Art Supplies: Faber-Castell 24 Color Classic Pencils Tin
  {
    categoryPath: 'books-stationery/books-writing-art-supplies/books-art-craft-paint',
    productTypeSlug: 'pencil-set',
    nameEn: 'Demo Faber-Castell 24 Classic Permanent Color Pencils Metal Tin Box',
    nameBn: 'ডেমো ফেবার-ক্যাস্টেল ২৪ রঙের ক্লাসিক কালার পেন্সিল টিন বক্স',
    slug: 'demo-st-faber-castell-color-pencils',
    sku: 'ST-AR-FBR-01',
    brand: 'Faber-Castell',
    manufacturer: 'Faber-Castell AG',
    shortDescriptionEn:
      'Break-resistant SV-bonded rich pigment color pencils in protective tin case with brilliant blending performance for student drawings and sketches.',
    shortDescriptionBn:
      'নিখুঁত শেডিং ও চমৎকার কালার ব্লেন্ডিংয়ের জন্য এসভি-বন্ডেড ফেবার-ক্যাস্টেল ২৪ রঙের পেন্সিল সেট।',
    price: 680,
    compareAtPrice: 750,
    stock: 50,
    unit: 'box',
    specs: {
      'book-pack-size': 'Pack of 24',
    },
    variants: [
      pv('Pack of 24', 'ST-AR-FBR-24C', 680, 50, '24 Vibrant Colors'),
    ],
  },

  // 10. Geometry / Math Set: Deli Precision Metal Geometry Box Set
  {
    categoryPath: 'books-stationery/books-writing-art-supplies/books-pencils-geometry',
    productTypeSlug: 'geometry-box',
    nameEn: 'Demo Deli Precision Metal Mathematical Geometry Box (9-Piece Kit)',
    nameBn: 'ডেমো ডেলি প্রিসিশন মেটাল জ্যামিতি বক্স (৯টি সামগ্রীর সেট)',
    slug: 'demo-st-deli-geometry-box',
    sku: 'ST-GM-DEL-01',
    brand: 'Deli',
    manufacturer: 'Deli Group Co., Ltd.',
    shortDescriptionEn:
      'Sturdy tin case containing metal compass, divider, 15cm ruler, 2 set squares, 180-degree protractor, pencil, eraser, and sharpener for school math classes.',
    shortDescriptionBn:
      'স্কুল-কলেজ শিক্ষার্থীদের জ্যামিতিক অঙ্কনের জন্য টেকসই ধাতব কম্পাস ও স্কেলযুক্ত ডেলি জ্যামিতি বক্স।',
    price: 250,
    compareAtPrice: 290,
    stock: 110,
    unit: 'box',
    specs: {
      'book-pack-size': '1 Piece',
    },
    variants: [
      pv('1 Piece', 'ST-GM-DEL-9PC', 250, 110, '9-Piece Kit'),
    ],
  },
];

export const BOOKS_VERTICAL: SeedVertical = {
  key: 'books-stationery',
  root: BOOKS_TAXONOMY,
  attributes: BOOKS_ATTRIBUTES,
  brands: BOOKS_BRANDS,
  manufacturers: BOOKS_MANUFACTURERS,
  products: BOOKS_PRODUCTS,
};
