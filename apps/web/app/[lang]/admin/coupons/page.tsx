'use client';

import React, { useState } from 'react';
import { useGetAdminCouponsQuery } from '@/features/coupons/couponsApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useGetAdminCouponsQuery({ page, limit, search });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-mono font-bold">{row.getValue('code')}</span>
    },
    {
      accessorKey: 'discountType',
      header: 'Type',
    },
    {
      accessorKey: 'discountValue',
      header: 'Value',
      cell: ({ row }) => {
        const type = row.getValue('discountType');
        const value = row.getValue('discountValue');
        return type === 'PERCENTAGE' ? `${value}%` : `৳${value}`;
      }
    },
    {
      accessorKey: 'usage',
      header: 'Usage (Used / Limit)',
      cell: ({ row }) => {
        const used = row.original.usedCount;
        const limit = row.original.usageLimit;
        return `${used} / ${limit || '∞'}`;
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        const endDate = row.original.endDate ? new Date(row.original.endDate) : null;
        const isExpired = endDate && endDate < new Date();

        if (isExpired) return <Badge variant="destructive">Expired</Badge>;
        if (isActive) return <Badge variant="default">Active</Badge>;
        return <Badge variant="secondary">Inactive</Badge>;
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
      </div>
      
      <div className="flex items-center space-x-2 max-w-sm">
        <Input 
          placeholder="Search coupon code..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
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
      />
    </div>
  );
}
