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
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/features/auth/authApi';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
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

const accountSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
});

export default function SellerProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const isAuthenticated = useAppSelector((s: RootState) => s.auth.isAuthenticated);
  const { data: shop, isLoading } = useGetSellerShopQuery();
  const [updateShop, { isLoading: isUpdating }] = useUpdateSellerShopMutation();
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  const shopForm = useForm<z.infer<typeof shopSchema>>({
    resolver: zodResolver(shopSchema),
    values: {
      nameEn: shop?.nameEn || '',
      nameBn: shop?.nameBn || '',
      description: shop?.description || '',
    },
  });

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
    },
  });

  const onShopSubmit = async (values: z.infer<typeof shopSchema>) => {
    try {
      await updateShop(values).unwrap();
      toast.success(isBn ? 'শপ প্রোফাইল আপডেট হয়েছে' : 'Shop profile updated');
    } catch {
      toast.error(isBn ? 'শপ প্রোফাইল আপডেট করতে ত্রুটি হয়েছে' : 'Failed to update shop profile');
    }
  };

  const onAccountSubmit = async (values: z.infer<typeof accountSchema>) => {
    try {
      await updateProfile(values).unwrap();
      toast.success(isBn ? 'অ্যাকাউন্ট তথ্য আপডেট হয়েছে' : 'Account info updated');
    } catch {
      toast.error(isBn ? 'অ্যাকাউন্ট তথ্য আপডেট করতে ত্রুটি হয়েছে' : 'Failed to update account info');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold">{isBn ? 'প্রোফাইল' : 'Profile'}</h1>

      {/* Account contact info — PATCH /auth/me */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{isBn ? 'অ্যাকাউন্ট তথ্য' : 'Account Info'}</h2>
        <Form {...accountForm}>
          <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
            <FormField
              control={accountForm.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'নামের প্রথম অংশ' : 'First Name'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'নামের শেষ অংশ' : 'Last Name'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={accountForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'মোবাইল নম্বর' : 'Contact Phone'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile
                ? isBn
                  ? 'সংরক্ষণ হচ্ছে...'
                  : 'Saving...'
                : isBn
                  ? 'অ্যাকাউন্ট সংরক্ষণ করুন'
                  : 'Save Account Info'}
            </Button>
            <p className="text-xs text-muted-foreground">
              {isBn
                ? 'এই নম্বরটি কাস্টমাররা আপনার দোকানের যোগাযোগ নম্বর হিসেবে দেখবে।'
                : 'This is the contact number customers see on your storefront shop page.'}
            </p>
          </form>
        </Form>
      </section>

      <hr />

      {/* Shop profile — PATCH /seller-portal/shop */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{isBn ? 'শপ প্রোফাইল' : 'Shop Profile'}</h2>
        <Form {...shopForm}>
          <form onSubmit={shopForm.handleSubmit(onShopSubmit)} className="space-y-4">
            <FormField
              control={shopForm.control}
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
              control={shopForm.control}
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
              control={shopForm.control}
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
              {isUpdating
                ? isBn
                  ? 'সংরক্ষণ হচ্ছে...'
                  : 'Saving...'
                : isBn
                  ? 'শপ সংরক্ষণ করুন'
                  : 'Save Shop Profile'}
            </Button>
          </form>
        </Form>
      </section>
    </div>
  );
}
