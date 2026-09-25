'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState } from 'react';
import {
  useGetAdminOrdersQuery,
  useTransitionOrderMutation,
  Order,
  OrderStatus,
  VALID_ORDER_TRANSITIONS,
} from '@/features/orders/ordersApi';
import { useGetRidersQuery, useAssignDeliveryMutation } from '@/features/deliveries/deliveriesApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface AdminOrdersViewProps {
  namespace: 'admin' | 'super-admin';
}

const STATUS_ACTION_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Reset to Pending',
  [OrderStatus.CONFIRMED]: 'Confirm Order',
  [OrderStatus.PROCESSING]: 'Start Processing',
  [OrderStatus.READY_FOR_PICKUP]: 'Mark Ready for Pickup',
  [OrderStatus.ASSIGNED_TO_RIDER]: 'Assign to Rider',
  [OrderStatus.PICKED_UP]: 'Confirm Picked Up',
  [OrderStatus.OUT_FOR_DELIVERY]: 'Send Out for Delivery',
  [OrderStatus.DELIVERED]: 'Mark as Delivered',
  [OrderStatus.CANCELLED]: 'Cancel Order',
  [OrderStatus.FAILED]: 'Mark as Failed',
  [OrderStatus.REFUNDED]: 'Issue Refund',
};

export function AdminOrdersView({ namespace }: AdminOrdersViewProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  // Rider Assignment State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');

  // Reason Confirmation Modal State
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [targetTransition, setTargetTransition] = useState<{ orderId: string; targetStatus: OrderStatus } | null>(null);
  const [transitionReason, setTransitionReason] = useState('');

  // Filter State
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery({ page, limit, search });
  const [transitionOrder, { isLoading: isTransitioning }] = useTransitionOrderMutation();

  const { data: ridersData } = useGetRidersQuery(undefined, { skip: !isAssignModalOpen });
  const [assignDelivery, { isLoading: isAssigning }] = useAssignDeliveryMutation();

  const isSuperAdmin = namespace === 'super-admin';

  const filteredOrders = React.useMemo(() => {
    let list = data?.data || [];
    if (statusFilter !== 'ALL') {
      list = list.filter((order) => order.status === statusFilter);
    }
    return list;
  }, [data?.data, statusFilter]);

  const executeTransition = async (orderId: string, targetStatus: OrderStatus, reason?: string) => {
    try {
      await transitionOrder({ id: orderId, targetStatus, reason }).unwrap();
      toast.success(`Order successfully transitioned to ${targetStatus}`);
      setIsReasonModalOpen(false);
      setTargetTransition(null);
      setTransitionReason('');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to transition order status');
    }
  };

  const handleActionClick = (orderId: string, targetStatus: OrderStatus) => {
    // For cancellation or refund, require/allow a reason modal
    if (targetStatus === OrderStatus.CANCELLED || targetStatus === OrderStatus.REFUNDED || targetStatus === OrderStatus.FAILED) {
      setTargetTransition({ orderId, targetStatus });
      setTransitionReason('');
      setIsReasonModalOpen(true);
    } else {
      executeTransition(orderId, targetStatus, `Operational transition by ${namespace}`);
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
      cell: ({ row }) => <span className="font-mono">{String(row.getValue('id')).substring(0, 8)}...</span>,
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
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => `৳${Number(row.getValue('total')).toFixed(2)}`,
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
        const currentStatus = order.status as OrderStatus;
        const validNextStatuses = VALID_ORDER_TRANSITIONS[currentStatus] || [];
        const canAssignRider = ['CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'ASSIGNED_TO_RIDER'].includes(currentStatus);

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
              {canAssignRider && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setAssigningOrderId(order.id);
                      setIsAssignModalOpen(true);
                    }}
                  >
                    Assign Rider
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuLabel className="text-xs text-muted-foreground">Valid Transitions</DropdownMenuLabel>
              {validNextStatuses.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                  No further transitions
                </div>
              ) : (
                validNextStatuses.map((nextStatus) => {
                  const isDestructive = nextStatus === OrderStatus.CANCELLED || nextStatus === OrderStatus.FAILED;
                  return (
                    <DropdownMenuItem
                      key={nextStatus}
                      onClick={() => handleActionClick(order.id, nextStatus)}
                      className={isDestructive ? 'text-destructive focus:text-destructive' : ''}
                    >
                      {STATUS_ACTION_LABELS[nextStatus] || `Transition to ${nextStatus}`}
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isSuperAdmin ? 'All Platform Orders' : 'Order Management'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSuperAdmin
              ? 'Super Admin oversight of all marketplace orders across all stores, riders, and regions.'
              : 'Track, fulfill, and assign riders for customer orders.'}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        pageCount={data?.meta?.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: 'order', plural: 'orders' }}
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
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search order ID..."
        filterSlot={
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 dark:border-border dark:bg-card dark:text-foreground">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="READY_FOR_PICKUP">Ready for Pickup</SelectItem>
                <SelectItem value="ASSIGNED_TO_RIDER">Assigned to Rider</SelectItem>
                <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
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
                    )
                  )
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No riders available</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignRiderSubmit}
              disabled={!selectedRiderId || isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReasonModalOpen} onOpenChange={setIsReasonModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Transition</DialogTitle>
            <DialogDescription>
              You are transitioning Order #{targetTransition?.orderId.substring(0, 8)} to{' '}
              <span className="font-semibold text-foreground">{targetTransition?.targetStatus}</span>.
              Please provide a reason or note for this transition.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for this change (e.g., Customer requested cancellation)..."
              value={transitionReason}
              onChange={(e) => setTransitionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReasonModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={targetTransition?.targetStatus === OrderStatus.CANCELLED || targetTransition?.targetStatus === OrderStatus.FAILED ? 'destructive' : 'default'}
              disabled={isTransitioning}
              onClick={() => {
                if (targetTransition) {
                  executeTransition(
                    targetTransition.orderId,
                    targetTransition.targetStatus,
                    transitionReason || `Transitioned to ${targetTransition.targetStatus} by ${namespace}`,
                  );
                }
              }}
            >
              {isTransitioning ? 'Updating...' : 'Confirm Transition'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
