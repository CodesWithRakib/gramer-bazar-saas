# System Feature Inventory

This document inventory lists all discovered features across the Gramer Bazar platform.

| Feature | Primary Role | Route Pattern | API Endpoint | DB Entity | Status | Tested | Notes |
| ------- | ------------ | ------------- | ------------ | --------- | ------ | ------ | ----- |
| Public Marketplace Discovery | Guest / Customer | `/[lang]` | `GET /api/v1/public/catalog/search` | `SellerProduct`, `Product` | Active | Yes | Featured products, categories, shops |
| Category & Subcategory Catalog | Guest / Customer | `/[lang]/categories`, `/[lang]/catalog` | `GET /api/v1/public/categories` | `Category`, `SubCategory` | Active | Yes | Multilingual category browsing |
| Product Search & Filter | Guest / Customer | `/[lang]/search` | `GET /api/v1/public/catalog/search` | `SellerProduct`, `Brand` | Active | Yes | Price range, brand, category filters |
| Product Details View | Guest / Customer | `/[lang]/products/[slug]` | `GET /api/v1/public/catalog/[slug]` | `SellerProduct`, `ProductVariant` | Active | Yes | Stock, price, shop info, reviews |
| Shop Public Page | Guest / Customer | `/[lang]/shops/[id]` | `GET /api/v1/shops/[id]` | `Shop`, `SellerProduct` | Active | Yes | Seller profile & shop catalog |
| Customer Registration | Guest | `/[lang]/register` | `POST /api/v1/auth/register` | `User`, `Role` | Active | Yes | Phone/Email validation, role assignment |
| Customer / User Login | Guest | `/[lang]/login` | `POST /api/v1/auth/login` | `User` | Active | Yes | JWT access/refresh tokens |
| Password Reset / OTP | Guest / User | `/[lang]/forgot-password` | `POST /api/v1/auth/forgot-password` | `OtpToken` | Active | Yes | Verification code & password update |
| Customer Cart Management | Customer | `/[lang]/cart` | Client State / LocalStorage | `SellerProduct` | Active | Yes | Add/remove items, quantity change |
| Customer Address Book | Customer | `/[lang]/customer/addresses` | `GET/POST/PUT/DELETE /api/v1/addresses` | `Address` | Active | Yes | Default address selection |
| Checkout & Order Placement | Customer | `/[lang]/customer/checkout` | `POST /api/v1/orders/checkout` | `Order`, `OrderItem` | Active | Yes | COD & SSLCOMMERZ gateway support |
| Order History & Tracking | Customer | `/[lang]/customer/orders` | `GET /api/v1/orders/my-orders` | `Order`, `OrderStatusHistory` | Active | Yes | Realtime status updates |
| Customer Wishlist | Customer | `/[lang]/customer/wishlist` | `GET/POST/DELETE /api/v1/wishlist` | `Wishlist` | Active | Yes | Product bookmarking |
| Customer Wallet & Balance | Customer | `/[lang]/customer/profile` | `GET /api/v1/wallets/me` | `Wallet`, `WalletTransaction` | Active | Yes | Refund balances & transactions |
| Seller Application | Customer / User | `/[lang]/become-a-seller` | `POST /api/v1/applications/seller` | `Application` | Active | Yes | NID, Trade License, Shop Details |
| Seller Shop Management | Seller | `/[lang]/seller/shop` | `GET/PUT /api/v1/seller-portal/shop` | `Shop` | Active | Yes | Logo, Banner, Address, Operating hours |
| Seller Product Inventory | Seller | `/[lang]/seller/products` | `GET/POST/PUT/DELETE /api/v1/seller-portal/products` | `SellerProduct` | Active | Yes | Stock, pricing, discount, status |
| Seller Order Processing | Seller | `/[lang]/seller/orders` | `GET/PATCH /api/v1/seller-portal/orders` | `Order` | Active | Yes | Confirm, process, ready for pickup |
| Seller Earnings & Wallet | Seller | `/[lang]/seller/wallet` | `GET /api/v1/seller-portal/wallet` | `Wallet`, `WalletTransaction` | Active | Yes | Revenue balance & payout history |
| Seller Payout Requests | Seller | `/[lang]/seller/wallet` | `POST /api/v1/payouts/request` | `Payout` | Active | Yes | Bank/bKash withdrawal requests |
| Rider Application | Customer / User | `/[lang]/become-a-rider` | `POST /api/v1/applications/rider` | `Application` | Active | Yes | Vehicle info, Driving license, NID |
| Rider Delivery Dashboard | Rider | `/[lang]/rider/deliveries` | `GET /api/v1/deliveries/rider/my-deliveries` | `Delivery` | Active | Yes | Active & completed assignments |
| Rider Delivery Progression | Rider | `/[lang]/rider/deliveries/[id]` | `PATCH /api/v1/deliveries/rider/status` | `Delivery`, `Order` | Active | Yes | Accept, Pickup, Out for Delivery, Delivered |
| Realtime Chat & Messaging | Customer/Seller/Rider/Admin | `/[role]/messages` | `GET /api/v1/chat/...` + Socket.IO | `Conversation`, `Message` | Active | Yes | Direct messaging & unread counters |
| Realtime Notifications | All Auth Users | `/[role]/notifications` | `GET /api/v1/notifications` + Socket.IO | `Notification` | Active | Yes | Status change alerts & mark read |
| Dispute Handling | Customer / Seller | `/[role]/disputes` | `GET/POST /api/v1/disputes` | `Dispute` | Active | Yes | Order issues & refund requests |
| Product Request Form | Customer | `/[lang]/customer/product-requests` | `GET/POST /api/v1/product-requests` | `ProductRequest` | Active | Yes | Request unlisted items |
| Admin Overview Dashboard | Admin / Super Admin | `/[lang]/admin` | `GET /api/v1/analytics/dashboard` | Aggregated | Active | Yes | Platform sales, order counts, users |
| Admin User Management | Admin / Super Admin | `/[lang]/admin/users-management` | `GET/PATCH /api/v1/users` | `User` | Active | Yes | Role assignment & status toggle |
| Admin Seller Applications | Admin / Super Admin | `/[lang]/admin/users-management` | `GET/POST /api/v1/applications/admin` | `Application` | Active | Yes | Approve/reject seller applications |
| Admin Rider Assignments | Admin / Super Admin | `/[lang]/admin/orders` | `POST /api/v1/deliveries/admin/assign` | `Delivery` | Active | Yes | Manual delivery assignment to riders |
| Admin Category & Brand CRUD | Admin / Super Admin | `/[lang]/admin/products` | `GET/POST/PUT /api/v1/catalog/...` | `Category`, `Brand` | Active | Yes | Marketplace taxonomy management |
| Admin Payout Approval | Admin / Super Admin | `/[lang]/admin/finance` | `PATCH /api/v1/payouts/admin/...` | `Payout`, `Wallet` | Active | Yes | Approve/reject withdrawal payouts |
| Super Admin Role Management | Super Admin | `/[lang]/super-admin/users-management` | `GET/POST /api/v1/roles` | `Role`, `Permission` | Active | Yes | System permissions configuration |
| Super Admin System Settings | Super Admin | `/[lang]/super-admin/settings` | `GET/PUT /api/v1/settings` | `Setting` | Active | Yes | Commission rates, Gateway keys |
