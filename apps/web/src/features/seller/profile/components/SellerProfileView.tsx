'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetSellerShopQuery,
  useUpdateSellerShopMutation,
  useUploadSellerAvatarMutation,
} from '@/features/seller';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/features/auth/authApi';
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
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { CustomImage } from '@/components/ui/CustomImage';
import { customToast as toast } from '@/components/ui/custom-toast';

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

export interface SellerProfileViewProps {
  lang?: string;
}

export function SellerProfileView({ lang = 'en' }: SellerProfileViewProps) {
  const isBn = lang === 'bn';
  const isAuthenticated = useAppSelector((s: RootState) => s.auth.isAuthenticated);
  const { data: shop, isLoading } = useGetSellerShopQuery();
  const [updateShop, { isLoading: isUpdating }] = useUpdateSellerShopMutation();
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar] = useUploadSellerAvatarMutation();

  const handleAvatarUpload = async (files: File[]) => {
    if (!files[0]) return;
    const body = new FormData();
    body.append('file', files[0]);
    try {
      await uploadAvatar(body).unwrap();
      toast.success(isBn ? 'প্রোফাইল ছবি আপডেট হয়েছে' : 'Profile avatar updated');
    } catch {
      toast.error(isBn ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Failed to upload avatar');
      throw new Error('Avatar upload failed');
    }
  };

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
      toast.error(
        isBn ? 'অ্যাকাউন্ট তথ্য আপডেট করতে ত্রুটি হয়েছে' : 'Failed to update account info'
      );
    }
  };

  if (isLoading)
    return <LoadingState message={isBn ? 'প্রোফাইল লোড হচ্ছে...' : 'Loading profile...'} />;

  return (
    <div className="w-full max-w-3xl space-y-6 pb-16">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'প্রোফাইল' : 'Profile' },
        ]}
        title={isBn ? 'সেলার প্রোফাইল' : 'Seller profile'}
        description={
          isBn
            ? 'ব্যক্তিগত যোগাযোগ এবং দোকানের তথ্য আপডেট করুন'
            : 'Update your personal contact details and shop information'
        }
      />

      {/* Profile avatar section */}
      <section className="border-border space-y-4 rounded-lg border p-4 sm:p-6">
        <div>
          <h2 className="text-lg font-semibold">{isBn ? 'প্রোফাইল ছবি' : 'Profile Picture'}</h2>
          <p className="text-muted-foreground text-xs">
            {isBn
              ? 'আপনার অ্যাকাউন্টের ছবি আপলোড করুন। ফাইলটি স্বয়ংক্রিয়ভাবে অপটিমাইজ করা হবে।'
              : 'Upload your personal account avatar. Image will be automatically compressed for optimal loading.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            <CustomImage
              src={profile?.avatar}
              alt={profile?.firstName || 'Seller avatar'}
              fill
              className="object-cover"
              fallbackSrc="/placeholder-avatar.png"
            />
          </div>

          <div className="w-full max-w-sm">
            <ImageUploader
              profile="avatar"
              isBn={isBn}
              maxFiles={1}
              upload={handleAvatarUpload}
              description={
                isBn ? 'সর্বোচ্চ ৫ মেগাবাইট (JPEG, PNG, WebP)' : 'Max 5MB (JPEG, PNG, WebP)'
              }
            />
          </div>
        </div>
      </section>

      {/* Account contact info — PATCH /auth/me */}
      <section className="border-border space-y-4 rounded-lg border p-4 sm:p-6">
        <h2 className="text-lg font-semibold">{isBn ? 'অ্যাকাউন্ট তথ্য' : 'Account info'}</h2>
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

      <hr className="border-border" />

      {/* Shop profile — PATCH /seller-portal/shop */}
      <section className="border-border space-y-4 rounded-lg border p-4 sm:p-6">
        <h2 className="text-lg font-semibold">{isBn ? 'শপ প্রোফাইল' : 'Shop profile'}</h2>
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
