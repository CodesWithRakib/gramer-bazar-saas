'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { RootState } from '@/store/store';
import { useGetOrdersQuery } from '@/features/orders/ordersApi';
import { useGetUserWishlistQuery } from '@/features/wishlists/wishlistsApi';
import { useGetAddressesQuery } from '@/features/addresses/addressApi';
import { useGetCustomerDisputesQuery } from '@/features/disputes/disputesApi';
import { useGetUnreadCountQuery } from '@/features/notifications/notificationsApi';
import { useGetPublicCouponsQuery } from '@/features/coupons/couponsApi';
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
  ChevronRight,
  Package,
  Search,
  Truck,
  Ticket,
  Copy,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomImage } from '@/components/ui/CustomImage';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getOrderStatusMeta } from '@/lib/order-status';
import { formatCurrency, formatDate, formatReference } from '@/lib/format';

export interface CustomerDashboardViewProps {
  lang?: string;
}

/** Statuses that still need customer attention. */
const CLOSED_ORDER_STATUSES = [
  'DELIVERED',
  'CANCELLED',
  'FAILED',
  'REFUNDED',
  'RETURNED',
  'PICKED_UP',
];

export function CustomerDashboardView({ lang = 'en' }: CustomerDashboardViewProps) {
  const isBn = lang === 'bn';
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
  } = useGetOrdersQuery();
  const { data: wishlist = [], isLoading: isWishlistLoading } = useGetUserWishlistQuery();
  const { data: addresses = [], isLoading: isAddressesLoading } = useGetAddressesQuery();
  const { data: disputes = [] } = useGetCustomerDisputesQuery();
  const { data: unread } = useGetUnreadCountQuery();
  const { data: coupons = [] } = useGetPublicCouponsQuery();

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const activeOrders = sortedOrders.filter(
    (o) => !CLOSED_ORDER_STATUSES.includes(o.status.toUpperCase())
  );
  const openDisputes = disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW');
  const unreadCount = unread?.count ?? 0;
  const availableCoupons = coupons.filter((c) => c.isActive !== false && !c.shopId).slice(0, 3);

  const stats = [
    {
      key: 'total',
      label: isBn ? 'মোট অর্ডার' : 'Total orders',
      value: orders.length,
      icon: ShoppingCart,
      href: `/${lang}/customer/orders`,
      loading: isOrdersLoading,
    },
    {
      key: 'active',
      label: isBn ? 'চলমান অর্ডার' : 'In progress',
      value: activeOrders.length,
      icon: Truck,
      href: `/${lang}/customer/orders?status=to-receive`,
      loading: isOrdersLoading,
      highlight: activeOrders.length > 0,
    },
    {
      key: 'wishlist',
      label: isBn ? 'পছন্দের পণ্য' : 'Wishlist items',
      value: wishlist.length,
      icon: Heart,
      href: `/${lang}/customer/wishlist`,
      loading: isWishlistLoading,
    },
    {
      key: 'addresses',
      label: isBn ? 'সংরক্ষিত ঠিকানা' : 'Saved addresses',
      value: addresses.length,
      icon: MapPin,
      href: `/${lang}/customer/addresses`,
      loading: isAddressesLoading,
    },
  ];

  const quickActions = [
    {
      title: isBn ? 'আমার অর্ডার' : 'My Orders',
      icon: ShoppingCart,
      href: `/${lang}/customer/orders`,
    },
    {
      title: isBn ? 'পছন্দের তালিকা' : 'Wishlist',
      icon: Heart,
      href: `/${lang}/customer/wishlist`,
    },
    { title: isBn ? 'ঠিকানা' : 'Addresses', icon: MapPin, href: `/${lang}/customer/addresses` },
    {
      title: isBn ? 'পণ্য অনুরোধ' : 'Product Requests',
      icon: ClipboardList,
      href: `/${lang}/customer/product-requests`,
    },
    { title: isBn ? 'আমার রিভিউ' : 'My Reviews', icon: Star, href: `/${lang}/customer/reviews` },
    {
      title: isBn ? 'বার্তা' : 'Messages',
      icon: MessageSquare,
      href: `/${lang}/customer/messages`,
    },
    { title: isBn ? 'প্রোফাইল' : 'Profile', icon: User, href: `/${lang}/customer/profile` },
  ];

  const copyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(isBn ? `কুপন কোড ${code} কপি হয়েছে` : `Coupon code ${code} copied`);
    } catch {
      toast.info(code);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Greeting */}
      <Card className="rounded-3xl border-border/70">
        <CardContent className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isBn
                ? `স্বাগতম, ${user?.firstName || 'গ্রাহক'}!`
                : `Welcome back, ${user?.firstName || 'shopper'}!`}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              {isBn
                ? 'আপনার অর্ডার, ডেলিভারি ঠিকানা, পছন্দের পণ্য ও অফার এক জায়গা থেকে দেখুন।'
                : 'Track your orders, manage addresses and discover today’s offers — all in one place.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button size="sm" asChild className="rounded-xl">
              <Link href={`/${lang}/customer/orders`}>
                <Package className="me-1.5 h-4 w-4" />
                {isBn ? 'আমার অর্ডার' : 'My orders'}
              </Link>
            </Button>
            <Button size="sm" asChild variant="outline" className="rounded-xl">
              <Link href={`/${lang}/categories`}>
                <Search className="me-1.5 h-4 w-4" />
                {isBn ? 'পণ্য ব্রাউজ করুন' : 'Browse products'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.key} href={stat.href} className="group">
              <Card className="h-full rounded-2xl border-border/70 transition-colors group-hover:border-primary/40">
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </span>
                    <Icon
                      className={`h-4 w-4 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                  </div>
                  {stat.loading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <span
                      className={`text-2xl font-bold ${stat.highlight ? 'text-primary' : 'text-foreground'}`}
                    >
                      {stat.value}
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Needs attention: unread notifications + open disputes */}
      {(unreadCount > 0 || openDisputes.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {unreadCount > 0 && (
            <Link href={`/${lang}/customer/notifications`} className="group">
              <Card className="h-full rounded-2xl border-primary/25 bg-primary/5 transition-colors group-hover:border-primary/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {isBn
                        ? `${unreadCount} টি নতুন নোটিফিকেশন`
                        : `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isBn ? 'অর্ডার ও অফারের আপডেট দেখুন' : 'Order and offer updates'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                </CardContent>
              </Card>
            </Link>
          )}

          {openDisputes.length > 0 && (
            <Link href={`/${lang}/customer/disputes`} className="group">
              <Card className="h-full rounded-2xl border-warning/30 bg-warning/5 transition-colors group-hover:border-warning/60">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {isBn
                        ? `${openDisputes.length} টি অভিযোগ চলমান`
                        : `${openDisputes.length} open dispute${openDisputes.length > 1 ? 's' : ''}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isBn
                        ? 'সাপোর্ট টিমের সাথে আলোচনা চালিয়ে যান'
                        : 'Continue the conversation with support'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Active orders */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {isBn ? 'চলমান অর্ডার' : 'In progress'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isBn ? 'যেগুলো এখনো পৌঁছায়নি' : 'Orders that have not reached you yet'}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs">
            <Link href={`/${lang}/customer/orders`}>
              {isBn ? 'সব অর্ডার' : 'All orders'}
              <ChevronRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </Button>
        </div>

        {isOrdersLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : isOrdersError ? (
          <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 text-sm text-muted-foreground">
              {isBn
                ? 'অর্ডারের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।'
                : 'We could not load your orders. Please refresh the page.'}
            </CardContent>
          </Card>
        ) : activeOrders.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/80 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <Truck className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {isBn ? 'এখন কোনো চলমান অর্ডার নেই' : 'No orders in progress'}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {isBn
                  ? 'নতুন অর্ডার করলে এখান থেকে ডেলিভারির অবস্থা দেখতে পারবেন।'
                  : 'Place an order and you can follow its delivery status right here.'}
              </p>
              <Button asChild size="sm" className="mt-1 rounded-xl">
                <Link href={`/${lang}/categories`}>
                  {isBn ? 'কেনাকাটা শুরু করুন' : 'Start shopping'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {activeOrders.slice(0, 2).map((order) => {
              const meta = getOrderStatusMeta(order.status);
              return (
                <li key={order.id}>
                  <Link href={`/${lang}/customer/orders/${order.id}`} className="block group">
                    <Card className="rounded-2xl border-border/70 transition-colors group-hover:border-primary/40">
                      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {formatReference(order.id)}
                            </span>
                            <StatusBadge tone={meta.tone} label={isBn ? meta.bn : meta.en} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt, lang)}
                            <span aria-hidden className="mx-1.5">
                              •
                            </span>
                            {order.items?.length ?? 0} {isBn ? 'টি পণ্য' : 'items'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-primary">
                            {formatCurrency(order.total)}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent orders + wishlist preview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {isBn ? 'সাম্প্রতিক অর্ডার' : 'Recent orders'}
            </h2>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs">
              <Link href={`/${lang}/customer/orders`}>
                {isBn ? 'সব দেখুন' : 'View all'}
                <ChevronRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          {isOrdersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-border/80 bg-muted/20">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                {isBn ? 'এখনো কোনো অর্ডার করা হয়নি।' : 'You have not placed any orders yet.'}
              </CardContent>
            </Card>
          ) : (
            <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-card">
              {sortedOrders.slice(0, 4).map((order) => {
                const meta = getOrderStatusMeta(order.status);
                return (
                  <li key={order.id}>
                    <Link
                      href={`/${lang}/customer/orders/${order.id}`}
                      className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-foreground">
                          {formatReference(order.id)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(order.createdAt, lang)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <StatusBadge tone={meta.tone} label={isBn ? meta.bn : meta.en} />
                        <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {isBn ? 'পছন্দের পণ্য' : 'Saved items'}
            </h2>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs">
              <Link href={`/${lang}/customer/wishlist`}>{isBn ? 'সব' : 'All'}</Link>
            </Button>
          </div>

          {isWishlistLoading ? (
            <Skeleton className="h-32 w-full rounded-2xl" />
          ) : wishlist.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-border/80 bg-muted/20">
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <Heart className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isBn ? 'এখনো কোনো পণ্য সংরক্ষণ করা হয়নি।' : 'No saved products yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {wishlist.slice(0, 3).map((item) => {
                const name =
                  (isBn ? item.product.nameBn : item.product.nameEn) || item.product.nameEn;
                const rawImage = item.product.images?.[0];
                const image =
                  typeof rawImage === 'string' ? rawImage : rawImage?.url || '/placeholder.jpg';
                return (
                  <li key={item.id}>
                    <Link
                      href={`/${lang}/products/${item.product.slug}`}
                      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <CustomImage
                          src={image}
                          alt={name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                          {name}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-primary">
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Offers & coupons */}
      {availableCoupons.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {isBn ? 'আজকের অফার' : 'Available offers'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? 'চেকআউটে কোড ব্যবহার করে ছাড় নিন'
                  : 'Apply these codes at checkout to save'}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs">
              <Link href={`/${lang}/offers`}>
                {isBn ? 'সব অফার' : 'All offers'}
                <ChevronRight className="ms-1 h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableCoupons.map((coupon) => {
              const value =
                coupon.discountType === 'PERCENTAGE'
                  ? `${coupon.discountValue}% ${isBn ? 'ছাড়' : 'OFF'}`
                  : `${formatCurrency(coupon.discountValue)} ${isBn ? 'ছাড়' : 'OFF'}`;
              return (
                <li key={coupon.id}>
                  <Card className="h-full rounded-2xl border-border/70">
                    <CardContent className="flex h-full flex-col gap-2 p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Ticket className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-bold text-foreground">{value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isBn
                          ? `সর্বনিম্ন অর্ডার ${formatCurrency(coupon.minOrderAmount)}`
                          : `Min. order ${formatCurrency(coupon.minOrderAmount)}`}
                        {coupon.endDate ? (
                          <>
                            <span aria-hidden className="mx-1.5">
                              •
                            </span>
                            {isBn ? 'শেষ' : 'ends'} {formatDate(coupon.endDate, lang, 'short')}
                          </>
                        ) : null}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyCoupon(coupon.code)}
                        className="mt-auto flex items-center justify-between gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-start transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="font-mono text-xs font-bold tracking-wide text-primary">
                          {coupon.code}
                        </span>
                        <Copy className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="sr-only">
                          {isBn ? `${coupon.code} কপি করুন` : `Copy code ${coupon.code}`}
                        </span>
                      </button>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {isBn ? 'দ্রুত অ্যাকশন' : 'Quick actions'}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">
                    {action.title}
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href={`/${lang}/customer/settings`}
              className="group flex h-full items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-primary">
                {isBn ? 'সেটিংস' : 'Settings'}
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
