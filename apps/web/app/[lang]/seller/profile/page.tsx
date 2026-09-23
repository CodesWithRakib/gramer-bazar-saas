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
  nameEn: z.string().min(2, 'Shop name is required').max(150),
  nameBn: z.string().min(2, 'Shop name (Bangla) is required').max(200),
  description: z.string().max(2000).optional(),
});

export default function SellerProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data: shop, isLoading } = useGetSellerShopQuery();
  const [updateShop, { isLoading: isUpdating }] = useUpdateSellerShopMutation();

  const form = useForm<z.infer<typeof shopSchema>>({
    resolver: zodResolver(shopSchema),
    values: {
      nameEn: shop?.nameEn || '',
      nameBn: shop?.nameBn || '',
      description: shop?.description || '',
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
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'দোকানের নাম (ইংরেজি)' : 'Shop Name (English)'}</FormLabel>
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
                <FormLabel>{isBn ? 'দোকানের নাম (বাংলা)' : 'Shop Name (Bangla)'}</FormLabel>
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
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : (isBn ? 'সংরক্ষণ করুন' : 'Save Changes')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
