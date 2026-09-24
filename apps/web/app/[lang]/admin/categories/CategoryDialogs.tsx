'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useGetCategoriesTreeQuery,
  Category,
} from '@/features/catalog/catalogApi';

const categorySchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameBn: z.string().min(1, 'Bangla name is required'),
  slug: z.string().min(1, 'Slug is required'),
  parentId: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
  descriptionBn: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.coerce.number().min(0).default(0),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);
  const [createCategory, { isLoading }] = useCreateAdminCategoryMutation();
  const { data: tree } = useGetCategoriesTreeQuery();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nameEn: '',
      nameBn: '',
      slug: '',
      parentId: null,
      descriptionEn: '',
      descriptionBn: '',
      icon: '',
      sortOrder: 0,
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await createCategory({
        ...values,
        parentId: values.parentId === 'NONE' || !values.parentId ? null : values.parentId,
      }).unwrap();
      toast.success('Category created successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to create category');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Category</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Category / Subcategory</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    value={field.value || 'NONE'}
                    onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category (or leave as Root)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">— None (Top-Level Root Category) —</SelectItem>
                      {tree?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nameEn} ({cat.nameBn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a parent to make this a subcategory, or leave as root category.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (English)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Vegetables"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (!form.getValues('slug')) {
                            form.setValue(
                              'slug',
                              e.target.value
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '')
                            );
                          }
                        }}
                      />
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
                      <Input placeholder="যেমন: শাকসবজি" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. vegetables" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (Emoji or Icon Name)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 🥬" value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Optional category description" value={field.value || ''} onChange={field.onChange} />
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
                  <FormLabel>Description (Bangla)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="ঐচ্ছিক ক্যাটাগরি বিবরণ" value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Category'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category: Category;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateCategory, { isLoading }] = useUpdateAdminCategoryMutation();
  const { data: tree } = useGetCategoriesTreeQuery();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    values: {
      nameEn: category?.nameEn || '',
      nameBn: category?.nameBn || '',
      slug: category?.slug || '',
      parentId: category?.parentId || null,
      descriptionEn: category?.descriptionEn || '',
      descriptionBn: category?.descriptionBn || '',
      icon: category?.icon || '',
      sortOrder: category?.sortOrder || 0,
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await updateCategory({
        id: category.id,
        data: {
          ...values,
          parentId: values.parentId === 'NONE' || !values.parentId ? null : values.parentId,
        },
      }).unwrap();
      toast.success('Category updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update category');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Category - {category?.nameEn}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    value={field.value || 'NONE'}
                    onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category (or leave as Root)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">— None (Top-Level Root Category) —</SelectItem>
                      {tree
                        ?.filter((c) => c.id !== category?.id)
                        .map((cat) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
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
              </div>

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Input value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} value={field.value || ''} onChange={field.onChange} />
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
                  <FormLabel>Description (Bangla)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} value={field.value || ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
