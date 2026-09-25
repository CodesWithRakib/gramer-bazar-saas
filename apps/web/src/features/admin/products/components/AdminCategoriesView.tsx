'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useGetAdminCategoriesQuery,
  useDeleteAdminCategoryMutation,
  Category,
} from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';
import { AddCategoryDialog, EditCategoryDialog } from './CategoryDialogs';

export interface AdminCategoriesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminCategoriesView({ lang = 'en' }: AdminCategoriesViewProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminCategoriesQuery({
    page,
    limit,
    search,
  });

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteAdminCategoryMutation();

  const handleDelete = async (category: Category) => {
    if (
      !window.confirm(
        `Are you sure you want to delete category "${category.nameEn}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteCategory(category.id).unwrap();
      toast.success(`Category "${category.nameEn}" deleted successfully`);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to delete category');
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'icon',
      header: 'Icon',
      cell: ({ row }) => (
        <span className="text-xl">{row.original.icon || '📁'}</span>
      ),
    },
    {
      accessorKey: 'nameEn',
      header: 'Name (EN)',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.original.nameEn}</div>
          <div className="text-xs text-muted-foreground">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: 'nameBn',
      header: 'Name (BN)',
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{row.original.nameBn}</div>
      ),
    },
    {
      id: 'hierarchy',
      header: 'Level',
      cell: ({ row }) => {
        const cat = row.original;
        if (!cat.parentId) {
          return (
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
              Root Category
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="border-primary/40 text-primary">
            Subcategory
          </Badge>
        );
      },
    },
    {
      accessorKey: 'sortOrder',
      header: 'Order',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.sortOrder ?? 0}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingCategory(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={() => handleDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories & Subcategories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage root categories, subcategories, sort orders, and translations.
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
        searchPlaceholder={lang === 'bn' ? 'ক্যাটাগরি বা স্লাগ দিয়ে খুঁজুন...' : 'Search categories by name or slug...'}
        actionSlot={<AddCategoryDialog />}
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
          singular: lang === 'bn' ? 'ক্যাটাগরি' : 'category',
          plural: lang === 'bn' ? 'ক্যাটাগরি' : 'categories',
        }}
      />

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(o: boolean) => {
            if (!o) setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}
