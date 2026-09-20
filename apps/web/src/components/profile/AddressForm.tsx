'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreateAddressMutation, useUpdateAddressMutation, Address } from '@/features/addresses/addressApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddressFormProps {
  initialData?: Address;
  isBn: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ initialData, isBn, onSuccess, onCancel }: AddressFormProps) {
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    contactName: initialData?.contactName || '',
    contactPhone: initialData?.contactPhone || '',
    streetAddress: initialData?.streetAddress || '',
    isDefault: initialData?.isDefault || false,
  });

  const isSaving = isCreating || isUpdating;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isDefault: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await updateAddress({ id: initialData.id, body: formData }).unwrap();
        toast.success(isBn ? 'অ্যাড্রেস আপডেট করা হয়েছে' : 'Address updated successfully');
      } else {
        await createAddress(formData).unwrap();
        toast.success(isBn ? 'নতুন অ্যাড্রেস যোগ করা হয়েছে' : 'New address added successfully');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.data?.message || (isBn ? 'সমস্যা হয়েছে' : 'An error occurred'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{isBn ? 'অ্যাড্রেস টাইটেল (যেমন: বাসা, অফিস)' : 'Address Title (e.g., Home, Office)'}</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactName">{isBn ? 'যোগাযোগের নাম' : 'Contact Name'}</Label>
          <Input
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">{isBn ? 'যোগাযোগের নম্বর' : 'Contact Phone'}</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetAddress">{isBn ? 'বিস্তারিত ঠিকানা' : 'Street Address'}</Label>
        <Input
          id="streetAddress"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="isDefault">
          {isBn ? 'এটি আমার ডিফল্ট ঠিকানা হিসেবে সেট করুন' : 'Set as my default address'}
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          {isBn ? 'বাতিল' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {initialData 
            ? (isBn ? 'আপডেট করুন' : 'Update Address') 
            : (isBn ? 'সেভ করুন' : 'Save Address')
          }
        </Button>
      </div>
    </form>
  );
}
