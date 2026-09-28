# Payment System Architecture & Gateway Integration

## Overview

Gramer Bazar supports two main payment mechanisms:
1. **Cash on Delivery (COD)**: Payment is collected physically by the delivery rider upon delivery.
2. **Digital Payments (SSLCOMMERZ)**: Payment via SSLCOMMERZ gateway (bKash, Nagad, Rocket, Cards, NetBanking) in Sandbox or Live environment.

---

## SSLCOMMERZ Payment Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Web as Next.js Frontend (5000)
    participant API as NestJS Backend (4000)
    participant SSL as SSLCOMMERZ Gateway

    Customer->>Web: Selects SSLCOMMERZ & Clicks Checkout
    Web->>API: POST /api/v1/orders/checkout (paymentMethod: DIGITAL)
    API->>API: Calculate order total & create Order (PENDING)
    API->>API: Generate SSLCOMMERZ-compliant tran_id (GBZ_...)
    API->>SSL: Initiate session (POST /gwprocess/v4/api.php)
    SSL-->>API: Gateway Response (GatewayPageURL)
    API-->>Web: Return { order, paymentUrl }
    Web->>Customer: Redirect to GatewayPageURL
    Customer->>SSL: Completes Payment (bKash / Card)
    SSL->>API: POST /api/v1/payments/sslcommerz/success
    API->>SSL: Validate Payment (POST /validator/api/validationserverAPI.php)
    SSL-->>API: Validation Response (VALIDATED)
    API->>API: Update Order status to CONFIRMED & Payment to PAID
    API-->>Customer: Redirect to Frontend /en/customer/orders with success toast
```

---

## Security Invariants

- **Server-side Calculation**: Payment totals are ALWAYS computed from database product records (`seller_products.price`, `discountPrice`, delivery fee rules). Frontend-submitted totals are ignored.
- **Transaction ID Format**: Generated as `GBZ_<orderPrefix8>_<timeBase36>_<rand4>` (max 30 characters) to strictly satisfy SSLCOMMERZ specification.
- **IPN Callback Validation**: Every IPN callback triggers a secondary server-to-server validation check against SSLCOMMERZ validation API endpoint.
- **Replay Protection**: Duplicate callback requests check if payment transaction status is already `PAID` before processing.
