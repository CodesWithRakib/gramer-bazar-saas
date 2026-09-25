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
} from 'lucide-react';
import { ElementType } from 'react';

export interface DashboardRoute {
  title: string;
  titleBn: string;
  href: string;
  icon: ElementType;
}

export const adminRoutes: DashboardRoute[] = [
  { title: 'Dashboard', titleBn: 'ড্যাশবোর্ড', href: '/admin', icon: LayoutDashboard },
  { title: 'Users', titleBn: 'ইউজার', href: '/admin/users', icon: Users },
  { title: 'Seller Applications', titleBn: 'সেলার আবেদন', href: '/admin/seller-applications', icon: ClipboardList },
  { title: 'Rider Applications', titleBn: 'রাইডার আবেদন', href: '/admin/rider-applications', icon: Truck },
  { title: 'Sellers', titleBn: 'সেলার', href: '/admin/sellers', icon: Store },
  { title: 'Products', titleBn: 'পণ্য', href: '/admin/products', icon: Package },
  { title: 'Categories', titleBn: 'ক্যাটাগরি', href: '/admin/categories', icon: Tag },
  { title: 'Brands', titleBn: 'ব্র্যান্ড', href: '/admin/brands', icon: Building2 },
  { title: 'Orders', titleBn: 'অর্ডার', href: '/admin/orders', icon: ShoppingCart },
  { title: 'Deliveries', titleBn: 'ডেলিভারি', href: '/admin/deliveries', icon: Truck },
  { title: 'Riders', titleBn: 'রাইডার', href: '/admin/riders', icon: Truck },
  { title: 'Product Requests', titleBn: 'পণ্য অনুরোধ', href: '/admin/product-requests', icon: ClipboardList },
  { title: 'Flash Sales', titleBn: 'ফ্ল্যাশ সেল', href: '/admin/flash-sales', icon: Zap },
  { title: 'Coupons', titleBn: 'কুপন', href: '/admin/coupons', icon: Ticket },
  { title: 'Banners', titleBn: 'ব্যানার', href: '/admin/banners', icon: ImageIcon },
  { title: 'Reviews', titleBn: 'রিভিউ', href: '/admin/reviews', icon: Star },
  { title: 'Disputes', titleBn: 'বিরোধ', href: '/admin/disputes', icon: AlertCircle },
  { title: 'Payouts', titleBn: 'পেআউট', href: '/admin/payouts', icon: Wallet },
  { title: 'Reports', titleBn: 'রিপোর্ট', href: '/admin/reports/demand', icon: BarChart3 },
  { title: 'Audit Logs', titleBn: 'অডিট লগ', href: '/admin/audit-logs', icon: ScrollText },
  { title: 'Messages', titleBn: 'বার্তা', href: '/admin/messages', icon: MessageSquare },
  { title: 'Settings', titleBn: 'সেটিংস', href: '/admin/settings', icon: Settings },
];

export const superAdminRoutes: DashboardRoute[] = [
  { title: 'Overview', titleBn: 'সারসংক্ষেপ', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Admin Roster', titleBn: 'অ্যাডমিন পরিচালনা', href: '/super-admin/admins', icon: ShieldCheck },
  { title: 'Create Staff', titleBn: 'নতুন স্টাফ তৈরি', href: '/super-admin/create-user', icon: UserPlus },
  { title: 'All Users', titleBn: 'সকল ব্যবহারকারী', href: '/admin/users', icon: Users },
  { title: 'Seller Applications', titleBn: 'সেলার আবেদন', href: '/admin/seller-applications', icon: ClipboardList },
  { title: 'Rider Applications', titleBn: 'রাইডার আবেদন', href: '/admin/rider-applications', icon: Truck },
  { title: 'Audit Logs', titleBn: 'অডিট লগ', href: '/admin/audit-logs', icon: ScrollText },
  { title: 'System Settings', titleBn: 'সিস্টেম সেটিংস', href: '/admin/settings', icon: Settings },
];

export const sellerRoutes: DashboardRoute[] = [
  { title: 'Dashboard', titleBn: 'ড্যাশবোর্ড', href: '/seller', icon: LayoutDashboard },
  { title: 'My Shop', titleBn: 'আমার দোকান', href: '/seller/shop', icon: Store },
  { title: 'Products', titleBn: 'পণ্য', href: '/seller/products', icon: Package },
  { title: 'Inventory', titleBn: 'ইনভেন্টরি', href: '/seller/inventory', icon: Boxes },
  { title: 'Orders', titleBn: 'অর্ডার', href: '/seller/orders', icon: ShoppingCart },
  { title: 'Coupons', titleBn: 'কুপন', href: '/seller/coupons', icon: Ticket },
  { title: 'Reports', titleBn: 'রিপোর্ট', href: '/seller/reports', icon: BarChart3 },
  { title: 'Wallet', titleBn: 'ওয়ালেট', href: '/seller/wallet', icon: Wallet },
  { title: 'Messages', titleBn: 'বার্তা', href: '/seller/messages', icon: MessageSquare },
  { title: 'Disputes', titleBn: 'বিরোধ', href: '/seller/disputes', icon: AlertCircle },
  { title: 'Profile', titleBn: 'প্রোফাইল', href: '/seller/profile', icon: User },
];

export const riderRoutes: DashboardRoute[] = [
  { title: 'Dashboard', titleBn: 'ড্যাশবোর্ড', href: '/rider', icon: LayoutDashboard },
  { title: 'Deliveries', titleBn: 'ডেলিভারি', href: '/rider/deliveries', icon: Truck },
  { title: 'Messages', titleBn: 'বার্তা', href: '/rider/messages', icon: MessageSquare },
  { title: 'Profile', titleBn: 'প্রোফাইল', href: '/rider/profile', icon: User },
];

export const customerRoutes: DashboardRoute[] = [
  { title: 'Dashboard', titleBn: 'ড্যাশবোর্ড', href: '/profile', icon: User },
  { title: 'Orders', titleBn: 'আমার অর্ডার', href: '/orders', icon: ShoppingCart },
  { title: 'Wishlist', titleBn: 'উইশলিস্ট', href: '/profile/wishlist', icon: Star },
  { title: 'Messages', titleBn: 'বার্তা', href: '/messages', icon: MessageSquare },
  { title: 'Disputes', titleBn: 'বিরোধ', href: '/disputes', icon: AlertCircle },
  { title: 'Security', titleBn: 'নিরাপত্তা', href: '/profile/security', icon: Settings },
];
