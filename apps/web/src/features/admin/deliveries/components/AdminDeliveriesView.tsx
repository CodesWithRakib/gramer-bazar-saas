'use client';

import React, { useState } from 'react';
import {
  useGetAdminDeliveriesQuery,
  useBookCourierMutation,
  Delivery,
} from '@/features/deliveries/deliveriesApi';
import { DataTable } from '@/components/ui/data-table';
import { BackButton } from '@/components/common/BackButton';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { customToast as toast } from '@/components/ui/custom-toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { Truck, ExternalLink, PackageCheck, Loader2 } from 'lucide-react';

export interface AdminDeliveriesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminDeliveriesView({
  lang = 'en',
  namespace = 'admin',
}: AdminDeliveriesViewProps) {
  const isBn = lang === 'bn';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  // 3PL Booking modal state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingDelivery, setBookingDelivery] = useState<Delivery | null>(null);
  const [courierProvider, setCourierProvider] = useState<'STEADFAST' | 'PATHAO' | 'MOCK'>('STEADFAST');
  const [courierNote, setCourierNote] = useState('');

  // Tracking details modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activeTrackingDelivery, setActiveTrackingDelivery] = useState<Delivery | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminDeliveriesQuery({ page, limit, search });
  const [bookCourier, { isLoading: isBooking }] = useBookCourierMutation();

  const handleOpenBookModal = (delivery: Delivery) => {
    setBookingDelivery(delivery);
    setCourierProvider('STEADFAST');
    setCourierNote('');
    setIsBookModalOpen(true);
  };

  const handleBookCourierSubmit = async () => {
    if (!bookingDelivery?.orderId) {
      toast.error(isBn ? 'অর্ডার আইডি পাওয়া যায়নি' : 'Missing Order ID');
      return;
    }

    try {
      const res = await bookCourier({
        orderId: bookingDelivery.orderId,
        provider: courierProvider,
        note: courierNote.trim() || undefined,
      }).unwrap();

      toast.success(
        isBn
          ? `কুরিয়ারে বুকিং সফল! ট্র্যাকিং কোড: ${res.trackingCode}`
          : `Booked successfully! Tracking: ${res.trackingCode}`
      );
      setIsBookModalOpen(false);
      setBookingDelivery(null);
      refetch();
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isBn ? 'কুরিয়ার বুকিং ব্যর্থ হয়েছে' : 'Failed to book courier parcel'
        )
      );
    }
  };

  const columns: ColumnDef<Delivery>[] = [
    {
      accessorKey: 'id',
      header: 'Delivery ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{String(row.getValue('id')).substring(0, 8)}...</span>
      ),
    },
    {
      accessorKey: 'order',
      header: 'Order',
      cell: ({ row }) => {
        const order = row.getValue('order') as { id: string } | null;
        return order ? (
          <span className="font-mono text-xs font-semibold text-primary">
            #{String(order.id).substring(0, 8)}
          </span>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'courierProvider',
      header: isBn ? 'লজিস্টিকস ও কুরিয়ার' : 'Logistics Channel',
      cell: ({ row }) => {
        const delivery = row.original;
        if (delivery.courierProvider) {
          const providerColor =
            delivery.courierProvider === 'STEADFAST'
              ? 'border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400'
              : delivery.courierProvider === 'PATHAO'
                ? 'border-red-500/30 text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400'
                : 'border-blue-500/30 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400';

          return (
            <div className="flex flex-col gap-1 items-start">
              <Badge variant="outline" className={`text-[10px] font-bold ${providerColor}`}>
                {delivery.courierProvider} 3PL
              </Badge>
              {delivery.trackingCode && (
                <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
                  TRK: {delivery.trackingCode}
                </span>
              )}
            </div>
          );
        }

        const rider = delivery.rider;
        return rider ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium">
              {rider.firstName} {rider.lastName}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {isBn ? 'স্থানীয় নিজস্ব রাইডার' : 'Local Fleet Rider'}
            </span>
          </div>
        ) : (
          <Badge variant="secondary" className="text-[10px]">
            {isBn ? 'আনঅ্যাসাইন্ড' : 'Unassigned'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: isBn ? 'ডেলিভারি স্থিতি' : 'Delivery Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
        if (status === 'UNASSIGNED') variant = 'secondary';
        else if (status === 'DELIVERED') variant = 'default';
        else if (status === 'CANCELLED' || status === 'FAILED') variant = 'destructive';

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: isBn ? 'তারিখ' : 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.getValue('createdAt')).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: isBn ? 'কার্যক্রম' : 'Actions',
      cell: ({ row }) => {
        const delivery = row.original;
        return (
          <div className="flex items-center gap-2">
            {!delivery.courierProvider ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => handleOpenBookModal(delivery)}
              >
                <Truck className="h-3.5 w-3.5 text-primary" />
                {isBn ? '৩পিএল কুরিয়ার বুক' : 'Book 3PL Courier'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-xs text-primary hover:bg-primary/10"
                onClick={() => {
                  setActiveTrackingDelivery(delivery);
                  setIsTrackingModalOpen(true);
                }}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {isBn ? 'ট্র্যাক' : 'Track'}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <BackButton
          href={`/${lang}/${namespace}/orders`}
          label="Back to Orders Hub"
          labelBn="অর্ডার হাবে ফিরে যান"
          lang={lang}
        />
        <div className="flex justify-between items-center mt-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isBn ? 'ডেলিভারি ট্র্যাকিং ও লজিস্টিকস' : 'Deliveries & Logistics'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isBn
                ? 'রিয়েল-টাইম রাইডার অ্যাসাইনমেন্ট, স্টেডফাস্ট এবং পাঠাও কুরিয়ার পার্সেল পরিচালনা করুন।'
                : 'Track real-time rider assignments and dispatch parcels via Steadfast or Pathao.'}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages ?? -1}
        pagination={{ pageIndex: page - 1, pageSize: limit }}
        onPaginationChange={(updater) => {
          if (typeof updater === 'function') {
            const newState = updater({ pageIndex: page - 1, pageSize: limit });
            setPage(newState.pageIndex + 1);
            setLimit(newState.pageSize);
          } else {
            setPage(updater.pageIndex + 1);
            setLimit(updater.pageSize);
          }
        }}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={
          isBn ? 'ডেলিভারি আইডি দিয়ে খুঁজুন...' : 'Search delivery ID...'
        }
        totalItems={data?.meta?.total}
        itemsPerPage={limit}
        currentPage={page}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        lang={lang as any}
        itemLabel={{
          singular: isBn ? 'ডেলিভারি' : 'delivery',
          plural: isBn ? 'ডেলিভারি' : 'deliveries',
        }}
      />

      {/* Book 3PL Courier Dialog */}
      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              {isBn ? '৩পিএল কুরিয়ার পার্সেল বুকিং' : 'Book 3PL Courier Dispatch'}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? `অর্ডার #${bookingDelivery?.orderId?.substring(0, 8)} এর জন্য স্টেডফাস্ট বা পাঠাও পার্সেল তৈরি করুন।`
                : `Dispatch Order #${bookingDelivery?.orderId?.substring(0, 8)} through external logistics network.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isBn ? 'কুরিয়ার প্রোভাইডার' : 'Courier Provider'}
              </label>
              <Select
                value={courierProvider}
                onValueChange={(val: 'STEADFAST' | 'PATHAO' | 'MOCK') => setCourierProvider(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Courier Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STEADFAST">
                    Steadfast Courier (Nationwide Doorstep & COD)
                  </SelectItem>
                  <SelectItem value="PATHAO">
                    Pathao Courier (Express Urban / Suburban)
                  </SelectItem>
                  <SelectItem value="MOCK">
                    Simulated Sandbox (Offline Testing)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isBn ? 'পার্সেল নোট / নির্দেশনা' : 'Handling Instructions / Note'}
              </label>
              <Input
                placeholder={isBn ? 'যেমন: ভঙ্গুর মাটির পাত্র, সাবধানে হ্যান্ডেল করুন' : 'e.g. Fragile rural organic goods'}
                value={courierNote}
                onChange={(e) => setCourierNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookModalOpen(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleBookCourierSubmit} disabled={isBooking}>
              {isBooking ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {isBn ? 'বুকিং হচ্ছে...' : 'Booking...'}
                </>
              ) : (
                <>
                  <PackageCheck className="me-2 h-4 w-4" />
                  {isBn ? 'পার্সেল নিশ্চিত করুন' : 'Confirm Dispatch'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Courier Tracking Modal */}
      <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              {isBn ? 'কুরিয়ার ট্র্যাকিং বিবরণ' : 'Courier Tracking Details'}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? `ট্র্যাকিং কোড: ${activeTrackingDelivery?.trackingCode || 'N/A'}`
                : `Tracking Code: ${activeTrackingDelivery?.trackingCode || 'N/A'}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="flex justify-between items-center rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">{isBn ? 'প্রোভাইডার' : 'Provider'}:</span>
              <Badge variant="outline" className="font-bold">
                {activeTrackingDelivery?.courierProvider || 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">{isBn ? 'কনসাইনমেন্ট আইডি' : 'Consignment ID'}:</span>
              <span className="font-mono text-sm">{activeTrackingDelivery?.consignmentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">{isBn ? 'কুরিয়ার স্থিতি' : 'Courier Status'}:</span>
              <Badge variant="default">{activeTrackingDelivery?.courierStatus || 'in_transit'}</Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackingModalOpen(false)}>
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

