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
import { toast } from 'sonner';
import {
  useAddSellerProductMutation,
  useUpdateSellerProductMutation,
  SellerProductItem,
} from '@/features/seller-portal/sellerPortalApi';

const addProductSchema = z.object({
  productVariantId: z.string().min(1, 'Product ID is required'), // Ideally, this would be a combobox to search global catalog
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().optional(),
  sellerSku: z.string().optional(),
  quantity: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().optional(),
});

export function AddProductDialog({ isBn }: { isBn: boolean }) {
  const [open, setOpen] = useState(false);
  const [addProduct, { isLoading }] = useAddSellerProductMutation();
  
  const form = useForm<z.infer<typeof addProductSchema>>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      productVariantId: '',
      price: 0,
      quantity: 0,
    }
  });

  const onSubmit = async (values: z.infer<typeof addProductSchema>) => {
    try {
      await addProduct(values).unwrap();
      toast.success(isBn ? 'প্রোডাক্ট যোগ করা হয়েছে' : 'Product added successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || (isBn ? 'ত্রুটি হয়েছে' : 'Failed to add product'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{isBn ? 'নতুন প্রোডাক্ট যোগ করুন' : 'Add New Product'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBn ? 'নতুন প্রোডাক্ট' : 'New Product'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="productVariantId" render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'প্রোডাক্ট ভেরিয়েন্ট আইডি (সাময়িক)' : 'Product Variant ID (Temp)'}</FormLabel>
                <FormControl><Input placeholder="UUID..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'দাম (৳)' : 'Price (৳)'}</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'পরিমাণ' : 'Quantity'}</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="sellerSku" render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'এসকেইউ (ঐচ্ছিক)' : 'SKU (Optional)'}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isBn ? 'সংরক্ষণ করুন' : 'Save')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const editProductSchema = z.object({
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().optional(),
  sellerSku: z.string().optional(),
  quantity: z.coerce.number().min(0),
});

export function EditProductDialog({ isBn, product, open, onOpenChange }: { isBn: boolean, product: SellerProductItem, open: boolean, onOpenChange: (o: boolean) => void }) {
  const [updateProduct, { isLoading }] = useUpdateSellerProductMutation();
  
  const form = useForm<z.infer<typeof editProductSchema>>({
    resolver: zodResolver(editProductSchema),
    values: {
      price: product?.price || 0,
      discountPrice: product?.discountPrice || undefined,
      sellerSku: product?.sellerSku || '',
      quantity: product?.inventory?.quantity || 0,
    }
  });

  const onSubmit = async (values: z.infer<typeof editProductSchema>) => {
    try {
      await updateProduct({ id: product.id, data: values }).unwrap();
      toast.success(isBn ? 'আপডেট হয়েছে' : 'Updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || (isBn ? 'ত্রুটি হয়েছে' : 'Failed to update product'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isBn ? 'এডিট করুন' : 'Edit'} - {isBn ? product?.productVariant?.product?.nameBn : product?.productVariant?.product?.nameEn}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'দাম (৳)' : 'Price (৳)'}</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? 'পরিমাণ (নতুন করে সেট করুন)' : 'Set Quantity'}</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="sellerSku" render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? 'এসকেইউ (ঐচ্ছিক)' : 'SKU (Optional)'}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isBn ? 'সংরক্ষণ করুন' : 'Save Changes')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
