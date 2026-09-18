'use client';

import React, { useState } from 'react';
import { useGetAdminReviewsQuery } from '@/features/reviews/reviewsApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useGetAdminReviewsQuery({ page, limit, search });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => {
        const product = row.getValue('product') as any;
        return product ? product.nameEn : '-';
      }
    },
    {
      accessorKey: 'user',
      header: 'Reviewer',
      cell: ({ row }) => {
        const user = row.getValue('user') as any;
        return user ? `${user.firstName} ${user.lastName}` : '-';
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="mr-1">{row.getValue('rating')}</span>
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        </div>
      )
    },
    {
      accessorKey: 'isApproved',
      header: 'Status',
      cell: ({ row }) => {
        const isApproved = row.getValue('isApproved') as boolean;
        return isApproved ? (
          <Badge variant="default">Approved</Badge>
        ) : (
          <Badge variant="secondary">Pending/Rejected</Badge>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
      </div>
      
      <div className="flex items-center space-x-2 max-w-sm">
        <Input 
          placeholder="Search reviews..." 
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
