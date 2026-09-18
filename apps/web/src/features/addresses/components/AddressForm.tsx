'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LocationSelector } from './LocationSelector';
import { useCreateAddressMutation, useUpdateAddressMutation, Address } from '../addressApi';
import { toast } from 'sonner';
import { useEffect } from 'react';

const addressSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  contactName: z.string().min(1, 'Contact Name is required').max(150),
  contactPhone: z.string().min(1, 'Contact Phone is required').max(20),
  countryId: z.string().optional(),
  divisionId: z.string().optional(),
  districtId: z.string().optional(),
  upazilaId: z.string().optional(),
  unionId: z.string().optional(),
  areaId: z.string().optional(),
  streetAddress: z.string().min(1, 'Street address is required'),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: Address | null;
  onSuccess?: () => void;
}

export function AddressForm({ initialData, onSuccess }: AddressFormProps) {
  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: initialData?.title || '',
      contactName: initialData?.contactName || '',
      contactPhone: initialData?.contactPhone || '',
      countryId: initialData?.countryId || '',
      divisionId: initialData?.divisionId || '',
      districtId: initialData?.districtId || '',
      upazilaId: initialData?.upazilaId || '',
      unionId: initialData?.unionId || '',
      areaId: initialData?.areaId || '',
      streetAddress: initialData?.streetAddress || '',
      isDefault: initialData?.isDefault || false,
    },
  });

  // Reset dependent fields when parent changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'divisionId') {
        form.setValue('districtId', '');
        form.setValue('upazilaId', '');
        form.setValue('unionId', '');
        form.setValue('areaId', '');
      } else if (name === 'districtId') {
        form.setValue('upazilaId', '');
        form.setValue('unionId', '');
        form.setValue('areaId', '');
      } else if (name === 'upazilaId') {
        form.setValue('unionId', '');
        form.setValue('areaId', '');
      } else if (name === 'unionId') {
        form.setValue('areaId', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(data: AddressFormValues) {
    try {
      if (initialData) {
        await updateAddress({ id: initialData.id, body: data }).unwrap();
        toast.success('Address updated successfully');
      } else {
        await createAddress(data).unwrap();
        toast.success('Address created successfully');
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save address');
      console.error(error);
    }
  }

  const isLoading = isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Home, Office" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+8801..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg border p-4 bg-muted/30">
          <h4 className="mb-4 text-sm font-medium">Location Details</h4>
          <LocationSelector form={form} />
        </div>

        <FormField
          control={form.control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="House/Road No, Landmark" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Checkbox for default is simple, skipped here for brevity unless needed */}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
