'use client';

import { use, useState, useMemo } from 'react';
import React from 'react';
import {
  useGetSellerProductsQuery,
  SellerProductItem,
} from '@/features/seller-portal/sellerPortalApi';
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
import { AddProductDialog, EditProductDialog } from './SellerProductDialogs';

export interface SellerProductsViewProps {
  lang?: string;
}

export function SellerProductsView({ lang = 'en' }: SellerProductsViewProps) {
  
  const isBn = lang === 'bn';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState<SellerProductItem | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: products, isLoading, isError, refetch } = useGetSellerProductsQuery(
    searchTerm.trim() || undefined,
  );

  const filteredProducts = useMemo(() => {
    let list = products || [];
    if (statusFilter !== 'ALL') {
      const wantActive = statusFilter === 'ACTIVE';
      list = list.filter((p) => p.isActive === wantActive);
    }
    return list;
  }, [products, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / limit));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProducts.slice(start, start + limit);
  }, [filteredProducts, page, limit]);

  const columns: ColumnDef<SellerProductItem>[] = [
    {
      accessorKey: 'productVariant.product.name',
      header: isBn ? 'প্রোডাক্টের নাম' : 'Product Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">
            {isBn
              ? row.original.productVariant.product.nameBn
              : row.original.productVariant.product.nameEn}
          </div>
          <div className="text-xs text-muted-foreground">
            SKU: {row.original.productVariant.sku}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: isBn ? 'মূল্য' : 'Price',
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-foreground">৳{row.original.price}</span>
          {row.original.discountPrice && (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              ৳{row.original.discountPrice}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'inventory.quantity',
      header: isBn ? 'মজুদ' : 'Stock',
      cell: ({ row }) => {
        const qty = row.original.inventory?.quantity ?? 0;
        const low = row.original.inventory?.lowStockThreshold ?? 5;
        const isLow = qty <= low;

        return (
          <div>
            <span className={`font-medium ${isLow ? 'text-destructive font-semibold' : 'text-foreground'}`}>
              {qty}
            </span>
            {isLow && (
              <span className="ml-2 text-xs text-destructive">
                ({isBn ? 'কম স্টক' : 'Low'})
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: isBn ? 'অবস্থা' : 'Status',
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? (isBn ? 'সক্রিয়' : 'Active') : isBn ? 'নিষ্ক্রিয়' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: isBn ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full h-8 px-3"
          onClick={() => setEditingProduct(row.original)}
        >
          {isBn ? 'এডিট' : 'Edit'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isBn ? 'আমার প্রোডাক্টসমূহ' : 'My Products'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isBn
              ? 'আপনার স্টোরের সমস্ত প্রোডাক্ট ও ইনভেন্টরি পরিচালনা করুন।'
              : 'Manage products, prices, and stock inventory for your store.'}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedProducts}
        pageCount={totalPages}
        totalCount={filteredProducts.length}
        itemLabel={{
          singular: isBn ? 'প্রোডাক্ট' : 'product',
          plural: isBn ? 'প্রোডাক্ট' : 'products',
        }}
        isBn={isBn}
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
        search={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchPlaceholder={isBn ? 'প্রোডাক্ট খুঁজুন...' : 'Search products...'}
        filterSlot={
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 dark:border-border dark:bg-card dark:text-foreground">
                <SelectValue placeholder={isBn ? 'সব অবস্থা' : 'All Statuses'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isBn ? 'সব অবস্থা' : 'All Statuses'}</SelectItem>
                <SelectItem value="ACTIVE">{isBn ? 'সক্রিয়' : 'Active'}</SelectItem>
                <SelectItem value="INACTIVE">{isBn ? 'নিষ্ক্রিয়' : 'Inactive'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        actionSlot={<AddProductDialog isBn={isBn} />}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(o: boolean) => {
            if (!o) setEditingProduct(null);
          }}
          isBn={isBn}
        />
      )}
    </div>
  );
}
