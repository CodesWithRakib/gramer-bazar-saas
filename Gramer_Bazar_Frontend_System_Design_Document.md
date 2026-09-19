# Gramer Bazar — Frontend System Design & Development Documentation

**Project:** Gramer Bazar  
**Initial Market:** Khanসামা Upazila, Dinajpur, Bangladesh  
**Frontend:** Next.js + TypeScript  
**Backend:** NestJS + TypeORM + PostgreSQL  
**Languages:** Bangla (default) + English  
**Architecture:** Mobile-first, PWA-ready, API-driven modular frontend

---

## 1. Frontend Vision

Gramer Bazar হবে Khanসামা-কেন্দ্রিক একটি hyperlocal marketplace যেখানে customer:

1. Location/address নির্বাচন করবে
2. Product browse/search করবে
3. Product details দেখবে
4. Cart-এ product রাখবে
5. Checkout করবে
6. COD order করবে
7. Order status/track করবে
8. Delivered product review করবে
9. না পাওয়া product-এর জন্য Product Request পাঠাবে

Platform-এর অন্য clients:

- Customer Web/PWA
- Admin Panel
- Seller Dashboard
- Rider Dashboard

Frontend-এর লক্ষ্য:

- Mobile-first UX
- Fast page load
- Bangla-first experience
- English support
- RTL/LTR-ready architecture
- Reusable components
- Strict API typing
- Permission-based UI
- SEO-friendly public storefront
- Production-grade loading/error/empty states

---

# 2. Recommended Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui |
| State | Redux Toolkit |
| Server/API State | RTK Query |
| Forms | React Hook Form |
| Validation | Zod |
| i18n | next-intl |
| Icons | Lucide React |
| Tables | TanStack Table |
| Charts | Recharts |
| PWA | Web App Manifest + Service Worker strategy |
| Image | next/image |
| Error Monitoring | Sentry |
| Testing | Vitest/Jest + React Testing Library + Playwright |
| API Docs | Backend Swagger/OpenAPI |

---

# 3. Application Structure

Recommended approach:

```text
apps/
  customer/
  admin/
  seller/
  rider/

packages/
  ui/
  types/
  config/
  api/
  i18n/
  utils/
```

For a single Next.js repository, use:

```text
src/
  app/
  components/
  features/
  lib/
  store/
  hooks/
  types/
  config/
  i18n/
```

If the project is initially small, a single Next.js app with route groups is recommended. Separate applications can be introduced later if team/scale requires it.

---

# 4. Next.js Route Architecture

Recommended App Router structure:

```text
app/
├── [locale]/
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── categories/
│   │   ├── products/
│   │   ├── search/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── wishlist/
│   │   ├── profile/
│   │   └── product-request/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── verify-otp/
│   │   └── register/
│   │
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── sellers/
│   │   ├── orders/
│   │   ├── riders/
│   │   ├── product-requests/
│   │   ├── customers/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── seller/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── orders/
│   │   ├── shop/
│   │   └── reports/
│   │
│   └── rider/
│       ├── dashboard/
│       ├── deliveries/
│       ├── delivery/[id]/
│       └── profile/
│
└── api/
```

---

# 5. Public Customer Pages

## Home

Route:

```text
/bn
/en
```

Sections:

- Location selector
- Search bar
- Categories
- Promotional banner
- Featured products
- Popular products
- Trending products
- Fresh products
- Nearby/local products
- Recommended products
- Product Request CTA
- Footer

Mobile priority:

```text
Location
↓
Search
↓
Categories
↓
Promotions
↓
Products
↓
Product Request
```

---

# 6. Category Pages

Example:

```text
/bn/categories/grocery
/bn/categories/fashion
/bn/categories/electronics
```

Features:

- Category title
- Subcategories
- Product grid
- Sort
- Price filter
- Brand filter
- Availability
- Rating
- Seller/shop filter
- Pagination/infinite loading

URL query example:

```text
/products?category=grocery
/products?category=grocery&minPrice=50&maxPrice=500
/products?category=grocery&sort=popular
```

Filters must be reflected in URL so pages can be shared/bookmarked.

---

# 7. Product Search

Search must support:

- Bangla
- English
- Banglish
- SKU
- Category
- Brand

Example:

```text
/search?q=আলু
/search?q=potato
/search?q=alu
```

Search UX:

```text
User types
↓
Debounced request
↓
Suggestions
↓
Search results
```

Do not call API on every keystroke.

Recommended debounce:

```text
300–500ms
```

---

# 8. Product Details

Route:

```text
/products/[slug]
```

Show:

- Product images
- Product name BN/EN
- Price
- Discount
- Variants
- Unit
- Stock status
- Seller/shop
- Description
- Specifications
- Reviews
- Related products
- Add to cart
- Buy now
- Wishlist

Important:

Frontend must never calculate the final trusted order amount.

Backend checkout API is authoritative.

---

# 9. Product Card

Reusable component:

```text
ProductCard
```

Props conceptually:

```ts
product
variant
price
discount
stock
seller
onAddToCart
```

States:

```text
Available
Low Stock
Out of Stock
Loading
Unavailable
```

Do not duplicate product-card logic across pages.

---

# 10. Cart

Route:

```text
/cart
```

Features:

- Product list
- Quantity increment/decrement
- Remove
- Seller information
- Stock validation
- Price validation
- Subtotal
- Delivery estimate
- Checkout CTA

Before checkout:

```text
Cart
↓
Validate cart
↓
Show updated prices/stock
↓
Checkout
```

If price changed:

```text
"The price of X has changed."
```

If unavailable:

```text
"X is currently unavailable."
```

---

# 11. Checkout

Route:

```text
/checkout
```

Steps:

```text
Address
↓
Order summary
↓
Delivery fee
↓
Payment method
↓
Place order
```

MVP payment:

```text
Cash on Delivery
```

Future:

```text
bKash
Nagad
Card
```

Frontend payment architecture must remain gateway-independent.

---

# 12. Address Management

Customer can:

- Add address
- Edit address
- Delete address
- Set default address
- Select address during checkout

Fields:

```text
Recipient name
Phone
Location
Union/Area/Village
Address line
Landmark
Latitude
Longitude
Default
```

Location hierarchy:

```text
District
↓
Upazila
↓
Union
↓
Area/Village
```

Do not hardcode Khanসামা-specific IDs in frontend.

---

# 13. Order Pages

Routes:

```text
/orders
/orders/[id]
```

Order list:

- Order number
- Date
- Total
- Status
- Item count

Order details:

- Products
- Quantity
- Price snapshot
- Address snapshot
- Payment status
- Delivery status
- Timeline
- Cancel button when allowed
- Reorder button

Status timeline:

```text
Pending
↓
Confirmed
↓
Processing
↓
Ready for Pickup
↓
Picked Up
↓
Out for Delivery
↓
Delivered
```

---

# 14. Product Request — Core USP

Route:

```text
/product-request
```

Customer can submit:

```text
Product name
Description
Category
Expected quantity
Reference image
Optional note
```

Flow:

```text
Customer Request
↓
Pending
↓
Reviewing
↓
Searching
↓
Found
↓
Product Added
↓
Customer Notified
↓
Closed
```

Customer UI:

```text
My Requests
Request Details
Request Status
Admin response/note
Product link when available
```

This feature should be highly visible on:

- Home
- Search empty state
- Category empty state
- Product not found page

Example:

```text
Didn't find what you're looking for?
Request this product
```

---

# 15. Wishlist

Routes:

```text
/wishlist
```

Features:

- Add/remove product
- Wishlist count
- Move to cart
- Out-of-stock indication

Use RTK Query mutation for toggle.

---

# 16. Reviews

Customer can review only eligible purchased products.

UI:

```text
Rating: 1–5
Comment
Images (future)
```

Show:

- Average rating
- Total reviews
- Rating distribution
- Review list

Backend must enforce purchase eligibility.

Frontend should not rely only on UI restrictions.

---

# 17. Authentication

Customer authentication:

```text
Phone
↓
Send OTP
↓
Verify OTP
↓
JWT access/refresh
```

Pages:

```text
/login
/verify-otp
```

Admin/Seller can use:

```text
Email/phone + password
```

Future:

```text
2FA
```

Token strategy should follow the backend's chosen secure storage approach. Avoid exposing long-lived sensitive tokens to client-side JavaScript when an HTTP-only cookie architecture is available.

---

# 18. Redux Architecture

Use Redux Toolkit only for true client/application state.

Recommended:

```text
store/
├── index.ts
├── provider.tsx
└── slices/
    ├── authSlice.ts
    ├── cartSlice.ts
    ├── uiSlice.ts
    └── locationSlice.ts
```

Do NOT put every API response into Redux manually.

API/server state:

```text
RTK Query
```

Client state:

```text
Redux Toolkit
```

Form state:

```text
React Hook Form
```

---

# 19. RTK Query API Architecture

Recommended:

```text
store/
└── api/
    ├── baseApi.ts
    ├── authApi.ts
    ├── productApi.ts
    ├── categoryApi.ts
    ├── cartApi.ts
    ├── orderApi.ts
    ├── addressApi.ts
    ├── wishlistApi.ts
    ├── reviewApi.ts
    ├── productRequestApi.ts
    ├── notificationApi.ts
    └── adminApi.ts
```

Base API:

```ts
baseApi.injectEndpoints(...)
```

Use tags:

```text
Products
Categories
Cart
Orders
Wishlist
Reviews
ProductRequests
Notifications
```

Example invalidation:

```text
addToCart
→ invalidate Cart
```

```text
updateProduct
→ invalidate Products
```

```text
createOrder
→ invalidate Cart + Orders
```

---

# 20. API Client Flow

```text
UI
 ↓
Feature Hook
 ↓
RTK Query
 ↓
baseApi
 ↓
HTTP
 ↓
NestJS API
 ↓
PostgreSQL
```

Never let UI components directly contain raw fetch/axios logic.

Bad:

```text
ProductPage → fetch(...)
```

Better:

```text
ProductPage
→ useGetProductQuery()
→ productApi
→ baseApi
```

---

# 21. API Endpoint Mapping

Base:

```text
/api/v1
```

Customer frontend mapping:

| Feature | Endpoint |
|---|---|
| Send OTP | POST /auth/send-otp |
| Verify OTP | POST /auth/verify-otp |
| Current user | GET /auth/me |
| Update profile | PATCH /users/me |
| Addresses | /users/me/addresses |
| Locations | /locations |
| Categories | /categories |
| Products | /products |
| Product detail | /products/:id |
| Search | /products?search= |
| Cart | /cart |
| Cart validation | /cart/validate |
| Wishlist | /wishlist |
| Checkout preview | POST /checkout/preview |
| Create order | POST /orders |
| Orders | GET /orders |
| Order detail | GET /orders/:id |
| Cancel order | POST /orders/:id/cancel |
| Product request | POST /product-requests |
| Product requests | GET /product-requests |
| Reviews | /reviews |
| Notifications | /notifications |

Admin/Seller/Rider use corresponding protected endpoints.

---

# 22. Standard API Response Handling

Success:

```ts
{
  success: true,
  data: {},
  message: "Success"
}
```

Error:

```ts
{
  success: false,
  message: "Validation failed",
  errorCode: "VALIDATION_ERROR",
  errors: {}
}
```

Frontend should have centralized error handling.

Map common errors:

```text
401 → Refresh/login
403 → Permission denied
404 → Not found
409 → Conflict
422 → Validation
429 → Too many requests
500 → Server error
```

---

# 23. Loading States

Every async UI should have an intentional loading state.

Examples:

```text
Page skeleton
Product card skeleton
Table skeleton
Button spinner
Modal loading
Checkout loading
```

Avoid:

```text
Loading...
```

everywhere.

Use skeleton components for content-heavy areas.

---

# 24. Empty States

Examples:

Cart:

```text
Your cart is empty.
Start shopping
```

Search:

```text
No products found.
Try another search or request a product.
```

Wishlist:

```text
No saved products yet.
```

Orders:

```text
You haven't placed any orders yet.
```

Product requests:

```text
No requests yet.
```

---

# 25. Error UX

Network failure:

```text
Something went wrong.
Please try again.
```

Provide:

```text
Retry
```

Do not expose:

```text
AxiosError
Internal server error stack
SQL errors
```

---

# 26. Internationalization

Languages:

```text
bn
en
```

Default:

```text
bn
```

Translation structure:

```text
messages/
├── bn.json
└── en.json
```

Example:

```json
{
  "common": {
    "addToCart": "কার্টে যোগ করুন",
    "buyNow": "এখনই কিনুন"
  }
}
```

Never hardcode user-facing strings inside reusable components.

---

# 27. RTL/LTR

Although Bangla and English are LTR, architecture should remain direction-aware for future Arabic expansion.

Use:

```text
dir="ltr"
```

and future:

```text
dir="rtl"
```

Avoid CSS that assumes a physical left/right direction when logical properties work better.

Prefer:

```css
ms-*
me-*
ps-*
pe-*
start-*
end-*
```

over hardcoded left/right where applicable.

---

# 28. Design System

Create reusable components:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Dialog
│   ├── Drawer
│   ├── Sheet
│   ├── Badge
│   ├── Tabs
│   └── Skeleton
│
├── common/
│   ├── EmptyState
│   ├── ErrorState
│   ├── LoadingState
│   ├── Pagination
│   └── ConfirmDialog
│
├── product/
│   ├── ProductCard
│   ├── ProductGrid
│   ├── ProductGallery
│   ├── ProductPrice
│   ├── ProductVariantSelector
│   └── ProductRating
│
├── cart/
├── checkout/
├── order/
└── navigation/
```

---

# 29. Feature-Based Architecture

Instead of putting everything into generic folders:

```text
features/
├── auth/
├── products/
├── categories/
├── cart/
├── checkout/
├── orders/
├── wishlist/
├── reviews/
├── product-request/
├── notifications/
├── address/
└── location/
```

Each feature can contain:

```text
products/
├── components/
├── hooks/
├── schemas/
├── types.ts
├── productApi.ts
└── utils.ts
```

This keeps features isolated and scalable.

---

# 30. Admin Panel

Admin dashboard route:

```text
/admin/dashboard
```

Dashboard widgets:

- Total orders
- Revenue
- Pending orders
- Delivered orders
- Customers
- Sellers
- Riders
- Product requests
- Top products
- Top categories
- Demand trends

Admin modules:

```text
Products
Categories
Brands
Sellers
Customers
Orders
Riders
Deliveries
Product Requests
Coupons
Promotions
Reviews
Notifications
Reports
Settings
Audit Logs
```

---

# 31. Admin Product Management

Pages:

```text
/admin/products
/admin/products/create
/admin/products/[id]
```

Admin can:

- Create product
- Edit product
- Upload images
- Manage variants
- Assign category
- Assign brand
- Activate/deactivate
- Approve seller products
- Archive

Forms:

```text
React Hook Form
+
Zod
```

---

# 32. Seller Dashboard

Seller pages:

```text
/seller/dashboard
/seller/products
/seller/products/create
/seller/inventory
/seller/orders
/seller/shop
/seller/reports
```

Seller can:

- Manage shop
- Add product offers
- Update prices
- Update inventory
- View orders
- Update allowed order status
- View sales reports

Seller must never access another seller's data.

Backend authorization remains authoritative.

---

# 33. Rider Dashboard

Rider pages:

```text
/rider/dashboard
/rider/deliveries
/rider/delivery/[id]
```

Dashboard:

```text
Assigned
Accepted
Picked Up
Out for Delivery
Delivered
Failed
```

Delivery detail:

- Customer
- Phone
- Address
- Order
- Amount/COD
- Status
- Map/navigation link
- Delivery confirmation

Future:

```text
GPS live tracking
```

---

# 34. Permission-Based UI

Do not hardcode only role checks.

Prefer permission checks:

```text
products.create
products.update
products.delete
orders.update
orders.assign_rider
reports.view
users.manage
```

Example:

```tsx
<Can permission="products.create">
  <CreateProductButton />
</Can>
```

The backend must still enforce the same permission.

---

# 35. Middleware / Route Protection

Protected routes:

```text
/customer
/admin
/seller
/rider
```

Frontend route protection should:

1. Check authentication
2. Check user role/permission
3. Redirect unauthorized users

But frontend protection is UX/security boundary only.

Actual authorization must happen in NestJS.

---

# 36. SEO

Public storefront should be SEO-friendly.

Optimize:

```text
Home
Category
Product
Shop
Local product pages
```

Use:

```text
generateMetadata()
```

Metadata:

- Title
- Description
- Open Graph
- Twitter metadata
- Canonical URL
- Product structured data

Product structured data can include:

```text
name
image
description
price
availability
rating
```

Do not expose private/admin pages to search engines.

---

# 37. Image Strategy

Use:

```text
next/image
```

Do not ship original 5–10MB images to users.

Image pipeline:

```text
Upload
↓
Resize/compress
↓
CDN/object storage
↓
Next/image
```

Recommended storage:

```text
Cloudinary
```

or:

```text
S3-compatible storage
```

Frontend should store only URLs/metadata returned by backend.

---

# 38. Performance Strategy

Target:

```text
Fast mobile experience
```

Rules:

- Server Components by default
- Client Components only when interaction/state requires them
- Dynamic imports for heavy components
- Image optimization
- Lazy loading
- Pagination
- Debounced search
- Avoid unnecessary Redux state
- Avoid huge JS bundles
- Use URL state for filters
- Cache public data appropriately
- Avoid repeated API requests

Important:

Do not make the whole app:

```text
"use client"
```

Prefer small client boundaries.

---

# 39. PWA / Mobile App-Like Experience

Customer storefront should be PWA-ready.

Provide:

```text
manifest.json
icons
theme metadata
installable experience
```

Mobile UX:

- Bottom navigation
- Sticky cart CTA
- Large touch targets
- Mobile filter drawer
- Mobile checkout
- Fast skeletons
- Pull-friendly layouts
- Minimal popups

Bottom navigation:

```text
Home
Categories
Search
Cart
Account
```

Service worker/offline caching should be introduced carefully.

Do NOT cache sensitive checkout/order data blindly.

---

# 40. Responsive Breakpoints

Design mobile first.

Suggested:

```text
Mobile: < 640px
Tablet: 640–1024px
Desktop: > 1024px
```

Customer product grid:

```text
Mobile: 2 columns
Tablet: 3 columns
Desktop: 4–6 columns
```

Actual layout should follow UX testing rather than rigid numbers.

---

# 41. Search & Filter UX

Mobile:

```text
Search
↓
Filter button
↓
Bottom sheet
```

Desktop:

```text
Sidebar filters
+
Product grid
```

Filter state should live in URL:

```text
?category=
?brand=
?minPrice=
?maxPrice=
?sort=
?rating=
?page=
```

Benefits:

- Shareable
- Bookmarkable
- Browser back/forward support
- SEO-friendly where appropriate

---

# 42. Notifications

Notification center:

```text
/notifications
```

Types:

```text
Order confirmed
Order shipped
Order delivered
Product request update
Promotion
System notification
```

MVP:

```text
In-app notifications
```

Future:

```text
SMS
Push notification
Email
```

Unread count can be fetched/refreshed efficiently.

---

# 43. Checkout Safety

Frontend should send:

```text
addressId
cart/items reference
payment method
coupon
```

Backend calculates:

```text
Product price
Discount
Stock
Delivery fee
Tax if applicable
Grand total
```

Never trust:

```text
frontendTotal
frontendPrice
frontendDiscount
```

Frontend displays backend-confirmed values.

---

# 44. Order Creation UX

Flow:

```text
Place Order
↓
Disable button
↓
Show loading
↓
POST /orders
↓
Success
→ /orders/[id]
```

Prevent double submission.

For critical order/payment operations, backend should support idempotency.

Frontend can send an idempotency key where supported.

---

# 45. Form Architecture

Use:

```text
React Hook Form
+
Zod
```

Example structure:

```text
schemas/
├── login.schema.ts
├── address.schema.ts
├── product.schema.ts
├── checkout.schema.ts
└── product-request.schema.ts
```

Validation should exist on both:

```text
Frontend
+
Backend
```

Frontend validation improves UX.

Backend validation protects the system.

---

# 46. Error Boundary

Use Next.js error boundaries:

```text
error.tsx
global-error.tsx
not-found.tsx
loading.tsx
```

Feature-level errors should have:

```text
Retry
```

Production monitoring:

```text
Sentry
```

Include useful context:

```text
route
requestId
userId
errorCode
```

Do not send secrets/tokens/passwords to Sentry.

---

# 47. Analytics

Track business events:

```text
VIEW_PRODUCT
SEARCH_PRODUCT
ADD_TO_CART
REMOVE_FROM_CART
WISHLIST
CHECKOUT_STARTED
ORDER_CREATED
ORDER_DELIVERED
PRODUCT_REQUEST_CREATED
REVIEW_SUBMITTED
```

These events help identify demand.

Do not track sensitive personal information unnecessarily.

---

# 48. Demand Analytics UX

Admin:

```text
Reports
→ Product Demand
```

Show:

- Most searched
- Most viewed
- Most requested
- Most added to cart
- Most purchased
- Products with high requests but low availability

This directly supports the Gramer Bazar sourcing strategy.

Example:

```text
Searches: 1,200
Requests: 150
Purchases: 20

→ Candidate product to source
```

---

# 49. Security

Frontend:

- HTTPS
- Secure authentication flow
- No secrets in client bundle
- Environment variables separated by public/private
- Input validation
- XSS-safe rendering
- Avoid dangerouslySetInnerHTML unless sanitized
- CSP where practical
- Do not expose admin APIs publicly through UI
- Do not store sensitive tokens in localStorage unless architecture explicitly requires it
- Avoid logging personal/payment information

---

# 50. Environment Variables

Example:

```text
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_STORAGE_URL=
NEXT_PUBLIC_SENTRY_DSN=
```

Never expose:

```text
DATABASE_URL
JWT_SECRET
PRIVATE_API_KEY
PAYMENT_SECRET
```

with `NEXT_PUBLIC_`.

---

# 51. Caching Strategy

Good candidates:

```text
Categories
Brands
Public settings
Featured products
Popular products
```

Be careful with:

```text
Stock
Cart
Checkout
Order status
Payment
```

Stale stock/order information can create serious UX problems.

RTK Query cache should be configured with endpoint-appropriate lifetimes.

---

# 52. Component Rules

A component should have one clear responsibility.

Bad:

```text
HomePage
→ 1500 lines
→ API calls
→ business logic
→ forms
→ UI
```

Better:

```text
HomePage
├── Hero
├── CategorySection
├── FeaturedProducts
├── PopularProducts
├── ProductRequestCTA
└── Footer
```

Business logic should live in:

```text
hooks
services
feature utilities
API layer
```

---

# 53. Naming Conventions

Components:

```text
PascalCase
```

Hooks:

```text
useSomething
```

Files:

```text
product-card.tsx
product-api.ts
```

Types:

```text
Product
ProductVariant
Order
OrderItem
```

Constants:

```text
ORDER_STATUS
PAYMENT_METHOD
```

---

# 54. Type Safety

Frontend types should match backend OpenAPI contract.

Recommended future workflow:

```text
NestJS Swagger
↓
OpenAPI
↓
Generated TypeScript types/API
↓
Frontend
```

Avoid manually duplicating dozens of API interfaces.

Potential tools:

```text
Orval
```

or another OpenAPI code generator.

---

# 55. Shared API Contract

Recommended generated types:

```text
Product
Category
Brand
Seller
Shop
Inventory
Cart
CartItem
Order
OrderItem
Payment
Delivery
Review
ProductRequest
Notification
```

Enums should be shared/generated where possible.

---

# 56. Customer UX Flow

Complete happy path:

```text
Home
↓
Select location
↓
Search/browse category
↓
Product details
↓
Add to cart
↓
Cart
↓
Validate
↓
Checkout
↓
Select address
↓
COD
↓
Place order
↓
Order confirmation
↓
Order tracking
↓
Delivered
↓
Review
```

---

# 57. Product Request UX Flow

```text
Search
↓
No result
↓
"Can't find your product?"
↓
Request Product
↓
Submit
↓
Request tracking
↓
Admin finds/sources
↓
Product added
↓
Customer notified
↓
Customer orders
```

This should be treated as a first-class feature, not a hidden admin function.

---

# 58. Seller Order Flow

```text
New Order
↓
Seller sees order
↓
Accept/process
↓
Prepare items
↓
Ready for pickup
↓
Rider pickup
```

Frontend must display only status transitions permitted by backend.

---

# 59. Rider Flow

```text
Assigned
↓
Accept
↓
Pickup
↓
Out for Delivery
↓
Delivered
```

Failure:

```text
Out for Delivery
↓
Failed
```

Rider should see:

- Order number
- Customer name
- Phone
- Delivery address
- COD amount
- Items
- Delivery instructions

---

# 60. Admin Order Flow

Admin can:

```text
View
Filter
Search
Confirm
Process
Assign Rider
Reassign Rider
Update allowed status
Cancel
View status history
```

Filters:

```text
Status
Date
Seller
Rider
Payment
Customer
Order number
```

---

# 61. Admin Tables

Use TanStack Table where complex table behavior is needed.

Features:

- Server-side pagination
- Search
- Sorting
- Filtering
- Column visibility
- Bulk actions where safe
- Row actions
- Responsive mobile view

Do not load thousands of rows into browser unnecessarily.

---

# 62. Admin Reports

Reports:

```text
Sales
Orders
Products
Sellers
Customers
Delivery
Product Demand
```

Filters:

```text
Date range
Category
Seller
Product
Location
```

Charts:

```text
Revenue
Orders
Top products
Top categories
Demand
```

Use server aggregation for large datasets.

---

# 63. Delivery Zone UI

Admin can manage:

```text
Zone
Location
Delivery fee
Minimum order
Availability
```

Customer checkout should receive the applicable delivery fee from backend.

Do not hardcode delivery fees in frontend.

---

# 64. Coupon UI

Customer:

```text
Enter coupon
↓
Apply
↓
Validate
↓
Show discount
```

Admin:

```text
Create
Edit
Activate
Deactivate
Usage report
```

Backend remains authoritative for coupon validity.

---

# 65. Accessibility

Must support:

- Keyboard navigation
- Focus states
- Labels
- Semantic HTML
- Screen-reader-friendly buttons
- Accessible dialogs
- Proper contrast
- Touch-friendly controls

Avoid icon-only buttons without accessible labels.

---

# 66. Testing Strategy

## Unit

Test:

```text
Price display
formatters
validators
utilities
business helpers
```

## Component

Test:

```text
ProductCard
CartItem
CheckoutForm
OrderStatus
```

## Integration

Test:

```text
API → component → UI state
```

## E2E

Critical flow:

```text
Login
→ Browse
→ Add cart
→ Checkout
→ Create order
→ Track order
```

Also:

```text
Product Request
Seller processing
Rider delivery
Review
```

---

# 67. Suggested E2E Test Scenarios

### Customer

1. Login with OTP
2. Browse category
3. Search Bangla product
4. Search English product
5. Add product
6. Change quantity
7. Remove product
8. Checkout
9. Add address
10. Place COD order
11. View order
12. Cancel eligible order
13. Submit product request
14. Submit review

### Seller

1. Login
2. View dashboard
3. Create seller product
4. Update inventory
5. View order
6. Update order status

### Rider

1. Login
2. View assigned delivery
3. Accept
4. Pickup
5. Out for delivery
6. Delivered

### Admin

1. Login
2. Manage product
3. Approve seller
4. Manage order
5. Assign rider
6. Review product request
7. Create product from request
8. View demand report

---

# 68. Frontend Folder Structure

Recommended single-app production structure:

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── (store)/
│   │   ├── (auth)/
│   │   ├── admin/
│   │   ├── seller/
│   │   └── rider/
│   └── globals.css
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── layout/
│   └── navigation/
│
├── features/
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── addresses/
│   ├── wishlist/
│   ├── reviews/
│   ├── product-request/
│   ├── notifications/
│   ├── admin/
│   ├── seller/
│   └── rider/
│
├── store/
│   ├── index.ts
│   ├── provider.tsx
│   ├── api/
│   └── slices/
│
├── hooks/
├── lib/
│   ├── auth/
│   ├── api/
│   ├── utils/
│   └── constants/
│
├── schemas/
├── types/
├── config/
└── i18n/
```

---

# 69. Development Order

Do not build everything simultaneously.

## Phase 1 — Foundation

```text
Next.js
TypeScript
Tailwind
shadcn
next-intl
Redux Toolkit
RTK Query
RHF
Zod
Sentry
```

Then:

```text
Layout
Theme
i18n
API client
Auth foundation
```

## Phase 2 — Customer Core

```text
Home
Categories
Products
Search
Product Details
Cart
Address
Checkout
Orders
```

## Phase 3 — Product Request

```text
Request form
Request list
Request details
Empty-search CTA
Admin request management
```

## Phase 4 — Seller

```text
Seller dashboard
Products
Inventory
Orders
Shop
Reports
```

## Phase 5 — Rider

```text
Dashboard
Deliveries
Delivery details
Status update
```

## Phase 6 — Admin

```text
Dashboard
Products
Categories
Sellers
Orders
Riders
Customers
Requests
Reviews
Coupons
Reports
Settings
```

## Phase 7 — Production Hardening

```text
SEO
PWA
Performance
Accessibility
Analytics
E2E
Sentry
Security review
```

---

# 70. MVP Priority

Must have:

```text
Authentication
Location
Categories
Products
Search
Product details
Cart
Address
Checkout
COD
Orders
Seller inventory
Rider delivery
Product Request
Admin product/order management
```

Can come later:

```text
Wishlist
Reviews
Coupons
Promotions
Push notification
Online payment
Live rider tracking
Advanced recommendation
Meilisearch/OpenSearch
Redis
Offline mode
```

However, Wishlist/Reviews/Coupons can be brought into MVP if implementation capacity allows.

---

# 71. Performance Targets

Initial targets:

```text
Fast mobile first load
Low JavaScript on public pages
Optimized images
Good Core Web Vitals
Minimal layout shift
Responsive interaction
```

Measure with:

```text
Lighthouse
PageSpeed Insights
Real-user monitoring
Sentry performance
```

Do not optimize based only on assumptions; measure real device/network performance.

---

# 72. Production Architecture

```text
User
 ↓
CDN / Edge
 ↓
Next.js
 ↓
RTK Query
 ↓
NestJS API
 ↓
PostgreSQL
```

Supporting services:

```text
Object Storage/CDN
Sentry
SMS provider
Payment gateway
Redis (future)
Queue/BullMQ (future)
Search engine (future)
```

---

# 73. Frontend Deployment

Recommended:

```text
Next.js → Vercel
```

Backend:

```text
NestJS → Docker/VPS/Cloud
```

Database:

```text
PostgreSQL
```

Images:

```text
Cloudinary/S3-compatible storage
```

Monitoring:

```text
Sentry
```

Domain:

```text
gramerbazar.com
```

Use environment-specific configuration for:

```text
development
staging
production
```

---

# 74. Definition of Done

A frontend feature is not complete until:

- UI implemented
- Mobile responsive
- Bangla implemented
- English implemented
- API integrated
- Loading state implemented
- Empty state implemented
- Error state implemented
- Validation implemented
- Permission handled
- Accessibility checked
- URL state handled where applicable
- API errors handled
- Sentry considered
- Unit/component test added where useful
- E2E added for critical flows
- No console errors
- No sensitive data exposed
- Production build passes

---

# 75. Complete Customer Navigation

```text
Home
├── Categories
│   ├── Grocery & Fresh
│   ├── Fish & Meat
│   ├── Eggs & Dairy
│   ├── Medicine & Health
│   ├── Beauty
│   ├── Fashion
│   ├── Baby & Kids
│   ├── Electronics
│   ├── Home & Kitchen
│   ├── Food
│   ├── Agriculture
│   ├── Livestock & Poultry
│   ├── Hardware & Tools
│   ├── Books & Stationery
│   ├── Sports
│   ├── Pet Supplies
│   ├── Gifts
│   ├── Auto & Bike
│   ├── Religious
│   ├── Local & Homemade
│   └── Local Services
│
├── Search
├── Product
├── Cart
├── Checkout
├── Orders
├── Wishlist
├── Product Requests
├── Notifications
└── Account
```

Medicine and other regulated categories must comply with applicable Bangladesh laws, licensing and platform policies.

---

# 76. Final Frontend Architecture

```text
                    GRAMER BAZAR
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Customer        Admin         Seller/Rider
          │              │              │
          └──────────────┼──────────────┘
                         │
                    Next.js App
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Features       Components      State
          │              │              │
          │              │       ┌──────┴──────┐
          │              │       │             │
          │              │     Redux        RTK Query
          │              │       │             │
          └──────────────┼───────┴─────────────┘
                         │
                    NestJS REST API
                         │
                    PostgreSQL
```

---

# 77. Recommended Final Stack

```text
Frontend
├── Next.js
├── TypeScript
├── Tailwind CSS
├── shadcn/ui
├── Redux Toolkit
├── RTK Query
├── React Hook Form
├── Zod
├── next-intl
├── TanStack Table
├── Recharts
├── Sentry
└── Playwright

Backend
├── NestJS
├── TypeORM
├── PostgreSQL
├── JWT/Auth
├── Swagger
├── Redis (future)
├── BullMQ (future)
└── Search Engine (future)
```

---

# 78. Final Implementation Strategy

Build Gramer Bazar as a **mobile-first modular marketplace**, not as a collection of pages.

The core architecture should be:

```text
Feature-based UI
+
Reusable design system
+
RTK Query server state
+
Redux client state
+
Typed API contracts
+
Bangla/English i18n
+
Permission-based UI
+
SEO-ready public pages
+
PWA-ready mobile UX
```

The most important business differentiator remains:

```text
Customer cannot find product
        ↓
Product Request
        ↓
Platform sources product
        ↓
Product added
        ↓
Customer notified
        ↓
Customer orders
```

This turns Gramer Bazar from a normal e-commerce website into a **hyperlocal demand-driven marketplace**.

---

# 79. Frontend + Backend Development Sequence

Use this exact sequence:

```text
1. Project setup
2. Design system
3. i18n
4. API client
5. Authentication
6. Locations
7. Categories
8. Products
9. Search
10. Product details
11. Cart
12. Addresses
13. Checkout
14. Orders
15. Seller
16. Inventory
17. Rider
18. Delivery
19. Product Request
20. Reviews
21. Wishlist
22. Admin
23. Notifications
24. Coupons
25. Reports
26. SEO
27. PWA
28. Analytics
29. Testing
30. Production hardening
```

**Golden rule:** first make the complete customer purchase flow work end-to-end. Then expand Seller → Rider → Admin → Analytics.
