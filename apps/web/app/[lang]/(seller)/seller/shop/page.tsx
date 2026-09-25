'use client';

import React, { use, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import {
  useGetSellerShopQuery,
  useUpdateSellerShopMutation,
  useUploadShopLogoMutation,
  useUploadShopBannerMutation,
} from '@/features/seller-portal/sellerPortalApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Upload,
  ExternalLink,
  CheckCircle,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  Clock,
  Truck,
  Image as ImageIcon,
  Save,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

const shopFormSchema = z.object({
  nameEn: z.string().min(2, 'Shop name (English) is required').max(150),
  nameBn: z.string().min(2, 'Shop name (Bangla) is required').max(200),
  shortDescription: z.string().max(300).optional().nullable(),
  description: z.string().max(3000).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  secondaryPhone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  facebook: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  instagram: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  district: z.string().max(100).optional().nullable(),
  upazila: z.string().max(100).optional().nullable(),
  union: z.string().max(100).optional().nullable(),
  village: z.string().max(100).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  openingHours: z.string().max(255).optional().nullable(),
  deliveryInfo: z.string().max(255).optional().nullable(),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

export default function SellerShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: shop, isLoading } = useGetSellerShopQuery();
  const [updateShop, { isLoading: isUpdating }] = useUpdateSellerShopMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadShopLogoMutation();
  const [uploadBanner, { isLoading: isUploadingBanner }] = useUploadShopBannerMutation();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
  });

  useEffect(() => {
    if (shop) {
      reset({
        nameEn: shop.nameEn || '',
        nameBn: shop.nameBn || '',
        shortDescription: shop.shortDescription || '',
        description: shop.description || '',
        phone: shop.phone || '',
        secondaryPhone: shop.secondaryPhone || '',
        whatsapp: shop.whatsapp || '',
        email: shop.email || '',
        website: shop.website || '',
        facebook: shop.facebook || '',
        instagram: shop.instagram || '',
        district: shop.district || '',
        upazila: shop.upazila || '',
        union: shop.union || '',
        village: shop.village || '',
        address: shop.address || '',
        openingHours: shop.openingHours || '',
        deliveryInfo: shop.deliveryInfo || '',
      });
      setLogoPreview(shop.logo);
      setBannerPreview(shop.banner);
    }
  }, [shop, reset]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(isBn ? 'শুধুমাত্র JPG, PNG বা WEBP ফাইল গ্রহণযোগ্য' : 'Only JPG, PNG or WEBP allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? 'ফাইলের আকার ৫MB এর কম হতে হবে' : 'File size must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadLogo(formData).unwrap();
      setLogoPreview(res.logoUrl);
      toast.success(isBn ? 'লোগো সফলভাবে আপলোড হয়েছে' : 'Logo uploaded successfully');
    } catch {
      toast.error(isBn ? 'লোগো আপলোড ব্যর্থ হয়েছে' : 'Failed to upload logo');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(isBn ? 'শুধুমাত্র JPG, PNG বা WEBP ফাইল গ্রহণযোগ্য' : 'Only JPG, PNG or WEBP allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? 'ফাইলের আকার ৫MB এর কম হতে হবে' : 'File size must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadBanner(formData).unwrap();
      setBannerPreview(res.bannerUrl);
      toast.success(isBn ? 'ব্যানার সফলভাবে আপলোড হয়েছে' : 'Cover banner uploaded successfully');
    } catch {
      toast.error(isBn ? 'ব্যানার আপলোড ব্যর্থ হয়েছে' : 'Failed to upload cover banner');
    }
  };

  const onSubmit = async (data: ShopFormValues) => {
    try {
      await updateShop(data).unwrap();
      toast.success(isBn ? 'শপ প্রোফাইল সফলভাবে আপডেট করা হয়েছে' : 'Shop profile updated successfully');
    } catch {
      toast.error(isBn ? 'শপ প্রোফাইল আপডেট করতে সমস্যা হয়েছে' : 'Failed to update shop profile');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{isBn ? 'শপ তথ্য লোড হচ্ছে...' : 'Loading shop profile...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isBn ? 'দোকান প্রোফাইল ও সেটিংস' : 'Shop Profile & Settings'}
            </h1>
            {shop?.isVerified && (
              <Badge variant="secondary" className="bg-blue-600 text-white gap-1 py-0.5 text-xs">
                <CheckCircle className="w-3 h-3" />
                {isBn ? 'ভেরিফাইড' : 'Verified'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn
              ? 'আপনার দোকানের ব্র্যান্ডিং, যোগাযোগের তথ্য এবং লোকেশন সাজান'
              : 'Customize your storefront branding, public contacts, and location'}
          </p>
        </div>

        {shop && (
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link href={`/${lang}/shops/${shop.id}`} target="_blank">
              <ExternalLink className="w-4 h-4" />
              {isBn ? 'পাবলিক স্টোরফ্রন্ট দেখুন' : 'View Public Storefront'}
            </Link>
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="branding" className="text-xs md:text-sm">
              <Store className="w-4 h-4 mr-1.5 hidden sm:inline" />
              {isBn ? 'ব্র্যান্ডিং' : 'Branding'}
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs md:text-sm">
              <Phone className="w-4 h-4 mr-1.5 hidden sm:inline" />
              {isBn ? 'যোগাযোগ' : 'Contact'}
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs md:text-sm">
              <MapPin className="w-4 h-4 mr-1.5 hidden sm:inline" />
              {isBn ? 'লোকেশন' : 'Location'}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BRANDING & IDENTITY */}
          <TabsContent value="branding" className="space-y-6">
            {/* Visual Media Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Upload Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {isBn ? 'দোকানের লোগো' : 'Shop Logo'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn ? 'বর্গাকার ছবি (সর্বোচ্চ ৫MB)' : 'Square image recommended (Max 5MB)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative bg-muted/30">
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Shop Logo" fill className="object-cover" />
                    ) : (
                      <Store className="w-10 h-10 text-muted-foreground/40" />
                    )}
                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingLogo}
                      asChild
                    >
                      <span>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {logoPreview
                          ? isBn
                            ? 'লোগো পরিবর্তন'
                            : 'Change Logo'
                          : isBn
                          ? 'লোগো আপলোড'
                          : 'Upload Logo'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </CardContent>
              </Card>

              {/* Banner Cover Upload Card */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    {isBn ? 'কভার ব্যানার' : 'Cover Banner'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn ? 'প্রশস্ত ল্যান্ডস্কেপ ব্যানার (১৬:৯ অনুপাত)' : 'Wide landscape banner (16:9 ratio, max 5MB)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                  <div className="w-full h-32 md:h-36 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative bg-muted/30">
                    {bannerPreview ? (
                      <Image src={bannerPreview} alt="Cover Banner" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground/40 gap-1">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">{isBn ? 'কোন ব্যানার নেই' : 'No banner set'}</span>
                      </div>
                    )}
                    {isUploadingBanner && (
                      <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingBanner}
                      asChild
                    >
                      <span>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {bannerPreview
                          ? isBn
                            ? 'ব্যানার পরিবর্তন'
                            : 'Change Banner'
                          : isBn
                            ? 'ব্যানার আপলোড'
                            : 'Upload Banner'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleBannerUpload}
                    />
                  </label>
                </CardContent>
              </Card>
            </div>

            {/* Names and Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isBn ? 'দোকানের নাম ও পরিচিতি' : 'Shop Name & Descriptions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nameEn">{isBn ? 'দোকানের নাম (English)' : 'Shop Name (English)'} *</Label>
                    <Input id="nameEn" {...register('nameEn')} />
                    {errors.nameEn && <p className="text-xs text-destructive">{errors.nameEn.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nameBn">{isBn ? 'দোকানের নাম (বাংলা)' : 'Shop Name (Bangla)'} *</Label>
                    <Input id="nameBn" {...register('nameBn')} />
                    {errors.nameBn && <p className="text-xs text-destructive">{errors.nameBn.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="shortDescription">
                    {isBn ? 'সংক্ষিপ্ত স্লোগান / বিশেষত্ব' : 'Short Tagline / Specialization'}
                  </Label>
                  <Input
                    id="shortDescription"
                    placeholder={isBn ? 'উদা: খাঁটি তাজা শাকসবজি ও গ্রামের তাজা ফলমূল' : 'e.g. Pure fresh organic farm vegetables & fruits'}
                    {...register('shortDescription')}
                  />
                  {errors.shortDescription && <p className="text-xs text-destructive">{errors.shortDescription.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">
                    {isBn ? 'বিস্তারিত বিবরণ ও শপের গল্প' : 'Detailed Shop Description / About'}
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder={isBn ? 'আপনার দোকান ও পণ্য সম্পর্কে বিস্তারিত লিখুন...' : 'Tell customers about your shop history, quality promise, and services...'}
                    {...register('description')}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: CONTACT & SOCIAL */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isBn ? 'যোগাযোগের মাধ্যম' : 'Public Contact Channels'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'গ্রাহকরা যাতে আপনার সাথে দ্রুত যোগাযোগ করতে পারে'
                    : 'Help customers reach out for inquiries and orders'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {isBn ? 'প্রধান ফোন নম্বর' : 'Primary Phone'}
                    </Label>
                    <Input id="phone" placeholder="017XXXXXXXX" {...register('phone')} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="secondaryPhone" className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {isBn ? 'বিকল্প ফোন নম্বর' : 'Secondary Phone'}
                    </Label>
                    <Input id="secondaryPhone" placeholder="018XXXXXXXX" {...register('secondaryPhone')} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp" className="flex items-center gap-1.5 text-emerald-600">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {isBn ? 'হোয়াটসঅ্যাপ নম্বর' : 'WhatsApp Number'}
                    </Label>
                    <Input id="whatsapp" placeholder="+8801XXXXXXXXX" {...register('whatsapp')} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      {isBn ? 'পাবলিক ইমেইল' : 'Public Email'}
                    </Label>
                    <Input id="email" type="email" placeholder="contact@shop.com" {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h3 className="text-sm font-semibold">
                    {isBn ? 'অনলাইন ও সোশ্যাল লিংক' : 'Online & Social Links'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        {isBn ? 'ওয়েবসাইট লিংক' : 'Website'}
                      </Label>
                      <Input id="website" placeholder="https://..." {...register('website')} />
                      {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input id="facebook" placeholder="https://facebook.com/..." {...register('facebook')} />
                      {errors.facebook && <p className="text-xs text-destructive">{errors.facebook.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input id="instagram" placeholder="https://instagram.com/..." {...register('instagram')} />
                      {errors.instagram && <p className="text-xs text-destructive">{errors.instagram.message}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: LOCATION & OPERATIONS */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isBn ? 'ঠিকানা ও এলাকা' : 'Store Address & Location'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn ? 'আপনার স্থানীয় অবস্থান নির্দেশ করুন' : 'Local geographical coordinates and address'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="district">{isBn ? 'জেলা' : 'District'}</Label>
                    <Input id="district" placeholder={isBn ? 'উদা: নরসিংদী' : 'e.g. Narsingdi'} {...register('district')} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="upazila">{isBn ? 'উপজেলা' : 'Upazila'}</Label>
                    <Input id="upazila" placeholder={isBn ? 'উদা: রায়পুরা' : 'e.g. Raipura'} {...register('upazila')} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="union">{isBn ? 'ইউনিয়ন' : 'Union'}</Label>
                    <Input id="union" placeholder={isBn ? 'উদা: আমিরগঞ্জ' : 'e.g. Amirganj'} {...register('union')} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="village">{isBn ? 'গ্রাম' : 'Village'}</Label>
                    <Input id="village" placeholder={isBn ? 'উদা: করিমগঞ্জ' : 'e.g. Karimganj'} {...register('village')} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">{isBn ? 'বিস্তারিত রাস্তার ঠিকানা' : 'Detailed Street Address'}</Label>
                  <Input id="address" placeholder={isBn ? 'দোকান নং, বাজার বা রাস্তার নাম' : 'Shop No, Market or Road Name'} {...register('address')} />
                </div>

                <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="openingHours" className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {isBn ? 'দোকান খোলা থাকার সময়' : 'Business / Opening Hours'}
                    </Label>
                    <Input
                      id="openingHours"
                      placeholder={isBn ? 'সকাল ৯:০০ - রাত ৯:০০ (প্রতিদিন)' : '9:00 AM - 9:00 PM (Daily)'}
                      {...register('openingHours')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deliveryInfo" className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      {isBn ? 'ডেলিভারি তথ্য' : 'Delivery Information'}
                    </Label>
                    <Input
                      id="deliveryInfo"
                      placeholder={isBn ? 'ইউনিয়নের মধ্যে ১ ঘণ্টার মধ্যে পৌঁছে দেওয়া হয়' : 'Delivered within 1 hour locally'}
                      {...register('deliveryInfo')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t sticky bottom-4 bg-background/90 backdrop-blur-md p-4 rounded-xl border shadow-lg z-20">
          <Button
            type="submit"
            disabled={isUpdating || !isDirty}
            className="gap-2 px-6"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isUpdating
              ? isBn
                ? 'সংরক্ষণ হচ্ছে...'
                : 'Saving...'
              : isBn
              ? 'পরিবর্তন সংরক্ষণ করুন'
              : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
