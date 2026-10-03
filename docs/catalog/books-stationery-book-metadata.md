# Book Metadata & ISBN Architecture

## Overview
Books require specialized bibliographic and publishing metadata to support catalog search, academic citations, and customer discovery. Rather than introducing separate database tables (`BookProduct`, `BookVariant`), Gramer Bazar leverages the universal catalog attribute engine.

## 1. Multi-Axis Variant Resolution Matrix

| Category / Product Type | Primary Variant Axis | Secondary Variant Axis | Example SKU |
| --- | --- | --- | --- |
| **Novels & Literature** | `book-format` (Hardcover / Paperback) | ISBN-13 | `BK-NV-HUM-HC` |
| **Self-Help & Business** | `book-format` (Paperback / Hardcover) | Edition | `BK-SH-JMC-PB` |
| **Notebooks & Khata** | `book-paper-size` (A4, A5) | `book-pages` / GSM | `ST-NB-BSH-A4` |
| **Writing Pens** | `book-ink-color` (Blue, Black) | `book-pack-size` (Pack of 10) | `ST-PN-MAT-BLU` |
| **Printer Paper** | `book-pack-size` (1 Ream, Box of 5) | `book-paper-gsm` (80 GSM) | `ST-PP-BSH-1RM` |

## 2. Bibliographic Metadata Verification
- **ISBN Integrity:** Normalized 10-digit and 13-digit ISBNs are indexed and displayed as structured badges rather than buried in descriptions.
- **Publisher Attributions:** Verified publishing houses are linked directly as official brands and manufacturers.
- **Anti-Piracy & Originality Standards:** Storefront banners ensure customers receive authentic publisher prints, protecting author copyrights and ensuring durable binding quality.
