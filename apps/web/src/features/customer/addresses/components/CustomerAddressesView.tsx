'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState } from 'react';
import { useGetAddressesQuery, useDeleteAddressMutation, Address } from '@/features/addresses/addressApi';
import { AddressForm } from '@/components/profile/AddressForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Plus, Edit2, Trash2, Home, Star, LocateFixed } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

export interface CustomerAddressesViewProps {
  lang?: string;
}

export function CustomerAddressesView({ lang = 'en' }: CustomerAddressesViewProps) {
  const isBn = lang === 'bn';

  const { data: addresses = [], isLoading } = useGetAddressesQuery();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress(addressToDelete).unwrap();
      toast.success(isBn ? 'ঠিকানা মুছে ফেলা হয়েছে' : 'Address deleted successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || (isBn ? 'সমস্যা হয়েছে' : 'Failed to delete address'));
    } finally {
      setAddressToDelete(null);
    }
  };

  const primaryAddress = addresses.find((a) => a.isDefault);
  const otherAddresses = addresses.filter((a) => !a.isDefault);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'অ্যাড্রেস বুক' : 'Address Book'}
          description={
            isBn ? 'আপনার ডেলিভারি ঠিকানা পরিচালনা করুন।' : 'Manage your delivery addresses.'
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44 w-full rounded-2xl md:col-span-2" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isAdding || editingAddress) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          title={
            editingAddress
              ? isBn
                ? 'ঠিকানা আপডেট করুন'
                : 'Edit Address'
              : isBn
              ? 'নতুন ঠিকানা যোগ করুন'
              : 'Add New Address'
          }
          description={
            isBn
              ? 'সঠিক তথ্য প্রদান করে আপনার ডেলিভারি সুবিধা নিশ্চিত করুন।'
              : 'Provide accurate location details for smooth order deliveries.'
          }
          secondaryActions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setEditingAddress(null);
              }}
              className="rounded-xl"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
          }
        />
        <Card className="rounded-3xl border border-border/70 shadow-xs">
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
      <PageHeader
        title={isBn ? 'অ্যাড্রেস বুক' : 'Address Book'}
        description={
          isBn ? 'আপনার ডেলিভারি ঠিকানা পরিচালনা করুন।' : 'Manage your delivery addresses.'
        }
        badge={
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
            {addresses.length} {isBn ? 'টি ঠিকানা' : 'addresses'}
          </span>
        }
        primaryAction={
          <Button onClick={() => setIsAdding(true)} className="rounded-xl shadow-xs">
            <Plus className="w-4 h-4 mr-2" />
            {isBn ? 'নতুন ঠিকানা' : 'Add New'}
          </Button>
        }
      />

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-8 h-8 text-primary" />}
          title={isBn ? 'কোন ঠিকানা পাওয়া যায়নি' : 'No addresses found'}
          description={
            isBn
              ? 'দ্রুত ও সহজে চেকআউট সম্পন্ন করতে আপনার ডেলিভারি ঠিকানা যোগ করুন।'
              : 'Add your home or office delivery addresses for fast and seamless checkout.'
          }
          action={{
            label: isBn ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address',
            onClick: () => setIsAdding(true),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {primaryAddress && (
            <Card className="border-primary/40 bg-primary/5 md:col-span-2 shadow-xs rounded-2xl">
              <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-2 rounded-xl text-primary shrink-0">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{primaryAddress.title}</h3>
                      <span className="bg-primary text-primary-foreground text-xs px-2.5 py-0.5 rounded-full font-medium shadow-xs">
                        {isBn ? 'প্রাইমারি' : 'Primary'}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{primaryAddress.contactName}</p>
                    <p className="text-sm text-muted-foreground">{primaryAddress.contactPhone}</p>
                    <p className="text-sm mt-2 text-muted-foreground">{primaryAddress.streetAddress}</p>
                    {primaryAddress.lat != null && primaryAddress.lng != null && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <LocateFixed className="w-3.5 h-3.5" />
                        {isBn ? 'জিপিএস পিন করা আছে — লাইভ ট্র্যাকিং চালু' : 'GPS pinned — live tracking enabled'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 self-start shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAddress(primaryAddress)}
                    className="rounded-xl shadow-xs"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    {isBn ? 'এডিট' : 'Edit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {otherAddresses.map((address) => (
            <Card key={address.id} className="rounded-2xl border-border/70 shadow-xs hover:border-primary/30 transition-all">
              <CardContent className="p-5 flex justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-muted p-2 rounded-xl shrink-0">
                    <Home className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{address.title}</h3>
                    <p className="text-sm font-medium">{address.contactName}</p>
                    <p className="text-sm text-muted-foreground">{address.contactPhone}</p>
                    <p className="text-sm mt-1 text-muted-foreground line-clamp-2">{address.streetAddress}</p>
                    {address.lat != null && address.lng != null && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <LocateFixed className="w-3 h-3" />
                        {isBn ? 'GPS পিন করা' : 'GPS pinned'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingAddress(address)}
                    className="rounded-xl h-8 w-8 hover:bg-muted"
                    aria-label={isBn ? 'এডিট ঠিকানা' : 'Edit address'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8"
                    onClick={() => setAddressToDelete(address.id)}
                    aria-label={isBn ? 'মুছে ফেলুন' : 'Delete address'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!addressToDelete}
        onOpenChange={(open) => {
          if (!open) setAddressToDelete(null);
        }}
        title={isBn ? 'ঠিকানাটি মুছে ফেলতে চান?' : 'Delete Address?'}
        description={
          isBn
            ? 'আপনি কি নিশ্চিত যে আপনি এই ঠিকানাটি মুছে ফেলতে চান? এটি আর চেকআউটে পাওয়া যাবে না।'
            : 'Are you sure you want to delete this delivery address? It will no longer be available at checkout.'
        }
        confirmLabel={isBn ? 'মুছে ফেলুন' : 'Delete Address'}
        cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        isBn={isBn}
      />
    </div>
  );
}
