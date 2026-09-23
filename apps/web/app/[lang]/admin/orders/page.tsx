'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState } from 'react';
import {
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
  Order,
} from '@/features/orders/ordersApi';
import { useGetRidersQuery, useAssignDeliveryMutation } from '@/features/deliveries/deliveriesApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  // Rider Assignment State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');

  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery({ page, limit, search });
  const [updateStatus] = useUpdateAdminOrderStatusMutation();
  
  const { data: ridersData } = useGetRidersQuery(undefined, { skip: !isAssignModalOpen });
  const [assignDelivery, { isLoading: isAssigning }] = useAssignDeliveryMutation();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success('Order status updated');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update order status');
    }
  };

  const handleAssignRiderSubmit = async () => {
    if (!assigningOrderId || !selectedRiderId) return;
    
    try {
      await assignDelivery({ orderId: assigningOrderId, riderId: selectedRiderId }).unwrap();
      toast.success('Rider assigned successfully');
      setIsAssignModalOpen(false);
      setAssigningOrderId(null);
      setSelectedRiderId('');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to assign rider');
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => <span className="font-mono">{String(row.getValue('id')).substring(0, 8)}...</span>
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }) => {
        const user = row.getValue('user') as {
          firstName: string;
          lastName: string;
        } | null;
        return user ? `${user.firstName} ${user.lastName}` : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
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
              <DropdownMenuItem 
                onClick={() => {
                  setAssigningOrderId(order.id);
                  setIsAssignModalOpen(true);
                }}
              >
                Assign Rider
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Change Status</DropdownMenuLabel>
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
        isError={isError}
        onRetry={() => refetch()}
      />

      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Rider</DialogTitle>
            <DialogDescription>
              Select a rider to assign to order #{assigningOrderId?.substring(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rider" />
              </SelectTrigger>
              <SelectContent>
                {ridersData && ridersData.length > 0 ? (
                  ridersData.map(
                    (rider: {
                      id: string;
                      firstName: string;
                      lastName: string;
                      phone?: string;
                    }) => (
                    <SelectItem key={rider.id} value={rider.id}>
                      {rider.firstName} {rider.lastName} - {rider.phone}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No riders available</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAssignRiderSubmit} 
              disabled={!selectedRiderId || isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
