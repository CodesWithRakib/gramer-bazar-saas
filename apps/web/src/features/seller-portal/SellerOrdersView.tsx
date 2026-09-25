'use client';

import { use, useState, useMemo } from 'react';
import React from 'react';
import Link from 'next/link';
import { useGetSellerOrdersQuery } from '@/features/seller-portal/sellerPortalApi';
import { Order } from '@/features/orders/ordersApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SellerOrdersViewProps {
  lang?: string;
}

export function SellerOrdersView({ lang = 'en' }: SellerOrdersViewProps) {
  const isBn = lang === 'bn';
  const { data: orders, isLoading, isError, refetch } = useGetSellerOrdersQuery();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = useMemo(() => {
    let list = orders || [];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((order) => {
        const idMatch = order.id.toLowerCase().includes(q);
        const nameMatch = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`
          .toLowerCase()
          .includes(q);
        const phoneMatch = order.user?.phone?.includes(q);
        return idMatch || nameMatch || phoneMatch;
      });
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((order) => order.status === statusFilter);
    }
    return list;
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / limit));
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, page, limit]);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: isBn ? 'অর্ডার আইডি' : 'Order ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">
          #{row.getValue<string>('id').slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: isBn ? 'তারিখ' : 'Date',
      cell: ({ row }) => {
        try {
          return new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
            dateStyle: 'medium',
          }).format(new Date(row.getValue('createdAt')));
        } catch {
          return String(row.getValue('createdAt'));
        }
      },
    },
    {
      accessorKey: 'user',
      header: isBn ? 'গ্রাহক' : 'Customer',
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? (
          <div>
            <div className="font-medium text-foreground">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{user.phone}</div>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'items',
      header: isBn ? 'আইটেম' : 'Items',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.items?.length || 0} {isBn ? 'টি আইটেম' : 'items'}
        </span>
      ),
    },
    {
      id: 'amount',
      header: isBn ? 'পরিমাণ' : 'Amount',
      cell: ({ row }) => {
        const amount = row.original.sellerSubtotal ?? row.original.total;
        return <span className="font-semibold text-foreground">৳{amount}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: isBn ? 'অবস্থা' : 'Status',
      cell: ({ row }) => {
        const status = row.getValue<string>('status');
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
        if (status === 'DELIVERED') variant = 'default';
        if (status === 'CANCELLED' || status === 'FAILED') variant = 'destructive';
        if (status === 'CONFIRMED' || status === 'PROCESSING') variant = 'secondary';

        return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>;
      },
    },
    {
      id: 'actions',
      header: isBn ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" className="rounded-full h-8 px-3" asChild>
          <Link href={`/${lang}/seller/orders/${row.original.id}`}>
            {isBn ? 'বিস্তারিত' : 'View'}
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isBn ? 'অর্ডারসমূহ' : 'Orders'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isBn
              ? 'আপনার স্টোরের সমস্ত গ্রাহক অর্ডার পরিচালনা এবং ট্র্যাক করুন।'
              : 'Manage and fulfill orders placed for your store items.'}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedOrders}
        pageCount={totalPages}
        totalCount={filteredOrders.length}
        itemLabel={{
          singular: isBn ? 'অর্ডার' : 'order',
          plural: isBn ? 'অর্ডার' : 'orders',
        }}
        isBn={isBn}
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
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={isBn ? 'অর্ডার বা গ্রাহক খুঁজুন...' : 'Search by ID or customer...'}
        filterSlot={
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 dark:border-border dark:bg-card dark:text-foreground">
                <SelectValue placeholder={isBn ? 'সব অবস্থা' : 'All Statuses'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isBn ? 'সব অবস্থা' : 'All Statuses'}</SelectItem>
                <SelectItem value="PENDING">{isBn ? 'পেন্ডিং' : 'Pending'}</SelectItem>
                <SelectItem value="CONFIRMED">{isBn ? 'নিশ্চিত' : 'Confirmed'}</SelectItem>
                <SelectItem value="PROCESSING">{isBn ? 'প্রক্রিয়াধীন' : 'Processing'}</SelectItem>
                <SelectItem value="READY_FOR_PICKUP">{isBn ? 'পিকআপের জন্য প্রস্তুত' : 'Ready for Pickup'}</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">{isBn ? 'ডেলিভারিতে রয়েছে' : 'Out for Delivery'}</SelectItem>
                <SelectItem value="DELIVERED">{isBn ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}</SelectItem>
                <SelectItem value="CANCELLED">{isBn ? 'বাতিল' : 'Cancelled'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}
