'use client';

import React, { useState } from 'react';
import { useGetAdminOrdersQuery, useUpdateAdminOrderStatusMutation } from '@/features/orders/ordersApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useGetAdminOrdersQuery({ page, limit, search });
  const [updateStatus] = useUpdateAdminOrderStatusMutation();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success('Order status updated');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update order status');
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => <span className="font-mono">{String(row.getValue('id')).substring(0, 8)}...</span>
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }) => {
        const user = row.getValue('user') as any;
        return user ? `${user.firstName} ${user.lastName}` : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: any = 'default';
        if (status === 'PENDING') variant = 'secondary';
        else if (status === 'DELIVERED') variant = 'default';
        else if (status === 'CANCELLED' || status === 'FAILED') variant = 'destructive';
        
        return <Badge variant={variant}>{status}</Badge>;
      }
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => `৳${Number(row.getValue('total')).toFixed(2)}`
    },
    {
      accessorKey: 'createdAt',
      header: 'Placed On',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        const availableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED'];
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableStatuses.map((status) => (
                <DropdownMenuItem 
                  key={status}
                  onClick={() => handleStatusChange(order.id, status)}
                  disabled={order.status === status}
                >
                  Mark as {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      </div>
      
      <div className="flex items-center space-x-2 max-w-sm">
        <Input 
          placeholder="Search order ID..." 
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
      />
    </div>
  );
}
