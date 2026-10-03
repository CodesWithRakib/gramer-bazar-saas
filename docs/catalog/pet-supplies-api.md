# Pet Supplies Catalog API Integration Guide

## 1. REST Endpoints Overview

The Pet Supplies vertical uses standard universal catalog endpoints under `/api/v1/catalog` and `/api/v1/categories`.

### A. Fetch Pet Supplies Root Hierarchy
```http
GET /api/v1/categories/pet-supplies
```

**Response (Summary):**
```json
{
  "id": "cat-pet-supplies-uuid",
  "nameEn": "Pet Supplies",
  "nameBn": "পোষা প্রাণীর সামগ্রী",
  "slug": "pet-supplies",
  "icon": "🐾",
  "subcategories": [
    {
      "nameEn": "Dog Supplies",
      "nameBn": "কুকুরের সামগ্রী",
      "slug": "dog-supplies",
      "children": [
        { "slug": "dog-food", "nameEn": "Dry & Wet Dog Food" },
        { "slug": "dog-treats-chews", "nameEn": "Treats, Chews & Bones" },
        { "slug": "dog-collars-leashes", "nameEn": "Collars, Leashes & Harnesses" }
      ]
    },
    {
      "nameEn": "Cat Supplies",
      "nameBn": "বিড়ালের সামগ্রী",
      "slug": "cat-supplies",
      "children": [
        { "slug": "cat-food", "nameEn": "Dry & Wet Cat Food" },
        { "slug": "cat-litter-boxes", "nameEn": "Cat Litter & Litter Boxes" }
      ]
    },
    {
      "nameEn": "Fish & Aquarium",
      "nameBn": "মাছ ও অ্যাকোয়ারিয়াম",
      "slug": "fish-aquarium",
      "children": [
        { "slug": "fish-food-flakes", "nameEn": "Fish Food, Flakes & Pellets" },
        { "slug": "aquarium-filters-pumps", "nameEn": "Water Filters & Air Pumps" }
      ]
    }
  ]
}
```

---

### B. Search & Faceted Filter for Pet Nutrition
```http
GET /api/v1/catalog/products?category=pet-food&petType=Cat&lifeStage=Kitten&minProtein=30
```

**Query Parameters Supported:**
- `category`: Category or Subcategory slug (`dog-food`, `cat-food`, `pet-food`, `cat-litter-boxes`, etc.)
- `petType`: `Dog`, `Cat`, `Bird`, `Fish`, `Rabbit`
- `lifeStage`: `Kitten / Puppy`, `Adult`, `Senior`
- `brand`: Brand slug (`royal-canin`, `pedigree`, `whiskas`, `me-o`, `tetra`, `sobo`)
- `minPrice`, `maxPrice`: Numeric range in BDT
- `page`, `limit`: Pagination parameters

---

### C. Product Details with Dynamic Specs & FEFO Batches
```http
GET /api/v1/catalog/products/royal-canin-maxi-adult-dry-dog-food
```

**Response (Extract):**
```json
{
  "id": "prod-rc-maxi-adult",
  "nameEn": "Royal Canin Maxi Adult Dry Dog Food",
  "nameBn": "রয়্যাল ক্যানিন ম্যাক্সি অ্যাডাল্ট ডগ ফুড",
  "slug": "royal-canin-maxi-adult-dry-dog-food",
  "brand": {
    "nameEn": "Royal Canin",
    "nameBn": "রয়্যাল ক্যানিন"
  },
  "productType": {
    "code": "pet-food-dry",
    "nameEn": "Dry Pet Food"
  },
  "attributeValues": [
    { "attributeCode": "pet-type", "value": "Dog" },
    { "attributeCode": "pet-food-type", "value": "Dry Kibble" },
    { "attributeCode": "pet-life-stage", "value": "Adult" },
    { "attributeCode": "pet-breed-size", "value": "Large Breed (>25kg)" },
    { "attributeCode": "pet-protein-percentage", "value": 26 },
    { "attributeCode": "pet-country-of-origin", "value": "France" }
  ],
  "variants": [
    {
      "id": "var-rc-4kg",
      "nameEn": "4kg Pack",
      "sku": "RC-MAXI-4KG",
      "price": 5200,
      "stock": 18,
      "batches": [
        {
          "lotNumber": "LOT-RC2601",
          "manufactureDate": "2026-01-10",
          "expiryDate": "2027-07-10",
          "quantity": 18
        }
      ]
    },
    {
      "id": "var-rc-15kg",
      "nameEn": "15kg Breeder Pack",
      "sku": "RC-MAXI-15KG",
      "price": 16800,
      "stock": 8,
      "batches": [
        {
          "lotNumber": "LOT-RC2602",
          "manufactureDate": "2026-02-01",
          "expiryDate": "2027-08-01",
          "quantity": 8
        }
      ]
    }
  ]
}
```
