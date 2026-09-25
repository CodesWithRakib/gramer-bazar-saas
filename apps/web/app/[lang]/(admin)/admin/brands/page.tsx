'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetAdminBrandsQuery, Brand } from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { AddBrandDialog, EditBrandDialog } from './BrandDialogs';

export default function AdminBrandsPage() {
  const routeParams = useParams();
  const lang = (routeParams?.lang as string) === 'bn' ? 'bn' : 'en';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  const { data, isLoading, isError, refetch } = useGetAdminBrandsQuery({ page, limit, search });

  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: 'nameEn',
      header: 'Name (EN)',
    },
    {
      accessorKey: 'nameBn',
      header: 'Name (BN)',
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setEditingBrand(row.original)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage manufacturer and producer brands.
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
        searchPlaceholder={lang === 'bn' ? 'ব্র্যান্ড খুঁজুন...' : 'Search brands...'}
        actionSlot={<AddBrandDialog />}
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
          singular: lang === 'bn' ? 'ব্র্যান্ড' : 'brand',
          plural: lang === 'bn' ? 'ব্র্যান্ড' : 'brands',
        }}
      />

      {editingBrand && (
        <EditBrandDialog
          brand={editingBrand}
          open={!!editingBrand}
          onOpenChange={(o) => {
            if (!o) setEditingBrand(null);
          }}
        />
      )}
    </div>
  );
}
