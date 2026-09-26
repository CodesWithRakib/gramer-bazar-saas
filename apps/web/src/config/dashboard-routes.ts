import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  MessageSquare,
  AlertCircle,
  Settings,
  Ticket,
  User,
  Wallet,
  BarChart3,
  CreditCard,
  MapPin,
  Star,
  ClipboardList,
} from 'lucide-react';
import { ElementType } from 'react';

export interface DashboardRoute {
  title: string;
  titleBn: string;
  href: string;
  icon: ElementType;
  section?: string;
  sectionBn?: string;
  matchPrefixes?: string[];
  children?: DashboardRoute[];
}

/**
 * Clean, Grouped Admin Primary Routes
 * Detailed sub-sections are accessed through each hub page via interactive navigation cards & tabs.
 */
export const adminRoutes: DashboardRoute[] = [
  // Section: Core Operations
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/admin',
    icon: LayoutDashboard,
    section: 'Overview',
    sectionBn: 'ওভারভিউ',
  },
  {
    title: 'Orders',
    titleBn: 'অর্ডার ব্যবস্থাপনা',
    href: '/admin/orders',
    icon: ShoppingCart,
    section: 'Operations',
    sectionBn: 'অপারেশনস',
    matchPrefixes: ['/admin/orders'],
  },
  {
    title: 'Products',
    titleBn: 'পণ্য ক্যাটালগ',
    href: '/admin/products',
    icon: Package,
    section: 'Operations',
    sectionBn: 'অপারেশনস',
    matchPrefixes: ['/admin/products', '/admin/categories', '/admin/brands'],
  },

  // Section: Management & Commerce
  {
    title: 'Promotions',
    titleBn: 'প্রমোশন ও অফার',
    href: '/admin/promotions',
    icon: Tag,
    section: 'Management',
    sectionBn: 'ব্যবস্থাপনা',
    matchPrefixes: ['/admin/promotions', '/admin/coupons', '/admin/flash-sales', '/admin/banners'],
  },
  {
    title: 'Users & Partners',
    titleBn: 'ব্যবহারকারী ও অংশীদার',
    href: '/admin/users-management',
    icon: Users,
    section: 'Management',
    sectionBn: 'ব্যবস্থাপনা',
    matchPrefixes: ['/admin/users-management', '/admin/users', '/admin/sellers', '/admin/riders'],
  },
  {
    title: 'Finance',
    titleBn: 'অর্থ ও পেমেন্ট',
    href: '/admin/finance',
    icon: CreditCard,
    section: 'Management',
    sectionBn: 'ব্যবস্থাপনা',
    matchPrefixes: ['/admin/finance'],
  },

  // Section: Communication & Governance
  {
    title: 'Messages',
    titleBn: 'বার্তা আদান-প্রদান',
    href: '/admin/messages',
    icon: MessageSquare,
    section: 'System',
    sectionBn: 'সিস্টেম',
    matchPrefixes: ['/admin/messages'],
  },
  {
    title: 'Disputes',
    titleBn: 'বিরোধ ও অভিযোগ',
    href: '/admin/disputes',
    icon: AlertCircle,
    section: 'System',
    sectionBn: 'সিস্টেম',
    matchPrefixes: ['/admin/disputes'],
  },
  {
    title: 'Settings',
    titleBn: 'সিস্টেম সেটিংস',
    href: '/admin/settings',
    icon: Settings,
    section: 'System',
    sectionBn: 'সিস্টেম',
    matchPrefixes: ['/admin/settings'],
  },
];

/**
 * Super Admin Grouped Primary Routes
 */
export const superAdminRoutes: DashboardRoute[] = [
  // Section: Overview
  {
    title: 'Master Console',
    titleBn: 'মাস্টার কনসোল',
    href: '/super-admin',
    icon: LayoutDashboard,
    section: 'Overview',
    sectionBn: 'ওভারভিউ',
  },
  {
    title: 'Orders',
    titleBn: 'সকল অর্ডার',
    href: '/super-admin/orders',
    icon: ShoppingCart,
    section: 'Operations',
    sectionBn: 'অপারেশনস',
    matchPrefixes: ['/super-admin/orders'],
  },
  {
    title: 'Products',
    titleBn: 'মাস্টার ক্যাটালগ',
    href: '/super-admin/products',
    icon: Package,
    section: 'Operations',
    sectionBn: 'অপারেশনস',
    matchPrefixes: ['/super-admin/products', '/super-admin/categories', '/super-admin/brands'],
  },

  // Section: Platform Governance
  {
    title: 'Promotions',
    titleBn: 'প্রমোশন হাব',
    href: '/super-admin/promotions',
    icon: Tag,
    section: 'Governance',
    sectionBn: 'প্রশাসন',
    matchPrefixes: ['/super-admin/promotions', '/super-admin/coupons', '/super-admin/flash-sales', '/super-admin/banners'],
  },
  {
    title: 'Users & Staff',
    titleBn: 'ব্যবহারকারী ও স্টাফ',
    href: '/super-admin/users-management',
    icon: Users,
    section: 'Governance',
    sectionBn: 'প্রশাসন',
    matchPrefixes: ['/super-admin/users-management', '/super-admin/users', '/super-admin/sellers', '/super-admin/riders', '/super-admin/admins'],
  },
  {
    title: 'Finance & Payouts',
    titleBn: 'অর্থ ও পে-আউট',
    href: '/super-admin/finance',
    icon: CreditCard,
    section: 'Governance',
    sectionBn: 'প্রশাসন',
    matchPrefixes: ['/super-admin/finance'],
  },

  // Section: System & Policies
  {
    title: 'Messages',
    titleBn: 'কমিউনিকেশন',
    href: '/super-admin/messages',
    icon: MessageSquare,
    section: 'System',
    sectionBn: 'সিস্টেম',
    matchPrefixes: ['/super-admin/messages'],
  },
  {
    title: 'Disputes & Reviews',
    titleBn: 'বিরোধ ও পর্যালোচনা',
    href: '/super-admin/disputes',
    icon: AlertCircle,
    section: 'System',
    sectionBn: 'সিস্টেম',
    matchPrefixes: ['/super-admin/disputes'],
  },
  {
    title: 'System Settings',
    titleBn: 'প্ল্যাটফর্ম সেটিংস',
    href: '/super-admin/settings',
    icon: Settings,
    section: 'System',
    sectionBn: 'সিস্টেম',
    matchPrefixes: ['/super-admin/settings'],
  },
];

/**
 * Seller Grouped Primary Routes
 */
export const sellerRoutes: DashboardRoute[] = [
  // Section: Shop Operations
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/seller',
    icon: LayoutDashboard,
    section: 'Shop Operations',
    sectionBn: 'দোকান অপারেশন',
  },
  {
    title: 'Shop Profile',
    titleBn: 'দোকান প্রোফাইল',
    href: '/seller/shop',
    icon: Store,
    section: 'Shop Operations',
    sectionBn: 'দোকান অপারেশন',
    matchPrefixes: ['/seller/shop'],
  },
  {
    title: 'Products & Stock',
    titleBn: 'পণ্য ও ইনভেন্টরি',
    href: '/seller/products',
    icon: Package,
    section: 'Shop Operations',
    sectionBn: 'দোকান অপারেশন',
    matchPrefixes: ['/seller/products'],
  },
  {
    title: 'Orders',
    titleBn: 'গ্রাহক অর্ডার',
    href: '/seller/orders',
    icon: ShoppingCart,
    section: 'Shop Operations',
    sectionBn: 'দোকান অপারেশন',
    matchPrefixes: ['/seller/orders'],
  },

  // Section: Business & Financials
  {
    title: 'Coupons',
    titleBn: 'কুপন ও ছাড়',
    href: '/seller/coupons',
    icon: Ticket,
    section: 'Business',
    sectionBn: 'ব্যবসা ও আয়',
    matchPrefixes: ['/seller/coupons'],
  },
  {
    title: 'Wallet & Payouts',
    titleBn: 'ওয়ালেট ও পে-আউট',
    href: '/seller/wallet',
    icon: Wallet,
    section: 'Business',
    sectionBn: 'ব্যবসা ও আয়',
    matchPrefixes: ['/seller/wallet'],
  },
  {
    title: 'Sales Reports',
    titleBn: 'বিক্রয় রিপোর্ট',
    href: '/seller/reports',
    icon: BarChart3,
    section: 'Business',
    sectionBn: 'ব্যবসা ও আয়',
    matchPrefixes: ['/seller/reports'],
  },

  // Section: Support & Settings
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/seller/messages',
    icon: MessageSquare,
    section: 'Support',
    sectionBn: 'সহায়তা ও সেটিংস',
    matchPrefixes: ['/seller/messages'],
  },
  {
    title: 'Disputes',
    titleBn: 'অভিযোগ',
    href: '/seller/disputes',
    icon: AlertCircle,
    section: 'Support',
    sectionBn: 'সহায়তা ও সেটিংস',
    matchPrefixes: ['/seller/disputes'],
  },
  {
    title: 'Settings',
    titleBn: 'সেটিংস',
    href: '/seller/settings',
    icon: Settings,
    section: 'Support',
    sectionBn: 'সহায়তা ও সেটিংস',
    matchPrefixes: ['/seller/settings'],
  },
];

/**
 * Rider Grouped Primary Routes
 */
export const riderRoutes: DashboardRoute[] = [
  // Section: Delivery Tasks
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/rider',
    icon: LayoutDashboard,
    section: 'Operations',
    sectionBn: 'ডেলিভারি কাজ',
  },
  {
    title: 'Deliveries',
    titleBn: 'ডেলিভারি কার্যতালিকা',
    href: '/rider/deliveries',
    icon: Truck,
    section: 'Operations',
    sectionBn: 'ডেলিভারি কাজ',
    matchPrefixes: ['/rider/deliveries'],
  },

  // Section: Account & Support
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/rider/messages',
    icon: MessageSquare,
    section: 'Account',
    sectionBn: 'অ্যাকাউন্ট',
    matchPrefixes: ['/rider/messages'],
  },
  {
    title: 'Rider Profile',
    titleBn: 'রাইডার প্রোফাইল',
    href: '/rider/profile',
    icon: User,
    section: 'Account',
    sectionBn: 'অ্যাকাউন্ট',
    matchPrefixes: ['/rider/profile'],
  },
  {
    title: 'Settings',
    titleBn: 'সেটিংস',
    href: '/rider/settings',
    icon: Settings,
    section: 'Account',
    sectionBn: 'অ্যাকাউন্ট',
    matchPrefixes: ['/rider/settings'],
  },
];

/**
 * Customer Grouped Primary Routes
 */
export const customerRoutes: DashboardRoute[] = [
  // Section: Overview
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/customer',
    icon: LayoutDashboard,
    section: 'Overview',
    sectionBn: 'ওভারভিউ',
  },
  {
    title: 'My Orders',
    titleBn: 'আমার অর্ডার',
    href: '/customer/orders',
    icon: ShoppingCart,
    section: 'Overview',
    sectionBn: 'ওভারভিউ',
    matchPrefixes: ['/customer/orders'],
  },
  {
    title: 'Wishlist',
    titleBn: 'পছন্দের তালিকা',
    href: '/customer/wishlist',
    icon: Star,
    section: 'Overview',
    sectionBn: 'ওভারভিউ',
    matchPrefixes: ['/customer/wishlist'],
  },

  // Section: Engagement
  {
    title: 'Reviews',
    titleBn: 'মতামত ও রিভিউ',
    href: '/customer/reviews',
    icon: Star,
    section: 'Activity',
    sectionBn: 'কার্যক্রম',
    matchPrefixes: ['/customer/reviews'],
  },
  {
    title: 'Product Requests',
    titleBn: 'পণ্য অনুরোধ',
    href: '/customer/product-requests',
    icon: ClipboardList,
    section: 'Activity',
    sectionBn: 'কার্যক্রম',
    matchPrefixes: ['/customer/product-requests'],
  },
  {
    title: 'Disputes',
    titleBn: 'অভিযোগ',
    href: '/customer/disputes',
    icon: AlertCircle,
    section: 'Activity',
    sectionBn: 'কার্যক্রম',
    matchPrefixes: ['/customer/disputes'],
  },
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/customer/messages',
    icon: MessageSquare,
    section: 'Activity',
    sectionBn: 'কার্যক্রম',
    matchPrefixes: ['/customer/messages'],
  },

  // Section: Account
  {
    title: 'Addresses',
    titleBn: 'ডেলিভারি ঠিকানা',
    href: '/customer/addresses',
    icon: MapPin,
    section: 'Account',
    sectionBn: 'অ্যাকাউন্ট',
    matchPrefixes: ['/customer/addresses'],
  },
  {
    title: 'Profile & Settings',
    titleBn: 'প্রোফাইল ও সেটিংস',
    href: '/customer/profile',
    icon: User,
    section: 'Account',
    sectionBn: 'অ্যাকাউন্ট',
    matchPrefixes: ['/customer/profile', '/customer/settings'],
  },
];
