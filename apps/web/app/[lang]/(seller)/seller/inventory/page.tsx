'use client';

import React, { use, useState, useMemo } from 'react';
import { 
  useGetSellerProductsQuery, 
  useUpdateInventoryMutation 
} from '@/features/seller-portal/sellerPortalApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Package } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

export default function SellerInventoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: products = [], isLoading } = useGetSellerProductsQuery();
  const [updateInventory] = useUpdateInventoryMutation();
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localQuantities, setLocalQuantities] = useState<Record<string, string>>({});

  // Search & Filter
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const name = isBn ? item.productVariant.product.nameBn : item.productVariant.product.nameEn;
      const sku = item.sellerSku || item.productVariant.sku || '';

      const matchesSearch =
        !search.trim() ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        sku.toLowerCase().includes(search.toLowerCase());

      const qty = item.inventory.quantity;
      const lowStockThreshold = item.inventory.lowStockThreshold || 5;

      let matchesStock = true;
      if (stockFilter === 'LOW_STOCK') {
        matchesStock = qty <= lowStockThreshold;
      } else if (stockFilter === 'IN_STOCK') {
        matchesStock = qty > lowStockThreshold;
      } else if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = qty === 0;
      }

      return matchesSearch && matchesStock;
    });
  }, [products, search, stockFilter, isBn]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleQuantityChange = (inventoryId: string, value: string) => {
    setLocalQuantities(prev => ({ ...prev, [inventoryId]: value }));
  };

  const handleSave = async (inventoryId: string) => {
    const val = localQuantities[inventoryId];
    if (val === undefined || val === '') return;
    
    setUpdatingId(inventoryId);
    try {
      await updateInventory({ id: inventoryId, quantity: parseInt(val, 10) }).unwrap();
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

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
        {/* Top Toolbar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
            {/* Search Pill */}
            <div className="relative w-full max-w-md min-w-[200px] flex-1 sm:w-auto">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isBn ? 'প্রোডাক্টের নাম বা SKU দিয়ে খুঁজুন...' : 'Search product name or SKU...'}
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Stock Filter */}
            <div className="w-full sm:w-44 md:w-48">
              <Select
                value={stockFilter}
                onValueChange={(val) => {
                  setStockFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল স্টক' : 'All Stock'}</SelectItem>
                  <SelectItem value="LOW_STOCK">{isBn ? 'কম স্টক (লো)' : 'Low Stock'}</SelectItem>
                  <SelectItem value="IN_STOCK">{isBn ? 'পর্যাপ্ত স্টক' : 'In Stock'}</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">{isBn ? 'স্টক শেষ' : 'Out of Stock'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Inner Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <TableRow>
                  <TableHead className="py-3.5 px-4">{isBn ? 'প্রোডাক্ট' : 'Product'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'SKU' : 'SKU'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'বর্তমান স্টক' : 'Current Stock'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'নতুন স্টক' : 'New Stock'}</TableHead>
                  <TableHead className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="animate-pulse">
                      <TableCell className="py-4 px-4"><div className="h-4 w-40 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-20 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-6 w-12 rounded-full bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-10 w-24 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4 text-right"><div className="h-9 w-20 ml-auto rounded bg-muted"></div></TableCell>
                    </TableRow>
                  ))
                ) : paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <Package className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোনো প্রোডাক্ট পাওয়া যায়নি' : 'No products found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || stockFilter !== 'ALL'
                            ? (isBn ? 'আপনার অনুসন্ধানের সাথে কোনো পণ্য মেলেনি' : 'No products match your search or filter.')
                            : (isBn ? 'ইনভেন্টরিতে কোনো পণ্য তালিকাভুক্ত নেই' : 'No products in inventory.')}
                        </p>
                        {(search || stockFilter !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setStockFilter('ALL');
                            }}
                            className="mt-4 text-sm font-medium text-primary hover:underline"
                          >
                            {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear filters'}
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <TableCell className="font-medium py-3.5 px-4 text-foreground">
                        {isBn ? item.productVariant.product.nameBn : item.productVariant.product.nameEn}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {item.sellerSku || item.productVariant.sku}
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.inventory.quantity <= (item.inventory.lowStockThreshold || 5)
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {item.inventory.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Input
                          type="number"
                          min="0"
                          className="w-24 h-9"
                          value={localQuantities[item.inventory.id] ?? item.inventory.quantity}
                          onChange={(e) => handleQuantityChange(item.inventory.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          className="rounded-full px-4"
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
          </div>
        </div>

        {/* Pagination */}
        <AdminPagination
          totalItems={filteredProducts.length}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setPageSize(newLimit);
            setCurrentPage(1);
          }}
          lang={isBn ? 'bn' : 'en'}
          itemLabel={{
            singular: isBn ? 'আইটেম' : 'item',
            plural: isBn ? 'আইটেম' : 'items',
          }}
        />
      </div>
    </div>
  );
}
