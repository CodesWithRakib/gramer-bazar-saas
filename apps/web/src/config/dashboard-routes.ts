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
  ScrollText,
  Boxes,
  ClipboardList,
  Zap,
  Image as ImageIcon,
  Star,
  Building2,
  ShieldCheck,
  UserPlus,
  CreditCard,
  MapPin,
  Lock,
  FileCheck,
  Bell,
} from 'lucide-react';
import { ElementType } from 'react';

export interface DashboardRoute {
  title: string;
  titleBn: string;
  href: string;
  icon: ElementType;
  matchPrefixes?: string[];
  children?: DashboardRoute[];
}

export const adminRoutes: DashboardRoute[] = [
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users & Partners',
    titleBn: 'ব্যবহারকারী ও অংশীদার',
    href: '/admin/users-management',
    icon: Users,
    matchPrefixes: [
      '/admin/users-management',
      '/admin/users',
      '/admin/sellers',
      '/admin/seller-applications',
      '/admin/riders',
      '/admin/rider-applications',
    ],
    children: [
      {
        title: 'All Users',
        titleBn: 'সকল ব্যবহারকারী',
        href: '/admin/users-management/users',
        icon: Users,
      },
      {
        title: 'Sellers Directory',
        titleBn: 'অনুমোদিত সেলার',
        href: '/admin/users-management/sellers',
        icon: Store,
      },
      {
        title: 'Seller Applications',
        titleBn: 'সেলার আবেদন',
        href: '/admin/users-management/seller-applications',
        icon: ClipboardList,
      },
      {
        title: 'Delivery Riders',
        titleBn: 'ডেলিভারি রাইডার',
        href: '/admin/users-management/riders',
        icon: Truck,
      },
      {
        title: 'Rider Applications',
        titleBn: 'রাইডার আবেদন',
        href: '/admin/users-management/rider-applications',
        icon: FileCheck,
      },
    ],
  },
  {
    title: 'Products & Catalog',
    titleBn: 'পণ্য ও ক্যাটালগ',
    href: '/admin/products',
    icon: Package,
    matchPrefixes: [
      '/admin/products',
      '/admin/categories',
      '/admin/brands',
      '/admin/product-requests',
    ],
    children: [
      {
        title: 'All Products',
        titleBn: 'সকল পণ্য',
        href: '/admin/products',
        icon: Package,
      },
      {
        title: 'Categories',
        titleBn: 'ক্যাটাগরি',
        href: '/admin/products/categories',
        icon: Tag,
      },
      {
        title: 'Brands',
        titleBn: 'ব্র্যান্ড',
        href: '/admin/products/brands',
        icon: Building2,
      },
      {
        title: 'Product Requests',
        titleBn: 'পণ্য অনুরোধ',
        href: '/admin/products/product-requests',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Orders & Deliveries',
    titleBn: 'অর্ডার ও ডেলিভারি',
    href: '/admin/orders',
    icon: ShoppingCart,
    matchPrefixes: ['/admin/orders', '/admin/deliveries'],
    children: [
      {
        title: 'All Orders',
        titleBn: 'সকল অর্ডার',
        href: '/admin/orders',
        icon: ShoppingCart,
      },
      {
        title: 'Live Deliveries',
        titleBn: 'লাইভ ডেলিভারি',
        href: '/admin/orders/deliveries',
        icon: Truck,
      },
    ],
  },
  {
    title: 'Finance & Payouts',
    titleBn: 'আর্থিক লেনদেন ও পেআউট',
    href: '/admin/finance',
    icon: CreditCard,
    matchPrefixes: ['/admin/finance', '/admin/payments', '/admin/payouts'],
    children: [
      {
        title: 'Customer Payments',
        titleBn: 'গ্রাহক পেমেন্ট',
        href: '/admin/finance/payments',
        icon: CreditCard,
      },
      {
        title: 'Seller Payouts',
        titleBn: 'সেলার পেআউট',
        href: '/admin/finance/payouts',
        icon: Wallet,
      },
    ],
  },
  {
    title: 'Marketing & Offers',
    titleBn: 'মার্কেটিং ও অফার',
    href: '/admin/promotions',
    icon: Zap,
    matchPrefixes: [
      '/admin/promotions',
      '/admin/flash-sales',
      '/admin/coupons',
      '/admin/banners',
    ],
    children: [
      {
        title: 'Flash Sales',
        titleBn: 'ফ্ল্যাশ সেল',
        href: '/admin/promotions/flash-sales',
        icon: Zap,
      },
      {
        title: 'Discount Coupons',
        titleBn: 'ডিসকাউন্ট কুপন',
        href: '/admin/promotions/coupons',
        icon: Ticket,
      },
      {
        title: 'Hero Banners',
        titleBn: 'হোমপেজ ব্যানার',
        href: '/admin/promotions/banners',
        icon: ImageIcon,
      },
    ],
  },
  {
    title: 'Disputes & Reviews',
    titleBn: 'বিরোধ ও রিভিউ',
    href: '/admin/disputes',
    icon: AlertCircle,
    matchPrefixes: ['/admin/disputes', '/admin/reviews'],
    children: [
      {
        title: 'Customer Disputes',
        titleBn: 'অর্ডার বিরোধ',
        href: '/admin/disputes',
        icon: AlertCircle,
      },
      {
        title: 'Product Reviews',
        titleBn: 'পণ্য রিভিউ',
        href: '/admin/disputes/reviews',
        icon: Star,
      },
    ],
  },
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'Settings & System',
    titleBn: 'সেটিংস ও সিস্টেম',
    href: '/admin/settings',
    icon: Settings,
    matchPrefixes: [
      '/admin/settings',
      '/admin/audit-logs',
      '/admin/reports',
    ],
    children: [
      {
        title: 'Platform & Gateway',
        titleBn: 'প্ল্যাটফর্ম ও গেটওয়ে',
        href: '/admin/settings/general',
        icon: Settings,
      },
      {
        title: 'Audit Logs',
        titleBn: 'অডিট লগ',
        href: '/admin/settings/audit-logs',
        icon: ScrollText,
      },
      {
        title: 'Demand Reports',
        titleBn: 'চাহিদা রিপোর্ট',
        href: '/admin/settings/reports/demand',
        icon: BarChart3,
      },
    ],
  },
];

export const superAdminRoutes: DashboardRoute[] = [
  {
    title: 'Overview',
    titleBn: 'সারসংক্ষেপ',
    href: '/super-admin',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    titleBn: 'ব্যবহারকারী ব্যবস্থাপনা',
    href: '/super-admin/users-management',
    icon: Users,
    matchPrefixes: [
      '/super-admin/users-management',
      '/super-admin/admins',
      '/super-admin/create-user',
      '/super-admin/users',
      '/super-admin/sellers',
      '/super-admin/seller-applications',
      '/super-admin/riders',
      '/super-admin/rider-applications',
    ],
    children: [
      {
        title: 'Admin Roster',
        titleBn: 'অ্যাডমিন পরিচালনা',
        href: '/super-admin/users-management/admins',
        icon: ShieldCheck,
      },
      {
        title: 'Create Staff',
        titleBn: 'নতুন স্টাফ তৈরি',
        href: '/super-admin/users-management/create-user',
        icon: UserPlus,
      },
      {
        title: 'All Users',
        titleBn: 'সকল ব্যবহারকারী',
        href: '/super-admin/users-management/users',
        icon: Users,
      },
      {
        title: 'Sellers Directory',
        titleBn: 'অনুমোদিত সেলার',
        href: '/super-admin/users-management/sellers',
        icon: Store,
      },
      {
        title: 'Seller Applications',
        titleBn: 'সেলার আবেদন',
        href: '/super-admin/users-management/seller-applications',
        icon: ClipboardList,
      },
      {
        title: 'Delivery Riders',
        titleBn: 'ডেলিভারি রাইডার',
        href: '/super-admin/users-management/riders',
        icon: Truck,
      },
      {
        title: 'Rider Applications',
        titleBn: 'রাইডার আবেদন',
        href: '/super-admin/users-management/rider-applications',
        icon: FileCheck,
      },
    ],
  },
  {
    title: 'Products & Catalog',
    titleBn: 'পণ্য ও ক্যাটালগ',
    href: '/super-admin/products',
    icon: Package,
    matchPrefixes: [
      '/super-admin/products',
      '/super-admin/categories',
      '/super-admin/brands',
      '/super-admin/product-requests',
    ],
    children: [
      {
        title: 'All Products',
        titleBn: 'সকল পণ্য',
        href: '/super-admin/products',
        icon: Package,
      },
      {
        title: 'Categories',
        titleBn: 'ক্যাটাগরি',
        href: '/super-admin/products/categories',
        icon: Tag,
      },
      {
        title: 'Brands',
        titleBn: 'ব্র্যান্ড',
        href: '/super-admin/products/brands',
        icon: Building2,
      },
      {
        title: 'Product Requests',
        titleBn: 'পণ্য অনুরোধ',
        href: '/super-admin/products/product-requests',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Orders & Deliveries',
    titleBn: 'অর্ডার ও ডেলিভারি',
    href: '/super-admin/orders',
    icon: ShoppingCart,
    matchPrefixes: ['/super-admin/orders', '/super-admin/deliveries'],
    children: [
      {
        title: 'All Orders',
        titleBn: 'সকল অর্ডার',
        href: '/super-admin/orders',
        icon: ShoppingCart,
      },
      {
        title: 'Live Deliveries',
        titleBn: 'লাইভ ডেলিভারি',
        href: '/super-admin/orders/deliveries',
        icon: Truck,
      },
    ],
  },
  {
    title: 'Finance & Payouts',
    titleBn: 'আর্থিক লেনদেন ও পেআউট',
    href: '/super-admin/finance',
    icon: CreditCard,
    matchPrefixes: [
      '/super-admin/finance',
      '/super-admin/payments',
      '/super-admin/payouts',
    ],
    children: [
      {
        title: 'Customer Payments',
        titleBn: 'গ্রাহক পেমেন্ট',
        href: '/super-admin/finance/payments',
        icon: CreditCard,
      },
      {
        title: 'Seller Payouts',
        titleBn: 'সেলার পেআউট',
        href: '/super-admin/finance/payouts',
        icon: Wallet,
      },
    ],
  },
  {
    title: 'Marketing & Offers',
    titleBn: 'মার্কেটিং ও অফার',
    href: '/super-admin/promotions',
    icon: Zap,
    matchPrefixes: [
      '/super-admin/promotions',
      '/super-admin/flash-sales',
      '/super-admin/coupons',
      '/super-admin/banners',
    ],
    children: [
      {
        title: 'Flash Sales',
        titleBn: 'ফ্ল্যাশ সেল',
        href: '/super-admin/promotions/flash-sales',
        icon: Zap,
      },
      {
        title: 'Discount Coupons',
        titleBn: 'ডিসকাউন্ট কুপন',
        href: '/super-admin/promotions/coupons',
        icon: Ticket,
      },
      {
        title: 'Hero Banners',
        titleBn: 'হোমপেজ ব্যানার',
        href: '/super-admin/promotions/banners',
        icon: ImageIcon,
      },
    ],
  },
  {
    title: 'Disputes & Reviews',
    titleBn: 'বিরোধ ও রিভিউ',
    href: '/super-admin/disputes',
    icon: AlertCircle,
    matchPrefixes: ['/super-admin/disputes', '/super-admin/reviews'],
    children: [
      {
        title: 'Customer Disputes',
        titleBn: 'অর্ডার বিরোধ',
        href: '/super-admin/disputes',
        icon: AlertCircle,
      },
      {
        title: 'Product Reviews',
        titleBn: 'পণ্য রিভিউ',
        href: '/super-admin/disputes/reviews',
        icon: Star,
      },
    ],
  },
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/super-admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'System Settings',
    titleBn: 'সিস্টেম সেটিংস',
    href: '/super-admin/settings',
    icon: Settings,
    matchPrefixes: [
      '/super-admin/settings',
      '/super-admin/audit-logs',
      '/super-admin/reports',
    ],
    children: [
      {
        title: 'Platform & Gateway',
        titleBn: 'প্ল্যাটফর্ম ও গেটওয়ে',
        href: '/super-admin/settings/general',
        icon: Settings,
      },
      {
        title: 'Audit Logs',
        titleBn: 'অডিট লগ',
        href: '/super-admin/settings/audit-logs',
        icon: ScrollText,
      },
      {
        title: 'Demand Reports',
        titleBn: 'চাহিদা রিপোর্ট',
        href: '/super-admin/settings/reports/demand',
        icon: BarChart3,
      },
    ],
  },
];

export const sellerRoutes: DashboardRoute[] = [
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/seller',
    icon: LayoutDashboard,
  },
  {
    title: 'My Shop',
    titleBn: 'আমার দোকান',
    href: '/seller/shop',
    icon: Store,
  },
  {
    title: 'Products & Stock',
    titleBn: 'পণ্য ও স্টক',
    href: '/seller/products',
    icon: Package,
    matchPrefixes: ['/seller/products', '/seller/inventory'],
    children: [
      {
        title: 'My Products',
        titleBn: 'আমার পণ্যসমূহ',
        href: '/seller/products',
        icon: Package,
      },
      {
        title: 'Inventory Stock',
        titleBn: 'ইনভেন্টরি স্টক',
        href: '/seller/products/inventory',
        icon: Boxes,
      },
    ],
  },
  {
    title: 'Orders',
    titleBn: 'অর্ডারসমূহ',
    href: '/seller/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Shop Coupons',
    titleBn: 'দোকানের কুপন',
    href: '/seller/coupons',
    icon: Ticket,
  },
  {
    title: 'Wallet & Payouts',
    titleBn: 'ওয়ালেট ও পেআউট',
    href: '/seller/wallet',
    icon: Wallet,
  },
  {
    title: 'Sales Reports',
    titleBn: 'বিক্রয় রিপোর্ট',
    href: '/seller/reports',
    icon: BarChart3,
  },
  {
    title: 'Disputes',
    titleBn: 'অর্ডার বিরোধ',
    href: '/seller/disputes',
    icon: AlertCircle,
  },
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/seller/messages',
    icon: MessageSquare,
  },
  {
    title: 'Seller Profile',
    titleBn: 'সেলার প্রোফাইল',
    href: '/seller/profile',
    icon: User,
  },
  {
    title: 'Store Settings',
    titleBn: 'দোকান সেটিংস',
    href: '/seller/settings',
    icon: Settings,
  },
];

export const riderRoutes: DashboardRoute[] = [
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/rider',
    icon: LayoutDashboard,
  },
  {
    title: 'Deliveries',
    titleBn: 'ডেলিভারিসমূহ',
    href: '/rider/deliveries',
    icon: Truck,
  },
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/rider/messages',
    icon: MessageSquare,
  },
  {
    title: 'Rider Profile',
    titleBn: 'রাইডার প্রোফাইল',
    href: '/rider/profile',
    icon: User,
  },
  {
    title: 'Rider Settings',
    titleBn: 'রাইডার সেটিংস',
    href: '/rider/settings',
    icon: Settings,
  },
];

export const customerRoutes: DashboardRoute[] = [
  {
    title: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    href: '/customer',
    icon: LayoutDashboard,
  },
  {
    title: 'My Profile',
    titleBn: 'আমার প্রোফাইল',
    href: '/customer/profile',
    icon: User,
  },
  {
    title: 'My Orders',
    titleBn: 'আমার অর্ডার',
    href: '/customer/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Saved Wishlist',
    titleBn: 'পছন্দের তালিকা',
    href: '/customer/wishlist',
    icon: Star,
  },
  {
    title: 'Delivery Addresses',
    titleBn: 'ডেলিভারি ঠিকানা',
    href: '/customer/addresses',
    icon: MapPin,
  },
  {
    title: 'Product Requests',
    titleBn: 'পণ্য অনুরোধ',
    href: '/customer/product-requests',
    icon: ClipboardList,
  },
  {
    title: 'My Reviews',
    titleBn: 'আমার রিভিউ',
    href: '/customer/reviews',
    icon: Star,
  },
  {
    title: 'Messages',
    titleBn: 'বার্তা',
    href: '/customer/messages',
    icon: MessageSquare,
  },
  {
    title: 'Disputes & Help',
    titleBn: 'বিরোধ ও সাহায্য',
    href: '/customer/disputes',
    icon: AlertCircle,
  },
  {
    title: 'Notifications',
    titleBn: 'নোটিফিকেশন',
    href: '/customer/notifications',
    icon: Bell,
  },
  {
    title: 'Account Settings',
    titleBn: 'অ্যাকাউন্ট সেটিংস',
    href: '/customer/settings',
    icon: Settings,
  },
];
