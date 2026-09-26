import { Role } from '../../roles/enums/role.enum.js';

export interface SeedPermissionItem {
  name: string;
  description: string;
}

export const SEED_PERMISSIONS: SeedPermissionItem[] = [
  // User Management
  { name: 'users.read', description: 'View user and staff accounts' },
  { name: 'users.create', description: 'Create user or administrative staff' },
  { name: 'users.update', description: 'Update user profiles and roles' },
  { name: 'users.delete', description: 'Deactivate or remove user accounts' },

  // Products & Catalog
  { name: 'products.read', description: 'Browse and search catalog products' },
  { name: 'products.create', description: 'Create new catalog products' },
  { name: 'products.update', description: 'Edit catalog products and variants' },
  { name: 'products.delete', description: 'Delete or archive catalog products' },

  // Categories & Brands
  { name: 'categories.read', description: 'View catalog categories' },
  { name: 'categories.create', description: 'Create new categories' },
  { name: 'categories.update', description: 'Modify category details and tree' },
  { name: 'categories.delete', description: 'Remove catalog categories' },
  { name: 'brands.read', description: 'View product brands' },
  { name: 'brands.create', description: 'Create new product brands' },
  { name: 'brands.update', description: 'Edit brand details and category links' },
  { name: 'brands.delete', description: 'Remove product brands' },

  // Shops & Inventory
  { name: 'shops.read', description: 'View merchant shops' },
  { name: 'shops.create', description: 'Register new merchant shops' },
  { name: 'shops.update', description: 'Edit shop settings and operational status' },
  { name: 'inventory.read', description: 'View stock levels' },
  { name: 'inventory.update', description: 'Update stock levels and pricing' },

  // Orders & Deliveries
  { name: 'orders.read', description: 'View customer and shop orders' },
  { name: 'orders.create', description: 'Place new orders' },
  { name: 'orders.update', description: 'Update order status and fulfillment' },
  { name: 'orders.cancel', description: 'Cancel pending or disputed orders' },
  { name: 'deliveries.read', description: 'View delivery fleet assignments' },
  { name: 'deliveries.update', description: 'Update delivery status and OTP confirmation' },
  { name: 'deliveries.accept', description: 'Accept rider delivery jobs' },

  // Financial & Payouts
  { name: 'payments.read', description: 'View payment transactions and gateways' },
  { name: 'payments.refund', description: 'Initiate order refund transactions' },
  { name: 'payouts.read', description: 'View seller and rider payout requests' },
  { name: 'payouts.request', description: 'Request earnings payout from wallet' },
  { name: 'payouts.review', description: 'Approve or reject merchant payout requests' },
  { name: 'wallets.read', description: 'View balance and transaction ledger' },
  { name: 'wallets.manage', description: 'Adjust or audit wallet balances' },

  // Applications & KYC
  { name: 'seller_applications.submit', description: 'Submit merchant partnership application' },
  { name: 'seller_applications.read', description: 'View seller KYC applications' },
  { name: 'seller_applications.review', description: 'Approve or reject seller applications' },
  { name: 'rider_applications.submit', description: 'Submit delivery fleet application' },
  { name: 'rider_applications.read', description: 'View rider fleet applications' },
  { name: 'rider_applications.review', description: 'Approve or reject rider applications' },

  // Customer Requests & Disputes
  { name: 'product_requests.create', description: 'Submit new product sourcing request' },
  { name: 'product_requests.read', description: 'View product sourcing requests' },
  { name: 'product_requests.manage', description: 'Review, source and link requested products' },
  { name: 'disputes.create', description: 'Open order dispute or return claim' },
  { name: 'disputes.read', description: 'View dispute tickets and messages' },
  { name: 'disputes.respond', description: 'Send dispute resolution messages' },
  { name: 'disputes.resolve', description: 'Adjudicate disputes with refund or rejection' },

  // Marketing & Promotions
  { name: 'coupons.read', description: 'View promotional coupons' },
  { name: 'coupons.create', description: 'Create discount coupons' },
  { name: 'coupons.update', description: 'Modify coupon rules and validity' },
  { name: 'coupons.delete', description: 'Deactivate discount coupons' },
  { name: 'banners.manage', description: 'Create and update promotional banners' },
  { name: 'reviews.create', description: 'Submit product reviews and ratings' },
  { name: 'reviews.read', description: 'Read customer reviews' },
  { name: 'reviews.moderate', description: 'Moderate or remove inappropriate reviews' },
  { name: 'settings.manage', description: 'Manage platform operational settings' },
];

export const ROLE_PERMISSION_NAMES: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: SEED_PERMISSIONS.map((p) => p.name),
  [Role.ADMIN]: SEED_PERMISSIONS.map((p) => p.name).filter((name) => name !== 'settings.manage'),
  [Role.SELLER]: [
    'shops.read',
    'shops.update',
    'inventory.read',
    'inventory.update',
    'products.read',
    'products.create',
    'products.update',
    'orders.read',
    'orders.update',
    'payouts.read',
    'payouts.request',
    'wallets.read',
    'disputes.read',
    'disputes.respond',
    'product_requests.read',
    'coupons.read',
    'reviews.read',
  ],
  [Role.RIDER]: [
    'deliveries.read',
    'deliveries.update',
    'deliveries.accept',
    'payouts.read',
    'payouts.request',
    'wallets.read',
  ],
  [Role.CUSTOMER]: [
    'products.read',
    'categories.read',
    'brands.read',
    'orders.create',
    'orders.read',
    'orders.cancel',
    'coupons.read',
    'product_requests.create',
    'product_requests.read',
    'disputes.create',
    'disputes.read',
    'disputes.respond',
    'reviews.create',
    'reviews.read',
    'wallets.read',
  ],
};
