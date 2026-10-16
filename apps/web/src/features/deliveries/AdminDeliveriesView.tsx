'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetAdminDeliveriesQuery, Delivery } from '@/features/deliveries/deliveriesApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Truck, Navigation } from 'lucide-react';
import { SmartRouteDispatcherTab } from './components/SmartRouteDispatcherTab';

export interface AdminDeliveriesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminDeliveriesView({ lang = 'en' }: AdminDeliveriesViewProps) {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'table' | 'dispatcher'>('table');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useGetAdminDeliveriesQuery({ page, limit, search });

  const columns: ColumnDef<Delivery>[] = [
    {
      accessorKey: 'id',
      header: 'Delivery ID',
      cell: ({ row }) => (
        <span className="font-mono">{String(row.getValue('id')).substring(0, 8)}...</span>
      ),
    },
    {
      accessorKey: 'order',
      header: 'Order',
      cell: ({ row }) => {
        const order = row.getValue('order') as { id: string } | null;
        return order ? (
          <span className="font-mono">{String(order.id).substring(0, 8)}...</span>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'rider',
      header: 'Rider',
      cell: ({ row }) => {
        const rider = row.getValue('rider') as {
          firstName: string;
          lastName: string;
        } | null;
        return rider ? `${rider.firstName} ${rider.lastName}` : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
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
      header: 'Created At',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isBn ? 'লজিস্টিকস ও ডেলিভারি হাব' : 'Deliveries & Logistics Hub'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn
              ? 'রিয়েল-টাইম রাইডার অ্যাসাইনমেন্ট, মাল্টি-স্টপ রুট ক্লাস্টারিং এবং ডেলিভারি ট্র্যাকিং।'
              : 'Real-time rider assignments, multi-stop rural route clustering, and delivery tracking.'}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table" className="gap-2 text-xs">
            <Truck className="w-4 h-4" />
            {isBn ? 'সকল ডেলিভারি' : 'All Deliveries'}
          </TabsTrigger>
          <TabsTrigger value="dispatcher" className="gap-2 text-xs">
            <Navigation className="w-4 h-4" />
            {isBn ? 'স্মার্ট রুট ক্লাস্টার' : 'Smart Route Dispatcher'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="pt-4">
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
              lang === 'bn' ? 'ডেলিভারি আইডি দিয়ে খুঁজুন...' : 'Search delivery ID...'
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
              singular: lang === 'bn' ? 'ডেলিভারি' : 'delivery',
              plural: lang === 'bn' ? 'ডেলিভারি' : 'deliveries',
            }}
          />
        </TabsContent>

        <TabsContent value="dispatcher" className="pt-4">
          <SmartRouteDispatcherTab lang={lang} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
