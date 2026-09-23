'use client';

import React, { use, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useGetSellerShopQuery, 
  useUpdateSellerShopMutation 
} from '@/features/seller-portal/sellerPortalApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Fix: actually import react-hook-form
import { useForm as useReactHookForm } from 'react-hook-form';

const shopSchema = z.object({
  nameEn: z.string().min(2, 'Shop name is required').max(150),
  nameBn: z.string().min(2, 'Shop name (Bangla) is required').max(200),
  description: z.string().max(2000).optional(),
});

type ShopFormValues = z.infer<typeof shopSchema>;

export default function SellerShopPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: shop, isLoading } = useGetSellerShopQuery();
  const [updateShop, { isLoading: isUpdating, isSuccess, isError }] = useUpdateSellerShopMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useReactHookForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
  });

  useEffect(() => {
    if (shop) {
      reset({
        nameEn: shop.nameEn || '',
        nameBn: shop.nameBn || '',
        description: shop.description || '',
      });
    }
  }, [shop, reset]);

  const onSubmit = async (data: ShopFormValues) => {
    try {
      await updateShop(data).unwrap();
    } catch (error) {
      console.error('Failed to update shop', error);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'শপ সেটিংস' : 'Shop Settings'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isBn ? 'আপনার দোকানের বিস্তারিত তথ্য পরিচালনা করুন' : 'Manage your storefront details.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'সাধারণ তথ্য' : 'General Information'}</CardTitle>
          <CardDescription>
            {isBn ? 'গ্রাহকরা এই তথ্য দেখতে পাবেন' : 'Customers will see this information on your store profile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nameEn">{isBn ? 'দোকানের নাম (ইংরেজি)' : 'Shop Name (English)'}</Label>
              <Input id="nameEn" {...register('nameEn')} />
              {errors.nameEn && <p className="text-sm text-destructive">{errors.nameEn.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameBn">{isBn ? 'দোকানের নাম (বাংলা)' : 'Shop Name (Bangla)'}</Label>
              <Input id="nameBn" {...register('nameBn')} />
              {errors.nameBn && <p className="text-sm text-destructive">{errors.nameBn.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{isBn ? 'বিবরণ' : 'Description'}</Label>
              <Textarea 
                id="description" 
                {...register('description')} 
                rows={4} 
                placeholder={isBn ? 'আপনার দোকান সম্পর্কে কিছু লিখুন...' : 'Write something about your shop...'} 
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message as string}</p>}
            </div>

            {isSuccess && (
              <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium">
                {isBn ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!'}
              </div>
            )}

            {isError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">
                {isBn ? 'সেটিংস সংরক্ষণে ত্রুটি হয়েছে!' : 'Failed to save settings!'}
              </div>
            )}

            <Button type="submit" disabled={isUpdating || !isDirty}>
              {isUpdating 
                ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') 
                : (isBn ? 'সংরক্ষণ করুন' : 'Save Changes')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
