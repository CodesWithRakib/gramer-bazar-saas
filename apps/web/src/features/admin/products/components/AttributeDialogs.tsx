'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { customToast as toast } from '@/components/ui/custom-toast';
import {
  useCreateAdminAttributeMutation,
  useUpdateAdminAttributeMutation,
  AttributeDataType,
  CatalogAttribute,
} from '@/features/catalog/catalogApi';

const SLUG_TYPES: AttributeDataType[] = ['SELECT', 'MULTI_SELECT', 'RANGE'];
const OPTION_TYPES: AttributeDataType[] = ['SELECT', 'MULTI_SELECT'];

const attributeSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameBn: z.string().min(1, 'Bangla name is required'),
  slug: z.string().min(1, 'Slug is required'),
  dataType: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'RANGE', 'DATE']),
  unit: z.string().optional().nullable(),
  isFilterable: z.boolean().default(true),
  isVariantAxis: z.boolean().default(false),
  sortOrder: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
  options: z
    .array(
      z.object({
        value: z.string().min(1, 'Option value is required'),
        valueBn: z.string().optional().nullable(),
        slug: z.string().optional().nullable(),
      })
    )
    .default([]),
});

type AttributeFormValues = z.infer<typeof attributeSchema>;

export const ATTRIBUTE_DATA_TYPE_LABELS: Record<AttributeDataType, string> = {
  TEXT: 'Text',
  NUMBER: 'Number',
  BOOLEAN: 'Yes / No',
  SELECT: 'Select (single choice)',
  MULTI_SELECT: 'Multi-select',
  RANGE: 'Range',
  DATE: 'Date',
};

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function AttributeForm({
  form,
  onSubmit,
  isLoading,
  submitLabel,
}: {
  form: ReturnType<typeof useForm<AttributeFormValues>>;
  onSubmit: (values: AttributeFormValues) => void;
  isLoading: boolean;
  submitLabel: string;
}) {
  const dataType = form.watch('dataType');
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'options' });
  const showOptions = OPTION_TYPES.includes(dataType);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Socket"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!form.getValues('slug')) {
                        form.setValue('slug', toSlug(e.target.value));
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
                  <Input placeholder="যেমন: সকেট" {...field} />
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
                    <Input placeholder="e.g. socket" {...field} />
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dataType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(ATTRIBUTE_DATA_TYPE_LABELS) as AttributeDataType[]).map((dt) => (
                      <SelectItem key={dt} value={dt}>
                        {ATTRIBUTE_DATA_TYPE_LABELS[dt]}
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
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. GHz, GB, inch"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <FormField
            control={form.control}
            name="isFilterable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Use as filter</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isVariantAxis"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Variant axis</FormLabel>
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
        </div>

        {showOptions && (
          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <FormLabel>Selectable Options</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: '', valueBn: '', slug: '' })}
              >
                + Add Option
              </Button>
            </div>
            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No options yet. Options become the selectable filter values (e.g. LGA1700, AM5).
              </p>
            )}
            <div className="space-y-2">
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <FormField
                    control={form.control}
                    name={`options.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Input placeholder="Value (EN)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`options.${index}.valueBn`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Input
                            placeholder="Value (BN)"
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-10"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </form>
    </Form>
  );
}

export function AddAttributeDialog() {
  const [open, setOpen] = useState(false);
  const [createAttribute, { isLoading }] = useCreateAdminAttributeMutation();

  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      nameEn: '',
      nameBn: '',
      slug: '',
      dataType: 'TEXT',
      unit: '',
      isFilterable: true,
      isVariantAxis: false,
      sortOrder: 0,
      isActive: true,
      options: [],
    },
  });

  const onSubmit = async (values: AttributeFormValues) => {
    try {
      const showOptions = OPTION_TYPES.includes(values.dataType);
      await createAttribute({
        ...values,
        unit: values.unit || null,
        options: showOptions
          ? values.options.map((o, i) => ({ ...o, sortOrder: i, isActive: true }))
          : [],
      }).unwrap();
      toast.success('Attribute created successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to create attribute');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Attribute</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Attribute</DialogTitle>
        </DialogHeader>
        <AttributeForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitLabel="Save Attribute"
        />
      </DialogContent>
    </Dialog>
  );
}

export function EditAttributeDialog({
  attribute,
  open,
  onOpenChange,
}: {
  attribute: CatalogAttribute;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [updateAttribute, { isLoading }] = useUpdateAdminAttributeMutation();

  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeSchema),
    values: {
      nameEn: attribute.nameEn,
      nameBn: attribute.nameBn,
      slug: attribute.slug,
      dataType: attribute.dataType,
      unit: attribute.unit || '',
      isFilterable: attribute.isFilterable,
      isVariantAxis: attribute.isVariantAxis,
      sortOrder: attribute.sortOrder ?? 0,
      isActive: attribute.isActive,
      options: (attribute.options || []).map((o) => ({
        value: o.value,
        valueBn: o.valueBn || '',
        slug: o.slug,
      })),
    },
  });

  const onSubmit = async (values: AttributeFormValues) => {
    try {
      const showOptions = OPTION_TYPES.includes(values.dataType);
      await updateAttribute({
        id: attribute.id,
        data: {
          ...values,
          unit: values.unit || null,
          options: showOptions
            ? values.options.map((o, i) => ({ ...o, sortOrder: i, isActive: true }))
            : [],
        },
      }).unwrap();
      toast.success('Attribute updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to update attribute');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Attribute — {attribute.nameEn}</DialogTitle>
        </DialogHeader>
        <AttributeForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}

/** Small read-only display used in the attributes table for option chips. */
export function AttributeOptionChips({ attribute }: { attribute: CatalogAttribute }) {
  const options = attribute.options || [];
  if (!SLUG_TYPES.includes(attribute.dataType) || options.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const visible = options.slice(0, 3);
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((o) => (
        <Badge key={o.id} variant="outline" className="text-xs">
          {o.value}
        </Badge>
      ))}
      {options.length > visible.length && (
        <Badge variant="secondary" className="text-xs">
          +{options.length - visible.length}
        </Badge>
      )}
    </div>
  );
}
