# Route Inventory

Complete inventory of frontend routes and their expected behavior in Gramer Bazar.

## 1. Public Routes

| Route | Purpose | Allowed Roles | Layout | API Dependencies | Status |
| ----- | ------- | ------------- | ------ | ---------------- | ------ |
| `/[lang]` | Homepage / Discovery | All | Public Layout | `/public/catalog/search`, `/public/categories` | Active |
| `/[lang]/categories` | Category Listing | All | Public Layout | `/public/categories` | Active |
| `/[lang]/catalog` | Filtered Catalog | All | Public Layout | `/public/catalog/search` | Active |
| `/[lang]/search` | Search Results | All | Public Layout | `/public/catalog/search` | Active |
| `/[lang]/products/[slug]` | Product Details | All | Public Layout | `/public/catalog/[slug]` | Active |
| `/[lang]/shops/[id]` | Public Shop View | All | Public Layout | `/shops/[id]` | Active |
| `/[lang]/cart` | Shopping Cart | All | Public Layout | None (Client State) | Active |
| `/[lang]/flash-sale` | Flash Deals | All | Public Layout | `/flash-sales` | Active |
| `/[lang]/offers` | Platform Offers | All | Public Layout | `/offers` | Active |
| `/[lang]/become-a-seller` | Seller Application Page | All | Public Layout | `/applications/seller` | Active |
| `/[lang]/become-a-rider` | Rider Application Page | All | Public Layout | `/applications/rider` | Active |

---

## 2. Authentication Routes

| Route | Purpose | Allowed Roles | Layout | API Dependencies | Status |
| ----- | ------- | ------------- | ------ | ---------------- | ------ |
| `/[lang]/login` | User Authentication | Guests | Auth Layout | `POST /auth/login` | Active |
| `/[lang]/register` | Account Creation | Guests | Auth Layout | `POST /auth/register` | Active |
| `/[lang]/forgot-password` | Password Recovery | Guests | Auth Layout | `POST /auth/forgot-password` | Active |
| `/[lang]/reset-password` | Reset Password | Guests | Auth Layout | `POST /auth/reset-password` | Active |
| `/[lang]/unauthorized` | 403 Forbidden | All | Auth Layout | None | Active |

---

## 3. Customer Routes

| Route | Purpose | Allowed Roles | Layout | API Dependencies | Status |
| ----- | ------- | ------------- | ------ | ---------------- | ------ |
| `/[lang]/customer` | Customer Dashboard | Customer | Customer Layout | `/orders/my-orders`, `/wallets/me` | Active |
| `/[lang]/customer/checkout` | Order Checkout | Customer | Customer Layout | `POST /orders/checkout`, `/addresses` | Active |
| `/[lang]/customer/orders` | Customer Order History | Customer | Customer Layout | `/orders/my-orders` | Active |
| `/[lang]/customer/addresses` | Delivery Addresses | Customer | Customer Layout | `/addresses` | Active |
| `/[lang]/customer/wishlist` | Bookmarked Items | Customer | Customer Layout | `/wishlist` | Active |
| `/[lang]/customer/profile` | Profile Settings | Customer | Customer Layout | `/users/me` | Active |
| `/[lang]/customer/disputes` | Order Disputes | Customer | Customer Layout | `/disputes` | Active |
| `/[lang]/customer/product-requests` | Unlisted Item Requests | Customer | Customer Layout | `/product-requests` | Active |
| `/[lang]/customer/messages` | Realtime Chat | Customer | Customer Layout | `/chat/...` | Active |
| `/[lang]/customer/notifications` | User Notifications | Customer | Customer Layout | `/notifications` | Active |

---

## 4. Seller Routes

| Route | Purpose | Allowed Roles | Layout | API Dependencies | Status |
| ----- | ------- | ------------- | ------ | ---------------- | ------ |
| `/[lang]/seller` | Seller Dashboard | Seller | Seller Layout | `/seller-portal/...` | Active |
| `/[lang]/seller/shop` | Shop Profile Setup | Seller | Seller Layout | `/seller-portal/shop` | Active |
| `/[lang]/seller/products` | Inventory Management | Seller | Seller Layout | `/seller-portal/products` | Active |
| `/[lang]/seller/orders` | Received Orders | Seller | Seller Layout | `/seller-portal/orders` | Active |
| `/[lang]/seller/wallet` | Earnings & Payouts | Seller | Seller Layout | `/seller-portal/wallet`, `/payouts` | Active |
| `/[lang]/seller/coupons` | Shop Coupons | Seller | Seller Layout | `/coupons` | Active |
| `/[lang]/seller/disputes` | Order Disputes | Seller | Seller Layout | `/disputes` | Active |
| `/[lang]/seller/messages` | Realtime Chat | Seller | Seller Layout | `/chat/...` | Active |
| `/[lang]/seller/notifications` | Seller Notifications | Seller | Seller Layout | `/notifications` | Active |

---

## 5. Rider Routes

| Route | Purpose | Allowed Roles | Layout | API Dependencies | Status |
| ----- | ------- | ------------- | ------ | ---------------- | ------ |
| `/[lang]/rider` | Rider Dashboard | Rider | Rider Layout | `/deliveries/rider/my-deliveries` | Active |
| `/[lang]/rider/deliveries` | Delivery List | Rider | Rider Layout | `/deliveries/rider/my-deliveries` | Active |
| `/[lang]/rider/deliveries/[id]` | Delivery Details & Status | Rider | Rider Layout | `/deliveries/rider/status` | Active |
| `/[lang]/rider/messages` | Realtime Chat | Rider | Rider Layout | `/chat/...` | Active |
| `/[lang]/rider/notifications` | Rider Notifications | Rider | Rider Layout | `/notifications` | Active |
| `/[lang]/rider/profile` | Rider Profile | Rider | Rider Layout | `/users/me` | Active |

---

## 6. Admin Routes

| Route | Purpose | Allowed Roles | Layout | API Dependencies | Status |
| ----- | ------- | ------------- | ------ | ---------------- | ------ |
| `/[lang]/admin` | Admin Analytics | Admin, Super Admin | Admin Layout | `/analytics/dashboard` | Active |
| `/[lang]/admin/users-management` | User & Role Admin | Admin, Super Admin | Admin Layout | `/users`, `/applications` | Active |
| `/[lang]/admin/orders` | Order & Delivery Admin | Admin, Super Admin | Admin Layout | `/orders/admin/all`, `/deliveries/admin/assign` | Active |
| `/[lang]/admin/products` | Catalog & Categories | Admin, Super Admin | Admin Layout | `/catalog/...` | Active |
| `/[lang]/admin/finance` | Payouts & Wallets | Admin, Super Admin | Admin Layout | `/payouts/admin/...` | Active |
| `/[lang]/admin/disputes` | Dispute Resolution | Admin, Super Admin | Admin Layout | `/disputes` | Active |
| `/[lang]/admin/messages` | Support Chat | Admin, Super Admin | Admin Layout | `/chat/...` | Active |

---

## 7. Super Admin Routes

| Route | Purpose | Allowed Roles | Layout | API Dependencies | Status |
| ----- | ------- | ------------- | ------ | ---------------- | ------ |
| `/[lang]/super-admin` | Super Admin Home | Super Admin | Super Admin Layout | Aggregated | Active |
| `/[lang]/super-admin/users-management` | Role Permissions & Admins | Super Admin | Super Admin Layout | `/roles`, `/permissions` | Active |
| `/[lang]/super-admin/settings` | System Settings | Super Admin | Super Admin Layout | `/settings` | Active |
| `/[lang]/super-admin/finance` | Global Financial Audit | Super Admin | Super Admin Layout | `/payouts/admin/...`, `/wallets` | Active |
