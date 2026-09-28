# API Endpoint Overview

All API endpoints reside under prefix `/api/v1`. Interactive Swagger documentation is hosted at `http://localhost:4000/api/docs`.

## Endpoint Domains

### 1. Authentication (`/api/v1/auth`)
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Password login
- `POST /auth/send-otp` - Dispatch OTP verification code
- `POST /auth/verify-otp` - Verify OTP & login
- `GET /auth/me` - Fetch authenticated user profile
- `POST /auth/refresh` - Refresh JWT access token
- `POST /auth/logout` - Revoke session

### 2. Public Catalog (`/api/v1/public`)
- `GET /public/catalog/search` - Search & filter products (paginated)
- `GET /public/catalog/[slug]` - Retrieve product details by slug
- `GET /public/categories` - Fetch active categories & subcategories
- `GET /public/brands` - Fetch marketplace brands

### 3. Orders (`/api/v1/orders`)
- `POST /orders/checkout` - Create order & lock inventory
- `GET /orders/my-orders` - Fetch customer order history
- `GET /orders/[id]` - Retrieve order details & status timeline
- `PATCH /orders/[id]/cancel` - Cancel pending order
- `GET /orders/admin/all` - Admin order search & list

### 4. Seller Portal (`/api/v1/seller-portal`)
- `GET/PUT /seller-portal/shop` - Seller shop profile
- `GET/POST/PUT/DELETE /seller-portal/products` - Seller inventory
- `GET/PATCH /seller-portal/orders` - Seller order fulfillment
- `GET /seller-portal/wallet` - Seller earnings wallet

### 5. Deliveries & Rider (`/api/v1/deliveries`)
- `GET /deliveries/rider/my-deliveries` - Rider assigned deliveries
- `PATCH /deliveries/rider/status` - Advance delivery status
- `POST /deliveries/admin/assign` - Admin assign delivery to rider

### 6. Payments & SSLCOMMERZ (`/api/v1/payments`)
- `POST /payments/initiate` - Initiate SSLCOMMERZ gateway session
- `POST /payments/sslcommerz/success` - SSLCOMMERZ success callback
- `POST /payments/sslcommerz/fail` - SSLCOMMERZ fail callback
- `POST /payments/sslcommerz/cancel` - SSLCOMMERZ cancel callback
- `POST /payments/sslcommerz/ipn` - SSLCOMMERZ IPN callback

### 7. Chat & Realtime (`/api/v1/chat`)
- `GET /chat/conversations` - List active chat conversations
- `GET /chat/conversations/[id]/messages` - Fetch conversation message history
- `POST /chat/messages` - Send chat message (REST fallback)

### 8. Payouts & Wallets (`/api/v1/payouts`, `/api/v1/wallets`)
- `GET /wallets/me` - Fetch authenticated user wallet
- `POST /payouts/request` - Submit wallet withdrawal request
- `GET /payouts/admin/pending` - List pending payout requests
- `PATCH /payouts/admin/[id]/approve` - Approve payout request
