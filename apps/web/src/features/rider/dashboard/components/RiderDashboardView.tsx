'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Banknote,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Navigation,
  Phone,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useGetRiderOperationalDashboardQuery,
  useUpdateRiderAvailabilityMutation,
} from '@/features/riders/ridersApi';
import { DeliveryStatus } from '@/features/deliveries/deliveriesApi';

export interface RiderDashboardViewProps {
  lang?: string;
}

const currency = (value: number) => `\u09F3${Number(value || 0).toFixed(2)}`;

export function RiderDashboardView({ lang = 'en' }: RiderDashboardViewProps) {
  const isBn = lang === 'bn';

  const { data, isLoading, isError, refetch } = useGetRiderOperationalDashboardQuery(undefined, {
    pollingInterval: 20000,
  });
  const [updateAvailability, { isLoading: isTogglingAvailability }] =
    useUpdateRiderAvailabilityMutation();

  const handleToggleAvailability = async (checked: boolean) => {
    try {
      await updateAvailability({ availability: checked ? 'AVAILABLE' : 'OFFLINE' }).unwrap();
      toast.success(
        checked
          ? isBn
            ? 'আপনি এখন অনলাইন — নতুন ডেলিভারি পাবেন'
            : 'You are now online and can receive deliveries'
          : isBn
            ? 'আপনি এখন অফলাইন'
            : 'You are now offline'
      );
    } catch {
      toast.error(isBn ? 'অবস্থা পরিবর্তন ব্যর্থ হয়েছে' : 'Failed to update availability');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="pt-2">
        <ErrorState
          isBn={isBn}
          title={isBn ? 'ড্যাশবোর্ড লোড করা যাচ্ছে না' : 'Unable to load dashboard'}
          message={
            isBn
              ? 'আপনার ড্যাশবোর্ড তথ্য আনতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।'
              : 'We could not fetch your dashboard data. Check your connection and try again.'
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  const { metrics, earnings, activeDelivery, newAssignments } = data;
  const isOnline = data.availability === 'AVAILABLE' || data.availability === 'BUSY';

  const stats = [
    {
      label: isBn ? 'নতুন অ্যাসাইনমেন্ট' : 'New Assignments',
      value: metrics.pendingAssignments,
      icon: ClipboardList,
      emphasize: metrics.pendingAssignments > 0,
    },
    {
      label: isBn ? 'চলমান ডেলিভারি' : 'Active Delivery',
      value: metrics.activeDeliveries,
      icon: Navigation,
      emphasize: metrics.activeDeliveries > 0,
    },
    {
      label: isBn ? 'আজ সম্পন্ন' : 'Completed Today',
      value: metrics.todayCompleted,
      icon: CheckCircle2,
      emphasize: false,
    },
    {
      label: isBn ? 'মোট সম্পন্ন' : 'Total Completed',
      value: metrics.totalCompleted,
      icon: CheckCircle2,
      emphasize: false,
    },
  ];

  return (
    <div className="space-y-5 pt-2">
      {/* Availability control */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {isBn ? 'আপনার অবস্থা' : 'Your Availability'}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.availability === 'BUSY'
                  ? isBn
                    ? 'ডেলিভারি চলছে'
                    : 'Delivering an order'
                  : isOnline
                    ? isBn
                      ? 'নতুন ডেলিভারির জন্য প্রস্তুত'
                      : 'Ready for new deliveries'
                    : isBn
                      ? 'বন্ধ — নতুন ডেলিভারি পাবেন না'
                      : 'Offline — not receiving deliveries'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge
                variant={isOnline ? 'default' : 'secondary'}
                className="h-7 px-3 uppercase text-[11px]"
              >
                {data.availability}
              </Badge>
              <Switch
                checked={isOnline}
                disabled={isTogglingAvailability || data.availability === 'BUSY'}
                onCheckedChange={handleToggleAvailability}
                aria-label={isBn ? 'অনলাইন টগল' : 'Toggle online status'}
              />
            </div>
          </div>
          {!data.isVerified && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
              {isBn
                ? 'আপনার অ্যাকাউন্ট এখনো সম্পূর্ণ ভেরিফাইড হয়নি।'
                : 'Your account verification is still in progress.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-2xl border-border shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  stat.emphasize
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold leading-tight text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings snapshot */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-primary" />
              {isBn ? 'আজকের আয়' : "Today's Earnings"}
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href={`/${lang}/rider/earnings`}>{isBn ? 'বিস্তারিত' : 'View all'}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {currency(earnings.todayEarnings)}
            </p>
            <span className="pb-1 text-xs text-muted-foreground">
              {isBn ? 'আজ' : 'today'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'উত্তোলনযোগ্য ব্যালেন্স' : 'Available Balance'}
              </p>
              <p className="font-semibold text-foreground">
                {currency(earnings.availableBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'পেন্ডিং পে-আউট' : 'Pending Payout'}
              </p>
              <p className="font-semibold text-foreground">{currency(earnings.pendingPayout)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active delivery */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          {isBn ? 'চলমান ডেলিভারি' : 'Active Delivery'}
        </h2>
        {activeDelivery ? (
          <Card className="rounded-2xl border-primary/40 shadow-none">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <Badge className="uppercase text-[11px]">
                  {activeDelivery.status.replace(/_/g, ' ')}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">
                  #{activeDelivery.order.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <p className="truncate font-semibold text-foreground">
                {activeDelivery.order.user?.firstName} {activeDelivery.order.user?.lastName}
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="line-clamp-2">
                  {activeDelivery.order.address?.streetAddress}
                  {activeDelivery.order.address?.contactPhone
                    ? `, ${activeDelivery.order.address.contactPhone}`
                    : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <Button asChild className="h-11 flex-1">
                  <Link href={`/${lang}/rider/deliveries/${activeDelivery.id}`}>
                    {isBn ? 'ডেলিভারি চালিয়ে যান' : 'Continue Delivery'}
                  </Link>
                </Button>
                {activeDelivery.order.user?.phone && (
                  <Button asChild variant="outline" size="icon" className="h-11 w-11 shrink-0">
                    <a href={`tel:${activeDelivery.order.user.phone}`} aria-label="Call customer">
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isBn ? 'এই মুহূর্তে কোনো চলমান ডেলিভারি নেই।' : 'No delivery in progress right now.'}
          </p>
        )}
      </div>

      {/* New assignments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {isBn ? 'নতুন অ্যাসাইনমেন্ট' : 'New Assignments'}
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href={`/${lang}/rider/deliveries`}>
              {isBn ? 'সব দেখুন' : 'View all'}
            </Link>
          </Button>
        </div>

        {newAssignments.length === 0 ? (
          <EmptyState
            className="min-h-[220px] rounded-2xl"
            icon={<Banknote className="h-7 w-7 text-primary" />}
            title={isBn ? 'নতুন অ্যাসাইনমেন্ট নেই' : 'No new assignments'}
            description={
              isBn
                ? 'অনলাইন থাকুন — নতুন ডেলিভারি এলে এখানে দেখতে পাবেন।'
                : 'Stay online and new delivery assignments will appear here.'
            }
          />
        ) : (
          <div className="space-y-3">
            {newAssignments.slice(0, 3).map((delivery) => (
              <Card key={delivery.id} className="rounded-2xl border-border shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[11px] uppercase">
                      {delivery.status === DeliveryStatus.ASSIGNED
                        ? isBn
                          ? 'অপেক্ষমাণ'
                          : 'Pending'
                        : delivery.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{delivery.order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="line-clamp-2">{delivery.order.address?.streetAddress}</span>
                  </div>
                  <Button asChild variant="outline" className="h-11 w-full">
                    <Link href={`/${lang}/rider/deliveries/${delivery.id}`}>
                      {isBn ? 'পর্যালোচনা করুন' : 'Review & Accept'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
