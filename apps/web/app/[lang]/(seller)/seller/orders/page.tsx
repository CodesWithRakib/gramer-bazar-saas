'use client';
import { use } from 'react';

import React from 'react';
import Link from 'next/link';
import { useGetSellerOrdersQuery } from '@/features/seller-portal/sellerPortalApi';
import { Order } from '@/features/orders/ordersApi';
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
import { Badge } from '@/components/ui/badge';

export default function SellerOrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: orders, isLoading } = useGetSellerOrdersQuery();

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: isBn ? 'অর্ডার আইডি' : 'Order ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue<string>('id').slice(-8).toUpperCase()}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: isBn ? 'তারিখ' : 'Date',
      cell: ({ row }) => {
        try {
          return new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
            dateStyle: 'medium',
          }).format(new Date(row.getValue('createdAt')));
        } catch {
          return '-';
        }
      },
    },
    {
      accessorKey: 'user.phone',
      header: isBn ? 'ক্রেতা' : 'Customer',
      cell: ({ row }) => (
        <div>
          <div>{row.original.user?.firstName || 'User'}</div>
          <div className="text-xs text-muted-foreground">{row.original.user?.phone || row.getValue('user.phone')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: isBn ? 'স্ট্যাটাস' : 'Status',
      cell: ({ row }) => {
        const status = row.getValue<string>('status');
        return <Badge variant="outline">{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: isBn ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${lang}/seller/orders/${row.getValue('id')}`}>
            {isBn ? 'বিস্তারিত' : 'Details'}
          </Link>
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{isBn ? 'অর্ডারসমূহ' : 'Orders'}</h1>

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
                  {isBn ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found.'}
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
