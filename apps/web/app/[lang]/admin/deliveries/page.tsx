'use client';

import React, { use, useState, useEffect } from 'react';
import { 
  useGetAdminDeliveriesQuery,
  useGetRidersQuery,
  useAssignDeliveryMutation 
} from '@/features/deliveries/deliveriesApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminDeliveriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const [lang, setLang] = useState('en');
  useEffect(() => { params.then(p => setLang(p.lang)); }, [params]);
  const isBn = lang === 'bn';

  const { data: deliveries, isLoading, refetch } = useGetAdminDeliveriesQuery(undefined, { pollingInterval: 30000 });
  const { data: riders } = useGetRidersQuery();
  const [assignDelivery, { isLoading: isAssigning }] = useAssignDeliveryMutation();

  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');

  const handleOpenAssign = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedRiderId('');
    setAssignmentModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedOrderId || !selectedRiderId) return;
    try {
      await assignDelivery({ orderId: selectedOrderId, riderId: selectedRiderId }).unwrap();
      toast.success(isBn ? 'রাইডার অ্যাসাইন করা হয়েছে' : 'Rider assigned successfully');
      setAssignmentModalOpen(false);
      refetch();
    } catch (e) {
      toast.error(isBn ? 'ব্যর্থ হয়েছে' : 'Failed to assign rider');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isBn ? 'ডেলিভারি ম্যানেজমেন্ট' : 'Delivery Management'}</h1>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rider</TableHead>
              <TableHead>Assigned At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : deliveries?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">No deliveries found</TableCell></TableRow>
            ) : (
              deliveries?.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-mono">{delivery.orderId.slice(-8).toUpperCase()}</TableCell>
                  <TableCell><Badge variant="outline">{delivery.status}</Badge></TableCell>
                  <TableCell>
                    {delivery.order?.address?.city}, {delivery.order?.address?.street}
                  </TableCell>
                  <TableCell>
                    {delivery.rider ? `${delivery.rider.firstName} ${delivery.rider.lastName}` : <span className="text-muted-foreground italic">Unassigned</span>}
                  </TableCell>
                  <TableCell>{delivery.assignedAt ? new Date(delivery.assignedAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleOpenAssign(delivery.orderId)}>
                      {isBn ? 'রাইডার পরিবর্তন' : 'Assign Rider'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isBn ? 'রাইডার অ্যাসাইন করুন' : 'Assign Rider'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Rider</Label>
              <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rider..." />
                </SelectTrigger>
                <SelectContent>
                  {riders?.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.firstName} {r.lastName} ({r.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAssign} disabled={isAssigning || !selectedRiderId}>
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
