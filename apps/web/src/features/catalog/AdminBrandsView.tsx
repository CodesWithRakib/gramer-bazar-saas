'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGetAdminBrandsQuery, Brand } from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddBrandDialog, EditBrandDialog } from './components/BrandDialogs';

export interface AdminBrandsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminBrandsView({ lang = 'en' }: AdminBrandsViewProps) {
  

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminBrandsQuery({ page, limit, search });

  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: 'nameEn',
      header: 'Name (EN)',
      cell: ({ row }) => <span className="font-semibold">{row.original.nameEn}</span>,
    },
    {
      accessorKey: 'nameBn',
      header: 'Name (BN)',
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>,
    },
    {
      id: 'categories',
      header: 'Categories',
      cell: ({ row }) => {
        const categories = row.original.categories || [];
        if (categories.length === 0) {
          return <span className="text-xs text-muted-foreground italic">None</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                {lang === 'bn' ? c.nameBn : c.nameEn}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setEditingBrand(row.original)}>
          {lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {lang === 'bn' ? 'ব্র্যান্ড ব্যবস্থাপনা' : 'Brand Management'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'bn'
              ? 'উৎপাদক এবং প্রস্তুতকারক ব্র্যান্ড এবং ক্যাটাগরি সংযোগ পরিচালনা করুন'
              : 'Manage manufacturer brands and their associated marketplace categories.'}
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
        lang={lang as any}
        itemLabel={{
          singular: lang === 'bn' ? 'ব্র্যান্ড' : 'brand',
          plural: lang === 'bn' ? 'ব্র্যান্ড' : 'brands',
        }}
      />

      {editingBrand && (
        <EditBrandDialog
          brand={editingBrand}
          open={!!editingBrand}
          onOpenChange={(o: boolean) => {
            if (!o) setEditingBrand(null);
          }}
        />
      )}
    </div>
  );
}
