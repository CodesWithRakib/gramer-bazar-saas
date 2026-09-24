# Gramer Bazar — Product Catalog, Local Image Storage & Bulk Importer Architecture

## 1. System Overview

Gramer Bazar features a complete production-grade product catalog, category/subcategory taxonomy, secure local file storage system, and bulk product importer/seed engine. The entire implementation seamlessly integrates with the existing NestJS backend, Next.js frontend, TypeORM entities, and PostgreSQL database.

---

## 2. Catalog & Taxonomy Architecture

### Hierarchy
```text
Root Category (parentId = null)
   └── Subcategory (parentId = Category.id)
          └── Product (Global Master Item)
                 ├── ProductImage (Local Disk Files + Relative Metadata)
                 ├── ProductVariant (SKU, Variant Attributes, Images)
                 └── SellerProduct (Shop Listing, Price, Inventory Stock)
```

### Primary Root Categories & Subcategories (Seed & Standard Taxonomy)
1. **Fresh & Vegetables (তাজা শাকসবজি ও আমিষ)**
   - Vegetables (শাকসবজি)
   - Fruits (ফলমূল)
   - Fish (দেশি মাছ)
   - Meat (মাংস)
   - Eggs (ডিম)
2. **Grocery (মুদি সামগ্রী)**
   - Rice (চাল)
   - Dal (ডাল)
   - Oil (তেল)
   - Salt (লবণ)
   - Sugar (চিনি)
   - Flour (আটা ও ময়দা)
   - Spices (মসলা)
   - Snacks (স্ন্যাক্স)
   - Biscuits (বিস্কুট)
   - Drinks (পানীয়)
   - Instant Food (ইনস্ট্যান্ট নুডলস ও ফুড)
3. **Medicine & Health (ওষুধ ও স্বাস্থ্যসেবা)**
   - OTC Medicine (ওটিসি প্রাথমিক ওষুধ)
   - First Aid (ফার্স্ট এইড ও ব্যান্ডেজ)
   - Personal Care (ব্যক্তিগত যত্ন)
   - Healthcare (স্বাস্থ্যসেবা সামগ্রী)
4. **Clothing (পোশাক ও পরিধেয়)**
   - Men's (পুরুষদের পোশাক)
   - Women's (নারীদের পোশাক)
   - Kids (শিশুদের পোশাক)
   - Accessories (আনুষাঙ্গিক সামগ্রী)
5. **Electronics (ইলেকট্রনিক্স ও গ্যাজেট)**
   - Mobile Accessories (মোবাইল এক্সেসরিজ)
   - Home Appliances (গৃহস্থালী ইলেকট্রনিক্স)
   - Computer Accessories (কম্পিউটার এক্সেসরিজ)
   - Lighting (লাইট ও বৈদ্যুতিক সরঞ্জাম)
6. **Cosmetics (প্রসাধন ও রূপচর্চা)**
   - Skincare (ত্বকের যত্ন)
   - Haircare (চুলের যত্ন)
   - Makeup (মেকআপ সামগ্রী)
   - Fragrance (সুগন্ধি ও আতর)
7. **Food (খাবার ও রেস্তোরাঁ)**
   - Restaurant Food (রেস্তোরাঁর খাবার)
   - Bakery (বেকারি পণ্য)
   - Fast Food (ফাস্ট ফুড)
   - Local Food (গ্রামের পিঠা ও ঐতিহ্যবাহী খাবার)

---

## 3. Database Schema & Relations

### Category (`categories` table)
- `id` (UUID, Primary Key)
- `parentId` (UUID, Nullable Self-Referencing Foreign Key `FK_categories_parent`)
- `nameEn` (varchar 100)
- `nameBn` (varchar 100)
- `slug` (varchar 100, Unique index)
- `icon` (varchar 100, nullable)
- `image` (varchar 255, nullable)
- `descriptionEn` (text, nullable)
- `descriptionBn` (text, nullable)
- `sortOrder` (int, default 0)
- `isRegulated` (boolean, default false)
- `isActive` (boolean, default true)
- `createdAt`, `updatedAt`

### Product (`products` table)
- `id` (UUID, Primary Key)
- `nameEn` (varchar 255)
- `nameBn` (varchar 255)
- `slug` (varchar 255, Unique index)
- `shortDescriptionEn` (varchar 500, nullable)
- `shortDescriptionBn` (varchar 500, nullable)
- `descriptionEn` (text, nullable)
- `descriptionBn` (text, nullable)
- `categoryId` (UUID, Foreign Key to Category)
- `subCategoryId` (UUID, Nullable Foreign Key to Category)
- `brandId` (UUID, Nullable Foreign Key to Brand)
- `sku` (varchar 100, nullable, indexed)
- `barcode` (varchar 100, nullable, indexed)
- `price` (decimal 10,2, default 0)
- `compareAtPrice` (decimal 10,2, nullable)
- `stock` (int, default 0)
- `unit` (varchar 50, default 'piece')
- `status` (Enum: `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `UNPUBLISHED`, `ARCHIVED`)
- `isFeatured` (boolean, default false)
- `isActive` (boolean, default true)
- `source` (varchar 50, nullable)
- `sourceProductId` (varchar 100, nullable)
- `sourceUrl` (varchar 500, nullable)
- `sourcePrice` (decimal 10,2, nullable)
- `sourceCurrency` (varchar 10, nullable)
- `createdAt`, `updatedAt`, `deletedAt`
- Relations: `OneToMany` to `ProductImage`, `ProductVariant`

### ProductImage (`product_images` table)
- `id` (UUID, Primary Key)
- `productId` (UUID, Foreign Key to Product with `CASCADE` on delete)
- `url` (varchar 500, e.g. `/uploads/products/YYYY/MM/[uuid].[ext]`)
- `storagePath` (varchar 500, portable relative storage key)
- `filename` (varchar 255, sanitized UUID filename)
- `originalFilename` (varchar 255, nullable)
- `mimeType` (varchar 50)
- `sizeBytes` (bigint)
- `isPrimary` (boolean, default false)
- `sortOrder` (int, default 0)
- `altText` (varchar 255, nullable)
- `sourceUrl` (varchar 500, nullable)
- `sourceAttribution` (text, nullable)
- `createdAt`, `updatedAt`

### ImportLog (`import_logs` table)
- `id` (UUID, Primary Key)
- `source` (varchar 50, e.g. `dummyjson`, `openfoodfacts`)
- `mode` (Enum: `DRY_RUN`, `IMPORT`, `RETRY_IMAGES`)
- `status` (Enum: `RUNNING`, `COMPLETED`, `FAILED`)
- `totalFetched`, `createdCount`, `updatedCount`, `skippedCount`, `duplicatesCount`, `failedCount`, `imageFailuresCount`, `mappingFailuresCount`
- `errorSummary` (text, nullable)
- `details` (jsonb, nullable)
- `startedAt`, `completedAt`, `createdAt`, `updatedAt`

---

## 4. Local Image Storage & Static Serving

### Storage Architecture
- Images are stored locally on disk under `apps/api/uploads/products/YYYY/MM/`.
- Filenames are randomized UUIDs (never trusting client-supplied filenames).
- Paths stored in PostgreSQL are portable relative paths (e.g. `products/YYYY/MM/abc-123.webp`).
- No OS-specific paths (e.g. `C:\...`) are ever saved in the database or sent to clients.

### Magic Bytes Security Validation
Every uploaded or downloaded image is inspected at the binary level:
- **JPEG**: Magic bytes `FF D8 FF`
- **PNG**: Magic bytes `89 50 4E 47 0D 0A 1A 0A`
- **WebP**: Header `RIFF` followed by `WEBP`
Executable scripts, disguised SVG/HTML, and corrupted files are rejected with HTTP 400.

### Static File Serving & Next.js Rewrite
- The API serves files at `http://localhost:4000/uploads/...` using `@nestjs/serve-static`.
- The Next.js frontend includes a rewrite rule in `next.config.ts`:
  ```ts
  {
    source: "/uploads/:path*",
    destination: "http://localhost:4000/uploads/:path*",
  }
  ```
- `CustomImage` and `resolveImageUrl` seamlessly resolve `/uploads/...` paths to the active API origin.

---

## 5. Bulk Product Importer System

### Source Adapters
1. **DummyJSON Adapter (`DummyJsonAdapter`)**:
   - Queries `https://dummyjson.com/products`.
   - Normalizes titles, descriptions, stock, tags, brands, images, and prices.
   - Extracts source pricing in USD without fabricating fake Bangladeshi prices.
2. **Open Food Facts Adapter (`OpenFoodFactsAdapter`)**:
   - Queries legitimate food database by category (`https://world.openfoodfacts.org/category/{category}.json`).
   - Normalizes authentic grocery names, packaging units (g, kg, ml), brands, barcodes, and images.

### SSRF Protection
The remote image downloader enforces security checks:
- Blocks private IPv4 address spaces (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- Blocks loopback addresses (`127.0.0.0/8`, `localhost`).
- Blocks link-local addresses (`169.254.0.0/16`).
- Blocks cloud metadata endpoints (`169.254.169.254`).
- Validates downloaded binary magic bytes before writing to local disk.

### Category Mapping Layer
Deterministic mapping translates external taxonomies to Gramer Bazar root categories and subcategories:
- `groceries` -> `Grocery` (`Rice`, `Oil`, `Spices`, etc. by tag)
- `beauty`, `skin-care` -> `Cosmetics` (`Skincare`)
- `fragrances` -> `Cosmetics` (`Fragrance`)
- `smartphones`, `mobile-accessories` -> `Electronics` (`Mobile Accessories`)
- `laptops` -> `Electronics` (`Computer Accessories`)
- Unmatched items are flagged as `PENDING_REVIEW` for admin approval.

### Duplicate Detection
Multi-field uniqueness heuristics prevent duplicate imports:
1. `source + sourceProductId` match
2. `barcode` match
3. `sku` match
4. Normalized product name match (case-insensitive, punctuation-stripped)

---

## 6. Development & Operational Commands

### 1. Database Seeding
To wipe and seed the database with the complete 7-category taxonomy, 35 subcategories, and 15 authentic Bangladesh marketplace products:
```bash
# Via HTTP POST (Dev server must be running)
curl -X POST http://localhost:4000/api/v1/dev/seed
```

### 2. Bulk Product Importer CLI / API
```bash
# Dry Run (Preview 10 products from DummyJSON without DB write)
curl -X POST http://localhost:4000/api/v1/admin/importer/run \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source": "dummyjson", "mode": "DRY_RUN", "limit": 10}'

# Actual Import (Download images and store in PostgreSQL)
curl -X POST http://localhost:4000/api/v1/admin/importer/run \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"source": "dummyjson", "mode": "IMPORT", "limit": 10}'

# View Import Audit Logs
curl -X GET http://localhost:4000/api/v1/admin/importer/logs \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 3. Build & Typecheck Commands
```bash
# API Typecheck, Lint, and Build
pnpm --filter api run typecheck
pnpm --filter api run lint
pnpm --filter api run build

# Web Typecheck, Lint, and Build
pnpm --filter web run typecheck
pnpm --filter web run lint
pnpm --filter web run build

# Run API Unit Tests
pnpm --filter api run test
```
