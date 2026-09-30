'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '@/features/orders/ordersApi';
import { OrderTrackingTimeline } from '@/components/orders/OrderTrackingTimeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomImage } from '@/components/ui/CustomImage';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Receipt, Phone, User, Ban, Star, CreditCard, Store, Package } from 'lucide-react';
import { customToast as toast } from '@/components/ui/custom-toast';
import { AddReviewModal } from '@/components/reviews/AddReviewModal';
import { useRetryPaymentMutation } from '@/features/payments/paymentsApi';
import { OpenDisputeDialog } from '@/components/disputes/OpenDisputeDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/lib/apiError';
import { getOrderStatusMeta, getPaymentStatusMeta, PAYMENT_METHOD_META } from '@/lib/order-status';
import { formatCurrency, formatDateTime, formatReference } from '@/lib/format';

export interface CustomerOrderDetailsViewProps {
  lang?: string;
  orderId: string;
}

export function CustomerOrderDetailsView({ lang = 'en', orderId }: CustomerOrderDetailsViewProps) {
  const isBn = lang === 'bn';

  const { data: order, isLoading, error, refetch } = useGetOrderByIdQuery(orderId);
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [retryPayment, { isLoading: isRetrying }] = useRetryPaymentMutation();
  const [reviewProductId, setReviewProductId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handlePayOnline = async () => {
    if (!order) return;
    try {
      const res = await retryPayment({ orderId: order.id, lang }).unwrap();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isBn ? 'পেমেন্ট গেটওয়েতে যাওয়া যায়নি' : 'Could not reach the payment gateway'
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
            { label: isBn ? 'আমার অর্ডার' : 'My Orders', href: `/${lang}/customer/orders` },
          ]}
          title={isBn ? 'অর্ডারের বিবরণ' : 'Order details'}
        />
        <ErrorState
          isBn={isBn}
          title={isBn ? 'অর্ডারটি পাওয়া যায়নি' : 'Order not found'}
          message={
            getApiErrorMessage(error, '') ||
            (isBn
              ? 'অর্ডারের তথ্য লোড করা যায়নি অথবা অর্ডারটি বিদ্যমান নেই।'
              : 'We could not load this order, or it no longer exists.')
          }
          onRetry={() => refetch()}
          secondaryAction={{
            label: isBn ? 'সকল অর্ডার' : 'All orders',
            href: `/${lang}/customer/orders`,
          }}
        />
      </div>
    );
  }

  const handleConfirmCancel = async () => {
    try {
      await cancelOrder(order.id).unwrap();
      toast.success(isBn ? 'অর্ডারটি বাতিল করা হয়েছে' : 'Order cancelled');
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, isBn ? 'অর্ডার বাতিল করা যায়নি' : 'Could not cancel the order')
      );
    }
  };

  const statusUpper = order.status.toUpperCase();
  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentStatusMeta(order.paymentStatus);
  const paymentMethod = PAYMENT_METHOD_META[order.paymentMethod?.toUpperCase()];
  const canCancel = statusUpper === 'PENDING';
  const canReport = statusUpper === 'DELIVERED';
  const canPay = order.paymentStatus.toUpperCase() !== 'PAID' && statusUpper !== 'CANCELLED';

  // Group line items by shop so the customer can see who is fulfilling what.
  const shopGroups = order.items.reduce<
    Array<{
      key: string;
      shop?: (typeof order.items)[number]['sellerProduct']['shop'];
      items: typeof order.items;
    }>
  >((groups, item) => {
    const key = item.sellerProduct?.shop?.id ?? 'unknown';
    const existing = groups.find((g) => g.key === key);
    if (existing) {
      existing.items = [...existing.items, item];
    } else {
      groups.push({ key, shop: item.sellerProduct?.shop, items: [item] });
    }
    return groups;
  }, []);

  const address = order.address;
  const addressLine = [
    address?.streetAddress,
    address?.street,
    address?.upazila ? (isBn ? address.upazila.nameBn : address.upazila.nameEn) : undefined,
    address?.district ? (isBn ? address.district.nameBn : address.district.nameEn) : undefined,
    address?.division ? (isBn ? address.division.nameBn : address.division.nameEn) : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
          { label: isBn ? 'আমার অর্ডার' : 'My Orders', href: `/${lang}/customer/orders` },
          { label: formatReference(order.id) },
        ]}
        title={`${isBn ? 'অর্ডার' : 'Order'} ${formatReference(order.id)}`}
        description={`${isBn ? 'অর্ডার করা হয়েছে' : 'Placed on'} ${formatDateTime(order.createdAt, lang)}`}
        badge={<StatusBadge tone={statusMeta.tone} label={isBn ? statusMeta.bn : statusMeta.en} />}
        secondaryActions={
          <>
            {canCancel && (
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
                className="rounded-xl gap-1.5 text-destructive hover:text-destructive"
              >
                <Ban className="h-4 w-4" />
                {isBn ? 'অর্ডার বাতিল' : 'Cancel order'}
              </Button>
            )}
            {canReport && (
              <OpenDisputeDialog
                orderId={order.id}
                isBn={isBn}
                trigger={
                  <Button variant="outline" className="rounded-xl">
                    {isBn ? 'সমস্যা জানান' : 'Report an issue'}
                  </Button>
                }
              />
            )}
          </>
        }
      />

      {/* Tracking */}
      <Card className="overflow-hidden rounded-2xl border-border/70">
        <CardHeader className="border-b bg-muted/20 pb-3">
          <CardTitle className="text-base">
            {isBn ? 'ডেলিভারি অবস্থা' : 'Delivery status'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <OrderTrackingTimeline
            statusHistory={order.statusHistory || []}
            currentStatus={order.status}
            lang={lang}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Items grouped by shop */}
        <section className="space-y-4 md:col-span-2">
          {shopGroups.map((group) => (
            <Card key={group.key} className="overflow-hidden rounded-2xl border-border/70">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b bg-muted/20 py-3">
                <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                  <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {group.shop
                      ? (isBn ? group.shop.nameBn : group.shop.nameEn) ||
                        group.shop.nameEn ||
                        group.shop.nameBn
                      : isBn
                        ? 'গ্রামের বাজার'
                        : 'Gramer Bazar'}
                  </span>
                </CardTitle>
                {group.shop && (
                  <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs">
                    <Link href={`/${lang}/shops/${group.shop.id}`}>
                      {isBn ? 'দোকান দেখুন' : 'Visit shop'}
                    </Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {group.items.map((item) => {
                    const variant = item.sellerProduct?.productVariant;
                    const name = variant
                      ? isBn
                        ? variant.nameBn || variant.product.nameBn
                        : variant.nameEn || variant.product.nameEn
                      : isBn
                        ? 'পণ্য পাওয়া যায়নি'
                        : 'Product unavailable';
                    const image = variant?.images?.[0] || '/placeholder.jpg';

                    return (
                      <li key={item.id} className="flex gap-3 p-4 sm:gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted/20">
                          <CustomImage
                            src={image}
                            alt={name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="min-w-0">
                            <h4 className="line-clamp-2 text-sm font-semibold sm:text-base">
                              {variant?.product.slug ? (
                                <Link
                                  href={`/${lang}/products/${variant.product.slug}`}
                                  className="hover:text-primary"
                                >
                                  {name}
                                </Link>
                              ) : (
                                name
                              )}
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                              {formatCurrency(item.unitPrice)} × {item.quantity}
                            </p>
                          </div>
                          <div className="mt-2 flex items-end justify-between gap-3">
                            {canReport && variant && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 text-xs"
                                onClick={() => setReviewProductId(variant.product.id)}
                              >
                                <Star className="h-3 w-3" />
                                {isBn ? 'রিভিউ দিন' : 'Write review'}
                              </Button>
                            )}
                            <p className="ms-auto text-sm font-bold text-primary sm:text-base">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Summary + address */}
        <aside className="space-y-6">
          <Card className="rounded-2xl border-border/70">
            <CardHeader className="border-b bg-muted/20 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                {isBn ? 'পেমেন্ট সারাংশ' : 'Payment summary'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm sm:p-5">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {isBn ? 'ডেলিভারি চার্জ' : 'Delivery fee'}
                </span>
                <span className="font-medium">{formatCurrency(order.deliveryFee)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between gap-3 text-destructive">
                  <span>{isBn ? 'ছাড়' : 'Discount'}</span>
                  <span className="font-medium">−{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between gap-3 border-t pt-3">
                <span className="text-base font-bold">{isBn ? 'সর্বমোট' : 'Total'}</span>
                <span className="text-lg font-bold text-primary sm:text-xl">
                  {formatCurrency(order.total)}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/30 px-3 py-2.5">
                <span className="text-xs text-muted-foreground">
                  {isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment method'}
                </span>
                <StatusBadge
                  tone="neutral"
                  label={
                    paymentMethod
                      ? isBn
                        ? paymentMethod.bn
                        : paymentMethod.en
                      : order.paymentMethod
                  }
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/30 px-3 py-2.5">
                <span className="text-xs text-muted-foreground">
                  {isBn ? 'পেমেন্ট স্ট্যাটাস' : 'Payment status'}
                </span>
                <StatusBadge
                  tone={paymentMeta.tone}
                  label={isBn ? paymentMeta.bn : paymentMeta.en}
                />
              </div>

              {canPay && (
                <Button
                  className="mt-1 h-11 w-full gap-2 rounded-xl font-semibold"
                  disabled={isRetrying}
                  onClick={handlePayOnline}
                >
                  <CreditCard className="h-4 w-4" />
                  {isRetrying
                    ? isBn
                      ? 'রিডাইরেক্ট হচ্ছে...'
                      : 'Redirecting...'
                    : isBn
                      ? 'অনলাইনে পেমেন্ট করুন'
                      : 'Pay online'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardHeader className="border-b bg-muted/20 py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {isBn ? 'ডেলিভারি ঠিকানা' : 'Delivery address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm sm:p-5">
              <div className="flex items-start gap-2.5">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">
                  {address?.contactName ||
                    `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim()}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{address?.contactPhone || order.user?.phone}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground leading-relaxed">
                  {addressLine || (isBn ? 'ঠিকানার তথ্য নেই' : 'No address on record')}
                </span>
              </div>
              {address?.title && (
                <StatusBadge tone="neutral" label={address.title} className="mt-1" />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Package className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {order.items.length} {isBn ? 'টি পণ্য' : 'items'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {shopGroups.length} {isBn ? 'টি দোকান থেকে' : 'store(s)'}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {reviewProductId && (
        <AddReviewModal
          isOpen={!!reviewProductId}
          onClose={() => setReviewProductId(null)}
          productId={reviewProductId}
          isBn={isBn}
        />
      )}

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title={isBn ? 'অর্ডার বাতিল করতে চান?' : 'Cancel this order?'}
        description={
          isBn
            ? 'আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান? এটি ফিরিয়ে আনা যাবে না।'
            : 'Are you sure you want to cancel this order? This action cannot be undone.'
        }
        confirmLabel={isBn ? 'হ্যাঁ, বাতিল করুন' : 'Yes, cancel order'}
        cancelLabel={isBn ? 'না, রাখুন' : 'Keep order'}
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        isBn={isBn}
      />
    </div>
  );
}
