'use client';

import React, { use, useState } from 'react';
import { useGetAddressesQuery, useDeleteAddressMutation, Address } from '@/features/addresses/addressApi';
import { AddressForm } from '@/components/profile/AddressForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Plus, Edit2, Trash2, Home, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function AddressBookPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [deleteAddress] = useDeleteAddressMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm(isBn ? 'আপনি কি এই ঠিকানাটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id).unwrap();
        toast.success(isBn ? 'ঠিকানা মুছে ফেলা হয়েছে' : 'Address deleted successfully');
      } catch (err: any) {
        toast.error(err.data?.message || (isBn ? 'সমস্যা হয়েছে' : 'Failed to delete address'));
      }
    }
  };

  const primaryAddress = addresses.find(a => a.isDefault);
  const otherAddresses = addresses.filter(a => !a.isDefault);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isAdding || editingAddress) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h2 className="text-xl font-bold">
            {editingAddress 
              ? (isBn ? 'ঠিকানা আপডেট করুন' : 'Edit Address')
              : (isBn ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address')
            }
          </h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <AddressForm 
              isBn={isBn} 
              initialData={editingAddress || undefined}
              onSuccess={() => {
                setIsAdding(false);
                setEditingAddress(null);
              }}
              onCancel={() => {
                setIsAdding(false);
                setEditingAddress(null);
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            {isBn ? 'অ্যাড্রেস বুক' : 'Address Book'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? 'আপনার ডেলিভারি ঠিকানা পরিচালনা করুন' : 'Manage your delivery addresses'}
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {isBn ? 'নতুন ঠিকানা' : 'Add New'}
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isBn ? 'কোন ঠিকানা পাওয়া যায়নি' : 'No addresses found'}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {isBn 
                ? 'দ্রুত চেকআউট করতে আপনার ডেলিভারি ঠিকানা যোগ করুন' 
                : 'Add your delivery addresses for faster checkout'}
            </p>
            <Button onClick={() => setIsAdding(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {isBn ? 'ঠিকানা যোগ করুন' : 'Add Address'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {primaryAddress && (
            <Card className="border-primary bg-primary/5 md:col-span-2 shadow-sm">
              <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-2 rounded-full text-primary shrink-0">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{primaryAddress.title}</h3>
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                        {isBn ? 'প্রাইমারি' : 'Primary'}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{primaryAddress.contactName}</p>
                    <p className="text-sm text-muted-foreground">{primaryAddress.contactPhone}</p>
                    <p className="text-sm mt-2 text-muted-foreground">{primaryAddress.streetAddress}</p>
                  </div>
                </div>
                <div className="flex gap-2 self-start shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setEditingAddress(primaryAddress)}>
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    {isBn ? 'এডিট' : 'Edit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {otherAddresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-5 flex justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-muted p-2 rounded-full shrink-0">
                    <Home className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{address.title}</h3>
                    <p className="text-sm font-medium">{address.contactName}</p>
                    <p className="text-sm text-muted-foreground">{address.contactPhone}</p>
                    <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{address.streetAddress}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setEditingAddress(address)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(address.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
