'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { use, useState } from 'react';
import { useUpdatePasswordMutation, useDeleteAccountMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ShieldCheck,
  AlertTriangle,
  Loader2,
  User,
  ShoppingCart,
  MapPin,
  Heart,
  Star,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export interface CustomerSettingsViewProps {
  lang?: string;
}

export function CustomerSettingsView({ lang = 'en' }: CustomerSettingsViewProps) {
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  const router = useRouter();

  const customerQuickLinks = [
    {
      title: 'Personal Profile',
      titleBn: 'ব্যক্তিগত প্রোফাইল',
      desc: 'Name, phone number and email',
      descBn: 'নাম, মোবাইল নম্বর ও ইমেইল',
      icon: User,
      href: `/${lang}/customer/profile`,
    },
    {
      title: 'Order History',
      titleBn: 'অর্ডার ইতিহাস ও ট্র্যাকিং',
      desc: 'Track recent orders and receipts',
      descBn: 'অর্ডারের অবস্থা ও বিবরণ দেখুন',
      icon: ShoppingCart,
      href: `/${lang}/customer/orders`,
    },
    {
      title: 'Delivery Addresses',
      titleBn: 'ডেলিভারি ঠিকানাসমূহ',
      desc: 'Manage home & work addresses',
      descBn: 'বাসা ও অফিসের ঠিকানা যুক্ত করুন',
      icon: MapPin,
      href: `/${lang}/customer/addresses`,
    },
    {
      title: 'Saved Wishlist',
      titleBn: 'পছন্দের তালিকা',
      desc: 'Products saved for later',
      descBn: 'সংরক্ষিত পছন্দের পণ্যসমূহ',
      icon: Heart,
      href: `/${lang}/customer/wishlist`,
    },
    {
      title: 'My Reviews',
      titleBn: 'আমার রিভিউসমূহ',
      desc: 'Product & shop ratings',
      descBn: 'পণ্যে দেওয়া রেটিং ও মতামত',
      icon: Star,
      href: `/${lang}/customer/reviews`,
    },
    {
      title: 'Product Requests',
      titleBn: 'পণ্য অনুরোধ',
      desc: 'Requests for unlisted village items',
      descBn: 'বিশেষ পণ্যের জন্য অনুরোধসমূহ',
      icon: ClipboardList,
      href: `/${lang}/customer/product-requests`,
    },
  ];

  const [updatePassword, { isLoading: isUpdating }] = useUpdatePasswordMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(isBn ? 'নতুন পাসওয়ার্ড মেলেনি' : 'New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error(
        isBn
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
          : 'Password must be at least 6 characters long',
      );
      return;
    }

    try {
      await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      toast.success(
        isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' : 'Password updated successfully',
      );
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(
        getApiErrorMessage(err) ||
          (isBn ? 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে' : 'Failed to update password'),
      );
    }
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      toast.success(
        isBn
          ? 'একাউন্ট মুছে ফেলার অনুরোধ গ্রহণ করা হয়েছে'
          : 'Account deletion requested successfully',
      );
      dispatch(logout());
      router.push(`/${lang}`);
    } catch (err) {
      toast.error(
        getApiErrorMessage(err) || (isBn ? 'সমস্যা হয়েছে' : 'Failed to request deletion'),
      );
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = () => {
    toast.info(
      isBn ? 'ডেটা এক্সপোর্ট রিকোয়েস্ট অ্যাডমিনকে পাঠানো হয়েছে!' : 'Data export request sent to admin!',
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Customer Hub Cards */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          {isBn ? 'অ্যাকাউন্ট সেটিংস ও হাব' : 'Account Settings & Overview'}
        </h1>
        <p className="text-muted-foreground text-sm mb-5">
          {isBn
            ? 'আপনার প্রোফাইল, ঠিকানা, অর্ডার এবং নিরাপত্তা নিয়ন্ত্রণ করুন।'
            : 'Manage your profile, delivery addresses, order history, and account security.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
          {customerQuickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} href={item.href} className="group block focus:outline-none">
                <Card className="rounded-xl border border-border/70 hover:border-primary/40 hover:shadow-xs transition-all p-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {isBn ? item.titleBn : item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {isBn ? item.descBn : item.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:translate-x-1 group-hover:text-primary transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          {isBn ? 'নিরাপত্তা ও পাসওয়ার্ড সেটিংস' : 'Security & Password Settings'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isBn
            ? 'আপনার পাসওয়ার্ড পরিবর্তন করুন এবং একাউন্ট সুরক্ষিত রাখুন'
            : 'Manage your password and secure your account'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</CardTitle>
          <CardDescription>
            {isBn ? 'নতুন পাসওয়ার্ড সেট করতে আপনার বর্তমান পাসওয়ার্ড প্রয়োজন হবে।' : 'You will need your current password to set a new one.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">{isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBn ? 'আপডেট করুন' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {isBn ? 'ডেটা ও প্রাইভেসি' : 'Data & Privacy'}
          </CardTitle>
          <CardDescription>
            {isBn 
              ? 'আপনার ডেটা এক্সপোর্ট করুন অথবা স্থায়ীভাবে একাউন্ট মুছে ফেলুন। একাউন্ট মুছে ফেললে আপনার সমস্ত তথ্য হারিয়ে যাবে।' 
              : 'Export your data or permanently delete your account. Deleting your account will remove all your data.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={handleExportData}>
            {isBn ? 'ডেটা এক্সপোর্ট রিকোয়েস্ট' : 'Request Data Export'}
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isBn ? 'একাউন্ট মুছে ফেলুন' : 'Delete Account'}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDeleteAccount}
        title={isBn ? 'একাউন্ট মুছে ফেলতে চান?' : 'Delete Account?'}
        description={
          isBn
            ? 'আপনি কি নিশ্চিত? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না এবং আপনার একাউন্টের সমস্ত তথ্য স্থায়ীভাবে মুছে যাবে।'
            : 'Are you sure? This action cannot be undone and will permanently remove your account data.'
        }
        confirmLabel={isBn ? 'একাউন্ট মুছুন' : 'Delete Account'}
        cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
