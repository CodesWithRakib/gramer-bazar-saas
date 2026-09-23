'use client';

import React, { useState } from 'react';
import { useGetAdminCategoriesQuery, Category } from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AddCategoryDialog, EditCategoryDialog } from './CategoryDialogs';

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const { data, isLoading, isError, refetch } = useGetAdminCategoriesQuery({ page, limit, search });

  const columns: ColumnDef<Category>[] = [
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
      accessorKey: 'parent',
      header: 'Parent',
      cell: ({ row }) => {
        const parent = row.getValue('parent') as Category | null;
        return parent ? parent.nameEn : '-';
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setEditingCategory(row.original)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <AddCategoryDialog />
      </div>
      
      <div className="flex items-center space-x-2 max-w-sm">
        <Input 
          placeholder="Search categories..." 
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

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(o) => {
            if (!o) setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}
