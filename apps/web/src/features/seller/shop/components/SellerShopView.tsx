'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { customToast as toast } from '@/components/ui/custom-toast';
import {
  Store,
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

import {
  useGetSellerShopQuery,
  useUpdateSellerShopMutation,
  useUploadShopLogoMutation,
  useUploadShopBannerMutation,
} from '@/features/seller';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CustomImage } from '@/components/ui/CustomImage';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatNumber } from '@/lib/format';

const shopFormSchema = z.object({
  nameEn: z.string().min(2, 'Shop name (English) is required').max(150),
  nameBn: z.string().min(2, 'Shop name (Bangla) is required').max(200),
  shortDescription: z.string().max(300).optional(),
  description: z.string().max(3000).optional(),
  phone: z.string().max(20).optional(),
  secondaryPhone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
  website: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
  facebook: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
  instagram: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
  district: z.string().max(100).optional(),
  upazila: z.string().max(100).optional(),
  union: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  openingHours: z.string().max(255).optional(),
  deliveryInfo: z.string().max(255).optional(),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

export interface SellerShopViewProps {
  lang?: string;
}

export function SellerShopView({ lang = 'en' }: SellerShopViewProps) {
  const isBn = lang === 'bn';

  const { data: shop, isLoading, isError, refetch } = useGetSellerShopQuery();
  const [updateShop, { isLoading: isUpdating }] = useUpdateSellerShopMutation();
  const [uploadLogo, { isLoading: isUploadingLogo }] = useUploadShopLogoMutation();
  const [uploadBanner, { isLoading: isUploadingBanner }] = useUploadShopBannerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
  });

  useEffect(() => {
    if (!shop) return;
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
  }, [shop, reset]);

  const uploadShopImage = async (
    files: File[],
    mutation: (body: FormData) => { unwrap: () => Promise<unknown> }
  ) => {
    const formData = new FormData();
    formData.append('file', files[0]);
    await mutation(formData).unwrap();
  };

  const onSubmit = async (data: ShopFormValues) => {
    try {
      await updateShop(data).unwrap();
      toast.success(
        isBn ? 'শপ প্রোফাইল সফলভাবে আপডেট করা হয়েছে' : 'Shop profile updated successfully'
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isBn ? 'শপ প্রোফাইল আপডেট করা যায়নি' : 'Failed to update shop profile'
        )
      );
    }
  };

  if (isLoading) {
    return <LoadingState message={isBn ? 'শপ তথ্য লোড হচ্ছে...' : 'Loading shop profile...'} />;
  }

  if (isError || !shop) {
    return (
      <ErrorState
        title={isBn ? 'শপ তথ্য লোড করা যায়নি' : 'Could not load shop profile'}
        message={
          isBn
            ? 'আপনার দোকানের তথ্য আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            : 'There was a problem loading your shop details. Please try again.'
        }
        onRetry={refetch}
        isBn={isBn}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl space-y-6 pb-16">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'দোকান প্রোফাইল' : 'Shop Profile' },
        ]}
        title={isBn ? 'দোকান প্রোফাইল' : 'Shop Profile'}
        description={
          isBn
            ? 'আপনার দোকানের ব্র্যান্ডিং, যোগাযোগের তথ্য এবং লোকেশন পরিচালনা করুন'
            : 'Manage your storefront branding, public contacts and location'
        }
        badge={
          shop.isVerified ? (
            <Badge variant="secondary" className="gap-1 text-xs">
              <CheckCircle className="h-3 w-3" />
              {isBn ? 'ভেরিফাইড' : 'Verified'}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs">
              {isBn ? 'যাচাই চলছে' : 'Verification pending'}
            </Badge>
          )
        }
        secondaryActions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/${lang}/shops/${shop.id}`} target="_blank">
              <ExternalLink className="h-4 w-4" />
              {isBn ? 'পাবলিক স্টোরফ্রন্ট' : 'View storefront'}
            </Link>
          </Button>
        }
      />

      {/* Shop health summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-muted-foreground text-xs">{isBn ? 'সক্রিয় পণ্য' : 'Products'}</p>
            <p className="text-foreground mt-1 text-2xl font-bold">
              {formatNumber(shop.productCount ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-muted-foreground text-xs">{isBn ? 'মোট অর্ডার' : 'Orders'}</p>
            <p className="text-foreground mt-1 text-2xl font-bold">
              {formatNumber(shop.totalOrders ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-5">
            <p className="text-muted-foreground text-xs">{isBn ? 'শপ স্ট্যাটাস' : 'Shop status'}</p>
            <p className="text-foreground mt-1 text-sm font-semibold">
              {shop.isActive ? (isBn ? 'সক্রিয়' : 'Active') : isBn ? 'নিষ্ক্রিয়' : 'Inactive'}
            </p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="branding" className="text-xs md:text-sm">
              <Store className="me-1.5 hidden h-4 w-4 sm:inline" />
              {isBn ? 'ব্র্যান্ডিং' : 'Branding'}
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs md:text-sm">
              <Phone className="me-1.5 hidden h-4 w-4 sm:inline" />
              {isBn ? 'যোগাযোগ' : 'Contact'}
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs md:text-sm">
              <MapPin className="me-1.5 hidden h-4 w-4 sm:inline" />
              {isBn ? 'লোকেশন' : 'Location'}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BRANDING & IDENTITY */}
          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Logo */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <ImageIcon className="text-primary h-4 w-4" />
                    {isBn ? 'দোকানের লোগো' : 'Shop logo'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn
                      ? 'বর্গাকার ছবি প্রস্তাবিত, আপলোডের আগে ছোট করা হবে'
                      : 'Square image recommended — resized before upload'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-border bg-muted/30 relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border">
                    {shop.logo ? (
                      <CustomImage src={shop.logo} alt="Shop logo" fill className="object-cover" />
                    ) : (
                      <Store className="text-muted-foreground/40 h-10 w-10" />
                    )}
                    {isUploadingLogo && (
                      <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
                        <Loader2 className="text-primary h-6 w-6 animate-spin" />
                      </div>
                    )}
                  </div>
                  <ImageUploader
                    profile="shopLogo"
                    maxFiles={1}
                    minWidth={128}
                    minHeight={128}
                    isBn={isBn}
                    disabled={isUploadingLogo}
                    compact
                    title={shop.logo ? (isBn ? 'লোগো পরিবর্তন' : 'Change logo') : undefined}
                    upload={(files) => uploadShopImage(files, uploadLogo)}
                    onUploaded={() => {
                      toast.success(isBn ? 'লোগো আপডেট হয়েছে' : 'Logo updated');
                    }}
                  />
                </CardContent>
              </Card>

              {/* Cover */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <ImageIcon className="text-primary h-4 w-4" />
                    {isBn ? 'কভার ব্যানার' : 'Cover banner'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn
                      ? 'প্রশস্ত ল্যান্ডস্কেপ ব্যানার (১৬:৯ অনুপাত)'
                      : 'Wide landscape banner (16:9 ratio)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-border bg-muted/30 relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border md:h-36">
                    {shop.banner ? (
                      <CustomImage
                        src={shop.banner}
                        alt="Cover banner"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground/40 flex flex-col items-center gap-1">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs">
                          {isBn ? 'কোন ব্যানার নেই' : 'No banner set'}
                        </span>
                      </div>
                    )}
                    {isUploadingBanner && (
                      <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
                        <Loader2 className="text-primary h-6 w-6 animate-spin" />
                      </div>
                    )}
                  </div>
                  <ImageUploader
                    profile="shopCover"
                    maxFiles={1}
                    minWidth={640}
                    isBn={isBn}
                    disabled={isUploadingBanner}
                    compact
                    title={shop.banner ? (isBn ? 'ব্যানার পরিবর্তন' : 'Change banner') : undefined}
                    upload={(files) => uploadShopImage(files, uploadBanner)}
                    onUploaded={() => {
                      toast.success(isBn ? 'কভার ব্যানার আপডেট হয়েছে' : 'Cover banner updated');
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isBn ? 'দোকানের নাম ও পরিচিতি' : 'Shop name & descriptions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="nameEn">
                      {isBn ? 'দোকানের নাম (English)' : 'Shop name (English)'} *
                    </Label>
                    <Input id="nameEn" {...register('nameEn')} />
                    {errors.nameEn && (
                      <p className="text-destructive text-xs">{errors.nameEn.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nameBn">
                      {isBn ? 'দোকানের নাম (বাংলা)' : 'Shop name (Bangla)'} *
                    </Label>
                    <Input id="nameBn" {...register('nameBn')} />
                    {errors.nameBn && (
                      <p className="text-destructive text-xs">{errors.nameBn.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="shortDescription">
                    {isBn ? 'সংক্ষিপ্ত স্লোগান' : 'Short tagline'}
                  </Label>
                  <Input
                    id="shortDescription"
                    placeholder={
                      isBn
                        ? 'উদা: খাঁটি তাজা শাকসবজি ও গ্রামের তাজা ফলমূল'
                        : 'e.g. Pure fresh organic farm vegetables & fruits'
                    }
                    {...register('shortDescription')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">{isBn ? 'বিস্তারিত বিবরণ' : 'Description'}</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder={
                      isBn
                        ? 'আপনার দোকান ও পণ্য সম্পর্কে বিস্তারিত লিখুন...'
                        : 'Tell customers about your shop, quality and services...'
                    }
                    {...register('description')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: CONTACT */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isBn ? 'যোগাযোগের মাধ্যম' : 'Public contact channels'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'গ্রাহকরা যাতে আপনার সাথে দ্রুত যোগাযোগ করতে পারে'
                    : 'Help customers reach out for inquiries and orders'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="text-primary h-3.5 w-3.5" />
                      {isBn ? 'প্রধান ফোন নম্বর' : 'Primary phone'}
                    </Label>
                    <Input id="phone" placeholder="017XXXXXXXX" {...register('phone')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="secondaryPhone" className="flex items-center gap-1.5">
                      <Phone className="text-muted-foreground h-3.5 w-3.5" />
                      {isBn ? 'বিকল্প ফোন নম্বর' : 'Secondary phone'}
                    </Label>
                    <Input
                      id="secondaryPhone"
                      placeholder="018XXXXXXXX"
                      {...register('secondaryPhone')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp" className="flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      {isBn ? 'হোয়াটসঅ্যাপ নম্বর' : 'WhatsApp number'}
                    </Label>
                    <Input id="whatsapp" placeholder="+8801XXXXXXXXX" {...register('whatsapp')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="text-primary h-3.5 w-3.5" />
                      {isBn ? 'পাবলিক ইমেইল' : 'Public email'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@shop.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-destructive text-xs">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-sm font-semibold">
                    {isBn ? 'অনলাইন ও সোশ্যাল লিংক' : 'Online & social links'}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-blue-500" />
                        {isBn ? 'ওয়েবসাইট' : 'Website'}
                      </Label>
                      <Input id="website" placeholder="https://..." {...register('website')} />
                      {errors.website && (
                        <p className="text-destructive text-xs">{errors.website.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        placeholder="https://facebook.com/..."
                        {...register('facebook')}
                      />
                      {errors.facebook && (
                        <p className="text-destructive text-xs">{errors.facebook.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/..."
                        {...register('instagram')}
                      />
                      {errors.instagram && (
                        <p className="text-destructive text-xs">{errors.instagram.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: LOCATION */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isBn ? 'ঠিকানা ও এলাকা' : 'Store address & location'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isBn
                    ? 'আপনার স্থানীয় অবস্থান নির্দেশ করুন'
                    : 'Local geographical coordinates and address'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="district">{isBn ? 'জেলা' : 'District'}</Label>
                    <Input
                      id="district"
                      placeholder={isBn ? 'উদা: নরসিংদী' : 'e.g. Narsingdi'}
                      {...register('district')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="upazila">{isBn ? 'উপজেলা' : 'Upazila'}</Label>
                    <Input
                      id="upazila"
                      placeholder={isBn ? 'উদা: রায়পুরা' : 'e.g. Raipura'}
                      {...register('upazila')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="union">{isBn ? 'ইউনিয়ন' : 'Union'}</Label>
                    <Input
                      id="union"
                      placeholder={isBn ? 'উদা: আমিরগঞ্জ' : 'e.g. Amirganj'}
                      {...register('union')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="village">{isBn ? 'গ্রাম' : 'Village'}</Label>
                    <Input
                      id="village"
                      placeholder={isBn ? 'উদা: করিমগঞ্জ' : 'e.g. Karimganj'}
                      {...register('village')}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">
                    {isBn ? 'বিস্তারিত রাস্তার ঠিকানা' : 'Detailed street address'}
                  </Label>
                  <Input
                    id="address"
                    placeholder={
                      isBn ? 'দোকান নং, বাজার বা রাস্তার নাম' : 'Shop No, Market or Road Name'
                    }
                    {...register('address')}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="openingHours" className="flex items-center gap-1.5">
                      <Clock className="text-primary h-3.5 w-3.5" />
                      {isBn ? 'দোকান খোলা থাকার সময়' : 'Opening hours'}
                    </Label>
                    <Input
                      id="openingHours"
                      placeholder={
                        isBn ? 'সকাল ৯:০০ - রাত ৯:০০ (প্রতিদিন)' : '9:00 AM - 9:00 PM (Daily)'
                      }
                      {...register('openingHours')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="deliveryInfo" className="flex items-center gap-1.5">
                      <Truck className="text-primary h-3.5 w-3.5" />
                      {isBn ? 'ডেলিভারি তথ্য' : 'Delivery information'}
                    </Label>
                    <Input
                      id="deliveryInfo"
                      placeholder={
                        isBn
                          ? 'ইউনিয়নের মধ্যে ১ ঘণ্টার মধ্যে পৌঁছে দেওয়া হয়'
                          : 'Delivered within 1 hour locally'
                      }
                      {...register('deliveryInfo')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-background/90 sticky bottom-4 z-20 flex items-center justify-end gap-3 rounded-xl border p-4 shadow-sm">
          <Button type="submit" disabled={isUpdating || !isDirty} className="gap-2 px-6">
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isUpdating
              ? isBn
                ? 'সংরক্ষণ হচ্ছে...'
                : 'Saving...'
              : isBn
                ? 'পরিবর্তন সংরক্ষণ করুন'
                : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
