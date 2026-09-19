'use client';

import React, { use, useState } from 'react';
import { 
  useGetSellerProductsQuery, 
  useUpdateInventoryMutation 
} from '@/features/seller-portal/sellerPortalApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

export default function SellerInventoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: products, isLoading } = useGetSellerProductsQuery();
  const [updateInventory] = useUpdateInventoryMutation();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localQuantities, setLocalQuantities] = useState<Record<string, string>>({});

  const handleQuantityChange = (inventoryId: string, value: string) => {
    setLocalQuantities(prev => ({ ...prev, [inventoryId]: value }));
  };

  const handleSave = async (inventoryId: string) => {
    const val = localQuantities[inventoryId];
    if (val === undefined || val === '') return;
    
    setUpdatingId(inventoryId);
    try {
      await updateInventory({ id: inventoryId, quantity: parseInt(val, 10) }).unwrap();
      // Remove from local tracking once saved to show default state again
      const newQuantities = { ...localQuantities };
      delete newQuantities[inventoryId];
      setLocalQuantities(newQuantities);
    } catch (error) {
      console.error('Failed to update inventory', error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'ইনভেন্টরি ম্যানেজমেন্ট' : 'Inventory Management'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isBn ? 'আপনার স্টকের পরিমাণ দ্রুত আপডেট করুন' : 'Quickly update your stock levels.'}
        </p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBn ? 'প্রোডাক্ট' : 'Product'}</TableHead>
                <TableHead>{isBn ? 'SKU' : 'SKU'}</TableHead>
                <TableHead>{isBn ? 'বর্তমান স্টক' : 'Current Stock'}</TableHead>
                <TableHead>{isBn ? 'নতুন স্টক' : 'New Stock'}</TableHead>
                <TableHead className="text-right">{isBn ? 'অ্যাকশন' : 'Action'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
                  </TableCell>
                </TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {isBn ? 'কোন প্রোডাক্ট পাওয়া যায়নি' : 'No products found'}
                  </TableCell>
                </TableRow>
              ) : (
                products?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {isBn ? item.productVariant.product.nameBn : item.productVariant.product.nameEn}
                    </TableCell>
                    <TableCell>{item.sellerSku || item.productVariant.sku}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.inventory.quantity <= (item.inventory.lowStockThreshold || 5)
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {item.inventory.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        className="w-24"
                        value={localQuantities[item.inventory.id] ?? item.inventory.quantity}
                        onChange={(e) => handleQuantityChange(item.inventory.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={updatingId === item.inventory.id || (localQuantities[item.inventory.id] === undefined || localQuantities[item.inventory.id] === String(item.inventory.quantity))}
                        onClick={() => handleSave(item.inventory.id)}
                      >
                        {updatingId === item.inventory.id 
                          ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') 
                          : (isBn ? 'সংরক্ষণ' : 'Save')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
