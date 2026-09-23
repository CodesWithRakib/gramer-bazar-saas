'use client';

import React, { useState } from 'react';
import { useGetAdminProductsQuery, Product } from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data, isLoading, isError, refetch } = useGetAdminProductsQuery({ page, limit, search });

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'nameEn',
      header: 'Name (EN)',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as { nameEn: string } | null;
        return category ? category.nameEn : '-';
      },
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => {
        const brand = row.getValue('brand') as { nameEn: string } | null;
        return brand ? brand.nameEn : '-';
      },
    },
    {
      accessorKey: 'variants',
      header: 'Variants',
      cell: ({ row }) => {
        const variants = row.getValue('variants') as unknown[];
        return variants?.length || 0;
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
        <h1 className="text-3xl font-bold tracking-tight">Products (Global)</h1>
      </div>
      
      <div className="flex items-center space-x-2 max-w-sm">
        <Input 
          placeholder="Search products..." 
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
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}
