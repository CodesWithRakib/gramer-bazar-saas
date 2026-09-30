'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Info, Loader2, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCurrency } from '@/lib/format';
import {
  useCreateSellerProductMutation,
  useGetSellerBrandsQuery,
  useGetSellerCategoriesQuery,
  useGetSellerProductQuery,
  useUpdateSellerProductMutation,
} from '@/features/seller';
import { SellerProductImageManager } from './SellerProductImageManager';

const NO_BRAND = '__none__';
const NO_SUBCATEGORY = '__none__';

const productSchema = z
  .object({
    nameEn: z.string().trim().min(3, 'English name must be at least 3 characters').max(255),
    nameBn: z.string().trim().min(2, 'Bangla name is required').max(255),
    categoryId: z.string().min(1, 'Please choose a category'),
    subCategoryId: z.string().optional(),
    brandId: z.string().optional(),
    shortDescriptionEn: z.string().max(500).optional(),
    shortDescriptionBn: z.string().max(500).optional(),
    descriptionEn: z.string().max(5000).optional(),
    descriptionBn: z.string().max(5000).optional(),
    sku: z.string().max(100).optional(),
    unit: z.string().max(50).optional(),
    price: z.coerce.number().positive('Price must be greater than zero').max(10_000_000),
    discountPrice: z.union([z.coerce.number().min(0).max(10_000_000), z.literal('')]).optional(),
    quantity: z.coerce.number().int().min(0, 'Stock cannot be negative').max(1_000_000),
    lowStockThreshold: z.coerce.number().int().min(0).max(100_000).optional(),
    isActive: z.boolean(),
  })
  .refine(
    (values) =>
      values.discountPrice === '' ||
      values.discountPrice === undefined ||
      Number(values.discountPrice) < values.price,
    {
      message: 'Discount price must be lower than the regular price',
      path: ['discountPrice'],
    }
  );

type ProductFormValues = z.infer<typeof productSchema>;

export interface SellerProductFormProps {
  lang: string;
  /** When present the form edits the listing; otherwise it creates a new one. */
  listingId?: string;
}

export function SellerProductForm({ lang, listingId }: SellerProductFormProps) {
  const isBn = lang === 'bn';
  const router = useRouter();
  const isEdit = !!listingId;

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetSellerCategoriesQuery();
  const { data: brands = [] } = useGetSellerBrandsQuery();
  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    refetch: refetchProduct,
  } = useGetSellerProductQuery(listingId ?? '', { skip: !listingId });

  const [createProduct, { isLoading: isCreating }] = useCreateSellerProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateSellerProductMutation();

  const catalogLocked = isEdit && product && !product.isOwned;

  const defaults: ProductFormValues = useMemo(
    () => ({
      nameEn: product?.nameEn ?? '',
      nameBn: product?.nameBn ?? '',
      categoryId: product?.categoryId ?? '',
      subCategoryId: product?.subCategoryId ?? '',
      brandId: product?.brandId ?? '',
      shortDescriptionEn: product?.shortDescriptionEn ?? '',
      shortDescriptionBn: product?.shortDescriptionBn ?? '',
      descriptionEn: product?.descriptionEn ?? '',
      descriptionBn: product?.descriptionBn ?? '',
      sku: product?.sku ?? '',
      unit: product?.unit ?? '',
      price: product?.price ?? 0,
      discountPrice: product?.discountPrice ?? '',
      quantity: product?.quantity ?? 0,
      lowStockThreshold: product?.lowStockThreshold ?? 5,
      isActive: product?.isActive ?? true,
    }),
    [product]
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    values: defaults,
  });

  const selectedCategoryId = form.watch('categoryId');
  const watchedPrice = Number(form.watch('price')) || 0;
  const watchedDiscount = Number(form.watch('discountPrice')) || 0;

  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories]
  );
  const subCategories = useMemo(
    () => categories.filter((category) => category.parentId === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      nameEn: values.nameEn.trim(),
      nameBn: values.nameBn.trim(),
      categoryId: values.categoryId,
      subCategoryId: values.subCategoryId || undefined,
      brandId: values.brandId || undefined,
      shortDescriptionEn: values.shortDescriptionEn?.trim() || undefined,
      shortDescriptionBn: values.shortDescriptionBn?.trim() || undefined,
      descriptionEn: values.descriptionEn?.trim() || undefined,
      descriptionBn: values.descriptionBn?.trim() || undefined,
      sku: values.sku?.trim() || undefined,
      unit: values.unit?.trim() || undefined,
      price: Number(values.price),
      discountPrice:
        values.discountPrice === '' || values.discountPrice === undefined
          ? undefined
          : Number(values.discountPrice),
      quantity: Number(values.quantity),
      lowStockThreshold: values.lowStockThreshold,
      isActive: values.isActive,
    };

    try {
      if (isEdit && listingId) {
        // Catalog fields are owner-only; send listing fields for shared products.
        const listingPayload = catalogLocked
          ? {
              price: payload.price,
              discountPrice: payload.discountPrice ?? null,
              quantity: payload.quantity,
              lowStockThreshold: payload.lowStockThreshold,
              isActive: payload.isActive,
              sellerSku: payload.sku ?? null,
            }
          : {
              ...payload,
              subCategoryId: payload.subCategoryId ?? null,
              brandId: payload.brandId ?? null,
            };

        await updateProduct({ id: listingId, data: listingPayload }).unwrap();
        toast.success(isBn ? 'প্রোডাক্ট আপডেট হয়েছে' : 'Product updated');
      } else {
        const created = await createProduct(payload).unwrap();
        toast.success(isBn ? 'প্রোডাক্ট তৈরি হয়েছে' : 'Product created');
        router.push(`/${lang}/seller/products/${created.id}`);
        return;
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, isBn ? 'সংরক্ষণ ব্যর্থ হয়েছে' : 'Could not save the product')
      );
    }
  };

  if (isEdit && isProductLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isEdit && (isProductError || !product)) {
    return (
      <ErrorState
        isBn={isBn}
        title={isBn ? 'প্রোডাক্ট পাওয়া যায়নি' : 'Product not found'}
        message={
          isBn
            ? 'এই প্রোডাক্টটি আপনার দোকানের নয় অথবা মুছে ফেলা হয়েছে।'
            : 'This product does not belong to your shop or no longer exists.'
        }
        onRetry={() => refetchProduct()}
        secondaryAction={{ label: isBn ? 'প্রোডাক্ট তালিকায় ফিরুন' : 'Back to products', href: `/${lang}/seller/products` }}
      />
    );
  }

  const isSaving = isCreating || isUpdating;
  const effectivePrice = watchedDiscount > 0 && watchedDiscount < watchedPrice ? watchedDiscount : watchedPrice;

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'পণ্য' : 'Products', href: `/${lang}/seller/products` },
          { label: isEdit ? isBn ? 'সম্পাদনা' : 'Edit' : isBn ? 'নতুন' : 'New' },
        ]}
        title={
          isEdit
            ? isBn
              ? 'প্রোডাক্ট সম্পাদনা'
              : 'Edit product'
            : isBn
              ? 'নতুন প্রোডাক্ট যোগ করুন'
              : 'Add a new product'
        }
        description={
          isEdit
            ? product?.nameEn
            : isBn
              ? 'প্রোডাক্টের তথ্য কয়েকটি ধাপে পূরণ করুন — তারপর ছবি যোগ করুন।'
              : 'Fill in the product details step by step, then add your images.'
        }
        secondaryActions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/${lang}/seller/products`}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {isBn ? 'ফিরে যান' : 'Back'}
            </Link>
          </Button>
        }
      />

      {isCategoriesError && (
        <ErrorState
          isBn={isBn}
          title={isBn ? 'ক্যাটাগরি লোড করা যায়নি' : 'Could not load categories'}
          message={
            isBn
              ? 'প্রোডাক্ট তৈরি করতে ক্যাটাগরি তালিকা প্রয়োজন।'
              : 'The category list is required to create a product.'
          }
          onRetry={() => refetchCategories()}
        />
      )}

      {catalogLocked && (
        <div className="border-info/30 bg-info/5 flex items-start gap-2.5 rounded-xl border p-3 text-xs">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-muted-foreground">
            {isBn
              ? 'এই প্রোডাক্টটি প্ল্যাটফর্ম ক্যাটালগের। তাই নাম, বিভরণ, ক্যাটাগরি ও ব্র্যান্ড পরিবর্তন করা যাবে না — তবে মূল্য, স্টক ও অবস্থা সম্পূর্ণ নিয়ন্ত্রণ করতে পারবেন।'
              : 'This product is part of the platform catalog, so its name, description, category and brand are managed centrally. You remain in full control of price, stock and availability.'}
          </p>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ---------------------------------------------------- basic info */}
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              {isBn ? 'মৌলিক তথ্য' : 'Basic information'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'গ্রাহক যে নাম ও শ্রেণিতে প্রোডাক্টটি খুঁজে পাবেন'
                : 'How customers will find this product in the storefront'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label={isBn ? 'নাম (ইংরেজি)' : 'Name (English)'}
              htmlFor="nameEn"
              error={form.formState.errors.nameEn?.message}
            >
              <Input
                id="nameEn"
                disabled={catalogLocked}
                placeholder="Fresh Organic Red Potato"
                {...form.register('nameEn')}
              />
            </Field>

            <Field
              label={isBn ? 'নাম (বাংলা)' : 'Name (Bangla)'}
              htmlFor="nameBn"
              error={form.formState.errors.nameBn?.message}
            >
              <Input
                id="nameBn"
                disabled={catalogLocked}
                placeholder="তাজা জৈব লাল আলু"
                {...form.register('nameBn')}
              />
            </Field>

            <Field
              label={isBn ? 'ক্যাটাগরি' : 'Category'}
              error={form.formState.errors.categoryId?.message}
            >
              <Select
                value={form.watch('categoryId') || undefined}
                disabled={catalogLocked || isCategoriesLoading}
                onValueChange={(value) => {
                  form.setValue('categoryId', value, { shouldValidate: true });
                  form.setValue('subCategoryId', '');
                }}
              >
                <SelectTrigger className="w-full" aria-label={isBn ? 'ক্যাটাগরি' : 'Category'}>
                  <SelectValue
                    placeholder={
                      isCategoriesLoading
                        ? isBn
                          ? 'লোড হচ্ছে...'
                          : 'Loading...'
                        : isBn
                          ? 'ক্যাটাগরি নির্বাচন করুন'
                          : 'Select a category'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon ? `${category.icon} ` : ''}
                      {isBn ? category.nameBn : category.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={isBn ? 'সাব-ক্যাটাগরি' : 'Sub-category'}
              hint={isBn ? 'ঐচ্ছিক' : 'Optional'}
            >
              <Select
                value={form.watch('subCategoryId') || NO_SUBCATEGORY}
                disabled={catalogLocked || subCategories.length === 0}
                onValueChange={(value) =>
                  form.setValue('subCategoryId', value === NO_SUBCATEGORY ? '' : value)
                }
              >
                <SelectTrigger className="w-full" aria-label={isBn ? 'সাব-ক্যাটাগরি' : 'Sub-category'}>
                  <SelectValue placeholder={isBn ? 'নির্বাচন করুন' : 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SUBCATEGORY}>
                    {isBn ? 'প্রযোজ্য নয়' : 'None'}
                  </SelectItem>
                  {subCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {isBn ? category.nameBn : category.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={isBn ? 'ব্র্যান্ড' : 'Brand'}
              hint={isBn ? 'ঐচ্ছিক' : 'Optional'}
              className="md:col-span-2"
            >
              <Select
                value={form.watch('brandId') || NO_BRAND}
                disabled={catalogLocked}
                onValueChange={(value) => form.setValue('brandId', value === NO_BRAND ? '' : value)}
              >
                <SelectTrigger className="w-full" aria-label={isBn ? 'ব্র্যান্ড' : 'Brand'}>
                  <SelectValue placeholder={isBn ? 'নির্বাচন করুন' : 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_BRAND}>{isBn ? 'ব্র্যান্ড ছাড়া' : 'No brand'}</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {isBn ? brand.nameBn : brand.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>

        {/* -------------------------------------------------- descriptions */}
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{isBn ? 'বিবরণ' : 'Descriptions'}</CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'সংক্ষিপ্ত বিবরণ তালিকায়, বিস্তারিত বিবরণ প্রোডাক্ট পাতায় দেখা যায়'
                : 'The short description appears in listings, the full one on the product page'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={isBn ? 'সংক্ষিপ্ত বিবরণ (ইংরেজি)' : 'Short description (English)'}>
              <Textarea
                rows={2}
                disabled={catalogLocked}
                placeholder="Naturally grown, pesticide-free"
                {...form.register('shortDescriptionEn')}
              />
            </Field>
            <Field label={isBn ? 'সংক্ষিপ্ত বিবরণ (বাংলা)' : 'Short description (Bangla)'}>
              <Textarea
                rows={2}
                disabled={catalogLocked}
                placeholder="প্রাকৃতিকভাবে চাষ করা, বিষমুক্ত"
                {...form.register('shortDescriptionBn')}
              />
            </Field>
            <Field label={isBn ? 'বিস্তারিত (ইংরেজি)' : 'Full description (English)'}>
              <Textarea
                rows={5}
                disabled={catalogLocked}
                placeholder="Origin, storage tips, packaging…"
                {...form.register('descriptionEn')}
              />
            </Field>
            <Field label={isBn ? 'বিস্তারিত (বাংলা)' : 'Full description (Bangla)'}>
              <Textarea
                rows={5}
                disabled={catalogLocked}
                placeholder="উৎস, সংরক্ষণ পদ্ধতি, প্যাকেজিং…"
                {...form.register('descriptionBn')}
              />
            </Field>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------- pricing */}
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{isBn ? 'মূল্য নির্ধারণ' : 'Pricing'}</CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'ছাড়ের মূল্য নিয়মিত মূল্যের চেয়ে কম হতে হবে'
                : 'A discount price must be lower than the regular price'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label={isBn ? 'নিয়মিত মূল্য (৳)' : 'Regular price (৳)'}
              htmlFor="price"
              error={form.formState.errors.price?.message}
            >
              <Input id="price" type="number" min={0} step="0.01" {...form.register('price')} />
            </Field>

            <Field
              label={isBn ? 'ছাড়ের মূল্য (৳)' : 'Discount price (৳)'}
              hint={isBn ? 'ঐচ্ছিক' : 'Optional'}
              htmlFor="discountPrice"
              error={form.formState.errors.discountPrice?.message}
            >
              <Input
                id="discountPrice"
                type="number"
                min={0}
                step="0.01"
                placeholder="—"
                {...form.register('discountPrice')}
              />
            </Field>

            <div className="bg-muted/40 flex flex-col justify-center rounded-xl p-3">
              <span className="text-muted-foreground text-xs">
                {isBn ? 'ক্রেতা দেবেন' : 'Customer pays'}
              </span>
              <span className="text-foreground text-xl font-bold tabular-nums">
                {formatCurrency(effectivePrice)}
              </span>
              {watchedDiscount > 0 && watchedDiscount < watchedPrice && (
                <span className="text-muted-foreground text-xs line-through">
                  {formatCurrency(watchedPrice)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ----------------------------------------------------- inventory */}
        <Card className="shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              {isBn ? 'ইনভেন্টরি ও শনাক্তকরণ' : 'Inventory & identification'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isBn
                ? 'স্টক শূন্যের নিচে যেতে পারবে না; কম স্টক সতর্কতা স্বয়ংক্রিয়ভাবে দেখানো হবে'
                : 'Stock can never go negative; low-stock alerts trigger automatically'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label={isBn ? 'স্টক পরিমাণ' : 'Stock quantity'}
              htmlFor="quantity"
              error={form.formState.errors.quantity?.message}
            >
              <Input id="quantity" type="number" min={0} {...form.register('quantity')} />
            </Field>
            <Field
              label={isBn ? 'কম স্টক সীমা' : 'Low-stock threshold'}
              hint={isBn ? 'ডিফল্ট ৫' : 'Defaults to 5'}
              htmlFor="lowStockThreshold"
            >
              <Input
                id="lowStockThreshold"
                type="number"
                min={0}
                {...form.register('lowStockThreshold')}
              />
            </Field>
            <Field label="SKU" hint={isBn ? 'ঐচ্ছিক' : 'Optional'}>
              <Input
                disabled={catalogLocked}
                placeholder="POT-RED-001"
                {...form.register('sku')}
              />
            </Field>
            <Field
              label={isBn ? 'একক' : 'Unit'}
              hint={isBn ? 'কেজি, পিস, লিটার' : 'kg, piece, litre'}
            >
              <Input
                disabled={catalogLocked}
                placeholder={isBn ? 'কেজি' : 'kg'}
                {...form.register('unit')}
              />
            </Field>
          </CardContent>
        </Card>

        {/* -------------------------------------------------------- images */}
        {isEdit && product ? (
          <SellerProductImageManager
            product={product}
            isBn={isBn}
            onChanged={() => void refetchProduct()}
          />
        ) : (
          <Card className="shadow-none">
            <CardContent className="flex items-start gap-2.5 p-4 text-xs">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-muted-foreground">
                {isBn
                  ? 'প্রোডাক্ট সংরক্ষণ করার পরেই ছবি যোগ করতে পারবেন — সংরক্ষণের সাথে সাথে সম্পাদনা পাতায় নিয়ে যাওয়া হবে।'
                  : 'You can add images right after saving — we will take you straight to the edit page once the product is created.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* -------------------------------------------------------- status */}
        <Card className="shadow-none">
          <CardContent className="flex flex-row items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium">
                {isBn ? 'দোকানে দেখানো হবে' : 'Visible in the shop'}
              </p>
              <p className="text-muted-foreground text-xs">
                {isBn
                  ? 'বন্ধ করলে গ্রাহক প্রোডাক্টটি দেখতে পাবেন না'
                  : 'Turn off to hide this product from customers without deleting it'}
              </p>
            </div>
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
              aria-label={isBn ? 'প্রোডাক্ট সক্রিয়' : 'Product active'}
            />
          </CardContent>
        </Card>

        {/* ---------------------------------------------------- save bar */}
        <div className="bg-background/95 border-border sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t p-3 backdrop-blur sm:p-4">
          <Button asChild type="button" variant="outline">
            <Link href={`/${lang}/seller/products`}>{isBn ? 'বাতিল' : 'Cancel'}</Link>
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving
              ? isBn
                ? 'সংরক্ষণ হচ্ছে...'
                : 'Saving...'
              : isEdit
                ? isBn
                  ? 'পরিবর্তন সংরক্ষণ'
                  : 'Save changes'
                : isBn
                  ? 'প্রোডাক্ট তৈরি করুন'
                  : 'Create product'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
        </Label>
        {hint && <span className="text-muted-foreground text-[11px]">{hint}</span>}
      </div>
      {children}
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
