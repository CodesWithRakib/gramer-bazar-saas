'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  useGetSellerCouponsQuery, 
  useCreateSellerCouponMutation, 
  useUpdateSellerCouponMutation, 
  useDeleteSellerCouponMutation,
  Coupon,
} from '@/features/coupons/couponsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Ticket, Plus, Trash2, Calendar, Users, Edit, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import AdminPagination from '@/components/AdminPagination';

export interface SellerCouponsViewProps {
  lang?: string;
}

export function SellerCouponsView({ lang = 'en' }: SellerCouponsViewProps) {
  
  const isBn = lang === 'bn';
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, isLoading } = useGetSellerCouponsQuery({ 
    page, 
    limit, 
    search: search.trim() || undefined 
  }, {
    skip: !isAuthenticated,
  });

  const [createCoupon] = useCreateSellerCouponMutation();
  const [updateCoupon] = useUpdateSellerCouponMutation();
  const [deleteCoupon] = useDeleteSellerCouponMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    customerUsageLimit: '1',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('SELLER')) {
      router.push(`/${lang}/login`);
    }
  }, [isAuthenticated, user, router, lang]);

  const rawCoupons = data?.data || [];
  const meta = data?.meta;

  const coupons = useMemo(() => {
    if (statusFilter === 'ALL') return rawCoupons;
    return rawCoupons.filter((c) => (statusFilter === 'ACTIVE' ? c.isActive : !c.isActive));
  }, [rawCoupons, statusFilter]);

  if (!isAuthenticated || !user?.roles?.includes('SELLER')) return null;

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '0',
      maxDiscountAmount: '',
      usageLimit: '',
      customerUsageLimit: '1',
      startDate: '',
      endDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setIsEditing(true);
    setFormData({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      customerUsageLimit: coupon.customerUsageLimit.toString(),
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCoupon({ id, data: { isActive } }).unwrap();
      toast.success(isBn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    } catch {
      toast.error(isBn ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    try {
      await deleteCoupon(id).unwrap();
      toast.success(isBn ? 'কুপন মুছে ফেলা হয়েছে' : 'Coupon deleted');
    } catch {
      toast.error(isBn ? 'মুছতে ব্যর্থ হয়েছে' : 'Deletion failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType as 'PERCENTAGE' | 'FIXED',
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      customerUsageLimit: Number(formData.customerUsageLimit) || 1,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    try {
      if (isEditing) {
        await updateCoupon({ id: formData.id, data: payload }).unwrap();
        toast.success(isBn ? 'কুপন আপডেট হয়েছে' : 'Coupon updated successfully');
      } else {
        await createCoupon(payload).unwrap();
        toast.success(isBn ? 'কুপন তৈরি হয়েছে' : 'Coupon created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || (isBn ? 'ব্যর্থ হয়েছে' : 'Operation failed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="h-8 w-8 text-primary" />
            {isBn ? 'দোকানের কুপন' : 'Shop Coupons'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn ? 'আপনার দোকানের ডিসকাউন্ট ও প্রোমো কোডসমূহ পরিচালনা করুন।' : 'Manage promotional coupons and discount campaigns for your shop.'}
          </p>
        </div>
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
                  setPage(1);
                }}
                placeholder={isBn ? 'কুপন কোড দিয়ে খুঁজুন...' : 'Search by coupon code...'}
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-44 md:w-48">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                  <SelectItem value="ACTIVE">{isBn ? 'সক্রিয়' : 'Active'}</SelectItem>
                  <SelectItem value="INACTIVE">{isBn ? 'নিষ্ক্রিয়' : 'Inactive'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Slot */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateModal} className="rounded-full px-6 h-11 whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                {isBn ? 'নতুন কুপন তৈরি করুন' : 'Create New Coupon'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? (isBn ? 'কুপন এডিট করুন' : 'Edit Coupon') : (isBn ? 'নতুন কুপন' : 'New Coupon')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isBn ? 'প্রোমো কোড' : 'Promo Code'}</Label>
                    <Input 
                      required 
                      className="uppercase"
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value})} 
                      placeholder="e.g. SHOP20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{isBn ? 'ডিসকাউন্ট ধরন' : 'Discount Type'}</Label>
                    <Select 
                      value={formData.discountType} 
                      onValueChange={(value) => setFormData({...formData, discountType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">{isBn ? 'শতাংশ (%)' : 'Percentage (%)'}</SelectItem>
                        <SelectItem value="FIXED">{isBn ? 'নির্ধারিত পরিমাণ (৳)' : 'Fixed Amount (৳)'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{isBn ? 'ডিসকাউন্ট মূল্য' : 'Discount Value'}</Label>
                    <Input 
                      type="number" 
                      required 
                      min="1"
                      value={formData.discountValue} 
                      onChange={e => setFormData({...formData, discountValue: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isBn ? 'সর্বনিম্ন অর্ডারের পরিমাণ (৳)' : 'Min Order Amount (৳)'}</Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={formData.minOrderAmount} 
                      onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} 
                    />
                  </div>

                  {formData.discountType === 'PERCENTAGE' && (
                    <div className="space-y-2">
                      <Label>{isBn ? 'সর্বোচ্চ ডিসকাউন্ট (৳)' : 'Max Discount Amount (৳)'}</Label>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Optional"
                        value={formData.maxDiscountAmount} 
                        onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value})} 
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{isBn ? 'মোট ব্যবহারের সীমা' : 'Total Usage Limit'}</Label>
                    <Input 
                      type="number" 
                      min="1"
                      placeholder="Optional"
                      value={formData.usageLimit} 
                      onChange={e => setFormData({...formData, usageLimit: e.target.value})} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isBn ? 'গ্রাহক প্রতি সীমা' : 'Limit Per Customer'}</Label>
                    <Input 
                      type="number" 
                      required 
                      min="1"
                      value={formData.customerUsageLimit} 
                      onChange={e => setFormData({...formData, customerUsageLimit: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{isBn ? 'শুরুর তারিখ' : 'Start Date'}</Label>
                    <Input 
                      type="datetime-local" 
                      value={formData.startDate} 
                      onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{isBn ? 'শেষের তারিখ' : 'End Date'}</Label>
                    <Input 
                      type="datetime-local" 
                      value={formData.endDate} 
                      onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6 rounded-full">
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Coupon'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inner Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'কোড' : 'Code'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'ডিসকাউন্ট' : 'Discount'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'ব্যবহার' : 'Usage'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'বৈধতা' : 'Validity'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-border">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 w-24 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-32 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-28 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-6 w-12 rounded-full bg-muted"></div></td>
                      <td className="py-4 px-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-muted"></div></td>
                    </tr>
                  ))
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <Ticket className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোনো কুপন পাওয়া যায়নি' : 'No coupons found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || statusFilter !== 'ALL'
                            ? (isBn ? 'আপনার ফিল্টারের সাথে কোনো কুপন মেলেনি' : 'No coupons match your search criteria.')
                            : (isBn ? 'আপনার দোকানে এখনও কোনো কুপন তৈরি করা হয়নি' : 'No coupons created for your shop yet.')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">{coupon.code}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-foreground">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}% (Max: ৳${coupon.maxDiscountAmount || '∞'})` 
                            : `৳${coupon.discountValue}`}
                        </span>
                        <div className="text-xs text-muted-foreground mt-0.5">Min: ৳{coupon.minOrderAmount}</div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-xs gap-0.5">
                          {coupon.startDate && <span><Calendar className="h-3 w-3 inline mr-1 text-muted-foreground"/> {new Date(coupon.startDate).toLocaleDateString()}</span>}
                          {coupon.endDate && <span className={new Date(coupon.endDate) < new Date() ? 'text-destructive font-medium' : ''}>
                            <Calendar className="h-3 w-3 inline mr-1 text-muted-foreground"/> {new Date(coupon.endDate).toLocaleDateString()}
                          </span>}
                          {!coupon.startDate && !coupon.endDate && <span className="text-muted-foreground">Always Valid</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Switch 
                          checked={coupon.isActive} 
                          onCheckedChange={(val: boolean) => handleToggleActive(coupon.id, val)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(coupon)} className="h-8 w-8 rounded-full">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination inside card */}
        <AdminPagination
          totalItems={meta?.total ?? coupons.length}
          itemsPerPage={limit}
          currentPage={page}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          lang={isBn ? 'bn' : 'en'}
          itemLabel={{
            singular: isBn ? 'কুপন' : 'coupon',
            plural: isBn ? 'কুপন' : 'coupons',
          }}
        />
      </div>
    </div>
  );
}
