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
  DollarSign
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
  { title: 'Products', titleBn: 'পণ্য', href: '/admin/products', icon: Package },
  { title: 'Orders', titleBn: 'অর্ডার', href: '/admin/orders', icon: ShoppingCart },
  { title: 'Shops', titleBn: 'দোকান', href: '/admin/shops', icon: Store },
  { title: 'Categories', titleBn: 'ক্যাটাগরি', href: '/admin/categories', icon: Tag },
  { title: 'Riders', titleBn: 'রাইডার', href: '/admin/riders', icon: Truck },
  { title: 'Offers', titleBn: 'অফার', href: '/admin/offers', icon: Ticket },
  { title: 'Messages', titleBn: 'বার্তা', href: '/admin/messages', icon: MessageSquare },
  { title: 'Disputes', titleBn: 'বিরোধ', href: '/admin/disputes', icon: AlertCircle },
  { title: 'Settings', titleBn: 'সেটিংস', href: '/admin/settings', icon: Settings },
];

export const sellerRoutes: DashboardRoute[] = [
  { title: 'Dashboard', titleBn: 'ড্যাশবোর্ড', href: '/seller', icon: LayoutDashboard },
  { title: 'My Shop', titleBn: 'আমার দোকান', href: '/seller/shop', icon: Store },
  { title: 'Products', titleBn: 'পণ্য', href: '/seller/products', icon: Package },
  { title: 'Orders', titleBn: 'অর্ডার', href: '/seller/orders', icon: ShoppingCart },
  { title: 'Coupons', titleBn: 'কুপন', href: '/seller/coupons', icon: Ticket },
  { title: 'Messages', titleBn: 'বার্তা', href: '/seller/messages', icon: MessageSquare },
  { title: 'Disputes', titleBn: 'বিরোধ', href: '/seller/disputes', icon: AlertCircle },
  { title: 'Settings', titleBn: 'সেটিংস', href: '/seller/settings', icon: Settings },
];

export const riderRoutes: DashboardRoute[] = [
  { title: 'Dashboard', titleBn: 'ড্যাশবোর্ড', href: '/rider', icon: LayoutDashboard },
  { title: 'Deliveries', titleBn: 'ডেলিভারি', href: '/rider/deliveries', icon: Truck },
  { title: 'Earnings', titleBn: 'উপার্জন', href: '/rider/earnings', icon: DollarSign },
  { title: 'Messages', titleBn: 'বার্তা', href: '/rider/messages', icon: MessageSquare },
  { title: 'Settings', titleBn: 'সেটিংস', href: '/rider/settings', icon: Settings },
];

export const customerRoutes: DashboardRoute[] = [
  { title: 'Dashboard', titleBn: 'ড্যাশবোর্ড', href: '/profile', icon: User },
  { title: 'Orders', titleBn: 'আমার অর্ডার', href: '/orders', icon: ShoppingCart },
  { title: 'Messages', titleBn: 'বার্তা', href: '/messages', icon: MessageSquare },
  { title: 'Disputes', titleBn: 'বিরোধ', href: '/disputes', icon: AlertCircle },
  { title: 'Settings', titleBn: 'সেটিংস', href: '/settings', icon: Settings },
];
