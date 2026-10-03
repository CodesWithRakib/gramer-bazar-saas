# Books & Stationery Catalog Vertical & Book Metadata System

The **tenth vertical** running on the Gramer Bazar universal catalog engine (joining Electronics, Medicine, Grocery, Fashion, Cosmetics, Home & Kitchen, Baby & Kids, Automotive, and Sports & Fitness).
Adhering strictly to universal architectural principles, Books & Stationery operates with **zero separate tables or architectural duplication**. It reuses Categories, Product Types, Attributes, Brands, Variants, SKU, Inventory, Search, Filters, Cart, Checkout, and Orders, while providing **rich structured book metadata and stationery specifications**.

```
                           UNIVERSAL CATALOG ENGINE (shared)
                                         │
   ┌──────────┬──────────┬──────────┬────┴─────┬──────────┬──────────────┬──────────────┬──────────────┬──────────────────┬────────────────────┐
   │          │          │          │          │          │              │              │              │                  │                    │
Electronics Medicine  Grocery    Fashion   Cosmetics  Home & Kitchen   Baby & Kids    Automotive   Sports & Fitness   Books & Stationery    Future
  Products   Products  Products   Products   Products    Products       Products       Products       Products           Products
  Variants   Variants  Variants   Variants   Variants    Variants       Variants       Variants       Variants           Variants (format × size × pack)
  Attributes Attributes Attributes Attributes Attributes  Attributes     Attributes     Attributes     Attributes         Attributes (author, ISBN, GSM)
  Inventory  Inventory Inventory  Inventory  Inventory   Inventory      Inventory      Inventory      Inventory          Inventory
```

---

## 1. What was Reused (Audit & Compliance)

| Concern | Reused | Notes |
| --- | --- | --- |
| Category tree (arbitrary depth, `level`/`path`) | ✅ | `upsertVerticalTaxonomy` with root `books-stationery` |
| Product Types + attribute mappings | ✅ | `upsertVerticalProductTypes` (Printed Book, Programming Book, Academic Textbook, Notebook, Pen Set, Pencil Set, Printer Paper, Geometry Box, Art Paint Set, File Folder) |
| Attribute engine (incl. SELECT option sets) | ✅ | `attributes`, `attribute_options`, `product_type_attributes`, `product_attribute_values` |
| Brands & Manufacturers | ✅ | `upsertVerticalBrands` & `upsertVerticalManufacturers` (Prothoma, Batighar, Tamralipi, Dimik, George Series, Rahmaniya, Faber-Castell, Matador, Bashundhara, Deli, Pilot, Parker) |
| Variants / SKU / Inventory | ✅ | Book Format (Paperback, Hardcover), Paper Size (A4, A5), GSM, Ink Color, and Pack Quantity are variant-axis attributes |
| Search / Dynamic Filters / Facets | ✅ | Facet builder and filter engine seamlessly filter on author, publisher, ISBN, language, genre, paper size, and brand |
| Book Metadata & Quality System | ✅ | Structured modeling of ISBN-10/13, Edition, Pages, Language, Binding, Paper GSM, and ruling |
| Cart / Checkout / Order / Analytics / RBAC | ✅ | Full end-to-end integration without custom tables |

**No category-specific database tables or schema copies exist (`BookProduct`, `BookSKU`, `StationeryProduct`, `BookCart`, etc. are forbidden).**

---

## 2. Taxonomy Hierarchy (`books-stationery`)

Root `books-stationery` — *Books & Stationery* / *বই ও স্টেশনারি* (Icon: 📚) — organized into 5 primary branches:

```
Books & Stationery (বই ও স্টেশনারি)
├── Academic & Educational Books (পাঠ্যবই ও শিক্ষামূলক বই)
│   ├── School & College Textbooks (স্কুল ও কলেজ পাঠ্যবই) → academic-textbook
│   ├── University & Admission Tests (বিশ্ববিদ্যালয় ও ভর্তি পরীক্ষা) → academic-textbook
│   └── BCS & Competitive Exam Guides (বিসিএস ও চাকরির পরীক্ষার বই) → academic-textbook
├── Literature & Fiction (সাহিত্য ও উপন্যাস)
│   ├── Bangla Literature & Novels (বাংলা উপন্যাস ও কথাসাহিত্য) → book
│   ├── English Literature & Classics (ইংরেজি সাহিত্য ও ক্লাসিক) → book
│   └── Mystery, Thriller & Sci-Fi (থ্রিলার ও রহস্য উপন্যাস) → book
├── Non-Fiction & Self-Development (নন-ফিকশন ও আত্মউন্নয়ন)
│   ├── Computer & Programming Books (কম্পিউটার ও প্রোগ্রামিং বই) → programming-book
│   ├── Business, Leadership & Finance (ব্যবসা, অর্থনীতি ও ক্যারিয়ার) → book
│   ├── Biography & History (জীবনী ও ইতিহাস) → book
│   └── Islamic & Religious Books (ইসলামিক ও ধর্মীয় বই) → book
├── Stationery & Paper Supplies (স্টেশনারি ও খাতা-কাগজ)
│   ├── Notebooks, Khata & Journals (নোটবুক, খাতা ও ডায়েরি) → notebook
│   ├── Printer & Craft Paper (প্রিন্টার ও আর্ট পেপার) → printer-paper
│   └── Files, Folders & Binders (ফাইল ও ফোল্ডার) → file-folder
└── Writing Instruments & Art Supplies (কলম ও আর্ট সামগ্রী)
    ├── Pens, Markers & Highlighters (বলপেন, জেলপেন ও মার্কার) → pen-set
    ├── Pencils & Geometry Boxes (পেন্সিল ও জ্যামিতি বক্স) → pencil-set, geometry-box
    └── Colors, Brushes & Sketchbooks (রং, তুলি ও স্কেচবুক) → art-paint-set
```

---

## 3. Structured Attributes & Multi-Dimensional Variants

13 reusable attributes defined for the Books & Stationery vertical:

| Attribute Slug | Type | Axis | Purpose & Options |
| --- | --- | --- | --- |
| `book-author` | SELECT | Spec | Humayun Ahmed, Tamim Shahriar Subeen, James Clear, Muhammad Zafar Iqbal, Imam Ghazali, George Series Editorial, etc. |
| `book-publisher` | SELECT | Spec | Prothoma Prokashon, Batighar, Tamralipi, Anupam Prokashani, Dimik Prokashoni, George Series, Rahmaniya, etc. |
| `book-isbn` | SELECT | Spec | Valid ISBN-10 or ISBN-13 (e.g. 9789849025801, 9789849133506, 9789849472612) |
| `book-language` | SELECT | Spec | Bangla, English, Arabic, Bilingual (Bangla + English) |
| `book-format` | SELECT | Variant | Paperback, Hardcover, Board Book, Spiral Bound |
| `book-edition` | SELECT | Spec | 1st Edition, 2nd Edition, Revised Edition (2026), Student Edition, Collector's Edition |
| `book-pages` | SELECT | Spec | 64 Pages, 128 Pages, 160 Pages, 256 Pages, 320 Pages, 384 Pages, 512 Pages |
| `book-genre` | SELECT | Spec | Fiction & Novel, Non-Fiction, Computer & Programming, Self-Development & Habits, Academic & Exam Guides, Islamic Literature |
| `book-paper-size` | SELECT | Variant | A4, A5, B5, Legal, Letter, Standard Book Size |
| `book-paper-gsm` | SELECT | Variant | 65 GSM, 70 GSM, 80 GSM, 100 GSM, 120 GSM, 200 GSM, 300 GSM |
| `book-paper-type` | SELECT | Spec | Ruled / Lined, Plain / Unruled, Grid / Graph, Dot Grid, Offset Premium Paper, Art Board / Canvas |
| `book-pack-size` | SELECT | Variant | 1 Piece, Pack of 3, Pack of 5, Pack of 10, Box of 12, Pack of 24, Ream of 500 Sheets, Box of 5 Reams |
| `book-ink-color` | SELECT | Variant | Blue Ink, Black Ink, Red Ink, Green Ink, Assorted / Multicolor |

---

## 4. 10 Rich Realistic Demo Products

1. **Bangla Classic Novel:** Demo Deyal (দেয়াল) by Humayun Ahmed (Hardcover / Paperback, ISBN: 9789849025801)
2. **Programming Book:** Demo Computer Programming (1st Part) by Tamim Shahriar Subeen (Dimik Prokashoni, Paperback, ISBN: 9789849133506)
3. **Self-Development Book:** Demo Atomic Habits (Bangla Edition) by James Clear (Paperback / Hardcover, ISBN: 9789849472612)
4. **Academic / Competitive Exam:** Demo MP3 Daily BCS Bangladesh Affairs (George Series, 2026 Revised Edition, Paperback, ISBN: 9789849312154)
5. **Islamic Literature:** Demo Parashmoni (পরশমণি) by Imam Abu Hamid Al-Ghazali (Rahmaniya Publications, Hardcover)
6. **Notebook / Khata:** Demo Bashundhara Premium Spiral Ruled Notebook (Variants: A4 / 160 Pages / 80 GSM, A5 / 160 Pages / 80 GSM)
7. **Pen & Writing:** Demo Matador Pinpoint 0.5mm Smooth Ball Pen (Variants: Blue Ink / Pack of 10, Black Ink / Pack of 10)
8. **Copy / Printer Paper:** Demo Bashundhara A4 80 GSM Premium Copier Paper (Variants: 1 Ream (500 Sheets), Box of 5 Reams)
9. **Art Supplies:** Demo Faber-Castell 24 Classic Color Pencils Tin (24 Vibrant Colors, Break-Resistant SV Bonded)
10. **Geometry / Math Set:** Demo Deli Precision Metal Geometry Box Set (9-Piece Mathematical Instrument Kit)

---

## 5. UI/UX & Storefront Features
- **Book Metadata Badges:** Dedicated chips for Author, Publisher, Binding Format, ISBN, and Language.
- **Dynamic Variant Axis Resolvers:** Contextual variant selectors for books (Hardcover / Paperback), notebooks (A4 / A5), pens (Ink Color / Pack), and printer paper (Ream / Box).
- **Original Print Quality Guarantee:** Advisory assuring 100% genuine publisher prints with strict prohibition against pirated photocopies.
- **Bilingual Storefront:** Full localized English & Bangla terminology across all book genres, publishers, and stationery types.
