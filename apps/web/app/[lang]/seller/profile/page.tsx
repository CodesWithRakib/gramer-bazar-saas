'use client';
import { use } from 'react';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetSellerShopQuery,
  useUpdateSellerShopMutation,
} from '@/features/seller-portal/sellerPortalApi';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const shopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export default function SellerProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: shop, isLoading } = useGetSellerShopQuery();
  const [updateShop, { isLoading: isUpdating }] = useUpdateSellerShopMutation();

  const form = useForm<z.infer<typeof shopSchema>>({
    resolver: zodResolver(shopSchema),
    values: {
      name: shop?.name || '',
      description: shop?.description || '',
      address: shop?.address || '',
      phone: shop?.phone || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof shopSchema>) => {
    try {
      await updateShop(values).unwrap();
      toast.success(isBn ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated');
    } catch {
      toast.error(isBn ? 'প্রোফাইল আপডেট করতে ত্রুটি হয়েছে' : 'Failed to update profile');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{isBn ? 'শপ প্রোফাইল' : 'Shop Profile'}</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'দোকানের নাম' : 'Shop Name'}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'বিবরণ' : 'Description'}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'ঠিকানা' : 'Address'}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'ফোন নম্বর' : 'Phone'}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : (isBn ? 'সংরক্ষণ করুন' : 'Save Changes')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
