# Tools & Hardware Catalog API Integration Guide

## 1. REST Endpoints Overview

The Tools & Hardware vertical uses standard universal catalog endpoints under `/api/v1/catalog` and `/api/v1/categories`.

### A. Fetch Tools & Hardware Root Hierarchy
```http
GET /api/v1/categories/tools-hardware
```

**Response (Summary):**
```json
{
  "id": "cat-tools-hardware-uuid",
  "nameEn": "Tools & Hardware",
  "nameBn": "যন্ত্রপাতি ও হার্ডওয়্যার",
  "slug": "tools-hardware",
  "icon": "🔧",
  "subcategories": [
    {
      "nameEn": "Power Tools",
      "nameBn": "পাওয়ার টুলস ও বৈদ্যুতিক যন্ত্রপাতি",
      "slug": "power-tools",
      "children": [
        { "slug": "drills-drivers", "nameEn": "Drills & Drivers" },
        { "slug": "angle-grinders-cutters", "nameEn": "Angle Grinders & Cutters" },
        { "slug": "power-saws", "nameEn": "Power Saws" }
      ]
    },
    {
      "nameEn": "Hand Tools",
      "nameBn": "হস্তচালিত যন্ত্রপাতি",
      "slug": "hand-tools",
      "children": [
        { "slug": "screwdrivers-wrenches", "nameEn": "Screwdrivers & Wrenches" },
        { "slug": "hammers-chisels", "nameEn": "Hammers & Chisels" }
      ]
    },
    {
      "nameEn": "Hardware & Fasteners",
      "nameBn": "হার্ডওয়্যার ও নাট-বল্টু",
      "slug": "hardware-fasteners",
      "children": [
        { "slug": "screws-drywall", "nameEn": "Screws & Drywall Fasteners" },
        { "slug": "bolts-nuts-washers", "nameEn": "Bolts, Nuts & Washers" }
      ]
    }
  ]
}
```

---

### B. Search & Faceted Filter for Power Tools
```http
GET /api/v1/catalog/products?category=drills-drivers&powerSource=Cordless+Battery&voltage=18V&brand=bosch
```

**Query Parameters Supported:**
- `category`: Category or Subcategory slug (`power-tools`, `drills-drivers`, `screws-drywall`, `switches-sockets`)
- `powerSource`: `Cordless Battery`, `Corded Electric`, `Manual Hand-Operated`
- `brand`: Brand slug (`bosch`, `makita`, `dewalt`, `stanley`, `ingco`, `total-tools`, `berger-paints`)
- `minPrice`, `maxPrice`: Numeric range in BDT
- `page`, `limit`: Standard pagination parameters

---

### C. Product Details with Dynamic Specs & Chemical Batches
```http
GET /api/v1/catalog/products/demo-tools-bosch-gsb-185-li
```

**Response (Extract):**
```json
{
  "id": "prod-bosch-gsb185-uuid",
  "nameEn": "Bosch GSB 185-LI Brushless Cordless Impact Drill 18V",
  "nameBn": "বশ জিএসবি ১৮৫-এলআই ব্রাশলেস কর্ডলেস ইমপ্যাক্ট ড্রিল ১৮ ভোল্ট",
  "slug": "demo-tools-bosch-gsb-185-li",
  "brand": {
    "nameEn": "Bosch",
    "nameBn": "বশ"
  },
  "productType": {
    "code": "cordless-drill",
    "nameEn": "Cordless Drill & Driver"
  },
  "attributeValues": [
    { "attributeCode": "tools-power-source", "value": "Cordless Battery" },
    { "attributeCode": "tools-voltage", "value": "18V Li-ion" },
    { "attributeCode": "tools-no-load-speed-rpm", "value": 1900 },
    { "attributeCode": "tools-max-torque-nm", "value": 50 },
    { "attributeCode": "tools-chuck-size", "value": "13mm (1/2\")" },
    { "attributeCode": "tools-warranty", "value": "1 Year Official Bosch Warranty" }
  ],
  "variants": [
    {
      "id": "var-solo",
      "nameEn": "Bare Tool (Without Battery & Charger)",
      "sku": "BOSCH-GSB185-SOLO",
      "price": 8200,
      "stock": 15
    },
    {
      "id": "var-kit",
      "nameEn": "Kit with 2x 2.0Ah Batteries & Fast Charger",
      "sku": "BOSCH-GSB185-KIT",
      "price": 14500,
      "stock": 22
    }
  ]
}
```
