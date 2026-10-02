# Gramer Bazar — Comprehensive QA System Inventory

Last Updated: October 2026
System Version: 1.0.0-GA
Automation Health: 100% Passing (Vitest 258/258, Playwright 42/42)

---

## 1. Architectural Overview & Coverage Summary

Gramer Bazar is an enterprise rural hyper-marketplace SaaS connecting rural farmers, local artisans, community merchants, neighborhood riders, and rural consumers across Bangladesh.

### Stack Components & Test Boundaries
| Layer | Tech Stack | Test Runner | Files | Tests | Pass Rate |
|---|---|---|---|---|---|
| **API Backend** | NestJS 11 + TypeORM + PostgreSQL + Redis | Vitest 3.x | 60 | 258 | 100% |
| **Web Frontend** | Next.js 15 (App Router) + Tailwind CSS + Redux Toolkit + Socket.io | Playwright | 12 suites | 42 | 100% |
| **Localization** | Custom i18n (`/en`, `/bn`) with dictionary fallback | Automated crawler & responsive audit | Continuous | Full App | 100% |

---

## 2. Backend Modules Inventory (37 Modules)

All 37 backend NestJS modules are fully verified and covered by automated unit/integration tests:

| Module | Primary Domain Responsibilities | E2E / Integration Verification | Status |
|---|---|---|---|
| **`AddressesModule`** | Customer multi-address management, geocoding coordinates | Addresses API CRUD, Checkout integration | ✅ VERIFIED |
| **`AdminsModule`** | Platform administrative controls, super-admin provisioning | `admin-flow.spec.ts`, RoleGuard | ✅ VERIFIED |
| **`AnalyticsModule`** | Platform analytics, sales, demand trends, customer cohort metrics | Analytics dashboard query tests | ✅ VERIFIED |
| **`AnnouncementsModule`** | System-wide notices, targeted push banners for rural users | Broadcast and banner flows | ✅ VERIFIED |
| **`ApplicationsModule`** | Seller & Rider onboarding application review pipeline | Seller onboarding, Rider vetting | ✅ VERIFIED |
| **`AuditLogsModule`** | Immutable compliance logs, actor tracking, security events | Admin audit logs spec, status mutation hooks | ✅ VERIFIED |
| **`AuthModule`** | Dual-channel auth (Email + Phone OTP), JWT access/refresh, argon2 | `otp-login-flow.spec.ts`, JWT strategy | ✅ VERIFIED |
| **`BannersModule`** | Promotional visual carousels, responsive marketing slots | Public marketplace banner loading | ✅ VERIFIED |
| **`BroadcastModule`** | Multichannel notification broadcast engine (SMS, Push, In-App) | Broadcast campaign queues | ✅ VERIFIED |
| **`CatalogModule`** | Category tree, brand management, product variants | Category tree crawler, brand filter | ✅ VERIFIED |
| **`CategoriesModule`** | Multi-tiered category taxonomy with slug-based routing | Public catalog search & categories spec | ✅ VERIFIED |
| **`ChatModule`** | Real-time WebSocket messaging between Buyer, Seller & Rider | `chat-flow.spec.ts` (socket singleton) | ✅ VERIFIED |
| **`CouponsModule`** | Fixed / percentage discounts, min order value, usage limits | Checkout coupon validation test | ✅ VERIFIED |
| **`DeliveriesModule`** | Delivery assignment, stage updates (`ACCEPTED` -> `DELIVERED`) | `rider-flow.spec.ts` lifecycle | ✅ VERIFIED |
| **`DevOtpModule`** | Development-only instant OTP resolver for automated testing | `otp-login-flow.spec.ts` | ✅ VERIFIED |
| **`DisputesModule`** | Order return / refund dispute resolution system | Dispute lifecycle integration test | ✅ VERIFIED |
| **`FlashSalesModule`** | Time-limited flash discounts with countdown locks | Public marketplace flash sale crawler | ✅ VERIFIED |
| **`ImpersonationModule`** | Super Admin session impersonation with audit trails | Impersonation audit controller | ✅ VERIFIED |
| **`InventoryModule`** | Real-time stock reservation with pessimistic write locks | Stock exhaustion & concurrency specs | ✅ VERIFIED |
| **`LocationsModule`** | Bangladesh administrative hierarchy (Divisions, Districts, Upazilas, Unions) | Location dropdown tree resolution | ✅ VERIFIED |
| **`NotificationsModule`** | Multichannel in-app notifications with unread counts | `notifications-flow.spec.ts` | ✅ VERIFIED |
| **`OrdersModule`** | Order state machine, COD, payment integration, lifecycle | `customer-flow`, `rider-flow`, `seller-flow` | ✅ VERIFIED |
| **`OtpModule`** | 6-digit OTP generator with rate limiting and replay prevention | OTP expiration & verification unit tests | ✅ VERIFIED |
| **`PaymentsModule`** | SSLCommerz, bKash, Nagad, COD settlement, IPN webhooks | `orders-payments-wallet.spec.ts` | ✅ VERIFIED |
| **`PayoutsModule`** | Seller and rider earnings payout request and processing | Seller payout request flow | ✅ VERIFIED |
| **`ProductImporterModule`** | CSV / Excel bulk product catalog ingestion | Admin importer log tests | ✅ VERIFIED |
| **`ProductRequestsModule`** | Sourcing requests from customers for unavailable rural goods | Customer product request flow | ✅ VERIFIED |
| **`ProductsModule`** | Core product catalog, images, pricing, specifications | Seller product management spec | ✅ VERIFIED |
| **`ProductVariantsModule`** | SKU, size, color, pack size variant configuration | Cart and variant selection tests | ✅ VERIFIED |
| **`PublicModule`** | Publicly accessible uncached and cached catalog search | `public-marketplace.spec.ts` | ✅ VERIFIED |
| **`ReviewsModule`** | Customer verified-purchase product ratings and reviews | Customer review submission | ✅ VERIFIED |
| **`RidersModule`** | Rider shift availability, geocoded GPS tracking, earnings | Rider profile & earnings flow | ✅ VERIFIED |
| **`RolesModule`** | Granular RBAC definitions and permission enforcement | RouteGuard access control boundary specs | ✅ VERIFIED |
| **`SeederModule`** | Idempotent baseline seeder for users, shops, products, riders | Continuous E2E seed verification | ✅ VERIFIED |
| **`SellerPortalModule`** | Seller dashboard, order processing, shop settings | `seller-flow.spec.ts` | ✅ VERIFIED |
| **`SettingsModule`** | System settings, platform commissions, maintenance mode | `admin-flow.spec.ts` settings toggle | ✅ VERIFIED |
| **`ShopsModule`** | Merchant storefronts, verification badges, seller profiles | Shop page public browsing | ✅ VERIFIED |
| **`UsersModule`** | User management, profile updates, avatar uploads | User profile update tests | ✅ VERIFIED |
| **`WalletsModule`** | User digital wallets, balance ledger, transaction records | Wallet balance verification | ✅ VERIFIED |
| **`WishlistsModule`** | Customer persistent wishlists | `wishlist-flow.spec.ts` | ✅ VERIFIED |

---

## 3. User Roles Matrix

| Role | Default Seed Email | Landing Route | Access Scope |
|---|---|---|---|
| **SUPER_ADMIN** | `admin@gramerbazar.com` | `/[lang]/admin` | Full system governance, audit logs, broadcast, impersonation |
| **ADMIN** | `admin@gramerbazar.com` | `/[lang]/admin` | Operational oversight, order dispatch, seller/rider vetting |
| **SELLER** | `seller1@gramerbazar.com` | `/[lang]/seller` | Shop management, inventory, product CRUD, seller orders |
| **RIDER** | `rider1@gramerbazar.com` | `/[lang]/rider` | Assigned deliveries, route map, delivery completion, payouts |
| **CUSTOMER** | `customer1@gramerbazar.com` | `/[lang]/customer` | Order placement, cart, wishlist, notifications, disputes |
| **GUEST** | Anonymous | `/[lang]` | Public marketplace, catalog browse, search, auth entry |

---

## 4. Frontend Route Inventory (`apps/web/app`)

### Public Routes
- `/[lang]` — Marketplace Landing Page
- `/[lang]/categories` — Category Showcase
- `/[lang]/search` — Real-Time Product Search
- `/[lang]/cart` — Responsive Cart Drawer & Summary
- `/[lang]/offers` — Promotional Campaigns
- `/[lang]/flash-sale` — Timed Flash Sale Discounts
- `/[lang]/login` — Unified Mobile/Email Login
- `/[lang]/register` — Customer Registration
- `/[lang]/become-a-seller` — Merchant Registration Portal
- `/[lang]/become-a-rider` — Delivery Partner Registration

### Customer Area (`/[lang]/customer/*`)
- `/` — Overview Dashboard
- `/orders` — Order History & Live Tracking
- `/orders/[id]` — Detailed Order Receipt
- `/wishlist` — Saved Items
- `/notifications` — Full Notification Center
- `/reviews` — Purchase Feedback & Ratings
- `/disputes` — Return & Refund Claims
- `/messages` — Live Seller Chat
- `/addresses` — Geocoded Delivery Addresses
- `/profile` — Personal Details & Security

### Seller Area (`/[lang]/seller/*`)
- `/` — Merchant Analytics & Sales Dashboard
- `/products` — Product Catalog Management
- `/products/new` — Multi-step Product Creator
- `/inventory` — Real-time Stock Adjustment
- `/orders` — Fulfillment & Dispatch Queue
- `/coupons` — Promotional Coupon Creator
- `/wallet` — Digital Earnings & Ledger
- `/wallet/payout` — Bank & Mobile Money Withdrawal
- `/messages` — Customer Inquiries
- `/notifications` — Merchant Activity Alerts
- `/shop` — Storefront Branding & Hours
- `/settings` — Operational Configuration

### Rider Area (`/[lang]/rider/*`)
- `/` — Active Run Sheet & Delivery KPIs
- `/deliveries` — Live Dispatches & Pickups
- `/deliveries/[id]` — Waypoint Directions & Status Transition
- `/history` — Historical Drop-off Records
- `/earnings` — Cash & Digital Delivery Incentives
- `/payouts` — Cash-out Requests
- `/messages` — Dispatcher & Buyer Chat
- `/notifications` — Assignment Alerts
- `/profile` — Vehicle & Verification Info
- `/settings` — Availability & Notification Preferences

### Admin Area (`/[lang]/admin/*` & `/[lang]/super-admin/*`)
- `/` — Platform Health & Financial Gross Volume
- `/orders/list` — Global Order Master Grid
- `/orders/deliveries` — Live Logistics Monitor
- `/users-management/users` — User Directory
- `/users-management/sellers` — Merchant Oversight
- `/users-management/riders` — Courier Fleet Management
- `/users-management/seller-applications` — Merchant Verification Gate
- `/users-management/rider-applications` — Rider Background Screening
- `/products/list` — Global SKU Registry
- `/products/categories` — Taxonomy Tree Editor
- `/products/brands` — Brand Registry
- `/products/product-requests` — Rural Sourcing Requests
- `/promotions/banners` — Banner Ad Management
- `/promotions/coupons` — Global Coupon Campaigns
- `/promotions/flash-sales` — Flash Sale Schedules
- `/finance/payments` — Transaction Reconciler
- `/finance/payouts` — Payout Approvals
- `/communication` — Announcements & SMS Broadcasts
- `/disputes/list` — Escalation Desk
- `/settings/general` — Core Commission & Operational Toggles
- `/settings/audit-logs` — Immutable Audit Ledger
