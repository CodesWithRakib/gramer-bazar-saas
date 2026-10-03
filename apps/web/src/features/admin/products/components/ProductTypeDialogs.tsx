'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useEffect, useMemo, useState } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { customToast as toast } from '@/components/ui/custom-toast';
import {
  useCreateAdminProductTypeMutation,
  useUpdateAdminProductTypeMutation,
  useGetCategoriesTreeQuery,
  useGetAdminAttributesQuery,
  useSetProductTypeAttributesMutation,
  Category,
  ProductType,
  CatalogAttribute,
} from '@/features/catalog/catalogApi';

const productTypeSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  nameEn: z.string().min(1, 'English name is required'),
  nameBn: z.string().min(1, 'Bangla name is required'),
  slug: z.string().min(1, 'Slug is required'),
  descriptionEn: z.string().optional().nullable(),
  descriptionBn: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type ProductTypeFormValues = z.infer<typeof productTypeSchema>;

export interface FlatCategory {
  id: string;
  label: string;
  depth: number;
}

/** Flattens the nested category tree into indented select options. */
export function flattenCategoryTree(
  tree: Category[] | undefined,
  depth = 0,
  acc: FlatCategory[] = []
): FlatCategory[] {
  for (const cat of tree ?? []) {
    acc.push({
      id: cat.id,
      label: `${'— '.repeat(depth)}${cat.nameEn}${cat.nameBn ? ` (${cat.nameBn})` : ''}`,
      depth,
    });
    if (cat.children?.length) {
      flattenCategoryTree(cat.children, depth + 1, acc);
    }
  }
  return acc;
}

function CategorySelect({
  value,
  onChange,
  label = 'Category',
  description,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}) {
  const { data: tree } = useGetCategoriesTreeQuery();
  const options = useMemo(() => flattenCategoryTree(tree), [tree]);

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select value={value || ''} onValueChange={onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
        </FormControl>
        <SelectContent className="max-h-[320px]">
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
}

function ProductTypeForm({
  form,
  onSubmit,
  isLoading,
  submitLabel,
}: {
  form: ReturnType<typeof useForm<ProductTypeFormValues>>;
  onSubmit: (values: ProductTypeFormValues) => void;
  isLoading: boolean;
  submitLabel: string;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <CategorySelect
              value={field.value}
              onChange={field.onChange}
              description="The deepest category this product type belongs to (e.g. PC Components → Processor)."
            />
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Processor"
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
                  <Input placeholder="যেমন: প্রসেসর" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. processor" {...field} />
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
          name="descriptionEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (English)</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Optional product type description"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
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
                <Textarea
                  rows={2}
                  placeholder="ঐচ্ছিক বিবরণ"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Active</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

export function AddProductTypeDialog() {
  const [open, setOpen] = useState(false);
  const [createProductType, { isLoading }] = useCreateAdminProductTypeMutation();

  const form = useForm<ProductTypeFormValues>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      categoryId: '',
      nameEn: '',
      nameBn: '',
      slug: '',
      descriptionEn: '',
      descriptionBn: '',
      icon: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const onSubmit = async (values: ProductTypeFormValues) => {
    try {
      await createProductType(values).unwrap();
      toast.success('Product type created successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to create product type');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Product Type</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Product Type</DialogTitle>
        </DialogHeader>
        <ProductTypeForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitLabel="Save Product Type"
        />
      </DialogContent>
    </Dialog>
  );
}

export function EditProductTypeDialog({
  productType,
  open,
  onOpenChange,
}: {
  productType: ProductType;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateProductType, { isLoading }] = useUpdateAdminProductTypeMutation();

  const form = useForm<ProductTypeFormValues>({
    resolver: zodResolver(productTypeSchema),
    values: {
      categoryId: productType.categoryId,
      nameEn: productType.nameEn,
      nameBn: productType.nameBn,
      slug: productType.slug,
      descriptionEn: productType.descriptionEn || '',
      descriptionBn: productType.descriptionBn || '',
      icon: productType.icon || '',
      sortOrder: productType.sortOrder ?? 0,
      isActive: productType.isActive,
    },
  });

  const onSubmit = async (values: ProductTypeFormValues) => {
    try {
      await updateProductType({ id: productType.id, data: values }).unwrap();
      toast.success('Product type updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update product type');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product Type — {productType.nameEn}</DialogTitle>
        </DialogHeader>
        <ProductTypeForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}

interface MappingRow {
  selected: boolean;
  isRequired: boolean;
  isFilterable: boolean;
  specGroup: string;
  sortOrder: number;
}

export function ManageProductTypeAttributesDialog({
  productType,
  open,
  onOpenChange,
}: {
  productType: ProductType;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data: attributes, isLoading: isLoadingAttributes } = useGetAdminAttributesQuery();
  const [setMappings, { isLoading: isSaving }] = useSetProductTypeAttributesMutation();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Record<string, MappingRow>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, MappingRow> = {};
    for (const mapping of productType.attributeMappings ?? []) {
      next[mapping.attributeId] = {
        selected: true,
        isRequired: mapping.isRequired,
        isFilterable: mapping.isFilterable,
        specGroup: mapping.specGroup || '',
        sortOrder: mapping.sortOrder ?? 0,
      };
    }
    setRows(next);
    setSearch('');
  }, [open, productType]);

  const visibleAttributes = useMemo(() => {
    const list = attributes ?? [];
    if (!search) return list;
    const term = search.toLowerCase();
    return list.filter(
      (a) =>
        a.nameEn.toLowerCase().includes(term) ||
        a.nameBn.includes(search) ||
        a.slug.toLowerCase().includes(term)
    );
  }, [attributes, search]);

  const updateRow = (attributeId: string, patch: Partial<MappingRow>) => {
    setRows((prev) => {
      const base: MappingRow = prev[attributeId] ?? {
        selected: false,
        isRequired: false,
        isFilterable: true,
        specGroup: '',
        sortOrder: 0,
      };
      return { ...prev, [attributeId]: { ...base, ...patch } };
    });
  };

  const selectedCount = Object.values(rows).filter((r) => r.selected).length;

  const handleSave = async () => {
    try {
      const mappings = Object.entries(rows)
        .filter(([, row]) => row.selected)
        .map(([attributeId, row]) => ({
          attributeId,
          isRequired: row.isRequired,
          isFilterable: row.isFilterable,
          specGroup: row.specGroup || undefined,
          sortOrder: row.sortOrder,
        }));
      await setMappings({ id: productType.id, mappings }).unwrap();
      toast.success(`Attribute schema updated (${mappings.length} attributes)`);
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to save attribute schema');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attribute Schema — {productType.nameEn}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attributes by name or slug..."
            />
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
          </div>

          {isLoadingAttributes ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading attributes...</p>
          ) : visibleAttributes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No attributes match your search. Create attributes first.
            </p>
          ) : (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pe-1">
              {visibleAttributes.map((attribute) => {
                const row: MappingRow = rows[attribute.id] ?? {
                  selected: false,
                  isRequired: false,
                  isFilterable: true,
                  specGroup: '',
                  sortOrder: 0,
                };
                return (
                  <Card key={attribute.id} className="border-border/60">
                    <CardContent className="flex flex-col gap-3 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-foreground">{attribute.nameEn}</div>
                          <div className="text-xs text-muted-foreground">
                            {attribute.slug} · {attribute.dataType}
                            {attribute.unit ? ` · ${attribute.unit}` : ''}
                          </div>
                        </div>
                        <Checkbox
                          checked={row.selected}
                          onCheckedChange={(v) =>
                            updateRow(attribute.id, { selected: !!v })
                          }
                        />
                      </div>

                      {row.selected && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`required-${attribute.id}`}
                              checked={row.isRequired}
                              onCheckedChange={(v) =>
                                updateRow(attribute.id, { isRequired: !!v })
                              }
                            />
                            <label
                              htmlFor={`required-${attribute.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Required
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`filterable-${attribute.id}`}
                              checked={row.isFilterable}
                              onCheckedChange={(v) =>
                                updateRow(attribute.id, { isFilterable: !!v })
                              }
                            />
                            <label
                              htmlFor={`filterable-${attribute.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Filterable
                            </label>
                          </div>
                          <Input
                            value={row.specGroup}
                            onChange={(e) =>
                              updateRow(attribute.id, { specGroup: e.target.value })
                            }
                            placeholder="Spec group e.g. Memory"
                            className="h-8 text-xs"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Attribute Schema'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProductTypeAttributeSummary({
  attributeMappings,
}: {
  attributeMappings?: Array<{ attributeId: string; attribute?: CatalogAttribute }>;
}) {
  const count = attributeMappings?.length ?? 0;
  return <span className="text-sm text-muted-foreground">{count} attributes</span>;
}
