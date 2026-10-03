# Toys, Games & Hobbies API & Endpoints Guide

The Toys, Games & Hobbies vertical utilizes the standard Gramer Bazar catalog API endpoints. No domain-specific controllers or endpoints are needed.

## Public Discovery APIs

### 1. Retrieve Category Hierarchy
```http
GET /api/v1/catalog/categories/tree
```
Returns nested tree with root node `toys-games-hobbies`, including all 15 branches and their L3 child categories.

### 2. Category Detail & Breadcrumbs
```http
GET /api/v1/catalog/categories/toys-games-hobbies
GET /api/v1/catalog/categories/toys-games-hobbies/educational-toys/stem-toys
```

### 3. Product Listing with Dynamic Filters
```http
GET /api/v1/catalog/products?category=toys-games-hobbies&toys-age-group=3–5+Years&brand=LEGO&page=1&limit=24
```
Query parameters dynamically resolve against indexed attribute values:
- `toys-age-group`
- `toys-stem-area`
- `toys-game-players`
- `toys-choking-hazard`
- `toys-material`
- `brand`
- `minPrice` / `maxPrice`

### 4. Product Details with Structured Attributes
```http
GET /api/v1/catalog/products/demo-toys-lego-police-station
```
Response includes:
- Master product metadata (Bilingual names, descriptions, compareAtPrice)
- Structured `specGroups` containing verified specifications
- Variants with distinct SKU, attributes (Piece Count, Color, Edition)
- Live inventory across verified seller shops

### 5. Cart Validation & Checkout
```http
POST /api/v1/cart/items
```
Payload:
```json
{
  "productVariantId": "variant-uuid",
  "quantity": 1
}
```
Backend validates real-time active inventory, shop operational status, and price consistency before cart confirmation.
