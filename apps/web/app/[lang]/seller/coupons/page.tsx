'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useEffect, useState } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Ticket, Plus, Trash2, Calendar, Users, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerCouponsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const router = useRouter();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetSellerCouponsQuery({ page, limit: 10 }, {
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

  if (!isAuthenticated || !user?.roles?.includes('SELLER')) return null;

  const coupons = data?.data || [];
  const meta = data?.meta;

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
    } catch (error) {
      toast.error(isBn ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    try {
      await deleteCoupon(id).unwrap();
      toast.success(isBn ? 'কুপন মুছে ফেলা হয়েছে' : 'Coupon deleted');
    } catch (error) {
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
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Ticket className="h-8 w-8 text-primary" />
          {isBn ? 'দোকানের কুপন' : 'Shop Coupons'}
        </h1>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateModal}>
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
              <Button type="submit" className="w-full mt-6">
                {isBn ? 'সংরক্ষণ করুন' : 'Save Coupon'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">{isBn ? 'কোড' : 'Code'}</th>
                  <th className="px-6 py-4 font-medium">{isBn ? 'ডিসকাউন্ট' : 'Discount'}</th>
                  <th className="px-6 py-4 font-medium">{isBn ? 'ব্যবহার' : 'Usage'}</th>
                  <th className="px-6 py-4 font-medium">{isBn ? 'বৈধতা' : 'Validity'}</th>
                  <th className="px-6 py-4 font-medium">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="px-6 py-4 font-medium text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">No coupons found.</td></tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-semibold text-primary">{coupon.code}</td>
                      <td className="px-6 py-4">
                        {coupon.discountType === 'PERCENTAGE' 
                          ? `${coupon.discountValue}% (Max: ৳${coupon.maxDiscountAmount || '∞'})` 
                          : `৳${coupon.discountValue}`}
                        <div className="text-xs text-muted-foreground mt-1">Min: ৳{coupon.minOrderAmount}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {coupon.usedCount} / {coupon.usageLimit || '∞'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs gap-1">
                          {coupon.startDate && <span><Calendar className="h-3 w-3 inline mr-1"/> {new Date(coupon.startDate).toLocaleDateString()}</span>}
                          {coupon.endDate && <span className={new Date(coupon.endDate) < new Date() ? 'text-red-500' : ''}>
                            <Calendar className="h-3 w-3 inline mr-1"/> {new Date(coupon.endDate).toLocaleDateString()}
                          </span>}
                          {!coupon.startDate && !coupon.endDate && <span className="text-muted-foreground">Always Valid</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Switch 
                          checked={coupon.isActive} 
                          onCheckedChange={(val: boolean) => handleToggleActive(coupon.id, val)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(coupon)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                {isBn ? 'পূর্ববর্তী' : 'Previous'}
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                {page} / {meta.totalPages}
              </div>
              <Button 
                variant="outline" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              >
                {isBn ? 'পরবর্তী' : 'Next'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
