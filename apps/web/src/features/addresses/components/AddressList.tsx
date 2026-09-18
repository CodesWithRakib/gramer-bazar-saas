'use client';

import { useState } from 'react';
import { useGetAddressesQuery, useDeleteAddressMutation, Address } from '../addressApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import { AddressForm } from './AddressForm';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function AddressList() {
  const { data: addresses, isLoading, isError } = useGetAddressesQuery();
  const [deleteAddress] = useDeleteAddressMutation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id).unwrap();
        toast.success('Address deleted successfully');
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center border border-destructive/50 bg-destructive/10 text-destructive rounded-lg">
        Failed to load addresses. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Your Addresses</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <AddressForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {!addresses?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20 border-dashed">
          <MapPin className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No addresses saved</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add an address to speed up your checkout process.
          </p>
          <Button onClick={() => setIsAddOpen(true)}>Add Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'border-primary/50 shadow-sm' : ''}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {address.title}
                    {address.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {address.contactName} • {address.contactPhone}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground">
                  {address.streetAddress}
                  <br />
                  {address.area?.nameEn && `${address.area.nameEn}, `}
                  {address.union?.nameEn && `${address.union.nameEn}, `}
                  {address.upazila?.nameEn && `${address.upazila.nameEn}`}
                  <br />
                  {address.district?.nameEn && `${address.district.nameEn}, `}
                  {address.division?.nameEn}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Dialog open={editingAddress?.id === address.id} onOpenChange={(open) => !open && setEditingAddress(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setEditingAddress(address)}>
                      <Edit2 className="mr-2 h-3 w-3" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Address</DialogTitle>
                    </DialogHeader>
                    {editingAddress && (
                      <AddressForm initialData={editingAddress} onSuccess={() => setEditingAddress(null)} />
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => handleDelete(address.id)}>
                  <Trash2 className="mr-2 h-3 w-3" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
