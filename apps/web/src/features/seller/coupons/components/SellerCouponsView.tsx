'use client';

import React, { useMemo, useState } from 'react';
import { customToast as toast } from '@/components/ui/custom-toast';
import { Calendar, Edit, Plus, Search, Ticket, Trash2, Users, X } from 'lucide-react';

import { getApiErrorMessage } from '@/lib/apiError';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import {
  Coupon,
  useCreateSellerCouponMutation,
  useDeleteSellerCouponMutation,
  useGetSellerCouponsQuery,
  useUpdateSellerCouponMutation,
} from '@/features/coupons/couponsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AdminPagination } from '@/components/ui/AdminPagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/format';

export interface SellerCouponsViewProps {
  lang?: string;
}

interface CouponFormState {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  customerUsageLimit: string;
  startDate: string;
  endDate: string;
}

const EMPTY_FORM: CouponFormState = {
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
};

/** `<input type="datetime-local">` value from an ISO string. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function SellerCouponsView({ lang = 'en' }: SellerCouponsViewProps) {
  const isBn = lang === 'bn';
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const { input: searchInput, term: search, onInputChange } = useDebouncedSearch();

  const { data, isLoading, isError, refetch } = useGetSellerCouponsQuery({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const [createCoupon, { isLoading: isSaving }] = useCreateSellerCouponMutation();
  const [updateCoupon] = useUpdateSellerCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteSellerCouponMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CouponFormState>(EMPTY_FORM);

  const rawCoupons = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;

  const coupons = useMemo(() => {
    if (statusFilter === 'ALL') return rawCoupons;
    return rawCoupons.filter((c) => (statusFilter === 'ACTIVE' ? c.isActive : !c.isActive));
  }, [rawCoupons, statusFilter]);

  const hasFilters = Boolean(search.trim()) || statusFilter !== 'ALL';

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormData(EMPTY_FORM);
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
      startDate: toLocalInput(coupon.startDate),
      endDate: toLocalInput(coupon.endDate),
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCoupon({ id, data: { isActive } }).unwrap();
      toast.success(isBn ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated');
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, isBn ? 'আপডেট ব্যর্থ হয়েছে' : 'Could not update the status')
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteCoupon(couponToDelete).unwrap();
      toast.success(isBn ? 'কুপন মুছে ফেলা হয়েছে' : 'Coupon deleted');
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, isBn ? 'মুছতে ব্যর্থ হয়েছে' : 'Could not delete the coupon')
      );
    } finally {
      setCouponToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const discountValue = Number(formData.discountValue);
    if (formData.discountType === 'PERCENTAGE' && (discountValue < 1 || discountValue > 100)) {
      toast.error(isBn ? 'শতাংশ ১-১০০ এর মধ্যে হতে হবে' : 'Percentage must be between 1 and 100');
      return;
    }

    const payload: Partial<Coupon> = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountValue,
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
        toast.success(isBn ? 'কুপন আপডেট হয়েছে' : 'Coupon updated');
      } else {
        await createCoupon(payload).unwrap();
        toast.success(isBn ? 'কুপন তৈরি হয়েছে' : 'Coupon created');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'ব্যর্থ হয়েছে' : 'Operation failed'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'কুপন' : 'Coupons' },
        ]}
        title={isBn ? 'দোকানের কুপন' : 'Shop coupons'}
        description={
          isBn
            ? 'আপনার দোকানের ডিসকাউন্ট ও প্রোমো কোডসমূহ পরিচালনা করুন।'
            : 'Manage promotional coupons and discount campaigns for your shop.'
        }
        primaryAction={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateModal} className="gap-2">
                <Plus className="h-4 w-4" />
                {isBn ? 'নতুন কুপন' : 'New coupon'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md md:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing
                    ? isBn
                      ? 'কুপন এডিট করুন'
                      : 'Edit coupon'
                    : isBn
                      ? 'নতুন কুপন'
                      : 'New coupon'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-code">{isBn ? 'প্রোমো কোড' : 'Promo code'}</Label>
                    <Input
                      id="coupon-code"
                      required
                      maxLength={40}
                      className="uppercase"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. SHOP20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isBn ? 'ডিসকাউন্ট ধরন' : 'Discount type'}</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          discountType: value as CouponFormState['discountType'],
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          {isBn ? 'শতাংশ (%)' : 'Percentage (%)'}
                        </SelectItem>
                        <SelectItem value="FIXED">
                          {isBn ? 'নির্ধারিত পরিমাণ (৳)' : 'Fixed amount (৳)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-value">
                      {isBn ? 'ডিসকাউন্ট মূল্য' : 'Discount value'}
                    </Label>
                    <Input
                      id="coupon-value"
                      type="number"
                      required
                      min="1"
                      max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    />
                    {formData.discountType === 'PERCENTAGE' && (
                      <p className="text-muted-foreground text-xs">
                        {isBn ? '১ থেকে ১০০ শতাংশ' : 'Between 1 and 100 percent'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-min">
                      {isBn ? 'সর্বনিম্ন অর্ডার (৳)' : 'Min order amount (৳)'}
                    </Label>
                    <Input
                      id="coupon-min"
                      type="number"
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    />
                  </div>

                  {formData.discountType === 'PERCENTAGE' && (
                    <div className="space-y-2">
                      <Label htmlFor="coupon-max">
                        {isBn ? 'সর্বোচ্চ ডিসকাউন্ট (৳)' : 'Max discount amount (৳)'}
                      </Label>
                      <Input
                        id="coupon-max"
                        type="number"
                        min="1"
                        placeholder={isBn ? 'ঐচ্ছিক' : 'Optional'}
                        value={formData.maxDiscountAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, maxDiscountAmount: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="coupon-usage">
                      {isBn ? 'মোট ব্যবহারের সীমা' : 'Total usage limit'}
                    </Label>
                    <Input
                      id="coupon-usage"
                      type="number"
                      min="1"
                      placeholder={isBn ? 'ঐচ্ছিক' : 'Optional'}
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-per-customer">
                      {isBn ? 'গ্রাহক প্রতি সীমা' : 'Limit per customer'}
                    </Label>
                    <Input
                      id="coupon-per-customer"
                      type="number"
                      required
                      min="1"
                      value={formData.customerUsageLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, customerUsageLimit: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-start">{isBn ? 'শুরুর তারিখ' : 'Start date'}</Label>
                    <Input
                      id="coupon-start"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon-end">{isBn ? 'শেষের তারিখ' : 'End date'}</Label>
                    <Input
                      id="coupon-end"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                    {formData.startDate &&
                      formData.endDate &&
                      new Date(formData.endDate) <= new Date(formData.startDate) && (
                        <p className="text-destructive text-xs">
                          {isBn
                            ? 'শেষের তারিখ শুরুর তারিখের পরে হতে হবে'
                            : 'End date must be after the start date'}
                        </p>
                      )}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving
                    ? isBn
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : isBn
                      ? 'সংরক্ষণ করুন'
                      : 'Save coupon'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="border-border bg-card space-y-4 rounded-xl border p-4 sm:p-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                onInputChange(e.target.value);
                setPage(1);
              }}
              placeholder={isBn ? 'কুপন কোড দিয়ে খুঁজুন...' : 'Search by coupon code...'}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full rounded-lg border ps-9 pe-9 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                aria-label={isBn ? 'মুছুন' : 'Clear'}
                onClick={() => {
                  onInputChange('');
                  setPage(1);
                }}
                className="text-muted-foreground hover:text-foreground absolute end-2 top-1/2 -translate-y-1/2 rounded p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as typeof statusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={isBn ? 'সকল স্ট্যাটাস' : 'All status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All status'}</SelectItem>
                <SelectItem value="ACTIVE">{isBn ? 'সক্রিয়' : 'Active'}</SelectItem>
                <SelectItem value="INACTIVE">{isBn ? 'নিষ্ক্রিয়' : 'Inactive'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded-lg border md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-start">{isBn ? 'কোড' : 'Code'}</th>
                <th className="px-4 py-3 text-start">{isBn ? 'ডিসকাউন্ট' : 'Discount'}</th>
                <th className="px-4 py-3 text-start">{isBn ? 'ব্যবহার' : 'Usage'}</th>
                <th className="px-4 py-3 text-start">{isBn ? 'বৈধতা' : 'Validity'}</th>
                <th className="px-4 py-3 text-start">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="px-4 py-3 text-end">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <p className="text-muted-foreground mb-3 text-sm">
                      {isBn ? 'কুপন তথ্য আনা যায়নি।' : 'Could not load coupons.'}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => void refetch()}>
                      {isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
                    </Button>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <EmptyCouponCell
                      hasFilters={hasFilters}
                      isBn={isBn}
                      onClear={handleOpenCreateModal}
                    />
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                    <td className="text-primary px-4 py-3.5 font-mono font-bold">{coupon.code}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-foreground font-semibold">
                        {coupon.discountType === 'PERCENTAGE'
                          ? `${coupon.discountValue}% · ${isBn ? 'সর্বোচ্চ' : 'Max'} ${formatCurrency(coupon.maxDiscountAmount ?? Infinity)}`
                          : formatCurrency(coupon.discountValue)}
                      </span>
                      <div className="text-muted-foreground mt-0.5 text-xs">
                        {isBn ? 'সর্বনিম্ন' : 'Min'}: {formatCurrency(coupon.minOrderAmount)}
                      </div>
                    </td>
                    <td className="text-muted-foreground px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
                        {coupon.startDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(coupon.startDate, lang)}
                          </span>
                        )}
                        {coupon.endDate && (
                          <span
                            className={
                              new Date(coupon.endDate) < new Date()
                                ? 'text-destructive inline-flex items-center gap-1 font-medium'
                                : 'inline-flex items-center gap-1'
                            }
                          >
                            <Calendar className="h-3 w-3" />
                            {formatDate(coupon.endDate, lang)}
                          </span>
                        )}
                        {!coupon.startDate && !coupon.endDate && (
                          <span>{isBn ? 'সবসময় বৈধ' : 'Always valid'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.isActive}
                          onCheckedChange={(val: boolean) => handleToggleActive(coupon.id, val)}
                          aria-label={isBn ? 'কুপন সক্রিয়' : 'Toggle coupon'}
                        />
                        <StatusBadge
                          tone={coupon.isActive ? 'success' : 'neutral'}
                          label={
                            coupon.isActive
                              ? isBn
                                ? 'সক্রিয়'
                                : 'Active'
                              : isBn
                                ? 'নিষ্ক্রিয়'
                                : 'Inactive'
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(coupon)}
                          className="h-8 w-8"
                          aria-label={isBn ? 'সম্পাদনা' : 'Edit'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCouponToDelete(coupon.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          aria-label={isBn ? 'মুছে ফেলুন' : 'Delete'}
                        >
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

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="border-border bg-muted/30 h-32 animate-pulse rounded-lg border"
              />
            ))
          ) : isError ? (
            <div className="border-border rounded-lg border p-6 text-center">
              <p className="text-muted-foreground mb-3 text-sm">
                {isBn ? 'কুপন তথ্য আনা যায়নি।' : 'Could not load coupons.'}
              </p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                {isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
              </Button>
            </div>
          ) : coupons.length === 0 ? (
            <div className="border-border rounded-lg border p-6 text-center">
              <EmptyCouponCell
                hasFilters={hasFilters}
                isBn={isBn}
                onClear={handleOpenCreateModal}
              />
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="border-border bg-card space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-primary truncate font-mono font-bold">{coupon.code}</p>
                    <p className="text-foreground text-sm font-semibold">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% ${isBn ? 'ডিসকাউন্ট' : 'off'}`
                        : `${formatCurrency(coupon.discountValue)} ${isBn ? 'ছাড়' : 'off'}`}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {isBn ? 'সর্বনিম্ন' : 'Min'}: {formatCurrency(coupon.minOrderAmount)}
                    </p>
                  </div>
                  <StatusBadge
                    tone={coupon.isActive ? 'success' : 'neutral'}
                    label={
                      coupon.isActive
                        ? isBn
                          ? 'সক্রিয়'
                          : 'Active'
                        : isBn
                          ? 'নিষ্ক্রিয়'
                          : 'Inactive'
                    }
                  />
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {coupon.usedCount} / {coupon.usageLimit ?? '∞'}
                  </span>
                  {coupon.endDate && (
                    <span
                      className={
                        new Date(coupon.endDate) < new Date()
                          ? 'text-destructive inline-flex items-center gap-1 font-medium'
                          : 'inline-flex items-center gap-1'
                      }
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(coupon.endDate, lang)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.isActive}
                      onCheckedChange={(val: boolean) => handleToggleActive(coupon.id, val)}
                      aria-label={isBn ? 'কুপন সক্রিয়' : 'Toggle coupon'}
                    />
                    <span className="text-muted-foreground text-xs">
                      {isBn ? 'সক্রিয়' : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditModal(coupon)}
                      className="h-9 w-9"
                      aria-label={isBn ? 'সম্পাদনা' : 'Edit'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCouponToDelete(coupon.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                      aria-label={isBn ? 'মুছে ফেলুন' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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

      <ConfirmDialog
        open={!!couponToDelete}
        onOpenChange={(open) => {
          if (!open) setCouponToDelete(null);
        }}
        title={isBn ? 'কুপন মুছে ফেলতে চান?' : 'Delete coupon?'}
        description={
          isBn
            ? 'আপনি কি নিশ্চিত যে আপনি এই ডিসকাউন্ট কুপনটি মুছে ফেলতে চান? গ্রাহকরা আর এই কোডটি ব্যবহার করতে পারবেন না।'
            : 'Are you sure you want to delete this coupon? Customers will no longer be able to apply this promo code.'
        }
        confirmLabel={isBn ? 'মুছে ফেলুন' : 'Delete coupon'}
        cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        isBn={isBn}
      />
    </div>
  );
}

function EmptyCouponCell({
  hasFilters,
  isBn,
  onClear,
}: {
  hasFilters: boolean;
  isBn: boolean;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-muted/60 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <Ticket className="text-muted-foreground/60 h-6 w-6" />
      </div>
      <h3 className="text-foreground mb-1 text-base font-semibold">
        {isBn ? 'কোনো কুপন পাওয়া যায়নি' : 'No coupons found'}
      </h3>
      <p className="text-muted-foreground max-w-sm text-sm">
        {hasFilters
          ? isBn
            ? 'আপনার ফিল্টারের সাথে কোনো কুপন মেলেনি'
            : 'No coupons match your filters.'
          : isBn
            ? 'আপনার দোকানে এখনও কোনো কুপন তৈরি করা হয়নি। প্রথম কুপনটি তৈরি করুন।'
            : 'No coupons yet. Create your first promo code to attract customers.'}
      </p>
      <Button variant="outline" className="mt-4 gap-2" onClick={onClear}>
        <Plus className="h-4 w-4" />
        {isBn ? 'নতুন কুপন তৈরি করুন' : 'Create a coupon'}
      </Button>
    </div>
  );
}
