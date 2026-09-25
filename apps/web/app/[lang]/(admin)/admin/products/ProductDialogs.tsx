'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState, useMemo } from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useGetCategoriesTreeQuery,
  useGetAdminBrandsQuery,
  useUploadProductImagesMutation,
  useSetPrimaryProductImageMutation,
  useDeleteProductImageMutation,
  Product,
} from '@/features/catalog/catalogApi';
import { CustomImage } from '@/components/ui/CustomImage';
import { ImagePlus, Trash2, Star, RefreshCw } from 'lucide-react';

const COMMON_UNITS = [
  { value: 'kg', label: 'kg (Kilogram)' },
  { value: 'gram', label: 'gram (g)' },
  { value: 'piece', label: 'piece (টি / পিস)' },
  { value: 'liter', label: 'liter (L)' },
  { value: 'ml', label: 'ml (Milliliter)' },
  { value: 'pack', label: 'pack (প্যাকেট)' },
  { value: 'box', label: 'box (বাক্স)' },
  { value: 'dozen', label: 'dozen (ডজন)' },
  { value: 'pair', label: 'pair (জোড়া)' },
  { value: 'bottle', label: 'bottle (বোতল)' },
  { value: 'bundle', label: 'bundle (আঁটি / বান্ডিল)' },
];

const productFormSchema = z.object({
  nameEn: z.string().min(2, 'English name is required'),
  nameBn: z.string().min(2, 'Bangla name is required'),
  shortDescriptionEn: z.string().optional().nullable(),
  shortDescriptionBn: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionBn: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  subCategoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be 0 or higher'),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stock must be 0 or higher'),
  unit: z.string().min(1, 'Unit is required'),
  status: z.string().default('PUBLISHED'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [createProduct, { isLoading }] = useCreateAdminProductMutation();
  const { data: tree } = useGetCategoriesTreeQuery();
  const { data: brandsData } = useGetAdminBrandsQuery({ limit: 100 });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nameEn: '',
      nameBn: '',
      shortDescriptionEn: '',
      shortDescriptionBn: '',
      descriptionEn: '',
      descriptionBn: '',
      categoryId: '',
      subCategoryId: null,
      brandId: null,
      sku: '',
      barcode: '',
      price: 0,
      compareAtPrice: null,
      stock: 10,
      unit: 'piece',
      status: 'PUBLISHED',
      isFeatured: false,
      isActive: true,
    },
  });

  const selectedCategoryId = form.watch('categoryId');

  // Subcategories belonging to selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategoryId || !tree) return [];
    const parent = tree.find((c) => c.id === selectedCategoryId);
    return parent?.children || [];
  }, [selectedCategoryId, tree]);

  const availableBrands = useMemo(() => {
    if (!brandsData?.data) return [];
    if (!selectedCategoryId) return brandsData.data;
    return brandsData.data.filter(
      (b) =>
        !b.categories ||
        b.categories.length === 0 ||
        b.categories.some((c) => c.id === selectedCategoryId)
    );
  }, [brandsData, selectedCategoryId]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      await createProduct({
        ...values,
        subCategoryId: values.subCategoryId === 'NONE' || !values.subCategoryId ? undefined : values.subCategoryId,
        brandId: values.brandId === 'NONE' || !values.brandId ? undefined : values.brandId,
        compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
      }).unwrap();
      toast.success('Product created successfully in master catalog');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to create product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Product</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Master Catalog Product</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                1. Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name (English) *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Miniket Rice 5kg" {...field} />
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
                      <FormLabel>Product Name (Bangla) *</FormLabel>
                      <FormControl>
                        <Input placeholder="যেমন: মিনিকেট চাল ৫ কেজি" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shortDescriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief summary" value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescriptionBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description (Bangla)</FormLabel>
                      <FormControl>
                        <Input placeholder="সংক্ষিপ্ত বিবরণ" value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description (English)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Detailed product specifications..." value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description (Bangla)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="বিস্তারিত বিবরণ..." value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 2: Classification */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                2. Classification & Brand
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('subCategoryId', null);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tree?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nameEn} ({cat.nameBn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        value={field.value || 'NONE'}
                        onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                        disabled={availableSubcategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                availableSubcategories.length === 0
                                  ? 'No subcategories'
                                  : 'Select Subcategory'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">— None —</SelectItem>
                          {availableSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.nameEn} ({sub.nameBn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        value={field.value || 'NONE'}
                        onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">— None / Generic —</SelectItem>
                          {availableBrands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 3: Pricing & Unit */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                3. Pricing & Measurement Unit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (BDT) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare-At Price (BDT)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="Optional strikethrough price"
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_UNITS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 4: Inventory & Codes */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                4. Inventory & Identifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Stock *</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. GB-RICE-01" value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 894110000000" value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 5: Publishing Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                5. Status & Visibility
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PUBLISHED">Published (লাইভ)</SelectItem>
                          <SelectItem value="PENDING_REVIEW">Pending Review (পর্যালোচনাধীন)</SelectItem>
                          <SelectItem value="DRAFT">Draft (খসড়া)</SelectItem>
                          <SelectItem value="UNPUBLISHED">Unpublished (অপ্রকাশিত)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                      <div>
                        <FormLabel>Featured Product</FormLabel>
                        <FormDescription>Highlight on homepage</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                      <div>
                        <FormLabel>Active in Catalog</FormLabel>
                        <FormDescription>Available for ordering</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Product...' : 'Create Master Product'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateProduct, { isLoading }] = useUpdateAdminProductMutation();
  const { data: tree } = useGetCategoriesTreeQuery();
  const { data: brandsData } = useGetAdminBrandsQuery({ limit: 100 });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    values: {
      nameEn: product?.nameEn || '',
      nameBn: product?.nameBn || '',
      shortDescriptionEn: product?.shortDescriptionEn || '',
      shortDescriptionBn: product?.shortDescriptionBn || '',
      descriptionEn: product?.descriptionEn || '',
      descriptionBn: product?.descriptionBn || '',
      categoryId: product?.categoryId || '',
      subCategoryId: product?.subCategoryId || null,
      brandId: product?.brandId || null,
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      price: Number(product?.price || 0),
      compareAtPrice: product?.compareAtPrice ? Number(product.compareAtPrice) : null,
      stock: product?.stock || 0,
      unit: product?.unit || 'piece',
      status: product?.status || 'PUBLISHED',
      isFeatured: !!product?.isFeatured,
      isActive: !!product?.isActive,
    },
  });

  const selectedCategoryId = form.watch('categoryId');

  const availableSubcategories = useMemo(() => {
    if (!selectedCategoryId || !tree) return [];
    const parent = tree.find((c) => c.id === selectedCategoryId);
    return parent?.children || [];
  }, [selectedCategoryId, tree]);

  const availableBrands = useMemo(() => {
    if (!brandsData?.data) return [];
    if (!selectedCategoryId) return brandsData.data;
    return brandsData.data.filter(
      (b) =>
        !b.categories ||
        b.categories.length === 0 ||
        b.categories.some((c) => c.id === selectedCategoryId)
    );
  }, [brandsData, selectedCategoryId]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      await updateProduct({
        id: product.id,
        data: {
          ...values,
          subCategoryId: values.subCategoryId === 'NONE' || !values.subCategoryId ? undefined : values.subCategoryId,
          brandId: values.brandId === 'NONE' || !values.brandId ? undefined : values.brandId,
          compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
        },
      }).unwrap();
      toast.success('Product updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product — {product?.nameEn}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                1. Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name (English) *</FormLabel>
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
                      <FormLabel>Product Name (Bangla) *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shortDescriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description (English)</FormLabel>
                      <FormControl>
                        <Input value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescriptionBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description (Bangla)</FormLabel>
                      <FormControl>
                        <Input value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description (English)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descriptionBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description (Bangla)</FormLabel>
                      <FormControl>
                        <Textarea rows={3} value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                2. Classification & Brand
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue('subCategoryId', null);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tree?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.nameEn} ({cat.nameBn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        value={field.value || 'NONE'}
                        onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                        disabled={availableSubcategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                availableSubcategories.length === 0
                                  ? 'No subcategories'
                                  : 'Select Subcategory'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">— None —</SelectItem>
                          {availableSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.nameEn} ({sub.nameBn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select
                        value={field.value || 'NONE'}
                        onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">— None / Generic —</SelectItem>
                          {availableBrands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                3. Pricing & Unit
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (BDT) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare-At Price (BDT)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_UNITS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                4. Inventory & Identifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock *</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input value={field.value || ''} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                5. Status & Visibility
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PUBLISHED">Published (লাইভ)</SelectItem>
                          <SelectItem value="PENDING_REVIEW">Pending Review (পর্যালোচনাধীন)</SelectItem>
                          <SelectItem value="DRAFT">Draft (খসড়া)</SelectItem>
                          <SelectItem value="UNPUBLISHED">Unpublished (অপ্রকাশিত)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                      <div>
                        <FormLabel>Featured Product</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                      <div>
                        <FormLabel>Active</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Product Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductImagesDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [uploadImages, { isLoading: isUploading }] = useUploadProductImagesMutation();
  const [setPrimary, { isLoading: isSettingPrimary }] = useSetPrimaryProductImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteProductImageMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await uploadImages({ productId: product.id, formData }).unwrap();
      toast.success('Images uploaded successfully');
      e.target.value = '';
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to upload images');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await setPrimary({ productId: product.id, imageId }).unwrap();
      toast.success('Primary image updated');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to set primary image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteImage({ productId: product.id, imageId }).unwrap();
      toast.success('Image deleted');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to delete image');
    }
  };

  const images = product.images || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Images — {product.nameEn}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-muted/20 hover:bg-muted/40 transition-colors">
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <label
                htmlFor={`product-image-upload-${product.id}`}
                className="cursor-pointer font-medium text-primary hover:underline"
              >
                Click to upload images
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Supports JPEG, PNG, WebP (Max 5MB each, validated with magic bytes)
              </p>
            </div>
            <input
              id={`product-image-upload-${product.id}`}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Uploading and processing local images...</span>
              </div>
            )}
          </div>

          {/* Current Images Grid */}
          <div>
            <h4 className="text-sm font-semibold mb-3">
              Stored Product Images ({images.length})
            </h4>

            {images.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/10">
                No images uploaded yet. Upload one above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative group rounded-xl border overflow-hidden p-2 flex flex-col gap-2 bg-card ${
                      img.isPrimary ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                      <CustomImage
                        src={img.url}
                        alt={img.altText || product.nameEn}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 shadow-xs">
                          <Star className="h-3 w-3 fill-current" /> Primary
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground px-1 truncate">
                      <span className="truncate">{img.filename}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t">
                      {!img.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() => handleSetPrimary(img.id)}
                          disabled={isSettingPrimary}
                        >
                          Make Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
