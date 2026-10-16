'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Phone,
  Fuel,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Anchor,
  ExternalLink,
  RotateCw,
  Building2,
  Check,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useGetRiderActiveRunQuery,
  useUpdateDispatchRunStatusMutation,
  useProgressWaypointMutation,
  DispatchRunStatus,
  WaypointStatus,
  WaypointStop,
} from '@/features/deliveries/logisticsApi';

export interface RiderOptimizedRouteViewProps {
  lang?: string;
}

export function RiderOptimizedRouteView({ lang = 'en' }: RiderOptimizedRouteViewProps) {
  const isBn = lang === 'bn';
  const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);

  const {
    data: activeRun,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetRiderActiveRunQuery(undefined, {
    pollingInterval: 20000,
  });

  const [updateRunStatus, { isLoading: isUpdatingStatus }] = useUpdateDispatchRunStatusMutation();
  const [progressWaypoint, { isLoading: isProgressing }] = useProgressWaypointMutation();

  const handleStartRun = async () => {
    if (!activeRun) return;
    try {
      await updateRunStatus({
        id: activeRun.id,
        status: DispatchRunStatus.IN_TRANSIT,
      }).unwrap();
    } catch (err) {
      console.error('Failed to start run', err);
    }
  };

  const handleProgressWaypoint = async (
    sequence: number,
    status: WaypointStatus,
    notes?: string,
  ) => {
    if (!activeRun) return;
    try {
      await progressWaypoint({
        id: activeRun.id,
        sequence,
        status,
        notes,
      }).unwrap();
    } catch (err) {
      console.error('Failed to progress waypoint', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pt-2">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 pt-2">
        <PageHeader
          title={isBn ? 'রুট অপ্টিমাইজেশন' : 'Optimized Delivery Route'}
          description={
            isBn
              ? 'আপনার গ্রামীণ মাল্টি-স্টপ ডেলিভারি রুট ও ক্লাস্টার।'
              : 'Multi-stop clustered delivery circuit for rural navigation.'
          }
        />
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">
            {isBn ? 'রুট লোড করতে সমস্যা হয়েছে।' : 'Failed to load route information.'}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RotateCw className="w-4 h-4" /> {isBn ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
          </Button>
        </Card>
      </div>
    );
  }

  if (!activeRun) {
    return (
      <div className="space-y-6 pt-2">
        <PageHeader
          title={isBn ? 'রুট অপ্টিমাইজেশন' : 'Optimized Delivery Route'}
          description={
            isBn
              ? 'আপনার গ্রামীণ মাল্টি-স্টপ ডেলিভারি রুট ও ক্লাস্টার।'
              : 'Multi-stop clustered delivery circuit for rural navigation.'
          }
        />
        <EmptyState
          title={isBn ? 'কোন সক্রিয় রুট নেই' : 'No Active Delivery Run'}
          description={
            isBn
              ? 'আপাতত আপনার জন্য কোনো ক্লাস্টার রুট বরাদ্দ করা হয়নি। নতুন রুট বরাদ্দ হলে এখানে প্রদর্শিত হবে।'
              : 'You do not have an active multi-stop circuit assigned at this moment. New runs will appear here once dispatched.'
          }
          icon={<Navigation className="w-8 h-8 text-muted-foreground" />}
          action={{
            label: isBn ? 'রিফ্রেশ করুন' : 'Refresh',
            onClick: () => refetch(),
          }}
        />
      </div>
    );
  }

  const waypoints = activeRun.waypoints || [];
  const completedStops = waypoints.filter((w) => w.status === WaypointStatus.DELIVERED).length;
  const totalCod = waypoints.reduce((sum, w) => sum + Number(w.codAmount || 0), 0);
  const isCompleted = activeRun.status === DispatchRunStatus.COMPLETED;
  const isInTransit = activeRun.status === DispatchRunStatus.IN_TRANSIT;

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono text-xs">
              {activeRun.runCode}
            </Badge>
            <Badge
              variant={
                isCompleted
                  ? 'default'
                  : isInTransit
                  ? 'secondary'
                  : 'outline'
              }
              className={
                isInTransit
                  ? 'bg-blue-500/10 text-blue-600 border-blue-200'
                  : isCompleted
                  ? 'bg-emerald-500 text-white'
                  : ''
              }
            >
              {activeRun.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{activeRun.title}</h1>
          <p className="text-sm text-muted-foreground">
            {activeRun.division} → {activeRun.district} → {activeRun.upazila}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {isBn ? 'রিফ্রেশ' : 'Refresh'}
          </Button>

          {activeRun.status === DispatchRunStatus.ASSIGNED && (
            <Button
              onClick={handleStartRun}
              disabled={isUpdatingStatus}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Navigation className="w-4 h-4" />
              {isBn ? 'ডেলিভারি যাত্রা শুরু করুন' : 'Start Delivery Run'}
            </Button>
          )}
        </div>
      </div>

      {/* Ferry / River Crossing Warning Banner */}
      {activeRun.requiresFerryCrossing && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <Anchor className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-amber-800 dark:text-amber-300">
              {isBn
                ? `নদী / ফেরি পারাপার আবশ্যক: ${activeRun.ferryGhatName || 'আঞ্চলিক ঘাট'}`
                : `River / Ferry Crossing Required: ${activeRun.ferryGhatName || 'Regional Ferry Ghat'}`}
            </h4>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
              {isBn
                ? `আনুমানিক অপেক্ষা: ${activeRun.ferryWaitMinutes || 45} মিনিট। ফেরি ভাড়ার জন্য আপনার ফুয়েল ভাতায় অতিরিক্ত ৬০ টাকা যুক্ত করা হয়েছে।`
                : `Estimated crossing delay: ${activeRun.ferryWaitMinutes || 45} mins. ৳60 toll has been added to your fuel allowance.`}
            </p>
          </div>
        </div>
      )}

      {/* Circuit KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'মোট দূরত্ব' : 'Total Distance'}
              </p>
              <h3 className="text-lg font-bold">{activeRun.totalDistanceKm} km</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'আনুমানিক সময়' : 'Estimated Time'}
              </p>
              <h3 className="text-lg font-bold">{activeRun.estimatedDurationMinutes} mins</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'ফুয়েল ভাতা' : 'Fuel Allowance'}
              </p>
              <h3 className="text-lg font-bold">৳{activeRun.fuelAllowanceBdt}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'অগ্রগতি' : 'Progress'}
              </p>
              <h3 className="text-lg font-bold">
                {completedStops} / {waypoints.length}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({waypoints.length > 0 ? Math.round((completedStops / waypoints.length) * 100) : 0}%)
                </span>
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Stops Sequential Timeline */}
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                {isBn ? 'অপ্টিমাইজড স্টপ ও ডেলিভারি পয়েন্ট' : 'Sequenced Route Waypoints'}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBn
                  ? 'সবচেয়ে কম দূরত্বের ভিত্তিতে সাজানো ক্রমধারা।'
                  : 'Optimized nearest-neighbor sequence to minimize fuel and travel time.'}
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              COD: ৳{totalCod.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Warehouse Origin Node */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="w-0.5 h-12 bg-border my-1" />
            </div>
            <div className="pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isBn ? 'যাত্রা শুরু / ওয়্যারহাউস ডিপো' : 'Start Point / Hub Depot'}
              </span>
              <h4 className="font-semibold text-sm">
                {(isBn ? activeRun.hub?.nameBn : activeRun.hub?.nameEn) ||
                  activeRun.hub?.nameEn ||
                  `${activeRun.district} Central Logistics Hub`}
              </h4>
              <p className="text-xs text-muted-foreground">
                {activeRun.hub?.address || `${activeRun.district} Sadar Depot`}
              </p>
            </div>
          </div>

          {/* Sequential Waypoint Stops */}
          {waypoints.map((wp, index) => {
            const isLast = index === waypoints.length - 1;
            const isDelivered = wp.status === WaypointStatus.DELIVERED;
            const isArrived = wp.status === WaypointStatus.ARRIVED;
            const isCurrent =
              !isDelivered &&
              (isArrived ||
                index === 0 ||
                waypoints[index - 1]?.status === WaypointStatus.DELIVERED);

            const mapsUrl =
              wp.lat && wp.lng
                ? `https://www.google.com/maps/dir/?api=1&destination=${wp.lat},${wp.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${wp.villageAddress}, ${wp.upazila}, ${wp.district}`,
                  )}`;

            return (
              <div key={wp.sequence} className="flex items-start gap-4">
                {/* Node Line & Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isDelivered
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse'
                        : 'bg-muted text-muted-foreground border'
                    }`}
                  >
                    {isDelivered ? <Check className="w-4 h-4" /> : wp.sequence}
                  </div>
                  {!isLast && <div className="w-0.5 h-full min-h-[4rem] bg-border my-1" />}
                </div>

                {/* Waypoint Details Box */}
                <div
                  className={`flex-1 rounded-xl p-4 border transition-all ${
                    isCurrent
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : isDelivered
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          {isBn ? `স্টপ #${wp.sequence}` : `Stop #${wp.sequence}`}
                        </span>
                        <Badge
                          variant={
                            isDelivered
                              ? 'default'
                              : isArrived
                              ? 'secondary'
                              : 'outline'
                          }
                          className={`text-xs ${
                            isDelivered ? 'bg-emerald-500 text-white' : ''
                          }`}
                        >
                          {wp.status}
                        </Badge>
                        {wp.orderNumber && (
                          <span className="font-mono text-xs text-muted-foreground">
                            #{wp.orderNumber}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base mt-1">{wp.recipientName}</h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted-foreground block">
                        {isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                      </span>
                      <span className="font-bold text-primary text-base">
                        ৳{Number(wp.codAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>
                        {wp.villageAddress}, {wp.union && `${wp.union}, `}
                        {wp.upazila}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{wp.recipientPhone}</span>
                    </p>
                  </div>

                  {/* Actions for current stop */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    <a
                      href={`tel:${wp.recipientPhone}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border bg-background hover:bg-muted font-medium transition-colors"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {isBn ? 'কল করুন' : 'Call'}
                    </a>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border bg-background hover:bg-muted font-medium transition-colors text-blue-600"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {isBn ? 'গুগল ম্যাপে নেভিগেট' : 'Google Maps'}
                    </a>

                    {isInTransit && !isDelivered && (
                      <>
                        {!isArrived && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleProgressWaypoint(wp.sequence, WaypointStatus.ARRIVED)
                            }
                            disabled={isProgressing}
                            className="text-xs h-8 ml-auto"
                          >
                            {isBn ? 'পৌঁছেছি চিহ্নিত করুন' : 'Mark Arrived'}
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() =>
                            handleProgressWaypoint(
                              wp.sequence,
                              WaypointStatus.DELIVERED,
                              'Delivered successfully',
                            )
                          }
                          disabled={isProgressing}
                          className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          {isBn ? 'ডেলিভারি সম্পন্ন' : 'Confirm Delivery'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
