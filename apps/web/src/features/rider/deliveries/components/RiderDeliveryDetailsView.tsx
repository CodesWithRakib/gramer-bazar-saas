'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { customToast as toast } from '@/components/ui/custom-toast';
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Store,
  Truck,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StartChatButton } from '@/components/chat/StartChatButton';
import {
  useGetRiderDeliveryDetailsQuery,
  useUpdateDeliveryStatusMutation,
  useUpdateRiderLocationMutation,
  DeliveryStatus,
} from '@/features/deliveries/deliveriesApi';

const LiveTrackingMap = dynamic(() => import('@/components/map/LiveTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl bg-muted/20 animate-pulse">
      <span className="text-sm text-muted-foreground">Loading map...</span>
    </div>
  ),
});

export interface RiderDeliveryDetailsViewProps {
  lang?: string;
  id: string;
}

const currency = (value: number | string) => `\u09F3${Number(value || 0).toFixed(2)}`;

const formatAddress = (address?: {
  streetAddress?: string;
  upazila?: { nameEn: string; nameBn: string } | null;
  district?: { nameEn: string; nameBn: string } | null;
  division?: { nameEn: string; nameBn: string } | null;
}) => {
  if (!address) return '';
  return [
    address.streetAddress,
    address.upazila?.nameEn,
    address.district?.nameEn,
    address.division?.nameEn,
  ]
    .filter(Boolean)
    .join(', ');
};

export function RiderDeliveryDetailsView({ lang = 'en', id }: RiderDeliveryDetailsViewProps) {
  const isBn = lang === 'bn';

  const { data: delivery, isLoading, isError, refetch } = useGetRiderDeliveryDetailsQuery(id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateDeliveryStatusMutation();
  const [updateLocation] = useUpdateRiderLocationMutation();

  const [confirmAction, setConfirmAction] = useState<DeliveryStatus | null>(null);
  const [currentLat, setCurrentLat] = useState<number | undefined>(undefined);
  const [currentLng, setCurrentLng] = useState<number | undefined>(undefined);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const updateLocationRef = useRef(updateLocation);
  useEffect(() => {
    updateLocationRef.current = updateLocation;
  }, [updateLocation]);

  useEffect(() => {
    if (!delivery || delivery.status !== DeliveryStatus.OUT_FOR_DELIVERY) return;
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setTrackingError(null);
        updateLocationRef.current({ id, lat: latitude, lng: longitude }).catch(() => {
          /* location sync is best-effort */
        });
      },
      () => {
        setTrackingError(
          isBn
            ? 'লোকেশন ট্র্যাক করা যাচ্ছে না। জিপিএস অনুমতি দিন।'
            : 'Unable to track location. Please allow GPS access.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // Restart tracking only when the status changes, not on every refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery?.status, id, isBn]);

  const handleUpdateStatus = async (status: DeliveryStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(isBn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated successfully');
      setConfirmAction(null);
      refetch();
    } catch {
      toast.error(
        isBn
          ? 'স্ট্যাটাস আপডেট করা যায়নি। আবার চেষ্টা করুন।'
          : 'Could not update status. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-2">
        <ErrorState isBn={isBn} onRetry={refetch} />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="pt-6 text-center">
        <p className="text-muted-foreground">
          {isBn ? 'ডেলিভারি পাওয়া যায়নি।' : 'Delivery not found.'}
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/${lang}/rider/deliveries`}>{isBn ? 'ফিরে যান' : 'Back to deliveries'}</Link>
        </Button>
      </div>
    );
  }

  const order = delivery.order;
  const shop = order.items?.[0]?.sellerProduct?.shop;
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const isPickupStage =
    delivery.status === DeliveryStatus.ASSIGNED || delivery.status === DeliveryStatus.ACCEPTED;
  const isCod = order.paymentMethod === 'COD';

  return (
    <div className="space-y-4 pt-2 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="-ms-2 shrink-0">
          <Link href={`/${lang}/rider/deliveries`} aria-label={isBn ? 'ফিরে যান' : 'Back'}>
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-foreground">
            {isBn ? 'ডেলিভারি বিস্তারিত' : 'Delivery Details'}
          </h1>
          <span className="font-mono text-xs text-muted-foreground">
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </div>
        <Badge variant="outline" className="shrink-0 text-[11px] uppercase">
          {delivery.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Pickup */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-primary" />
            {isBn ? 'পিকআপ' : 'Pickup'}
            {isPickupStage && (
              <Badge variant="secondary" className="text-[10px] uppercase">
                {isBn ? 'এখন' : 'Now'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium text-foreground">{shop?.nameEn || (isBn ? 'দোকান' : 'Shop')}</p>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              {shop?.address || (isBn ? 'ঠিকানা নেই' : 'Address unavailable')}
              {shop?.upazila?.nameEn ? `, ${shop.upazila.nameEn}` : ''}
              {shop?.district?.nameEn ? `, ${shop.district.nameEn}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">
              {isBn ? `${itemCount} টি পণ্য` : `${itemCount} item(s)`}
            </span>
            {shop?.phone && (
              <Button asChild variant="outline" size="sm" className="h-9">
                <a href={`tel:${shop.phone}`}>
                  <Phone className="me-1.5 h-3.5 w-3.5" />
                  {isBn ? 'কল' : 'Call'}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="h-4 w-4 text-primary" />
            {isBn ? 'ডেলিভারি' : 'Delivery'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium text-foreground">
            {order.address?.contactName ||
              `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim()}
          </p>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="break-words">{formatAddress(order.address)}</span>
          </div>
          {delivery.notes && (
            <div className="rounded-lg bg-muted/40 p-2.5 text-sm text-muted-foreground">
              <MessageSquare className="me-1.5 inline h-3.5 w-3.5" />
              {delivery.notes}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {order.address?.contactPhone && (
              <Button asChild variant="outline" size="sm" className="h-9">
                <a href={`tel:${order.address.contactPhone}`}>
                  <Phone className="me-1.5 h-3.5 w-3.5" />
                  {isBn ? 'গ্রাহককে কল' : 'Call customer'}
                </a>
              </Button>
            )}
            {order.user?.id && (
              <StartChatButton
                participantId={order.user.id}
                lang={lang}
                referenceId={order.id}
                referenceType="DELIVERY"
                buttonText={isBn ? 'মেসেজ' : 'Message'}
                redirectPath={`/${lang}/rider/messages`}
                size="sm"
                variant="outline"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order summary */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4 text-primary" />
            {isBn ? 'অর্ডার সারাংশ' : 'Order Summary'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {order.items?.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 text-muted-foreground">
                  {item.quantity} ×{' '}
                  {isBn
                    ? item.sellerProduct?.productVariant?.nameBn ||
                      item.sellerProduct?.productVariant?.nameEn
                    : item.sellerProduct?.productVariant?.nameEn}
                </span>
                <span className="shrink-0 font-medium text-foreground">
                  {currency(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {isBn ? 'ডেলিভারি চার্জ' : 'Delivery fee'}
              </span>
              <span className="text-foreground">{currency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>{isBn ? 'মোট' : 'Total'}</span>
              <span>{currency(order.total)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
            <span className="text-sm font-medium text-foreground">
              {isBn ? 'আদায়যোগ্য' : 'Collect from customer'}
            </span>
            <span className="font-semibold text-foreground">
              {isCod ? currency(order.total) : isBn ? 'পরিশোধিত' : 'Paid online'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Earning */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {isBn ? 'আপনার আয়' : 'Your earning'}
            </span>
          </div>
          <span className="text-lg font-bold text-foreground">{currency(order.deliveryFee)}</span>
        </CardContent>
      </Card>

      {/* Live map */}
      {delivery.status === DeliveryStatus.OUT_FOR_DELIVERY && (
        <Card className="overflow-hidden rounded-2xl border-border shadow-none">
          <CardHeader className="border-b border-border py-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              {isBn ? 'লাইভ লোকেশন' : 'Live Location'}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative h-[240px] p-0">
            {trackingError && (
              <div className="absolute inset-x-0 top-0 z-10 bg-destructive/90 p-2 text-center text-xs text-destructive-foreground">
                {trackingError}
              </div>
            )}
            {currentLat && currentLng ? (
              <LiveTrackingMap
                riderLat={currentLat}
                riderLng={currentLng}
                customerLat={Number(order.address?.lat) || undefined}
                customerLng={Number(order.address?.lng) || undefined}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {isBn ? 'লোকেশন খোঁজা হচ্ছে...' : 'Locating...'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-1">
        {delivery.status === DeliveryStatus.ASSIGNED && (
          <Button
            className="h-14 w-full text-base"
            onClick={() => handleUpdateStatus(DeliveryStatus.ACCEPTED)}
            disabled={isUpdating}
          >
            <CheckCircle2 className="me-2 h-5 w-5" />
            {isBn ? 'অ্যাসাইনমেন্ট গ্রহণ করুন' : 'Accept Assignment'}
          </Button>
        )}

        {delivery.status === DeliveryStatus.ACCEPTED && (
          <Button
            className="h-14 w-full text-base"
            onClick={() => handleUpdateStatus(DeliveryStatus.PICKED_UP)}
            disabled={isUpdating}
          >
            <Package className="me-2 h-5 w-5" />
            {isBn ? 'পিকআপ নিশ্চিত করুন' : 'Confirm Pickup'}
          </Button>
        )}

        {delivery.status === DeliveryStatus.PICKED_UP && (
          <Button
            className="h-14 w-full text-base"
            onClick={() => handleUpdateStatus(DeliveryStatus.OUT_FOR_DELIVERY)}
            disabled={isUpdating}
          >
            <Truck className="me-2 h-5 w-5" />
            {isBn ? 'ডেলিভারির জন্য রওনা' : 'Out for Delivery'}
          </Button>
        )}

        {delivery.status === DeliveryStatus.OUT_FOR_DELIVERY && (
          <>
            <Button
              className="h-14 w-full text-base"
              onClick={() => setConfirmAction(DeliveryStatus.DELIVERED)}
              disabled={isUpdating}
            >
              <CheckCircle2 className="me-2 h-5 w-5" />
              {isBn ? 'ডেলিভারি সম্পন্ন হয়েছে' : 'Mark as Delivered'}
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setConfirmAction(DeliveryStatus.FAILED)}
              disabled={isUpdating}
            >
              <AlertTriangle className="me-2 h-4 w-4" />
              {isBn ? 'ডেলিভারি ব্যর্থ' : 'Delivery Failed'}
            </Button>
          </>
        )}

        {(delivery.status === DeliveryStatus.DELIVERED ||
          delivery.status === DeliveryStatus.FAILED ||
          delivery.status === DeliveryStatus.CANCELLED) && (
          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            {delivery.status === DeliveryStatus.DELIVERED
              ? isBn
                ? 'এই ডেলিভারি সম্পন্ন হয়েছে।'
                : 'This delivery has been completed.'
              : isBn
                ? 'এই ডেলিভারিটি আর পরিবর্তন করা যাবে না।'
                : 'This delivery can no longer be changed.'}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction === DeliveryStatus.DELIVERED}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={isBn ? 'ডেলিভারি সম্পন্ন হিসেবে চিহ্নিত করবেন?' : 'Mark as delivered?'}
        description={
          isBn
            ? 'গ্রাহকের কাছে পণ্য পৌঁছে দেওয়ার পরেই নিশ্চিত করুন। এটি অর্ডার সম্পন্ন করবে এবং আয় যোগ হবে।'
            : 'Confirm only after handing the order to the customer. This completes the order and credits your earnings.'
        }
        confirmLabel={isBn ? 'হ্যাঁ, সম্পন্ন করুন' : 'Yes, mark delivered'}
        cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
        isLoading={isUpdating}
        onConfirm={() => handleUpdateStatus(DeliveryStatus.DELIVERED)}
        isBn={isBn}
      />

      <ConfirmDialog
        open={confirmAction === DeliveryStatus.FAILED}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={isBn ? 'ডেলিভারি ব্যর্থ হিসেবে চিহ্নিত করবেন?' : 'Mark delivery as failed?'}
        description={
          isBn
            ? 'ডেলিভারি সম্পন্ন করা সম্ভব না হলে এটি নিশ্চিত করুন। প্ল্যাটফর্ম ও গ্রাহককে জানানো হবে।'
            : 'Confirm if the delivery could not be completed. The platform and customer will be notified.'
        }
        confirmLabel={isBn ? 'হ্যাঁ, ব্যর্থ চিহ্নিত করুন' : 'Yes, mark failed'}
        cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isUpdating}
        onConfirm={() => handleUpdateStatus(DeliveryStatus.FAILED)}
        isBn={isBn}
      />
    </div>
  );
}
