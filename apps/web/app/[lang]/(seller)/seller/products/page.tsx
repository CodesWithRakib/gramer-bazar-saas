'use client';
import { use } from 'react';

import React, { useState } from 'react';
import {
  useGetSellerProductsQuery,
  SellerProductItem,
} from '@/features/seller-portal/sellerPortalApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BoxSelect } from 'lucide-react';
import { AddProductDialog, EditProductDialog } from './ProductDialogs';

export default function SellerProductsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<SellerProductItem | null>(null);
  
  const { data: products, isLoading } = useGetSellerProductsQuery(searchTerm || undefined);

  const columns: ColumnDef<SellerProductItem>[] = [
    {
      accessorKey: 'productVariant.product.name',
      header: isBn ? 'প্রোডাক্টের নাম' : 'Product Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {isBn
              ? row.original.productVariant.product.nameBn
              : row.original.productVariant.product.nameEn}
          </div>
          <div className="text-xs text-muted-foreground">SKU: {row.original.productVariant.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: isBn ? 'দাম' : 'Price',
      cell: ({ row }) => `৳ ${row.getValue('price')}`,
    },
    {
      accessorKey: 'inventory.quantity',
      header: isBn ? 'মজুদ' : 'Inventory',
      cell: ({ row }) => {
        const inv = row.original.inventory;
        const available = inv.quantity - inv.reservedQuantity;
        const isLowStock = available <= inv.lowStockThreshold;
        
        return (
          <div className="flex flex-col">
            <span>{isBn ? 'উপলব্ধ' : 'Available'}: <strong className={isLowStock ? 'text-red-500' : ''}>{available}</strong></span>
            <span className="text-xs text-muted-foreground">{isBn ? 'মোট' : 'Total'}: {inv.quantity} | {isBn ? 'সংরক্ষিত' : 'Reserved'}: {inv.reservedQuantity}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: isBn ? 'স্ট্যাটাস' : 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive');
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: isBn ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setEditingProduct(row.original)}>
          {isBn ? 'এডিট' : 'Edit'}
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{isBn ? 'আমার প্রোডাক্টসমূহ' : 'My Products'}</h1>
        <AddProductDialog isBn={isBn} />
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          placeholder={isBn ? 'সার্চ করুন...' : 'Search products...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40 mb-2" /><Skeleton className="h-3 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-16" /></TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <BoxSelect className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">{isBn ? 'কোনো প্রোডাক্ট পাওয়া যায়নি' : 'No products found'}</p>
                    <p className="text-sm mt-1">{isBn ? 'নতুন প্রোডাক্ট যোগ করতে উপরে "Add Product" বাটনে ক্লিক করুন' : 'Click "Add Product" above to create a new product.'}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {isBn ? 'পূর্ববর্তী' : 'Previous'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {isBn ? 'পরবর্তী' : 'Next'}
        </Button>
      </div>
      
      {editingProduct && (
        <EditProductDialog
          isBn={isBn}
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(o) => {
            if (!o) setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
