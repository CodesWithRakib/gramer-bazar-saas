import { Role } from '../../roles/enums/role.enum.js';

export interface SeedPermissionItem {
  name: string;
  description: string;
  /** Module group used by the Admin permission-management UI. */
  group: string;
  /** Marks permissions that should almost always stay with a Super Admin. */
  sensitive?: boolean;
}

/**
 * Canonical fine-grained permission catalog.
 *
 * Naming convention: `<module>.<action>` (e.g. `orders.cancel`).
 * This is the single source of truth used by seeds, role defaults and the
 * Super Admin permission-management UI. Do not create parallel permission sets.
 */
export const SEED_PERMISSIONS: SeedPermissionItem[] = [
  // Users & Customers
  { name: 'users.read', description: 'View user accounts', group: 'Users' },
  { name: 'users.create', description: 'Create user accounts', group: 'Users' },
  { name: 'users.update', description: 'Update user profiles', group: 'Users' },
  {
    name: 'users.delete',
    description: 'Deactivate or remove user accounts',
    group: 'Users',
    sensitive: true,
  },
  { name: 'customers.read', description: 'View customer profiles and orders', group: 'Customers' },
  { name: 'customers.update', description: 'Update customer account details', group: 'Customers' },
  {
    name: 'customers.suspend',
    description: 'Suspend or reactivate customer accounts',
    group: 'Customers',
  },

  // Sellers & Shops
  { name: 'sellers.read', description: 'View sellers and their shops', group: 'Sellers' },
  { name: 'sellers.update', description: 'Update seller account details', group: 'Sellers' },
  { name: 'sellers.approve', description: 'Approve seller applications', group: 'Sellers' },
  { name: 'sellers.reject', description: 'Reject seller applications', group: 'Sellers' },
  { name: 'sellers.suspend', description: 'Suspend or reactivate sellers', group: 'Sellers' },
  { name: 'shops.read', description: 'View merchant shops', group: 'Shops' },
  {
    name: 'shops.update',
    description: 'Edit shop settings and operational status',
    group: 'Shops',
  },
  { name: 'shops.delete', description: 'Remove merchant shops', group: 'Shops', sensitive: true },

  // Riders
  { name: 'riders.read', description: 'View riders and delivery activity', group: 'Riders' },
  { name: 'riders.update', description: 'Update rider account details', group: 'Riders' },
  { name: 'riders.approve', description: 'Approve rider applications', group: 'Riders' },
  { name: 'riders.reject', description: 'Reject rider applications', group: 'Riders' },
  { name: 'riders.suspend', description: 'Suspend or reactivate riders', group: 'Riders' },

  // Catalog
  { name: 'products.read', description: 'Browse and search catalog products', group: 'Products' },
  { name: 'products.create', description: 'Create new catalog products', group: 'Products' },
  { name: 'products.update', description: 'Edit catalog products and variants', group: 'Products' },
  { name: 'products.delete', description: 'Delete or archive catalog products', group: 'Products' },
  { name: 'categories.read', description: 'View catalog categories', group: 'Categories' },
  { name: 'categories.create', description: 'Create new categories', group: 'Categories' },
  {
    name: 'categories.update',
    description: 'Modify category details and tree',
    group: 'Categories',
  },
  { name: 'categories.delete', description: 'Remove catalog categories', group: 'Categories' },
  { name: 'brands.read', description: 'View product brands', group: 'Brands' },
  { name: 'brands.create', description: 'Create new product brands', group: 'Brands' },
  { name: 'brands.update', description: 'Edit brand details and category links', group: 'Brands' },
  { name: 'brands.delete', description: 'Remove product brands', group: 'Brands' },
  { name: 'inventory.read', description: 'View stock levels', group: 'Inventory' },
  { name: 'inventory.update', description: 'Update stock levels and pricing', group: 'Inventory' },

  // Orders, Deliveries & Payments
  { name: 'orders.read', description: 'View customer and shop orders', group: 'Orders' },
  { name: 'orders.update', description: 'Update order status and fulfillment', group: 'Orders' },
  { name: 'orders.cancel', description: 'Cancel pending or disputed orders', group: 'Orders' },
  { name: 'deliveries.read', description: 'View delivery fleet assignments', group: 'Deliveries' },
  {
    name: 'deliveries.update',
    description: 'Update delivery status and assignments',
    group: 'Deliveries',
  },
  {
    name: 'payments.read',
    description: 'View payment transactions and gateways',
    group: 'Payments',
  },
  {
    name: 'payments.refund',
    description: 'Initiate order refund transactions',
    group: 'Payments',
    sensitive: true,
  },

  // Finance
  { name: 'payouts.read', description: 'View seller and rider payout requests', group: 'Payouts' },
  { name: 'payouts.request', description: 'Request an earnings payout', group: 'Payouts' },
  {
    name: 'payouts.approve',
    description: 'Approve payout requests',
    group: 'Payouts',
    sensitive: true,
  },
  {
    name: 'payouts.reject',
    description: 'Reject payout requests',
    group: 'Payouts',
    sensitive: true,
  },
  { name: 'wallets.read', description: 'View balance and transaction ledger', group: 'Wallets' },
  {
    name: 'wallets.manage',
    description: 'Adjust or audit wallet balances',
    group: 'Wallets',
    sensitive: true,
  },

  // Applications
  {
    name: 'seller_applications.submit',
    description: 'Submit a merchant partnership application',
    group: 'Applications',
  },
  {
    name: 'seller_applications.read',
    description: 'View seller applications',
    group: 'Applications',
  },
  {
    name: 'seller_applications.review',
    description: 'Approve or reject seller applications',
    group: 'Applications',
  },
  {
    name: 'rider_applications.submit',
    description: 'Submit a delivery fleet application',
    group: 'Applications',
  },
  {
    name: 'rider_applications.read',
    description: 'View rider applications',
    group: 'Applications',
  },
  {
    name: 'rider_applications.review',
    description: 'Approve or reject rider applications',
    group: 'Applications',
  },

  // Disputes & Reviews
  { name: 'disputes.read', description: 'View dispute tickets and messages', group: 'Disputes' },
  {
    name: 'disputes.resolve',
    description: 'Adjudicate disputes with refund or rejection',
    group: 'Disputes',
  },
  { name: 'reviews.read', description: 'Read customer reviews', group: 'Reviews' },
  {
    name: 'reviews.moderate',
    description: 'Moderate or remove inappropriate reviews',
    group: 'Reviews',
  },

  // Promotions
  { name: 'coupons.read', description: 'View promotional coupons', group: 'Coupons' },
  { name: 'coupons.create', description: 'Create discount coupons', group: 'Coupons' },
  { name: 'coupons.update', description: 'Modify coupon rules and validity', group: 'Coupons' },
  { name: 'coupons.delete', description: 'Deactivate discount coupons', group: 'Coupons' },
  { name: 'offers.read', description: 'View banners and flash-sale offers', group: 'Offers' },
  { name: 'offers.create', description: 'Create banners and flash-sale offers', group: 'Offers' },
  { name: 'offers.update', description: 'Edit banners and flash-sale offers', group: 'Offers' },
  { name: 'offers.delete', description: 'Remove banners and flash-sale offers', group: 'Offers' },

  // Product sourcing requests
  {
    name: 'product_requests.read',
    description: 'View product sourcing requests',
    group: 'Product Requests',
  },
  {
    name: 'product_requests.manage',
    description: 'Review and source requested products',
    group: 'Product Requests',
  },

  // Platform governance (Super Admin)
  {
    name: 'admins.read',
    description: 'View administrative accounts and their permissions',
    group: 'Admin Management',
    sensitive: true,
  },
  {
    name: 'admins.create',
    description: 'Create administrative accounts',
    group: 'Admin Management',
    sensitive: true,
  },
  {
    name: 'admins.update',
    description: 'Edit administrative accounts',
    group: 'Admin Management',
    sensitive: true,
  },
  {
    name: 'admins.delete',
    description: 'Deactivate or remove administrative accounts',
    group: 'Admin Management',
    sensitive: true,
  },
  {
    name: 'roles.manage',
    description: 'Manage roles and role permissions',
    group: 'Admin Management',
    sensitive: true,
  },
  { name: 'audit_logs.read', description: 'Read administrative audit logs', group: 'Audit Logs' },
  { name: 'reports.read', description: 'View platform operational reports', group: 'Reports' },
  {
    name: 'notifications.read',
    description: 'View platform notifications',
    group: 'Notifications',
  },
  {
    name: 'notifications.manage',
    description: 'Send platform notifications',
    group: 'Notifications',
    sensitive: true,
  },
  { name: 'settings.read', description: 'View platform settings', group: 'Settings' },
  {
    name: 'settings.update',
    description: 'Update platform settings',
    group: 'Settings',
    sensitive: true,
  },
];

/**
 * Default permissions attached to each platform role.
 *
 * ADMIN intentionally receives a bounded operational baseline rather than the
 * full catalog. Additional permissions can be granted per Admin account through
 * the `user_permissions` joins exposed to Super Admins.
 */
export const ROLE_PERMISSION_NAMES: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: SEED_PERMISSIONS.map((p) => p.name),
  [Role.ADMIN]: [
    // Users & customers
    'users.read',
    'users.create',
    'users.update',
    'customers.read',
    'customers.update',
    'customers.suspend',
    // Sellers, shops & riders
    'sellers.read',
    'sellers.update',
    'sellers.reject',
    'shops.read',
    'shops.update',
    'riders.read',
    'riders.update',
    'seller_applications.read',
    'rider_applications.read',
    // Catalog
    'products.read',
    'products.create',
    'products.update',
    'categories.read',
    'categories.create',
    'categories.update',
    'brands.read',
    'brands.create',
    'brands.update',
    'inventory.read',
    'inventory.update',
    // Commerce
    'orders.read',
    'orders.update',
    'orders.cancel',
    'deliveries.read',
    'deliveries.update',
    'payments.read',
    // Finance (read-only by default; approvals are explicitly granted)
    'payouts.read',
    'wallets.read',
    // Disputes, reviews & sourcing
    'disputes.read',
    'disputes.resolve',
    'reviews.read',
    'reviews.moderate',
    'product_requests.read',
    'product_requests.manage',
    // Promotions
    'coupons.read',
    'coupons.create',
    'coupons.update',
    'coupons.delete',
    'offers.read',
    'offers.create',
    'offers.update',
    'offers.delete',
    // Reporting & notifications
    'reports.read',
    'notifications.read',
    'audit_logs.read',
    'settings.read',
  ],
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
    'product_requests.read',
    'coupons.read',
    'reviews.read',
    'seller_applications.submit',
    'rider_applications.submit',
  ],
  [Role.RIDER]: [
    'deliveries.read',
    'deliveries.update',
    'payouts.read',
    'payouts.request',
    'wallets.read',
    'rider_applications.submit',
    'seller_applications.submit',
  ],
  [Role.CUSTOMER]: [
    'products.read',
    'categories.read',
    'brands.read',
    'orders.read',
    'orders.cancel',
    'coupons.read',
    'product_requests.read',
    'disputes.read',
    'reviews.read',
    'wallets.read',
    'seller_applications.submit',
    'rider_applications.submit',
  ],
};

/** Permissions that a Super Admin should treat as system-critical. */
export const SENSITIVE_PERMISSION_NAMES: string[] = SEED_PERMISSIONS.filter((p) => p.sensitive).map(
  (p) => p.name,
);
