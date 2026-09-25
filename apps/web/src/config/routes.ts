/**
 * Gramer Bazar - Centralized Route System
 * 
 * Provides type-safe definitions for all application routes across public,
 * customer, seller, rider, admin, and super-admin namespaces.
 */

export const ROUTES = {
  // Public Storefront & Discovery
  public: {
    home: '/',
    cart: '/cart',
    products: '/products',
    productDetail: (slug: string) => `/products/${slug}`,
    categories: '/categories',
    categoryDetail: (slug: string) => `/categories/${slug}`,
    shops: '/shops',
    shopDetail: (id: string) => `/shops/${id}`,
    flashSale: '/flash-sale',
    offers: '/offers',
    contact: '/contact',
    faq: '/faq',
    privacy: '/privacy',
    becomeSeller: '/become-a-seller',
    becomeRider: '/become-a-rider',
  },

  // Authentication
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    unauthorized: '/unauthorized',
  },

  // Customer Dashboard & Account
  customer: {
    root: '/customer',
    profile: '/customer/profile',
    orders: '/customer/orders',
    orderDetail: (orderId: string) => `/customer/orders/${orderId}`,
    wishlist: '/customer/wishlist',
    addresses: '/customer/addresses',
    messages: '/customer/messages',
    disputes: '/customer/disputes',
    disputeDetail: (id: string) => `/customer/disputes/${id}`,
    settings: '/customer/settings',
    notifications: '/customer/notifications',
    reviews: '/customer/reviews',
    productRequests: '/customer/product-requests',
    productRequestDetail: (id: string) => `/customer/product-requests/${id}`,
    checkout: '/customer/checkout',
    checkoutSuccess: '/customer/checkout/success',
    checkoutFail: '/customer/checkout/fail',
    checkoutCancel: '/customer/checkout/cancel',
    payment: '/customer/payment',
  },

  // Seller Dashboard
  seller: {
    root: '/seller',
    shop: '/seller/shop',
    products: '/seller/products',
    inventory: '/seller/inventory',
    orders: '/seller/orders',
    orderDetail: (id: string) => `/seller/orders/${id}`,
    coupons: '/seller/coupons',
    reports: '/seller/reports',
    wallet: '/seller/wallet',
    walletPayout: '/seller/wallet/payout',
    messages: '/seller/messages',
    disputes: '/seller/disputes',
    disputeDetail: (id: string) => `/seller/disputes/${id}`,
    profile: '/seller/profile',
  },

  // Rider Dashboard
  rider: {
    root: '/rider',
    deliveries: '/rider/deliveries',
    deliveryDetail: (id: string) => `/rider/deliveries/${id}`,
    messages: '/rider/messages',
    profile: '/rider/profile',
  },

  // Admin Operational Dashboard
  admin: {
    root: '/admin',
    users: '/admin/users',
    sellerApplications: '/admin/seller-applications',
    riderApplications: '/admin/rider-applications',
    sellers: '/admin/sellers',
    products: '/admin/products',
    categories: '/admin/categories',
    brands: '/admin/brands',
    orders: '/admin/orders',
    payments: '/admin/payments',
    deliveries: '/admin/deliveries',
    riders: '/admin/riders',
    productRequests: '/admin/product-requests',
    productRequestDetail: (id: string) => `/admin/product-requests/${id}`,
    flashSales: '/admin/flash-sales',
    coupons: '/admin/coupons',
    banners: '/admin/banners',
    reviews: '/admin/reviews',
    disputes: '/admin/disputes',
    disputeDetail: (id: string) => `/admin/disputes/${id}`,
    payouts: '/admin/payouts',
    reports: '/admin/reports/demand',
    auditLogs: '/admin/audit-logs',
    messages: '/admin/messages',
    settings: '/admin/settings',
  },

  // Super Admin Governance & Mirrored Operations
  superAdmin: {
    root: '/super-admin',
    admins: '/super-admin/admins',
    createUser: '/super-admin/create-user',
    // Operational mirrors under /super-admin/*
    users: '/super-admin/users',
    sellerApplications: '/super-admin/seller-applications',
    riderApplications: '/super-admin/rider-applications',
    sellers: '/super-admin/sellers',
    products: '/super-admin/products',
    categories: '/super-admin/categories',
    brands: '/super-admin/brands',
    orders: '/super-admin/orders',
    payments: '/super-admin/payments',
    deliveries: '/super-admin/deliveries',
    riders: '/super-admin/riders',
    productRequests: '/super-admin/product-requests',
    productRequestDetail: (id: string) => `/super-admin/product-requests/${id}`,
    flashSales: '/super-admin/flash-sales',
    coupons: '/super-admin/coupons',
    banners: '/super-admin/banners',
    reviews: '/super-admin/reviews',
    disputes: '/super-admin/disputes',
    disputeDetail: (id: string) => `/super-admin/disputes/${id}`,
    payouts: '/super-admin/payouts',
    reports: '/super-admin/reports/demand',
    auditLogs: '/super-admin/audit-logs',
    messages: '/super-admin/messages',
    settings: '/super-admin/settings',
  },
} as const;

/**
 * Format route with locale prefix
 */
export function formatRoute(path: string, lang: string = 'en'): string {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return `/${lang}${path === '/' ? '' : path}`;
}

/**
 * Determine default landing dashboard based on user roles
 */
export function getDefaultDashboardForRoles(roles: string[] = []): string {
  if (roles.includes('SUPER_ADMIN')) return ROUTES.superAdmin.root;
  if (roles.includes('ADMIN')) return ROUTES.admin.root;
  if (roles.includes('SELLER')) return ROUTES.seller.root;
  if (roles.includes('RIDER')) return ROUTES.rider.root;
  return ROUTES.customer.profile;
}

/**
 * Checks if a path is considered a public route that does not require customer login
 */
export function isPublicPath(pathname: string): boolean {
  // Strip locale prefix
  const cleanPath = pathname.replace(/^\/(?:en|bn)/, '') || '/';
  
  if (cleanPath === '/' || cleanPath === '') return true;
  
  const publicPrefixes = [
    '/products',
    '/categories',
    '/shops',
    '/cart',
    '/flash-sale',
    '/offers',
    '/contact',
    '/faq',
    '/privacy',
    '/become-a-seller',
    '/become-a-rider',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/unauthorized',
  ];

  return publicPrefixes.some(prefix => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`));
}
