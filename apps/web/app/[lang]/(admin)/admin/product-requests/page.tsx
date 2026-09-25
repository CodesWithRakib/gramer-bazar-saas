'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useGetAdminProductRequestsQuery,
  ProductRequest,
} from '@/features/product-requests/productRequestsApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

export default function AdminProductRequestsPage() {
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) === 'bn' ? 'bn' : 'en';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data, isLoading, isError, refetch } = useGetAdminProductRequestsQuery({ page, limit, search });

  const columns: ColumnDef<ProductRequest>[] = [
    {
      accessorKey: 'requestedProductName',
      header: 'Requested Product',
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }) => {
        const user = row.getValue('user') as {
          firstName: string;
          lastName: string;
        } | null;
        return user ? `${user.firstName} ${user.lastName}` : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
        if (status === 'PENDING') variant = 'secondary';
        else if (status === 'APPROVED' || status === 'FULFILLED') variant = 'default';
        else if (status === 'REJECTED') variant = 'destructive';
        
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Requested On',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review customer product requests and track fulfillment status.
          </p>
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
        searchPlaceholder={lang === 'bn' ? 'পণ্য অনুরোধ খুঁজুন...' : 'Search product requests...'}
        totalItems={data?.meta?.total}
        itemsPerPage={limit}
        currentPage={page}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        lang={lang}
        itemLabel={{
          singular: lang === 'bn' ? 'অনুরোধ' : 'request',
          plural: lang === 'bn' ? 'অনুরোধ' : 'requests',
        }}
      />
    </div>
  );
}
