'use client';

import React, { useMemo, useState } from 'react';
import {
  useGetAdminProductTypesQuery,
  useDeleteAdminProductTypeMutation,
  useGetCategoriesTreeQuery,
  ProductType,
} from '@/features/catalog/catalogApi';
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
import { customToast as toast } from '@/components/ui/custom-toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  AddProductTypeDialog,
  EditProductTypeDialog,
  ManageProductTypeAttributesDialog,
  flattenCategoryTree,
} from './ProductTypeDialogs';

export interface AdminProductTypesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminProductTypesView({
  lang = 'en',
  namespace = 'admin',
}: AdminProductTypesViewProps) {
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
  const [managingProductType, setManagingProductType] = useState<ProductType | null>(null);
  const [productTypeToDelete, setProductTypeToDelete] = useState<ProductType | null>(null);

  const { data: tree } = useGetCategoriesTreeQuery();
  const categoryOptions = useMemo(() => flattenCategoryTree(tree), [tree]);

  const { data, isLoading, isError, refetch } = useGetAdminProductTypesQuery({
    categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
    includeMappings: true,
  });

  const [deleteProductType, { isLoading: isDeleting }] = useDeleteAdminProductTypeMutation();

  const productTypes = useMemo(() => {
    const list = data ?? [];
    if (!search) return list;
    const term = search.toLowerCase();
    return list.filter(
      (pt) =>
        pt.nameEn.toLowerCase().includes(term) ||
        pt.nameBn.includes(search) ||
        pt.slug.toLowerCase().includes(term)
    );
  }, [data, search]);

  const handleConfirmDelete = async () => {
    if (!productTypeToDelete) return;
    try {
      await deleteProductType(productTypeToDelete.id).unwrap();
      toast.success(
        lang === 'bn'
          ? `"${productTypeToDelete.nameBn || productTypeToDelete.nameEn}" প্রোডাক্ট টাইপ মুছে ফেলা হয়েছে`
          : `Product type "${productTypeToDelete.nameEn}" deleted successfully`
      );
      setProductTypeToDelete(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) ||
          (lang === 'bn'
            ? 'প্রোডাক্ট টাইপ মুছতে ব্যর্থ হয়েছে'
            : 'Failed to delete product type')
      );
    }
  };

  const columns: ColumnDef<ProductType>[] = [
    {
      accessorKey: 'nameEn',
      header: 'Product Type',
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
      cell: ({ row }) => <div className="font-medium text-foreground">{row.original.nameBn}</div>,
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.category ? (
            <span className="text-foreground">{row.original.category.nameEn}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      id: 'attributes',
      header: 'Attributes',
      cell: ({ row }) => (
        <Badge variant="outline" className="border-primary/40 text-primary">
          {row.original.attributeMappings?.length ?? 0}
        </Badge>
      ),
    },
    {
      accessorKey: 'sortOrder',
      header: 'Order',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.sortOrder ?? 0}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="secondary" className="bg-emerald-600/10 text-emerald-700">
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setManagingProductType(row.original)}
          >
            Attributes
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditingProductType(row.original)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={() => setProductTypeToDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/${lang}/${basePath}/products`}
        backLabel="Back to Products Hub"
        backLabelBn="পণ্য হাবে ফিরে যান"
        lang={lang}
        title={lang === 'bn' ? 'প্রোডাক্ট টাইপ' : 'Product Types'}
        description={
          lang === 'bn'
            ? 'প্রতিটি ক্যাটাগরির জন্য প্রোডাক্ট টাইপ ও অ্যাট্রিবিউট স্কিমা নির্ধারণ করুন।'
            : 'Define the product types within each category and their attribute schema.'
        }
      />

      <DataTable
        columns={columns}
        data={productTypes}
        pageCount={-1}
        pagination={{ pageIndex: 0, pageSize: productTypes.length || 15 }}
        onPaginationChange={() => undefined}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          lang === 'bn' ? 'প্রোডাক্ট টাইপ খুঁজুন...' : 'Search product types...'
        }
        filterSlot={
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 w-full rounded-full sm:w-[220px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
              <SelectItem value="ALL">All categories</SelectItem>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        actionSlot={<AddProductTypeDialog />}
        totalItems={productTypes.length}
        itemsPerPage={productTypes.length || 15}
        currentPage={1}
        onPageChange={() => undefined}
        lang={lang as 'en' | 'bn'}
        emptyMessage={
          lang === 'bn'
            ? 'এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট টাইপ নেই।'
            : 'No product types in this category yet.'
        }
      />

      {editingProductType && (
        <EditProductTypeDialog
          productType={editingProductType}
          open={!!editingProductType}
          onOpenChange={(o: boolean) => {
            if (!o) setEditingProductType(null);
          }}
        />
      )}

      {managingProductType && (
        <ManageProductTypeAttributesDialog
          productType={managingProductType}
          open={!!managingProductType}
          onOpenChange={(o: boolean) => {
            if (!o) setManagingProductType(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!productTypeToDelete}
        onClose={() => setProductTypeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          lang === 'bn'
            ? `"${productTypeToDelete?.nameBn || productTypeToDelete?.nameEn}" প্রোডাক্ট টাইপ মুছে ফেলতে চান?`
            : `Delete product type "${productTypeToDelete?.nameEn}"?`
        }
        description={
          lang === 'bn'
            ? 'প্রোডাক্ট টাইপ ব্যবহৃত হলে মুছে ফেলা যাবে না।'
            : 'A product type cannot be deleted while products still use it.'
        }
        confirmLabel={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
        cancelLabel={lang === 'bn' ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default AdminProductTypesView;
