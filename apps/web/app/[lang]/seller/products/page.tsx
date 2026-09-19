'use client';
import { use } from 'react';

import React, { useState } from 'react';
import {
  useGetSellerProductsQuery,
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

export default function SellerProductsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: products, isLoading } = useGetSellerProductsQuery(searchTerm || undefined);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'productVariant.product.name',
      header: isBn ? 'প্রোডাক্টের নাম' : 'Product Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.productVariant.product.name}</div>
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
        <Button variant="outline" size="sm">
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
        <Button>{isBn ? 'নতুন প্রোডাক্ট যোগ করুন' : 'Add New Product'}</Button>
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
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
                </TableCell>
              </TableRow>
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isBn ? 'কোনো প্রোডাক্ট পাওয়া যায়নি' : 'No results.'}
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
    </div>
  );
}
