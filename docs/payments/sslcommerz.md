# Gramer Bazar — SSLCOMMERZ V4 Payment Integration & ngrok Guide

This document details the complete architecture, configuration, local testing workflow with ngrok, security guarantees, and production migration instructions for the **SSLCOMMERZ V4 Payment Gateway** integration in **Gramer Bazar**.

---

## 1. Architecture Overview

```text
 Customer (Frontend localhost:3000)
       │
       ▼
 Select items & Click "Place Order & Pay with SSLCommerz"
       │
       ▼
 Backend (NestJS localhost:4000)
       ├─ Validates items, inventory, address, and coupon
       ├─ Calculates authoritative order total (never trusts frontend amount)
       ├─ Creates Order (PENDING)
       ├─ Generates unique transaction ID (e.g. GBZ_C0326DA9_M8Z9_A1B2)
       ├─ Creates Payment entity record (INITIATED)
       ├─ Computes callback URLs using SSLCOMMERZ_PUBLIC_URL
       └─ Calls SSLCOMMERZ V4 Gateway API (POST form-urlencoded)
             │
             ▼
 SSLCOMMERZ Hosted Checkout Page
       │ (Customer enters card/bKash/Nagad/Rocket test credentials)
       ▼
 ┌──────────────────────┬──────────────────────┬──────────────────────┐
 │                      │                      │                      │
 ▼                      ▼                      ▼                      ▼
SUCCESS Callback       FAIL Callback          CANCEL Callback        IPN Webhook
POST /api/v1/payments/  POST /api/v1/payments/ POST /api/v1/payments/ POST /api/v1/payments/
  sslcommerz/success     sslcommerz/fail        sslcommerz/cancel      sslcommerz/ipn
 │                                                                     │
 └──────────────────────────────┬──────────────────────────────────────┘
                                ▼
         Backend Server-Side Validation (validationserverAPI.php)
                                │
               Checks val_id, tran_id, amount & currency
                                │
                                ▼
         Database Transaction with Pessimistic Write Locking
                                ├─ Checks idempotency (if already PAID, skip)
                                ├─ Checks amount tampering (|expected - actual| <= 0.05)
                                ├─ Checks currency matches (BDT)
                                ├─ Payment record marked as PAID
                                ├─ Stores val_id, bank_tran_id, risk_level, card details
                                ├─ Order marked as CONFIRMED
                                ├─ OrderStatusHistory recorded
                                └─ Sends customer confirmation email & records AuditLog
                                │
                                ▼
               Customer Browser Redirected to Frontend:
         /payment/success?orderId={id}&tran_id={tranId}
                                │
                                ▼
     Frontend Authoritative Backend Verification (RTK Query)
     (Never trusts URL query parameters alone!)
```

---

## 2. Environment Variables Configuration

### Backend (`apps/api/.env`)

```env
PORT=4000
API_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002

# ==========================================
# SSLCOMMERZ CONFIGURATION (Sandbox)
# ==========================================
SSLCOMMERZ_STORE_ID=your_sandbox_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sandbox_store_password
SSLCOMMERZ_IS_LIVE=false

# Sandbox Gateway & Validator Endpoints
SSLCOMMERZ_PAYMENT_URL=https://sandbox-gw.sslcommerz.com/gwprocess/v4/api.php
SSLCOMMERZ_VALIDATION_URL=https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php

# Current Public HTTPS Tunnel URL (from ngrok)
SSLCOMMERZ_PUBLIC_URL=https://your-current-ngrok-url.ngrok-free.app
```

> [!IMPORTANT]
> **Secret Hygiene Rules**:
> 1. Never put `SSLCOMMERZ_STORE_PASSWORD` or `SSLCOMMERZ_STORE_ID` into frontend `NEXT_PUBLIC_*` variables.
> 2. Never commit `.env` to Git. (Protected in `.gitignore`).
> 3. Free ngrok URLs change on each restart. When ngrok issues a new URL, update `SSLCOMMERZ_PUBLIC_URL` in `apps/api/.env` and restart the backend.

---

## 3. Local Development with ngrok

Because your NestJS backend runs locally on `http://localhost:4000`, the remote SSLCOMMERZ server cannot directly reach your machine to send callbacks and asynchronous IPN webhook notifications. A public HTTPS tunnel via **ngrok** is required for local development.

### Step 1: Verify ngrok Installation

Open PowerShell and check if ngrok is installed:

```powershell
ngrok version
```

If ngrok is not installed, install it on Windows using one of the following methods:

- **Via Chocolatey**:
  ```powershell
  choco install ngrok
  ```
- **Via Winget**:
  ```powershell
  winget install ngrok.ngrok
  ```
- **Via npm / pnpm**:
  ```powershell
  npm install -g ngrok
  ```
- **Or download the Windows binary directly** from [https://ngrok.com/download](https://ngrok.com/download) and place `ngrok.exe` in your `PATH`.

### Step 2: Configure ngrok Authentication

Sign in or create a free account at [https://dashboard.ngrok.com](https://dashboard.ngrok.com), find your personal authtoken, and execute:

```powershell
ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
```

> [!CAUTION]
> Do NOT place the ngrok authtoken inside `.env` or anywhere in source control. The token is stored locally on your machine in `AppData\Local\ngrok\ngrok.yml`.

### Step 3: Start Local Backend

In **Terminal 1**:

```powershell
cd c:\Sofof_tech_2026\gramer-bazar\apps\api
pnpm dev
```

Verify backend health:

```powershell
Invoke-RestMethod -Uri http://localhost:4000/api/v1/health -Method Get
```

### Step 4: Start ngrok Tunnel

In **Terminal 2**:

```powershell
ngrok http 4000
```

ngrok will output a session summary like:

```text
Forwarding   https://a1b2-c3d4.ngrok-free.app -> http://localhost:4000
```

Copy the HTTPS forwarding address: `https://a1b2-c3d4.ngrok-free.app`.

### Step 5: Update `SSLCOMMERZ_PUBLIC_URL`

In `apps/api/.env`, update:

```env
SSLCOMMERZ_PUBLIC_URL=https://a1b2-c3d4.ngrok-free.app
```

Restart or allow NestJS dev server to hot-reload.

Verify that the public tunnel reaches your backend:

```powershell
Invoke-RestMethod -Uri https://a1b2-c3d4.ngrok-free.app/api/v1/health -Method Get
```

### Step 6: Start Frontend

In **Terminal 3**:

```powershell
cd c:\Sofof_tech_2026\gramer-bazar\apps\web
pnpm dev
```

The frontend runs locally on `http://localhost:3000`. You do **not** need to expose the frontend through ngrok; only the backend requires public accessibility for gateway callbacks and IPN.

---

## 4. Endpoints and Routing

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/v1/payments/initiate` | POST | Bearer JWT | Initiates SSLCOMMERZ payment session for an order |
| `/api/v1/payments/retry/:orderId` | POST | Bearer JWT | Creates a fresh payment attempt with a new transaction ID |
| `/api/v1/payments/sslcommerz/success` | POST | Public | Gateway success callback (validates & redirects browser) |
| `/api/v1/payments/sslcommerz/fail` | POST | Public | Gateway failure callback (marks failed & redirects) |
| `/api/v1/payments/sslcommerz/cancel` | POST | Public | Gateway cancel callback (marks cancelled & redirects) |
| `/api/v1/payments/sslcommerz/ipn` | POST | Public | Asynchronous server-to-server IPN listener (HTTP 200) |
| `/api/v1/payments/verify/:transactionId` | GET | Bearer JWT | Customer queries payment verification |
| `/api/v1/payments/order/:orderId` | GET | Bearer JWT | Customer queries payment attempts for an order |
| `/api/v1/payments/my-payments` | GET | Bearer JWT | Customer lists own payment history |
| `/api/v1/payments/admin/all` | GET | Admin / Super Admin | Paginated payment transactions with search and filter |
| `/api/v1/payments/admin/:id` | GET | Admin / Super Admin | Single payment audit details |

---

## 5. Security & Fraud Protection Guarantees

### 1. Amount Tampering Prevention
When the callback or IPN is received, the backend contacts the SSLCOMMERZ validator API (`validationserverAPI.php`) and checks:
```ts
const gatewayAmount = Number(validationData?.amount);
const expectedAmount = Number(payment.amount);
if (Math.abs(gatewayAmount - expectedAmount) > 0.05) {
  // Reject, flag as risk level DANGER, and mark FAILED
}
```
If an attacker alters the gateway payload to 10 BDT on a 1500 BDT order, the transaction is immediately rejected and flagged.

### 2. Currency Validation
Guarantees that the currency returned by the validator matches the internal expected currency (`BDT`).

### 3. Server-Side Validation Mandatory
The backend **never** trusts client-side redirection or query parameters. The payment is finalized strictly after receiving confirmation from `validationserverAPI.php`.

### 4. Idempotency & Duplicate IPN Protection
SSLCOMMERZ may send both a browser success redirect and an asynchronous IPN webhook simultaneously. The backend utilizes TypeORM pessimistic write locks inside database transactions:
```ts
const payment = await manager.findOne(Payment, {
  where: { transactionId: tranId },
  lock: { mode: 'pessimistic_write' },
  relations: ['order'],
});

if (payment.status === PaymentStatus.PAID) {
  return { success: true, alreadyProcessed: true };
}
```
If already marked `PAID`, duplicate financial events, duplicate order status updates, and duplicate customer notifications are completely prevented.

### 5. IDOR & Access Control
- Customers can only query their own payments and orders (`userId` enforcement).
- Admin routes (`/api/v1/payments/admin/*`) require `ADMIN` or `SUPER_ADMIN` roles.
- Sensitive credit card numbers and CVVs are never handled, stored, or exposed by the system.

---

## 6. Testing with SSLCOMMERZ Sandbox Cards

When checking out on the SSLCOMMERZ Sandbox hosted checkout page, use official test credentials:

| Channel | Number / Account | PIN / OTP | Notes |
|---|---|---|---|
| **bKash** | Any 11-digit mobile (e.g. `01700000000`) | OTP: `123456`, PIN: `12345` | Sandbox simulation |
| **Nagad** | Any 11-digit mobile | OTP: `123456`, PIN: `1234` | Sandbox simulation |
| **Visa / Mastercard** | Use Sandbox test cards provided in SSLCOMMERZ Sandbox portal | Any future expiry, CVV: `123` | 3D Secure simulation |

---

## 7. Production Migration Checklist

When moving from development/sandbox to production:

1. **Merchant Account**:
   Obtain your Live Store ID and Live Store Password from the SSLCOMMERZ merchant operations team.

2. **No Application Code Changes Required**:
   Simply configure production environment variables in your server/container environment:

   ```env
   SSLCOMMERZ_IS_LIVE=true
   SSLCOMMERZ_STORE_ID=your_live_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_live_store_password

   SSLCOMMERZ_PAYMENT_URL=https://securepay.sslcommerz.com/gwprocess/v4/api.php
   SSLCOMMERZ_VALIDATION_URL=https://securepay.sslcommerz.com/validator/api/validationserverAPI.php

   # Your production public backend domain
   SSLCOMMERZ_PUBLIC_URL=https://api.gramerbazar.com
   FRONTEND_URL=https://gramerbazar.com
   ```

3. **SSLCOMMERZ Merchant Panel Configuration**:
   Log into the live SSLCOMMERZ merchant portal (`https://merchant.sslcommerz.com`):
   - Under **IPN Settings**, configure:
     `https://api.gramerbazar.com/api/v1/payments/sslcommerz/ipn`
   - Set IPN HTTP method to **POST**.

4. **Verify Live SSL/TLS Certificate**:
   Ensure `https://api.gramerbazar.com` has a valid, trusted SSL/TLS certificate installed (Let's Encrypt, Cloudflare, or commercial CA).

---

## 8. Common Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| `STORE_ID or STORE_PASSWORD Invalid` | Incorrect credentials | Verify `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD` in `.env`. Ensure `SSLCOMMERZ_IS_LIVE=false` for Sandbox. |
| `Callback returns 404` | Missing ngrok URL or wrong route | Ensure `SSLCOMMERZ_PUBLIC_URL` points to the active ngrok URL (e.g., `https://xxxx.ngrok-free.app`). |
| `IPN not received` | ngrok stopped or firewall blocking | Verify ngrok is running and forwarding to port 4000. Inspect requests in `http://127.0.0.1:4040` (ngrok web interface). |
| `Amount tampering detected` | Order total modified after initiation | Check backend logs. Do not alter `total` between initiation and payment validation. |
| `ngrok tunnel changed` | Free ngrok instance restarted | Copy the new ngrok HTTPS URL, update `SSLCOMMERZ_PUBLIC_URL` in `apps/api/.env`, and restart NestJS. |
