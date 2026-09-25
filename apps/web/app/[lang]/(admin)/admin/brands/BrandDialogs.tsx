'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  useCreateAdminBrandMutation,
  useUpdateAdminBrandMutation,
  useGetPublicCategoriesQuery,
  Brand,
} from '@/features/catalog/catalogApi';

const brandSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameBn: z.string().min(1, 'Bangla name is required'),
  slug: z.string().min(1, 'Slug is required'),
  categoryIds: z.array(z.string()).optional(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

export function AddBrandDialog() {
  const [open, setOpen] = useState(false);
  const [createBrand, { isLoading }] = useCreateAdminBrandMutation();
  const { data: categories = [] } = useGetPublicCategoriesQuery();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { nameEn: '', nameBn: '', slug: '', categoryIds: [] },
  });

  const onSubmit = async (values: BrandFormValues) => {
    try {
      await createBrand(values).unwrap();
      toast.success('Brand created successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to create brand');
    }
  };

  const selectedCategoryIds = form.watch('categoryIds') || [];

  const toggleCategory = (catId: string) => {
    const current = new Set(selectedCategoryIds);
    if (current.has(catId)) {
      current.delete(catId);
    } else {
      current.add(catId);
    }
    form.setValue('categoryIds', Array.from(current), { shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Brand</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Brand</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Samsung" />
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
                  <FormLabel>Name (Bangla)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="উদা: স্যামসাং" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. samsung" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Associations */}
            <div className="space-y-2 pt-2 border-t">
              <FormLabel>Associated Categories</FormLabel>
              <p className="text-xs text-muted-foreground">
                Select which categories this brand belongs to (e.g. Electronics, Cosmetics).
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-muted/20">
                {categories.map((cat) => {
                  const checked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted cursor-pointer text-xs"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <span className="truncate">{cat.nameEn}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Brand'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditBrandDialog({
  brand,
  open,
  onOpenChange,
}: {
  brand: Brand;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateBrand, { isLoading }] = useUpdateAdminBrandMutation();
  const { data: categories = [] } = useGetPublicCategoriesQuery();

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    values: {
      nameEn: brand?.nameEn || '',
      nameBn: brand?.nameBn || '',
      slug: brand?.slug || '',
      categoryIds: brand?.categories?.map((c) => c.id) || [],
    },
  });

  const onSubmit = async (values: BrandFormValues) => {
    try {
      await updateBrand({ id: brand.id, data: values }).unwrap();
      toast.success('Brand updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update brand');
    }
  };

  const selectedCategoryIds = form.watch('categoryIds') || [];

  const toggleCategory = (catId: string) => {
    const current = new Set(selectedCategoryIds);
    if (current.has(catId)) {
      current.delete(catId);
    } else {
      current.add(catId);
    }
    form.setValue('categoryIds', Array.from(current), { shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Brand - {brand?.nameEn}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
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
                  <FormLabel>Name (Bangla)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Associations */}
            <div className="space-y-2 pt-2 border-t">
              <FormLabel>Associated Categories</FormLabel>
              <p className="text-xs text-muted-foreground">
                Select which categories this brand belongs to.
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl bg-muted/20">
                {categories.map((cat) => {
                  const checked = selectedCategoryIds.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted cursor-pointer text-xs"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <span className="truncate">{cat.nameEn}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
