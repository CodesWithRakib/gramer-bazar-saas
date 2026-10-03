'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { customToast as toast } from '@/components/ui/custom-toast';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  useCreateAdminManufacturerMutation,
  useUpdateAdminManufacturerMutation,
  Manufacturer,
} from '@/features/catalog/catalogApi';
import { Plus } from 'lucide-react';

const manufacturerSchema = z.object({
  nameEn: z.string().min(2, 'English name is required (min 2 characters)'),
  nameBn: z.string().min(2, 'Bangla name is required (min 2 characters)'),
  country: z.string().optional(),
  website: z.string().url('Must be a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

type ManufacturerFormValues = z.infer<typeof manufacturerSchema>;

export function AddManufacturerDialog({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';
  const [open, setOpen] = useState(false);
  const [createManufacturer, { isLoading }] = useCreateAdminManufacturerMutation();

  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      nameEn: '',
      nameBn: '',
      country: 'Bangladesh',
      website: '',
      isActive: true,
    },
  });

  const onSubmit = async (values: ManufacturerFormValues) => {
    try {
      await createManufacturer({
        nameEn: values.nameEn,
        nameBn: values.nameBn,
        country: values.country || undefined,
        website: values.website || undefined,
        isActive: values.isActive,
      }).unwrap();
      toast.success(isBn ? 'প্রস্তুতকারক সফলভাবে যোগ করা হয়েছে' : 'Manufacturer created successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || (isBn ? 'প্রস্তুতকারক তৈরিতে ব্যর্থ হয়েছে' : 'Failed to create manufacturer'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          <span>{isBn ? 'নতুন প্রস্তুতকারক যোগ করুন' : 'Add Manufacturer'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isBn ? 'নতুন প্রস্তুতকারক' : 'Add New Manufacturer'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'নাম (ইংরেজি)' : 'Name (English)'}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Square Pharmaceuticals Ltd." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameBn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'নাম (বাংলা)' : 'Name (Bangla)'}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="উদা: স্কয়ার ফার্মাসিউটিক্যালস লিমিটেড" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'দেশ' : 'Country'}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Bangladesh" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'ওয়েবসাইট (ঐচ্ছিক)' : 'Website (Optional)'}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://www.example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {isBn ? 'সক্রিয় রাখুন' : 'Is Active'}
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সংরক্ষণ করুন' : 'Save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditManufacturerDialog({
  manufacturer,
  open,
  onOpenChange,
  lang = 'en',
}: {
  manufacturer: Manufacturer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang?: string;
}) {
  const isBn = lang === 'bn';
  const [updateManufacturer, { isLoading }] = useUpdateAdminManufacturerMutation();

  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      nameEn: manufacturer.nameEn,
      nameBn: manufacturer.nameBn,
      country: manufacturer.country || '',
      website: manufacturer.website || '',
      isActive: manufacturer.isActive,
    },
  });

  useEffect(() => {
    form.reset({
      nameEn: manufacturer.nameEn,
      nameBn: manufacturer.nameBn,
      country: manufacturer.country || '',
      website: manufacturer.website || '',
      isActive: manufacturer.isActive,
    });
  }, [manufacturer, form]);

  const onSubmit = async (values: ManufacturerFormValues) => {
    try {
      await updateManufacturer({
        id: manufacturer.id,
        data: {
          nameEn: values.nameEn,
          nameBn: values.nameBn,
          country: values.country || undefined,
          website: values.website || undefined,
          isActive: values.isActive,
        },
      }).unwrap();
      toast.success(isBn ? 'প্রস্তুতকারক আপডেট করা হয়েছে' : 'Manufacturer updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || (isBn ? 'আপডেট করতে ব্যর্থ হয়েছে' : 'Failed to update manufacturer'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isBn ? 'প্রস্তুতকারক সম্পাদনা' : 'Edit Manufacturer'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'নাম (ইংরেজি)' : 'Name (English)'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameBn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'নাম (বাংলা)' : 'Name (Bangla)'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'দেশ' : 'Country'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'ওয়েবসাইট' : 'Website'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">
                    {isBn ? 'সক্রিয় রাখুন' : 'Is Active'}
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isBn ? 'আপডেট হচ্ছে...' : 'Updating...') : (isBn ? 'সংরক্ষণ করুন' : 'Save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
