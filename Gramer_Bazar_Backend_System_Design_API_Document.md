# Gramer Bazar — Backend System Design & API Specification

**Project:** Gramer Bazar  
**Initial Market:** Khanসামা, Dinajpur, Bangladesh  
**Languages:** Bangla (default) + English  
**Architecture:** Modular Monolith  
**Backend:** NestJS + TypeORM  
**Database:** PostgreSQL  
**API Style:** REST `/api/v1`  
**Primary Clients:** Customer Web/PWA, Admin, Seller, Rider  
**Initial Payment:** Cash on Delivery (COD)  
**Document Version:** 1.0

---

# 1. Business Requirements

## 1.1 Product Vision

Gramer Bazar is a hyperlocal marketplace for Khanসামা where customers can discover and order everyday products from local shops/suppliers and receive delivery at their address.

The platform must also support a **Product Request** workflow:

> If a customer cannot find a product, they can request it. Admin can source it from a local supplier, add it to the marketplace, and optionally notify the requesting customer.

The system is designed to start in Khanসামা and later expand to other upazilas/districts without changing the core architecture.

## 1.2 Business Goals

1. Bring local shopping online.
2. Make everyday products discoverable from one place.
3. Connect local sellers/shops with customers.
4. Provide local delivery.
5. Capture unmet product demand.
6. Use demand data to decide which products/categories to add.
7. Support Bangla-first UX with English localization.
8. Build a scalable foundation for future online payments, promotions, search, analytics and native apps.

## 1.3 Target Users

### Customer
- Browse products
- Search/filter
- Add to cart
- Place order
- Select address
- Track order
- Request unavailable products
- Review products
- Manage profile and addresses

### Seller
- Manage shop
- Add/manage products
- Manage inventory
- Accept/process seller-side orders
- View earnings
- Update shop information

### Rider
- View assigned deliveries
- Accept delivery
- Pick up order
- Mark out for delivery
- Complete delivery

### Admin
- Manage the complete marketplace
- Approve sellers
- Manage categories/products
- Manage orders
- Assign riders
- Handle product requests
- Manage customers
- Manage reviews
- Manage coupons/promotions
- View analytics

### Super Admin
- All admin permissions
- Manage admins/roles/permissions
- System configuration
- Audit/security management

---

# 2. Core Business Rules

## 2.1 Marketplace Rule

A product can be sold by one or multiple sellers.

Recommended initial model:

```text
Product = Catalog definition
SellerProduct = Seller-specific offer
Inventory = Seller-specific stock
```

This is better than putting `sellerId` directly on Product because the same product may later be sold by multiple shops.

## 2.2 Product Availability

A product can have:

- Active
- Inactive
- Out of stock
- Draft
- Pending approval
- Archived

Only eligible products with available inventory should be orderable.

## 2.3 Order Rule

An order is created from the customer's cart.

At checkout, backend must recalculate:

- Current price
- Available stock
- Discount
- Delivery fee
- Subtotal
- Grand total

Never trust price/total values sent by the frontend.

## 2.4 Stock Rule

Inventory must be changed transactionally.

For order creation:

```text
Begin DB Transaction
    ↓
Lock/check inventory
    ↓
Validate stock
    ↓
Create order
    ↓
Create order items
    ↓
Decrease/reserve stock
    ↓
Commit
```

If any step fails, rollback the transaction.

## 2.5 Cancellation Rule

Customer can cancel only while the order is in a cancellable status.

Recommended:

```text
PENDING
CONFIRMED
```

After pickup, cancellation requires admin handling.

## 2.6 Review Rule

Only customers with a completed/delivered order containing the product can review it.

## 2.7 Product Request Rule

A product request can be:

```text
PENDING
REVIEWING
SEARCHING
FOUND
PRODUCT_ADDED
CUSTOMER_NOTIFIED
REJECTED
CLOSED
```

## 2.8 Seller Rule

Seller must be approved before selling.

```text
REGISTERED
→ PENDING_APPROVAL
→ APPROVED
→ SUSPENDED
```

## 2.9 Rider Rule

Only active/approved riders can receive delivery assignments.

---

# 3. Architecture

```text
                         Clients
                            |
        +-------------------+-------------------+
        |                   |                   |
    Customer PWA         Admin Web          Seller/Rider
        |                   |                   |
        +-------------------+-------------------+
                            |
                         HTTPS
                            |
                    NestJS REST API
                            |
                 Modular Monolith
                            |
        +-------------------+-------------------+
        |                   |                   |
    PostgreSQL           Redis (later)      Object Storage
     TypeORM                                 Cloudinary/S3
        |
   Transactions
```

## 3.1 Why Modular Monolith?

Do NOT start with microservices.

The initial system should be:

```text
One NestJS application
    +
Clearly separated business modules
    +
One PostgreSQL database
```

Later, high-load modules can be extracted.

Potential future services:

- Search
- Notifications
- Payments
- Delivery
- Analytics

---

# 4. Backend Module Structure

```text
src/
├── app.module.ts
│
├── config/
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   ├── pipes/
│   ├── exceptions/
│   ├── pagination/
│   └── utils/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── auth/
├── users/
├── roles/
├── permissions/
├── locations/
├── addresses/
├── categories/
├── brands/
├── products/
├── seller-products/
├── inventory/
├── shops/
├── sellers/
├── carts/
├── wishlists/
├── orders/
├── payments/
├── deliveries/
├── riders/
├── reviews/
├── product-requests/
├── coupons/
├── promotions/
├── notifications/
├── uploads/
├── reports/
├── audit-logs/
└── health/
```

---

# 5. Recommended Request Flow

## Customer

```text
Controller
   ↓
DTO validation
   ↓
Guard / Permission
   ↓
Service
   ↓
Repository
   ↓
TypeORM
   ↓
PostgreSQL
```

Controller should remain thin.

Business logic belongs in services/domain-oriented classes.

---

# 6. Database Design

## 6.1 Main Entities

```text
User
Role
Permission
UserRole
RolePermission

Location
Union
Area
Address

Category
Brand
Product
ProductImage
ProductVariant
ProductAttribute
ProductAttributeValue

Seller
Shop
SellerProduct
Inventory

Cart
CartItem
Wishlist
WishlistItem

Order
OrderItem
OrderStatusHistory

Payment

Rider
Delivery
DeliveryStatusHistory

Review

ProductRequest

Coupon
CouponUsage
Promotion

Notification

AuditLog
```

---

# 7. User & Authentication

## User

```text
users
-------------------------
id UUID PK
phone VARCHAR UNIQUE
email VARCHAR NULLABLE UNIQUE
passwordHash VARCHAR NULLABLE
firstName VARCHAR
lastName VARCHAR
status ENUM
isPhoneVerified BOOLEAN
isEmailVerified BOOLEAN
lastLoginAt TIMESTAMP
createdAt TIMESTAMP
updatedAt TIMESTAMP
deletedAt TIMESTAMP NULL
```

## User Status

```text
ACTIVE
INACTIVE
BLOCKED
PENDING
```

## Authentication Strategy

Customer:

```text
Phone
 ↓
OTP
 ↓
Verify
 ↓
Access Token + Refresh Token
```

Admin/Seller:

```text
Phone/email
 +
Password
 +
2FA later
```

---

# 8. RBAC

## Roles

```text
SUPER_ADMIN
ADMIN
SELLER
RIDER
CUSTOMER
```

## Permission Examples

```text
users.read
users.update
users.block

products.read
products.create
products.update
products.delete

orders.read
orders.update
orders.cancel

sellers.read
sellers.approve
sellers.suspend

riders.read
riders.assign
riders.update

product_requests.read
product_requests.update

reports.read
settings.update
```

Use:

```text
JwtAuthGuard
RolesGuard
PermissionsGuard
```

---

# 9. Location System

Because the initial market is Khanসামা, location must be configurable rather than hard-coded.

Recommended hierarchy:

```text
Country
  ↓
Division
  ↓
District
  ↓
Upazila
  ↓
Union
  ↓
Area/Village
```

Entities:

```text
Location
├── type
├── nameBn
├── nameEn
├── parentId
└── isActive
```

This allows:

```text
Bangladesh
 └── Rangpur Division
      └── Dinajpur
           └── Khanসামা
```

and future expansion.

---

# 10. Address

```text
addresses
-------------------------
id UUID
userId UUID FK
locationId UUID FK
label VARCHAR
recipientName VARCHAR
phone VARCHAR
addressLine TEXT
landmark VARCHAR NULL
latitude DECIMAL NULL
longitude DECIMAL NULL
isDefault BOOLEAN
createdAt
updatedAt
```

---

# 11. Categories

Use parent-child hierarchy.

```text
categories
-------------------------
id
parentId NULL
nameBn
nameEn
slug
descriptionBn
descriptionEn
imageUrl
sortOrder
isActive
createdAt
updatedAt
```

Examples:

```text
Grocery & Fresh
 ├── Rice & Grains
 ├── Oil
 ├── Spices
 └── Vegetables

Fashion
 ├── Men's
 ├── Women's
 └── Kids
```

---

# 12. Product Architecture

## Product

Catalog-level product.

```text
products
-------------------------
id
categoryId
brandId NULL
nameBn
nameEn
slug
descriptionBn
descriptionEn
sku
unit
status
isFeatured
createdAt
updatedAt
deletedAt
```

## Product Status

```text
DRAFT
PENDING_APPROVAL
ACTIVE
INACTIVE
ARCHIVED
```

## Product Image

```text
product_images
-------------------------
id
productId
url
publicId
altBn
altEn
sortOrder
```

## Product Variant

Useful for:

```text
Rice 1kg
Rice 5kg
Rice 25kg
```

```text
product_variants
-------------------------
id
productId
nameBn
nameEn
sku
barcode NULL
unit
createdAt
updatedAt
```

---

# 13. Seller Product / Offer

Recommended model:

```text
seller_products
-------------------------
id
sellerId
productId
variantId NULL
sellingPrice
compareAtPrice NULL
isActive
createdAt
updatedAt
```

Example:

```text
Product:
Miniket Rice

Seller A:
5kg = ৳370

Seller B:
5kg = ৳365
```

The marketplace can later show:

```text
Available from 2 local shops
```

---

# 14. Inventory

```text
inventory
-------------------------
id
sellerProductId
quantity
reservedQuantity
lowStockThreshold
updatedAt
```

Available stock:

```text
available = quantity - reservedQuantity
```

Do not let frontend calculate authoritative stock.

---

# 15. Cart

```text
carts
-------------------------
id
userId
createdAt
updatedAt
```

```text
cart_items
-------------------------
id
cartId
sellerProductId
quantity
createdAt
updatedAt
```

For MVP, enforce one checkout-compatible seller/order strategy.

If multi-seller checkout is enabled later, one customer cart can generate multiple seller fulfillment groups/orders under one parent checkout.

---

# 16. Wishlist

```text
wishlists
-------------------------
id
userId
createdAt
```

```text
wishlist_items
-------------------------
id
wishlistId
productId
createdAt
```

Unique:

```text
wishlistId + productId
```

---

# 17. Order Design

## Order

```text
orders
-------------------------
id UUID
orderNumber VARCHAR UNIQUE
userId UUID
addressId UUID
status ENUM
subtotal DECIMAL
discountAmount DECIMAL
deliveryFee DECIMAL
grandTotal DECIMAL
paymentMethod ENUM
paymentStatus ENUM
customerNote TEXT NULL
createdAt
updatedAt
```

## Order Item

Snapshot important information.

```text
order_items
-------------------------
id
orderId
sellerProductId
productId
variantId NULL
productNameBn
productNameEn
sku
unitPrice
quantity
totalPrice
```

Do not depend only on current Product data for historical orders.

---

# 18. Order Status

```text
PENDING
CONFIRMED
PROCESSING
READY_FOR_PICKUP
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
```

Possible flow:

```text
PENDING
 ↓
CONFIRMED
 ↓
PROCESSING
 ↓
READY_FOR_PICKUP
 ↓
PICKED_UP
 ↓
OUT_FOR_DELIVERY
 ↓
DELIVERED
```

Cancellation:

```text
PENDING → CANCELLED
CONFIRMED → CANCELLED
```

depending on business rules.

Every status change should create an `OrderStatusHistory` record.

---

# 19. Order Creation Transaction

Critical backend flow:

```text
POST /orders

1. Authenticate customer
2. Load cart
3. Validate cart is not empty
4. Load current seller products
5. Load current prices
6. Check active status
7. Check inventory
8. Validate address
9. Calculate subtotal
10. Calculate discount
11. Calculate delivery fee
12. Calculate grand total
13. Begin DB transaction
14. Lock/update inventory
15. Create order
16. Create order items
17. Clear cart
18. Create payment record
19. Create order status history
20. Commit
21. Send notification
```

If stock is insufficient:

```text
409 CONFLICT
```

---

# 20. Payment

MVP:

```text
CASH_ON_DELIVERY
```

Payment entity:

```text
payments
-------------------------
id
orderId
method
status
amount
transactionId NULL
paidAt NULL
createdAt
updatedAt
```

Payment status:

```text
PENDING
PAID
FAILED
REFUNDED
```

Future:

```text
BKASH
NAGAD
CARD
OTHER_GATEWAY
```

Payment gateway integration should be isolated behind a payment service/interface.

---

# 21. Delivery

## Delivery

```text
deliveries
-------------------------
id
orderId
riderId NULL
status
assignedAt NULL
pickedUpAt NULL
outForDeliveryAt NULL
deliveredAt NULL
deliveryNote NULL
createdAt
updatedAt
```

Delivery status:

```text
UNASSIGNED
ASSIGNED
ACCEPTED
PICKED_UP
OUT_FOR_DELIVERY
DELIVERED
FAILED
CANCELLED
```

---

# 22. Rider

```text
riders
-------------------------
id
userId
status
phone
vehicleType NULL
vehicleNumber NULL
isAvailable
createdAt
updatedAt
```

Status:

```text
PENDING
ACTIVE
SUSPENDED
INACTIVE
```

---

# 23. Product Request — Core USP

```text
product_requests
-------------------------
id
userId
name
description NULL
imageUrl NULL
quantity NULL
budget NULL
locationId NULL
status
adminNote NULL
createdAt
updatedAt
```

Status:

```text
PENDING
REVIEWING
SEARCHING
FOUND
PRODUCT_ADDED
CUSTOMER_NOTIFIED
REJECTED
CLOSED
```

Workflow:

```text
Customer
 ↓
Request Product
 ↓
Admin
 ↓
Search local suppliers
 ↓
Product found?
 ├── Yes → Add product
 └── No → Keep searching/reject
 ↓
Notify customer
```

---

# 24. Demand Analytics

Track:

```text
Product View
Product Search
Add To Cart
Wishlist
Product Request
Order
```

Possible event table:

```text
product_events
-------------------------
id
userId NULL
productId NULL
eventType
metadata JSONB NULL
createdAt
```

Event types:

```text
VIEW
SEARCH
ADD_TO_CART
WISHLIST
REQUEST
PURCHASE
```

Later calculate:

```text
Demand Score
```

This can power:

- Popular products
- Most searched
- Most requested
- Recommended products to add
- Trending categories

---

# 25. Reviews

```text
reviews
-------------------------
id
userId
productId
orderId
rating
commentBn NULL
commentEn NULL
status
createdAt
updatedAt
```

Rating:

```text
1–5
```

Review status:

```text
PENDING
APPROVED
REJECTED
```

Rules:

- User must have purchased the product.
- Order must be delivered.
- One review per order item/product unless business rules allow updates.

---

# 26. Coupons

```text
coupons
-------------------------
id
code UNIQUE
type
value
minimumOrderAmount NULL
maximumDiscountAmount NULL
usageLimit NULL
perUserLimit NULL
startsAt
expiresAt
isActive
```

Types:

```text
PERCENTAGE
FIXED
```

Later:

```text
FIRST_ORDER
CATEGORY
PRODUCT
SELLER
AREA
```

---

# 27. Notifications

```text
notifications
-------------------------
id
userId
titleBn
titleEn
messageBn
messageEn
type
referenceType NULL
referenceId NULL
isRead
createdAt
```

Types:

```text
ORDER
DELIVERY
PAYMENT
PRODUCT_REQUEST
PROMOTION
SYSTEM
```

Channels can later include:

```text
IN_APP
SMS
EMAIL
PUSH
```

---

# 28. Audit Logs

Admin actions should be auditable.

```text
audit_logs
-------------------------
id
userId
action
entityType
entityId
oldValue JSONB NULL
newValue JSONB NULL
ipAddress NULL
userAgent NULL
createdAt
```

Examples:

```text
ADMIN_APPROVED_SELLER
ADMIN_CHANGED_PRODUCT_PRICE
ADMIN_CANCELLED_ORDER
ADMIN_ASSIGNED_RIDER
```

---

# 29. REST API Conventions

Base URL:

```text
/api/v1
```

Success:

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Product not found",
  "errorCode": "PRODUCT_NOT_FOUND"
}
```

Validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": {
    "phone": ["Invalid phone number"]
  }
}
```

---

# 30. Pagination Standard

Request:

```text
?page=1&limit=20
```

Response:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Maximum limit:

```text
100
```

---

# 31. Sorting / Filtering

Example:

```text
/products
?search=rice
&categoryId=...
&minPrice=50
&maxPrice=500
&sortBy=price
&sortOrder=ASC
&page=1
&limit=20
```

Whitelist sortable fields.

Never directly concatenate arbitrary query parameters into SQL.

---

# 32. AUTH API

## POST `/api/v1/auth/send-otp`

Send OTP.

Request:

```json
{
  "phone": "01XXXXXXXXX"
}
```

## POST `/api/v1/auth/verify-otp`

Request:

```json
{
  "phone": "01XXXXXXXXX",
  "otp": "123456"
}
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {}
}
```

## POST `/api/v1/auth/refresh`

```json
{
  "refreshToken": "..."
}
```

## POST `/api/v1/auth/logout`

Authenticated.

## GET `/api/v1/auth/me`

Returns current user.

## PATCH `/api/v1/users/me`

Update profile.

---

# 33. ADDRESS API

## GET `/api/v1/addresses`

List user addresses.

## POST `/api/v1/addresses`

```json
{
  "label": "Home",
  "recipientName": "Customer",
  "phone": "01XXXXXXXXX",
  "locationId": "...",
  "addressLine": "Village, Union",
  "landmark": "Near market",
  "isDefault": true
}
```

## GET `/api/v1/addresses/:id`

## PATCH `/api/v1/addresses/:id`

## DELETE `/api/v1/addresses/:id`

## PATCH `/api/v1/addresses/:id/default`

---

# 34. LOCATION API

## GET `/api/v1/locations`

## GET `/api/v1/locations/:id`

## GET `/api/v1/locations/:id/children`

Used for cascading selectors.

Example:

```text
District
 ↓
Upazila
 ↓
Union
 ↓
Area
```

Admin:

## POST `/api/v1/admin/locations`

## PATCH `/api/v1/admin/locations/:id`

## DELETE `/api/v1/admin/locations/:id`

---

# 35. CATEGORY API

Public:

## GET `/api/v1/categories`

## GET `/api/v1/categories/tree`

## GET `/api/v1/categories/:slug`

Admin:

## POST `/api/v1/admin/categories`

## GET `/api/v1/admin/categories`

## PATCH `/api/v1/admin/categories/:id`

## DELETE `/api/v1/admin/categories/:id`

---

# 36. BRAND API

Public:

## GET `/api/v1/brands`

## GET `/api/v1/brands/:id`

Admin:

## POST `/api/v1/admin/brands`

## PATCH `/api/v1/admin/brands/:id`

## DELETE `/api/v1/admin/brands/:id`

---

# 37. PRODUCT API — CUSTOMER

## GET `/api/v1/products`

Supports:

```text
search
category
brand
seller
minPrice
maxPrice
rating
inStock
featured
sort
pagination
```

## GET `/api/v1/products/:slug`

Product detail.

## GET `/api/v1/products/:id/related`

## GET `/api/v1/products/:id/reviews`

## GET `/api/v1/products/popular`

## GET `/api/v1/products/featured`

## GET `/api/v1/products/trending`

---

# 38. PRODUCT API — ADMIN

## POST `/api/v1/admin/products`

Create product.

## GET `/api/v1/admin/products`

## GET `/api/v1/admin/products/:id`

## PATCH `/api/v1/admin/products/:id`

## DELETE `/api/v1/admin/products/:id`

## PATCH `/api/v1/admin/products/:id/status`

## POST `/api/v1/admin/products/:id/images`

## DELETE `/api/v1/admin/products/:id/images/:imageId`

## POST `/api/v1/admin/products/:id/variants`

## PATCH `/api/v1/admin/products/:id/variants/:variantId`

## DELETE `/api/v1/admin/products/:id/variants/:variantId`

---

# 39. SELLER API

## POST `/api/v1/seller/register`

Create seller application.

## GET `/api/v1/seller/profile`

## PATCH `/api/v1/seller/profile`

## GET `/api/v1/seller/shop`

## PATCH `/api/v1/seller/shop`

## GET `/api/v1/seller/products`

## POST `/api/v1/seller/products`

Create seller offer for an existing catalog product.

## GET `/api/v1/seller/products/:id`

## PATCH `/api/v1/seller/products/:id`

## DELETE `/api/v1/seller/products/:id`

## PATCH `/api/v1/seller/products/:id/status`

---

# 40. SELLER INVENTORY API

## GET `/api/v1/seller/inventory`

## GET `/api/v1/seller/inventory/:sellerProductId`

## PATCH `/api/v1/seller/inventory/:sellerProductId`

Request:

```json
{
  "quantity": 100,
  "lowStockThreshold": 10
}
```

Do not allow seller to modify reserved quantity directly.

---

# 41. ADMIN SELLER API

## GET `/api/v1/admin/sellers`

Filters:

```text
status
search
location
date
```

## GET `/api/v1/admin/sellers/:id`

## PATCH `/api/v1/admin/sellers/:id/approve`

## PATCH `/api/v1/admin/sellers/:id/reject`

## PATCH `/api/v1/admin/sellers/:id/suspend`

## PATCH `/api/v1/admin/sellers/:id/activate`

## GET `/api/v1/admin/shops`

## GET `/api/v1/admin/shops/:id`

---

# 42. CART API

## GET `/api/v1/cart`

## POST `/api/v1/cart/items`

```json
{
  "sellerProductId": "...",
  "quantity": 2
}
```

## PATCH `/api/v1/cart/items/:itemId`

```json
{
  "quantity": 3
}
```

## DELETE `/api/v1/cart/items/:itemId`

## DELETE `/api/v1/cart`

## POST `/api/v1/cart/validate`

Validates:

- Product active?
- Price changed?
- Stock available?
- Seller active?

Response should identify changes.

---

# 43. WISHLIST API

## GET `/api/v1/wishlist`

## POST `/api/v1/wishlist/items`

```json
{
  "productId": "..."
}
```

## DELETE `/api/v1/wishlist/items/:productId`

## POST `/api/v1/wishlist/toggle`

---

# 44. CHECKOUT API

## POST `/api/v1/checkout/preview`

Request:

```json
{
  "addressId": "...",
  "couponCode": null
}
```

Response:

```json
{
  "items": [],
  "subtotal": 1000,
  "discount": 50,
  "deliveryFee": 50,
  "grandTotal": 1000
}
```

Important: this is only a preview. Final values are recalculated during order creation.

---

# 45. ORDER API — CUSTOMER

## POST `/api/v1/orders`

Create order.

Request:

```json
{
  "addressId": "...",
  "paymentMethod": "CASH_ON_DELIVERY",
  "couponCode": null,
  "customerNote": "Please call before delivery"
}
```

## GET `/api/v1/orders`

## GET `/api/v1/orders/:id`

## POST `/api/v1/orders/:id/cancel`

## POST `/api/v1/orders/:id/reorder`

## GET `/api/v1/orders/:id/status-history`

---

# 46. ORDER API — ADMIN

## GET `/api/v1/admin/orders`

Filters:

```text
status
paymentStatus
seller
rider
customer
dateFrom
dateTo
search
```

## GET `/api/v1/admin/orders/:id`

## PATCH `/api/v1/admin/orders/:id/status`

## POST `/api/v1/admin/orders/:id/assign-rider`

```json
{
  "riderId": "..."
}
```

## POST `/api/v1/admin/orders/:id/cancel`

## GET `/api/v1/admin/orders/:id/status-history`

---

# 47. ORDER API — SELLER

## GET `/api/v1/seller/orders`

## GET `/api/v1/seller/orders/:id`

## PATCH `/api/v1/seller/orders/:id/status`

Allowed seller-side transitions should be restricted.

Example:

```text
CONFIRMED
→ PROCESSING
→ READY_FOR_PICKUP
```

Seller must not be able to mark an order `DELIVERED`.

---

# 48. PAYMENT API

## GET `/api/v1/orders/:orderId/payment`

## POST `/api/v1/payments/cod/confirm`

For admin/system use where required.

Future:

## POST `/api/v1/payments/bkash/create`

## POST `/api/v1/payments/bkash/callback`

## POST `/api/v1/payments/nagad/create`

## POST `/api/v1/payments/nagad/callback`

Payment gateway callbacks must be authenticated/verified according to provider requirements.

---

# 49. RIDER API

## POST `/api/v1/admin/riders`

## GET `/api/v1/admin/riders`

## GET `/api/v1/admin/riders/:id`

## PATCH `/api/v1/admin/riders/:id`

## PATCH `/api/v1/admin/riders/:id/activate`

## PATCH `/api/v1/admin/riders/:id/suspend`

Rider app:

## GET `/api/v1/rider/profile`

## PATCH `/api/v1/rider/profile`

## GET `/api/v1/rider/deliveries`

## GET `/api/v1/rider/deliveries/:id`

## POST `/api/v1/rider/deliveries/:id/accept`

## POST `/api/v1/rider/deliveries/:id/picked-up`

## POST `/api/v1/rider/deliveries/:id/out-for-delivery`

## POST `/api/v1/rider/deliveries/:id/delivered`

---

# 50. DELIVERY API — ADMIN

## GET `/api/v1/admin/deliveries`

## GET `/api/v1/admin/deliveries/:id`

## POST `/api/v1/admin/deliveries/:id/assign`

## POST `/api/v1/admin/deliveries/:id/reassign`

## PATCH `/api/v1/admin/deliveries/:id/status`

---

# 51. PRODUCT REQUEST API

Customer:

## POST `/api/v1/product-requests`

Request:

```json
{
  "name": "Product name",
  "description": "Details",
  "quantity": 2,
  "budget": 500,
  "locationId": "..."
}
```

## GET `/api/v1/product-requests`

Customer's own requests.

## GET `/api/v1/product-requests/:id`

## PATCH `/api/v1/product-requests/:id/cancel`

Admin:

## GET `/api/v1/admin/product-requests`

## GET `/api/v1/admin/product-requests/:id`

## PATCH `/api/v1/admin/product-requests/:id/status`

## PATCH `/api/v1/admin/product-requests/:id/note`

## POST `/api/v1/admin/product-requests/:id/create-product`

## POST `/api/v1/admin/product-requests/:id/notify-customer`

---

# 52. REVIEW API

Customer:

## POST `/api/v1/products/:productId/reviews`

## GET `/api/v1/products/:productId/reviews`

## PATCH `/api/v1/reviews/:id`

## DELETE `/api/v1/reviews/:id`

Admin:

## GET `/api/v1/admin/reviews`

## PATCH `/api/v1/admin/reviews/:id/approve`

## PATCH `/api/v1/admin/reviews/:id/reject`

---

# 53. COUPON API

Customer:

## POST `/api/v1/coupons/validate`

Request:

```json
{
  "code": "WELCOME50",
  "cartTotal": 500
}
```

Admin:

## POST `/api/v1/admin/coupons`

## GET `/api/v1/admin/coupons`

## GET `/api/v1/admin/coupons/:id`

## PATCH `/api/v1/admin/coupons/:id`

## DELETE `/api/v1/admin/coupons/:id`

---

# 54. NOTIFICATION API

## GET `/api/v1/notifications`

## GET `/api/v1/notifications/unread-count`

## PATCH `/api/v1/notifications/:id/read`

## PATCH `/api/v1/notifications/read-all`

Admin:

## POST `/api/v1/admin/notifications/send`

---

# 55. UPLOAD API

## POST `/api/v1/uploads/image`

For authenticated users.

Server must validate:

- MIME type
- File size
- Extension
- Image dimensions where necessary

Allowed examples:

```text
JPEG
PNG
WEBP
```

Never trust the client-provided MIME type alone.

---

# 56. ADMIN DASHBOARD API

## GET `/api/v1/admin/dashboard/summary`

Returns:

```text
Today's orders
Today's revenue
Pending orders
Active customers
Active sellers
Active riders
Product requests
```

## GET `/api/v1/admin/dashboard/sales`

## GET `/api/v1/admin/dashboard/orders`

## GET `/api/v1/admin/dashboard/top-products`

## GET `/api/v1/admin/dashboard/top-categories`

## GET `/api/v1/admin/dashboard/top-sellers`

## GET `/api/v1/admin/dashboard/demand`

---

# 57. REPORT API

## GET `/api/v1/admin/reports/sales`

## GET `/api/v1/admin/reports/orders`

## GET `/api/v1/admin/reports/products`

## GET `/api/v1/admin/reports/sellers`

## GET `/api/v1/admin/reports/customers`

## GET `/api/v1/admin/reports/delivery`

## GET `/api/v1/admin/reports/product-demand`

Reports should support:

```text
dateFrom
dateTo
location
seller
category
```

---

# 58. HEALTH API

## GET `/api/v1/health`

Returns:

```json
{
  "status": "ok",
  "database": "up",
  "timestamp": "..."
}
```

Later include:

- Redis
- Queue
- Storage

---

# 59. Admin Settings API

## GET `/api/v1/admin/settings`

## PATCH `/api/v1/admin/settings`

Settings examples:

```text
defaultDeliveryFee
minimumOrderAmount
maximumOrderAmount
orderCancellationWindow
supportPhone
supportEmail
maintenanceMode
```

Do not hard-code business configuration in source code if admins need to change it.

---

# 60. Delivery Fee Strategy

For MVP use configurable zones.

```text
DeliveryZone
----------------
id
nameBn
nameEn
locationId
fee
minimumOrderAmount NULL
isActive
```

API:

## GET `/api/v1/delivery/zones`

Admin:

## POST `/api/v1/admin/delivery/zones`

## PATCH `/api/v1/admin/delivery/zones/:id`

## DELETE `/api/v1/admin/delivery/zones/:id`

---

# 61. API Authorization Matrix

| Module | Customer | Seller | Rider | Admin | Super Admin |
|---|---|---|---|---|---|
| Products Read | Yes | Yes | Limited | Yes | Yes |
| Products Create | No | Offer only | No | Yes | Yes |
| Categories | Read | Read | No | Manage | Manage |
| Cart | Yes | No | No | No | No |
| Orders | Own | Assigned seller | Assigned delivery | All | All |
| Delivery | Own status | View | Own | Manage | Manage |
| Product Request | Own | No | No | Manage | Manage |
| Reviews | Own | View | No | Moderate | Moderate |
| Sellers | Apply | Own | No | Manage | Manage |
| Riders | No | No | Own | Manage | Manage |
| Reports | No | Own | Own delivery stats | Yes | Yes |
| Roles/Permissions | No | No | No | Limited | Yes |

---

# 62. Important Database Constraints

Use database-level constraints wherever possible.

Examples:

```text
users.phone UNIQUE
users.email UNIQUE
products.slug UNIQUE
products.sku UNIQUE
orders.orderNumber UNIQUE
coupons.code UNIQUE

wishlist_items(wishlistId, productId) UNIQUE
```

Foreign keys:

```text
ON DELETE RESTRICT
```

where historical data must be preserved.

Use soft deletion for important entities.

---

# 63. TypeORM Rules

Use:

```text
TypeORM DataSource
Entities
Repositories
QueryBuilder
Transactions
Migrations
```

Do NOT use:

```text
synchronize: true
```

in production.

Use migrations:

```text
migration:generate
migration:run
migration:revert
```

Production:

```text
synchronize: false
```

---

# 64. TypeORM Transaction Pattern

Order creation must use a transaction.

Conceptually:

```text
DataSource.transaction(async manager => {
    validateCart()
    validateStock()
    calculateTotals()

    createOrder()
    createOrderItems()
    updateInventory()
    createPayment()
    createStatusHistory()
})
```

For high-concurrency inventory, use appropriate row locking/atomic updates.

---

# 65. API Error Codes

Standardize application errors.

Examples:

```text
AUTH_INVALID_OTP
AUTH_TOKEN_EXPIRED
AUTH_UNAUTHORIZED

USER_NOT_FOUND
USER_BLOCKED

PRODUCT_NOT_FOUND
PRODUCT_INACTIVE
PRODUCT_OUT_OF_STOCK

SELLER_NOT_FOUND
SELLER_NOT_APPROVED

CART_EMPTY
CART_ITEM_NOT_FOUND

ORDER_NOT_FOUND
ORDER_INVALID_STATUS
ORDER_CANNOT_CANCEL

INSUFFICIENT_STOCK

PAYMENT_FAILED

DELIVERY_NOT_FOUND
RIDER_NOT_AVAILABLE

PRODUCT_REQUEST_NOT_FOUND

COUPON_INVALID
COUPON_EXPIRED
COUPON_USAGE_LIMIT_REACHED

VALIDATION_ERROR
FORBIDDEN
INTERNAL_ERROR
```

---

# 66. Security Requirements

## Authentication

- Short-lived access token
- Refresh token rotation where practical
- Secure token storage strategy
- OTP expiration
- OTP attempt limit
- Login rate limiting

## API Security

- HTTPS
- CORS allowlist
- Helmet
- Rate limiting
- DTO validation
- Authorization guards
- Permission checks
- File upload validation
- SQL-safe query construction

## Admin Security

- Strong authentication
- 2FA later
- Audit logs
- IP/device monitoring later
- Strict permissions

---

# 67. Rate Limiting

Sensitive endpoints:

```text
send OTP
verify OTP
login
refresh token
password reset
product request
review
checkout
payment
```

should have stricter limits.

Later use Redis-backed rate limiting.

---

# 68. Idempotency

Critical operations should support idempotency.

Especially:

```text
Create Order
Payment
Payment Callback
```

Example:

```text
Idempotency-Key: UUID
```

This prevents duplicate orders if the customer taps the button twice or network retries.

---

# 69. Order Number

Do not expose sequential database IDs.

Use:

```text
GB-2026-000001
```

or a secure unique order identifier.

Database primary key can remain UUID.

---

# 70. Money Handling

Do not use floating-point numbers for money.

Use PostgreSQL:

```text
NUMERIC(12,2)
```

Example:

```text
price NUMERIC(12,2)
```

Backend calculations must be deterministic.

---

# 71. Product Pricing

Never trust:

```json
{
  "price": 50
}
```

from customer checkout.

Instead:

```text
sellerProductId
 ↓
DB lookup
 ↓
current price
 ↓
calculate
```

---

# 72. Order Snapshot

Order item stores:

```text
productNameBn
productNameEn
sku
unitPrice
quantity
```

because products can later change name/price.

---

# 73. Seller Order Strategy

For MVP, easiest approach:

```text
One checkout
 ↓
One seller-compatible order
```

If cart contains multiple sellers:

Option A:

```text
Block multi-seller checkout
```

or better long-term:

```text
Parent Order
 ├── Seller Order A
 ├── Seller Order B
 └── Seller Order C
```

Recommended long-term architecture:

```text
Checkout
   ↓
Parent Order
   ↓
Order Groups
   ↓
Seller Fulfillment
```

For MVP, implement one seller per order unless multi-seller is a confirmed business requirement.

---

# 74. Product Catalog vs Seller Offer

Important distinction:

```text
Product
= What the item is

SellerProduct
= Who sells it + at what price

Inventory
= How many that seller currently has
```

This makes the marketplace much easier to scale.

---

# 75. Suggested Initial Categories

```text
1. Grocery & Fresh
2. Fish & Meat
3. Eggs & Dairy
4. Health & Medicine
5. Beauty & Personal Care
6. Fashion
7. Baby & Kids
8. Electronics
9. Home & Kitchen
10. Food & Restaurant
11. Agriculture
12. Livestock & Poultry
13. Hardware & Tools
14. Books & Stationery
15. Sports & Fitness
16. Pet Supplies
17. Gifts & Occasions
18. Auto & Bike
19. Religious
20. Local & Homemade
21. Local Services
```

Medicine and other regulated categories must follow applicable Bangladesh laws, licensing and operational requirements.

---

# 76. Search Strategy

## MVP

PostgreSQL:

- Indexed product name
- Category
- Brand
- SKU
- Active status

## Later

```text
PostgreSQL
   ↓
Meilisearch/OpenSearch
```

Search should support:

```text
Bangla
English
Banglish
```

Example:

```text
"alu"
"আলু"
```

should ideally discover the same product.

---

# 77. Caching Strategy

Do not introduce Redis everywhere on day one.

Cache later:

```text
Categories
Popular products
Featured products
Location tree
Public settings
```

Do NOT blindly cache highly dynamic:

```text
Inventory
Order status
Payment status
```

---

# 78. Background Jobs

Later use:

```text
BullMQ + Redis
```

Jobs:

```text
Send OTP
Send SMS
Send notification
Send email
Generate reports
Process images
Demand aggregation
Abandoned cart reminders
Daily seller reports
```

---

# 79. Notification Events

Examples:

```text
ORDER_CREATED
ORDER_CONFIRMED
ORDER_PROCESSING
ORDER_OUT_FOR_DELIVERY
ORDER_DELIVERED

PRODUCT_REQUEST_RECEIVED
PRODUCT_REQUEST_FOUND
PRODUCT_ADDED

SELLER_APPROVED
SELLER_REJECTED

PAYMENT_SUCCESS
PAYMENT_FAILED
```

---

# 80. Observability

Use Sentry for:

```text
Frontend errors
Backend exceptions
Performance
```

Backend should also have structured logs:

```text
timestamp
requestId
userId
method
path
statusCode
duration
errorCode
```

---

# 81. API Documentation

Use Swagger/OpenAPI.

NestJS:

```text
/api/docs
```

Document:

- Endpoint
- Auth requirement
- Request DTO
- Response DTO
- Error responses
- Query parameters
- Example payloads

---

# 82. DTO Structure

Example:

```text
products/dto/
├── create-product.dto.ts
├── update-product.dto.ts
├── query-product.dto.ts
└── product-response.dto.ts
```

Do not expose TypeORM entities directly as API responses.

Use response DTOs.

---

# 83. Recommended Backend Folder Pattern

Example:

```text
orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── orders.repository.ts
├── entities/
│   ├── order.entity.ts
│   ├── order-item.entity.ts
│   └── order-status-history.entity.ts
├── dto/
│   ├── create-order.dto.ts
│   ├── cancel-order.dto.ts
│   └── query-orders.dto.ts
├── enums/
│   └── order-status.enum.ts
└── interfaces/
```

For complex domains, separate application/domain concerns further.

---

# 84. Business Service Examples

Orders should not contain all logic in one huge service.

Possible services:

```text
OrderService
OrderPricingService
OrderInventoryService
OrderStatusService
OrderNotificationService
```

Products:

```text
ProductService
ProductSearchService
ProductPricingService
ProductInventoryService
```

This supports SOLID principles.

---

# 85. Order Status Transition Guard

Do not accept arbitrary:

```text
PATCH /orders/1
{
  "status": "DELIVERED"
}
```

Instead validate allowed transitions.

Example:

```text
PENDING
 → CONFIRMED
 → PROCESSING
 → READY_FOR_PICKUP
 → PICKED_UP
 → OUT_FOR_DELIVERY
 → DELIVERED
```

Only authorized actors can perform each transition.

---

# 86. Seller Order Permissions

Seller:

```text
CONFIRMED
→ PROCESSING
→ READY_FOR_PICKUP
```

Rider:

```text
READY_FOR_PICKUP
→ PICKED_UP
→ OUT_FOR_DELIVERY
→ DELIVERED
```

Admin can override according to permission and should create an audit record.

---

# 87. Product Request Demand Logic

Admin dashboard:

```text
Most Requested Products
-----------------------
Product A    120 requests
Product B     87 requests
Product C     55 requests
```

Recommendation:

```text
High Request
+
No Catalog Product
=
Candidate for sourcing
```

This is a key business intelligence feature.

---

# 88. Customer Product Discovery

Customer can:

```text
Browse category
Search
Filter
Sort
View product
View shop
Add cart
Wishlist
Request unavailable product
```

Search event should not be stored for every keystroke.

Use debouncing on frontend and meaningful search events on backend.

---

# 89. Recommended API Versioning

Use:

```text
/api/v1
```

Later:

```text
/api/v2
```

Do not break v1 clients unexpectedly.

---

# 90. CORS

Production should use explicit origins:

```text
https://your-customer-domain
https://your-admin-domain
```

Avoid:

```text
origin: "*"
```

when authenticated credentials/cookies are involved.

---

# 91. Environment Variables

Example:

```text
NODE_ENV
PORT

DATABASE_URL

JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN

CORS_ORIGINS

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

REDIS_URL

SENTRY_DSN

SMS_PROVIDER_URL
SMS_PROVIDER_KEY

PAYMENT_PROVIDER_KEY
```

Never commit secrets.

---

# 92. Deployment

Recommended initial:

```text
Frontend
→ Vercel

Backend
→ VPS + Docker

PostgreSQL
→ Managed PostgreSQL or secured VPS DB

Object Storage
→ Cloudinary/S3

Monitoring
→ Sentry
```

Later:

```text
Cloudflare
Redis
Queue
CDN
Load Balancer
```

---

# 93. Docker Services — Later

```text
docker-compose
├── api
├── postgres
├── redis
└── worker
```

Production database backups are mandatory.

---

# 94. Database Backup

At minimum:

```text
Daily backup
Weekly retention
Off-server backup
```

Test restoration periodically.

A backup that has never been restored/tested should not be considered reliable.

---

# 95. Testing Plan

## Unit Tests

Test:

```text
Pricing
Coupon
Order status transitions
Inventory calculation
Delivery fee
Demand score
Permissions
```

## Integration Tests

Test:

```text
Auth → DB
Product → DB
Cart → DB
Order → Inventory → DB
```

## E2E Tests

Critical flow:

```text
Register/Login
 ↓
Browse
 ↓
Add Cart
 ↓
Checkout
 ↓
Order
 ↓
Seller Processing
 ↓
Rider Delivery
 ↓
Delivered
 ↓
Review
```

---

# 96. MVP Scope

Do NOT build everything at once.

## MVP Backend

### Must Have

```text
Auth
Users
Locations
Addresses
Categories
Products
Seller
Shop
Seller Products
Inventory
Cart
Checkout
COD
Orders
Rider
Delivery
Product Request
Notifications
Reviews
Admin
Swagger
Sentry
Audit Logs
```

### Later

```text
Online payment
Redis
BullMQ
Advanced search
Coupons
Promotions
Push notification
Advanced analytics
Multi-seller checkout
Native mobile app
```

---

# 97. MVP API Priority

Build in this exact order:

```text
1. Auth
2. Users
3. Locations
4. Addresses
5. Categories
6. Products
7. Sellers/Shops
8. Seller Products
9. Inventory
10. Cart
11. Checkout Preview
12. Orders
13. Delivery
14. Riders
15. Product Requests
16. Reviews
17. Notifications
18. Admin Dashboard
19. Reports
20. Audit Logs
```

---

# 98. Development Milestones

## Milestone 1 — Foundation

```text
NestJS
TypeORM
PostgreSQL
Config
Swagger
Global validation
Exception handling
Logging
```

## Milestone 2 — Auth

```text
OTP
JWT
Refresh token
RBAC
```

## Milestone 3 — Catalog

```text
Location
Category
Brand
Product
Images
Variants
```

## Milestone 4 — Seller

```text
Seller
Shop
SellerProduct
Inventory
```

## Milestone 5 — Shopping

```text
Cart
Wishlist
Checkout
```

## Milestone 6 — Order

```text
Order
Payment
Status history
```

## Milestone 7 — Delivery

```text
Rider
Delivery
Assignment
Tracking status
```

## Milestone 8 — Marketplace USP

```text
Product Request
Demand tracking
Admin sourcing workflow
```

## Milestone 9 — Trust

```text
Reviews
Notifications
Audit
```

## Milestone 10 — Production

```text
Tests
Security
Performance
Docker
CI/CD
Monitoring
Backups
```

---

# 99. Complete User Journey

```text
Customer opens Gramer Bazar
        ↓
Selects Khanসামা area
        ↓
Browses/searches products
        ↓
Chooses product
        ↓
Adds to cart
        ↓
Checkout
        ↓
Selects address
        ↓
Chooses COD
        ↓
Backend validates price + stock
        ↓
Order created
        ↓
Seller receives order
        ↓
Seller prepares order
        ↓
Admin/system assigns rider
        ↓
Rider picks up
        ↓
Rider delivers
        ↓
Customer confirms receipt
        ↓
Order DELIVERED
        ↓
Customer reviews
```

---

# 100. Product Request Journey

```text
Customer searches:
"Blender"

       ↓

No suitable product

       ↓

"আপনার প্রয়োজনীয় পণ্যটি পাচ্ছেন না?"

       ↓

Request Product

       ↓

Admin Dashboard

       ↓

Search local supplier

       ↓

Product found

       ↓

Admin adds catalog product

       ↓

Seller adds offer/stock

       ↓

Customer notification

       ↓

Customer orders
```

---

# 101. Future Expansion

The architecture must support:

```text
Khanসামা
   ↓
Dinajpur
   ↓
Rangpur Division
   ↓
Bangladesh
```

The following must therefore NOT be hard-coded:

- Upazila
- Delivery fee
- Categories
- Sellers
- Riders
- Product availability
- Business settings
- Language
- Payment methods

---

# 102. Recommended Final Tech Stack

```text
Frontend
────────────
Next.js
TypeScript
Tailwind CSS
shadcn/ui
next-intl
Redux Toolkit
RTK Query
React Hook Form
Zod
PWA

Backend
────────────
NestJS
TypeScript
TypeORM
PostgreSQL
JWT
Swagger
class-validator

Infrastructure
────────────
Docker
VPS
Vercel
Cloudinary/S3
GitHub Actions

Monitoring
────────────
Sentry

Later
────────────
Redis
BullMQ
Meilisearch/OpenSearch
Push Notifications
Online Payment
```

---

# 103. Final Engineering Principles

1. Keep controllers thin.
2. Put business rules in services/domain logic.
3. Use DTOs for input and output.
4. Never expose entities directly.
5. Never trust frontend prices/totals.
6. Use DB transactions for order/inventory operations.
7. Use TypeORM migrations.
8. Never use `synchronize: true` in production.
9. Use UUIDs for internal IDs.
10. Use snapshots for order history.
11. Enforce authorization server-side.
12. Validate order status transitions.
13. Use idempotency for critical operations.
14. Keep payment integrations isolated.
15. Keep location configurable.
16. Design for multi-seller later.
17. Start modular monolith, not microservices.
18. Add Redis only when there is a real need.
19. Monitor production errors with Sentry.
20. Back up the database and test restoration.

---

# 104. Definition of Done — Backend MVP

The backend is ready for MVP when:

- [ ] Customer can register/login.
- [ ] Customer can select Khanসামা location.
- [ ] Customer can manage addresses.
- [ ] Admin can create categories.
- [ ] Admin can create products.
- [ ] Seller can be approved.
- [ ] Seller can create product offers.
- [ ] Seller can update inventory.
- [ ] Customer can search/browse products.
- [ ] Customer can add products to cart.
- [ ] Checkout calculates server-side totals.
- [ ] Customer can place COD order.
- [ ] Inventory is safely updated.
- [ ] Seller can process order.
- [ ] Admin can assign rider.
- [ ] Rider can complete delivery.
- [ ] Customer can see order status.
- [ ] Customer can request unavailable products.
- [ ] Admin can process product requests.
- [ ] Customer can review delivered products.
- [ ] Notifications work for important order events.
- [ ] RBAC is enforced.
- [ ] Swagger documentation is available.
- [ ] Error handling is standardized.
- [ ] Audit logs exist for sensitive admin actions.
- [ ] Critical flows have automated tests.
- [ ] Production migrations are configured.
- [ ] Database backup strategy exists.
- [ ] Sentry/structured logging is configured.

---

# 105. One-Sentence Architecture Summary

**Gramer Bazar will be a Khanসামা-first, Bangla-first hyperlocal marketplace built as a NestJS modular monolith using TypeORM + PostgreSQL, with customer PWA, admin/seller/rider portals, local delivery, COD, seller inventory, product-request sourcing, and demand analytics, designed for future expansion across Bangladesh.**
