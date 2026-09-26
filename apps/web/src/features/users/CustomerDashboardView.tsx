'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetOrdersQuery } from '@/features/orders/ordersApi';
import { useGetUserWishlistQuery } from '@/features/wishlists/wishlistsApi';
import { useGetAddressesQuery } from '@/features/addresses/addressApi';
import { useGetCustomerDisputesQuery } from '@/features/disputes/disputesApi';
import {
  ShoppingCart,
  Heart,
  MapPin,
  ClipboardList,
  Star,
  MessageSquare,
  AlertCircle,
  Bell,
  User,
  Settings,
  ArrowRight,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface CustomerDashboardViewProps {
  lang?: string;
}

export function CustomerDashboardView({ lang = 'en' }: CustomerDashboardViewProps) {
  const isBn = lang === 'bn';
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: orders = [], isLoading: isOrdersLoading } = useGetOrdersQuery();
  const { data: wishlist = [], isLoading: isWishlistLoading } = useGetUserWishlistQuery();
  const { data: addresses = [], isLoading: isAddressesLoading } = useGetAddressesQuery();
  const { data: disputes = [], isLoading: isDisputesLoading } = useGetCustomerDisputesQuery();

  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status.toUpperCase()),
  );

  const hubCards = [
    {
      id: 'orders',
      title: 'My Orders',
      titleBn: 'আমার অর্ডারসমূহ',
      description: 'Track orders, view receipts and delivery history',
      descriptionBn: 'চলতি অর্ডার ট্র্যাক করুন এবং অর্ডারের বিবরণ দেখুন',
      icon: ShoppingCart,
      href: `/${lang}/customer/orders`,
      badge:
        activeOrders.length > 0
          ? `${activeOrders.length} ${isBn ? 'সক্রিয়' : 'Active'}`
          : undefined,
      badgeVariant: 'default' as const,
      color: 'from-blue-500/20 to-blue-500/5 text-blue-600',
    },
    {
      id: 'wishlist',
      title: 'Saved Wishlist',
      titleBn: 'পছন্দের পণ্যসমূহ',
      description: 'Your saved favorite items ready for quick checkout',
      descriptionBn: 'আপনার পছন্দের পণ্যসমূহ সংরক্ষণ ও দ্রুত কিনুন',
      icon: Heart,
      href: `/${lang}/customer/wishlist`,
      badge:
        wishlist.length > 0
          ? `${wishlist.length} ${isBn ? 'পণ্য' : 'Items'}`
          : undefined,
      badgeVariant: 'secondary' as const,
      color: 'from-rose-500/20 to-rose-500/5 text-rose-600',
    },
    {
      id: 'addresses',
      title: 'Delivery Addresses',
      titleBn: 'ডেলিভারি ঠিকানা',
      description: 'Manage home, office and village drop-off locations',
      descriptionBn: 'বাসা, অফিস ও গ্রামের ডেলিভারি ঠিকানা যুক্ত ও পরিবর্তন করুন',
      icon: MapPin,
      href: `/${lang}/customer/addresses`,
      badge:
        addresses.length > 0
          ? `${addresses.length} ${isBn ? 'ঠিকানা' : 'Saved'}`
          : undefined,
      badgeVariant: 'secondary' as const,
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600',
    },
    {
      id: 'product-requests',
      title: 'Product Requests',
      titleBn: 'পণ্য অনুরোধ',
      description: 'Request seasonal or rare village farm produce',
      descriptionBn: 'গ্রামের দুষ্প্রাপ্য বা বিশেষ কৃষিপণ্যের জন্য আবেদন',
      icon: ClipboardList,
      href: `/${lang}/customer/product-requests`,
      color: 'from-amber-500/20 to-amber-500/5 text-amber-600',
    },
    {
      id: 'reviews',
      title: 'My Reviews',
      titleBn: 'আমার রিভিউসমূহ',
      description: 'Feedback and ratings given on purchased products',
      descriptionBn: 'আপনার কেনা পণ্য ও সেলারদের দেওয়া রিভিউ ও রেটিং',
      icon: Star,
      href: `/${lang}/customer/reviews`,
      color: 'from-yellow-500/20 to-yellow-500/5 text-yellow-600',
    },
    {
      id: 'messages',
      title: 'Direct Messages',
      titleBn: 'বার্তা বিনিময়',
      description: 'Real-time inquiries with sellers and delivery riders',
      descriptionBn: 'সেলার এবং ডেলিভারি রাইডারের সাথে সরাসরি চ্যাট',
      icon: MessageSquare,
      href: `/${lang}/customer/messages`,
      color: 'from-indigo-500/20 to-indigo-500/5 text-indigo-600',
    },
    {
      id: 'disputes',
      title: 'Disputes & Help',
      titleBn: 'বিরোধ ও রিফান্ড',
      description: 'Open claims for damaged, wrong or missing deliveries',
      descriptionBn: 'ভুল, ক্ষতিগ্রস্ত পণ্য বা রিফান্ডের জন্য ক্লেইম পরিচালনা',
      icon: AlertCircle,
      href: `/${lang}/customer/disputes`,
      badge:
        disputes.filter((d) => d.status === 'OPEN').length > 0
          ? `${disputes.filter((d) => d.status === 'OPEN').length} ${isBn ? 'খোলা' : 'Open'}`
          : undefined,
      badgeVariant: 'destructive' as const,
      color: 'from-red-500/20 to-red-500/5 text-red-600',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      titleBn: 'নোটিফিকেশন',
      description: 'Delivery alerts, flash deals and order status updates',
      descriptionBn: 'অর্ডারের অগ্রগতি ও বিশেষ ছাড় সম্পর্কিত বার্তা',
      icon: Bell,
      href: `/${lang}/customer/notifications`,
      color: 'from-purple-500/20 to-purple-500/5 text-purple-600',
    },
    {
      id: 'profile',
      title: 'Personal Profile',
      titleBn: 'ব্যক্তিগত প্রোফাইল',
      description: 'Your personal info, contact phone, and avatar',
      descriptionBn: 'নাম, মোবাইল নম্বর ও ব্যক্তিগত তথ্য পরিবর্তন করুন',
      icon: User,
      href: `/${lang}/customer/profile`,
      color: 'from-cyan-500/20 to-cyan-500/5 text-cyan-600',
    },
    {
      id: 'settings',
      title: 'Security & Settings',
      titleBn: 'নিরাপত্তা ও সেটিংস',
      description: 'Manage password, privacy and login credentials',
      descriptionBn: 'পাসওয়ার্ড পরিবর্তন ও অ্যাকাউন্ট নিরাপত্তা সেটিংস',
      icon: Settings,
      href: `/${lang}/customer/settings`,
      color: 'from-slate-500/20 to-slate-500/5 text-slate-600',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-card border p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isBn ? 'গ্রাহক ড্যাশবোর্ড' : 'Customer Dashboard'}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isBn
                ? `স্বাগতম, ${user?.firstName || 'সম্মানিত গ্রাহক'}!`
                : `Welcome back, ${user?.firstName || 'Valued Customer'}!`}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              {isBn
                ? 'আপনার অর্ডার, ডেলিভারি ঠিকানা ও পছন্দের পণ্য সহজে এক জায়গা থেকে পরিচালনা করুন।'
                : 'Manage your active orders, wishlist, delivery addresses, and account security all in one place.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xl shadow-sm">
              <Link href={`/${lang}/customer/orders`}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isBn ? 'আমার অর্ডার দেখুন' : 'View Orders'}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl bg-background/80">
              <Link href={`/${lang}/search`}>
                <Package className="w-4 h-4 mr-2" />
                {isBn ? 'পণ্য খুঁজুন' : 'Browse Marketplace'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-primary/10">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              {isBn ? 'মোট অর্ডার' : 'Total Orders'}
            </p>
            <p className="text-2xl font-bold">
              {isOrdersLoading ? '...' : orders.length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              {isBn ? 'চলতি অর্ডার' : 'Active Orders'}
            </p>
            <p className="text-2xl font-bold text-primary">
              {isOrdersLoading ? '...' : activeOrders.length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              {isBn ? 'পছন্দের পণ্য' : 'Wishlist Items'}
            </p>
            <p className="text-2xl font-bold text-rose-600">
              {isWishlistLoading ? '...' : wishlist.length}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              {isBn ? 'সংরক্ষিত ঠিকানা' : 'Saved Addresses'}
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {isAddressesLoading ? '...' : addresses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Hub Cards Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight">
            {isBn ? 'অ্যাকাউন্ট ও সেবা হাব' : 'Account & Service Modules'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isBn
              ? 'আপনার প্রয়োজনীয় সকল পৃষ্ঠা ও সেটিংস সরাসরি ব্যবহার করুন'
              : 'Direct access to all your account management sections'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.id} href={card.href} className="group">
                <Card className="h-full rounded-2xl border-muted/60 transition-all duration-300 hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 relative overflow-hidden bg-card/60 backdrop-blur-sm">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        {card.badge && (
                          <Badge variant={card.badgeVariant} className="text-xs font-semibold">
                            {card.badge}
                          </Badge>
                        )}
                        <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-base font-semibold mt-3 group-hover:text-primary transition-colors">
                      {isBn ? card.titleBn : card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0">
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {isBn ? card.descriptionBn : card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Section */}
      {orders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">
              {isBn ? 'সাম্প্রতিক অর্ডারসমূহ' : 'Recent Orders'}
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href={`/${lang}/customer/orders`}>
                {isBn ? 'সকল অর্ডার' : 'View all'}
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.slice(0, 2).map((order) => (
              <Card key={order.id} className="rounded-2xl border-muted/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-semibold text-xs">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-muted/40">
                  <span className="text-sm font-bold text-primary">
                    ৳{order.total.toLocaleString()}
                  </span>
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
                    <Link href={`/${lang}/customer/orders/${order.id}`}>
                      {isBn ? 'বিস্তারিত' : 'Details'}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
