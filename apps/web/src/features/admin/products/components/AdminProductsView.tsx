'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
  Product,
} from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';
import { CustomImage } from '@/components/ui/CustomImage';
import {
  AddProductDialog,
  EditProductDialog,
  ProductImagesDialog,
} from './ProductDialogs';
import { ProductImporterModal } from './ProductImporterModal';
import { Images, Edit, Trash2, Package, Tag, Building2, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export interface AdminProductsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminProductsView({ lang = 'en', namespace = 'admin' }: AdminProductsViewProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [managingImagesProduct, setManagingImagesProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminProductsQuery({
    page,
    limit,
    search,
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteAdminProductMutation();

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id).unwrap();
      toast.success(
        lang === 'bn'
          ? `"${productToDelete.nameBn || productToDelete.nameEn}" মুছে ফেলা হয়েছে`
          : `Product "${productToDelete.nameEn}" deleted`
      );
      setProductToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || (lang === 'bn' ? 'পণ্য মুছতে ব্যর্থ হয়েছে' : 'Failed to delete product'));
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: 'thumbnail',
      header: 'Image',
      cell: ({ row }) => {
        const prod = row.original;
        const primaryImg =
          prod.images?.find((img) => img.isPrimary)?.url ||
          prod.images?.[0]?.url ||
          prod.variants?.[0]?.images?.[0] ||
          '/placeholder.jpg';

        return (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted/30">
            <CustomImage
              src={primaryImg}
              alt={prod.nameEn}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'nameEn',
      header: 'Product Details',
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span>{prod.nameEn}</span>
              {prod.isFeatured && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-amber-500/10 text-amber-700">
                  Featured
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{prod.nameBn}</div>
            {prod.sku && (
              <div className="text-[11px] text-muted-foreground/80 font-mono">
                SKU: {prod.sku}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'classification',
      header: 'Category & Sub',
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">
              {prod.category?.nameEn || '-'}
            </div>
            {prod.subCategory ? (
              <Badge variant="outline" className="text-xs font-normal">
                {prod.subCategory.nameEn}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">No subcategory</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: 'Price (BDT)',
      cell: ({ row }) => {
        const prod = row.original;
        return (
          <div>
            <div className="font-semibold text-foreground">৳{Number(prod.price).toFixed(2)}</div>
            {prod.compareAtPrice && Number(prod.compareAtPrice) > Number(prod.price) && (
              <div className="text-xs text-muted-foreground line-through">
                ৳{Number(prod.compareAtPrice).toFixed(2)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'inventory',
      header: 'Stock / Unit',
      cell: ({ row }) => {
        const prod = row.original;
        const stock = prod.stock ?? prod.totalStock ?? 0;
        return (
          <div>
            <span
              className={`font-semibold ${
                stock <= 5 ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {stock}
            </span>{' '}
            <span className="text-xs text-muted-foreground">({prod.unit || 'piece'})</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || 'PUBLISHED';
        let badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' = 'default';
        let badgeClass = '';

        switch (status) {
          case 'PUBLISHED':
            badgeClass = 'bg-emerald-600 hover:bg-emerald-700';
            break;
          case 'PENDING_REVIEW':
            badgeClass = 'bg-amber-600 hover:bg-amber-700';
            break;
          case 'DRAFT':
            badgeVariant = 'secondary';
            break;
          case 'UNPUBLISHED':
          case 'ARCHIVED':
            badgeVariant = 'outline';
            break;
        }

        return (
          <Badge variant={badgeVariant} className={badgeClass}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const prod = row.original;
        const imageCount = prod.images?.length || 0;

        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2.5 text-xs"
              onClick={() => setManagingImagesProduct(prod)}
            >
              <Images className="h-3.5 w-3.5" />
              <span>Images ({imageCount})</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setEditingProduct(prod)}
              title="Edit Product"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
              onClick={() => setProductToDelete(prod)}
              title="Delete Product"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {lang === 'bn' ? 'মাস্টার প্রোডাক্ট ক্যাটালগ' : 'Master Product Catalog'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'bn' ? 'সকল পণ্য তালিকা, ক্যাটাগরি, ব্র্যান্ড ও পণ্য অনুরোধ ব্যবস্থাপনা।' : 'Global catalog items, categories, brands, and product requests.'}
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b">
        <Link
          href={`/${lang}/${namespace}/products`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"
        >
          <Package className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সকল পণ্য' : 'All Products'}</span>
        </Link>
        <Link
          href={`/${lang}/${namespace}/products/categories`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
        </Link>
        <Link
          href={`/${lang}/${namespace}/products/brands`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'ব্র্যান্ডসমূহ' : 'Brands'}</span>
        </Link>
        <Link
          href={`/${lang}/${namespace}/products/product-requests`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'পণ্য অনুরোধ' : 'Product Requests'}</span>
        </Link>
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
        searchPlaceholder={lang === 'bn' ? 'নাম, SKU অথবা ব্র্যান্ড দিয়ে খুঁজুন...' : 'Search products by name, SKU, or brand...'}
        actionSlot={
          <div className="flex items-center gap-2">
            <ProductImporterModal />
            <AddProductDialog />
          </div>
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
          singular: lang === 'bn' ? 'পণ্য' : 'product',
          plural: lang === 'bn' ? 'পণ্য' : 'products',
        }}
      />

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(o: boolean) => {
            if (!o) setEditingProduct(null);
          }}
        />
      )}

      {managingImagesProduct && (
        <ProductImagesDialog
          product={managingImagesProduct}
          open={!!managingImagesProduct}
          onOpenChange={(o: boolean) => {
            if (!o) setManagingImagesProduct(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          lang === 'bn'
            ? `"${productToDelete?.nameBn || productToDelete?.nameEn}" পণ্যটি মুছে ফেলতে চান?`
            : `Delete "${productToDelete?.nameEn}"?`
        }
        description={
          lang === 'bn'
            ? 'এই অ্যাকশনটি বাতিল করা যাবে না এবং পণ্যের সমস্ত ডেটা মুছে যাবে।'
            : 'This action cannot be undone and will permanently remove this product.'
        }
        confirmLabel={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
        cancelLabel={lang === 'bn' ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
