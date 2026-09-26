import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import {
  ApiResponseDto,
  PaginationMetaDto,
  ApiErrorResponseDto,
  MessageResponseDto,
} from '../common/dto/api-response.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { ProductResponseDto } from '../catalog/dto/product-response.dto.js';
import { CategoryResponseDto } from '../catalog/dto/category-response.dto.js';
import { BrandResponseDto } from '../catalog/dto/brand-response.dto.js';
import { ShopResponseDto } from '../shops/dto/shop-response.dto.js';
import { OrderResponseDto } from '../orders/dto/order-response.dto.js';
import { PaymentResponseDto } from '../payments/dto/payment-response.dto.js';
import { DeliveryResponseDto } from '../deliveries/dto/delivery-response.dto.js';
import { CouponResponseDto } from '../coupons/dto/coupon-response.dto.js';
import { SellerProductResponseDto } from '../inventory/dto/seller-product-response.dto.js';
import { ProductRequestResponseDto } from '../product-requests/dto/product-request-response.dto.js';
import { DisputeResponseDto } from '../disputes/dto/dispute-response.dto.js';
import { FlashSaleResponseDto } from '../flash-sales/dto/flash-sale-response.dto.js';
import { AuditLogResponseDto } from '../audit-logs/dto/audit-log-response.dto.js';
import { PlatformSettingsResponseDto } from '../settings/dto/settings-response.dto.js';
import { SellerApplicationResponseDto, RiderApplicationResponseDto } from '../applications/dto/application-response.dto.js';
import { WalletResponseDto } from '../wallets/dto/wallet-response.dto.js';
import { PayoutResponseDto } from '../payouts/dto/payout-response.dto.js';
import { ProductSearchResultResponseDto } from '../catalog/dto/product-response.dto.js';
import { DeliveryHistoryResponseDto } from '../deliveries/dto/delivery-response.dto.js';
import { CheckoutDto } from '../orders/dto/checkout.dto.js';
import { TransitionOrderDto } from '../orders/dto/transition-order.dto.js';
import { PaymentAdminQueryDto } from '../payments/dto/payment.dto.js';
import { UpdateInventoryDto } from '../inventory/dto/update-inventory.dto.js';

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Gramer Bazar Hyperlocal Marketplace & SaaS API')
    .setDescription(
      `## Overview
The Gramer Bazar API powers an end-to-end hyperlocal multi-vendor agri-marketplace and SaaS platform.

### Standard Response Envelope
All non-binary JSON responses are intercepted and wrapped into the uniform structure:
\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "path": "/api/v1/resource",
  "timestamp": "2026-09-26T10:00:00.000Z",
  "data": { ... }
}
\`\`\`

### Pagination Structure
Paginated list endpoints return data wrapped with metadata:
\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "path": "/api/v1/products",
  "timestamp": "2026-09-26T10:00:00.000Z",
  "data": {
    "data": [ ... ],
    "meta": {
      "total": 125,
      "page": 1,
      "limit": 20,
      "totalPages": 7,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
\`\`\`

### Error Structure
Standard error responses returned by filters:
\`\`\`json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-09-26T10:00:00.000Z",
  "path": "/api/v1/resource",
  "message": "Validation failed",
  "errorCode": "BAD_REQUEST"
}
\`\`\`

### Authentication & Authorization
- **Bearer Authentication**: Pass JWT access token via \`Authorization: Bearer <token>\`.
- **RBAC**: Protected routes enforce roles (\`CUSTOMER\`, \`SELLER\`, \`RIDER\`, \`ADMIN\`, \`SUPER_ADMIN\`) and granular permissions.
- **Public Endpoints**: Clearly noted where no authentication is required.`,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication, registration, OTP verification, sessions, and profile')
    .addTag('Users', 'User account management, role assignment, and administrative directory')
    .addTag('Locations', 'Geographic hierarchy: Divisions, Districts, Upazilas, Unions, and Geolocation detection')
    .addTag('Addresses', 'Customer and delivery address book management')
    .addTag('Catalog - Categories', 'Hierarchical category tree and classification')
    .addTag('Catalog - Brands', 'Brand directory and category associations')
    .addTag('Catalog - Products', 'Global marketplace master catalog and product images')
    .addTag('Catalog - Variants', 'Product variation SKUs, attributes, and image mapping')
    .addTag('Catalog - Importer', 'Bulk catalog migration and ingestion tooling')
    .addTag('Public Catalog', 'High-performance customer-facing search, discovery, and product details')
    .addTag('Public Categories', 'Public discovery of category taxonomy')
    .addTag('Public Cart', 'Server-side cart pricing and stock validation')
    .addTag('Shops', 'Vendor store profiles, branding, operating locations, and shop catalogs')
    .addTag('Inventory - Seller Products', 'Seller marketplace listings linked to master catalog')
    .addTag('Inventory - Stock', 'Stock levels, threshold alerts, and inventory transaction auditing')
    .addTag('Reviews', 'Verified buyer product and vendor reviews and ratings')
    .addTag('Orders', 'Order lifecycle, checkout, cancellation, tracking, and fulfillment')
    .addTag('Product Requests', 'Customer product request bidding and custom procurement')
    .addTag('Seller Portal', 'Vendor analytics, shop settings, incoming order management, and catalog control')
    .addTag('Deliveries', 'Rider dispatch, assignment, live order pickup, and proof of delivery')
    .addTag('Wishlists', 'Customer saved items and wishlist collections')
    .addTag('Notifications', 'In-app notifications and read state synchronization')
    .addTag('Analytics', 'Platform metrics, GMV, sales reports, and top-performing products')
    .addTag('Coupons', 'Promotion engine, discount vouchers, and usage eligibility')
    .addTag('Chat', 'Real-time buyer-seller and customer-rider messaging')
    .addTag('Payments', 'SSLCOMMERZ gateway integration, transactions, IPN, and status verification')
    .addTag('Banners (CMS)', 'Homepage hero sliders, promotional carousels, and visual marketing assets')
    .addTag('Wallets (Seller)', 'Seller and rider digital balances and transaction history')
    .addTag('Payouts', 'Vendor and rider withdrawal requests, settlement processing, and receipts')
    .addTag('Disputes', 'Order issue escalation, arbitration, evidence submission, and refunds')
    .addTag('Flash Sales', 'Time-limited promotional campaigns, deal slots, and deep discounts')
    .addTag('Audit Logs (Admin)', 'Security event trail, administrative actions, and compliance logging')
    .addTag('Settings (Admin)', 'Platform-wide configuration, business rules, commission rates, and feature flags')
    .addTag('Applications', 'Onboarding pipeline for prospective sellers and delivery riders')
    .addTag('System', 'Health probes, API heartbeat, and operational status')
    .build();

  return SwaggerModule.createDocument(app, config, {
    extraModels: [
      ApiResponseDto,
      PaginationMetaDto,
      ApiErrorResponseDto,
      MessageResponseDto,
      UserResponseDto,
      ProductResponseDto,
      CategoryResponseDto,
      BrandResponseDto,
      ShopResponseDto,
      OrderResponseDto,
      PaymentResponseDto,
      DeliveryResponseDto,
      CouponResponseDto,
      SellerProductResponseDto,
      ProductRequestResponseDto,
      DisputeResponseDto,
      FlashSaleResponseDto,
      AuditLogResponseDto,
      PlatformSettingsResponseDto,
      SellerApplicationResponseDto,
      RiderApplicationResponseDto,
      WalletResponseDto,
      PayoutResponseDto,
      ProductSearchResultResponseDto,
      DeliveryHistoryResponseDto,
      CheckoutDto,
      TransitionOrderDto,
      PaymentAdminQueryDto,
      UpdateInventoryDto,
    ],
  });
}
