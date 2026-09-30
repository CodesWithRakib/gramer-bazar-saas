'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState, useRef } from 'react';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { customToast as toast } from '@/components/ui/custom-toast';
import { Camera, Loader2, User, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomImage } from '@/components/ui/CustomImage';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/ErrorState';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';

export interface CustomerProfileViewProps {
  lang?: string;
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export function CustomerProfileView({ lang = 'en' }: CustomerProfileViewProps) {
  const isBn = lang === 'bn';
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Sync the form when a different profile arrives (no effect needed).
  const [prevProfileId, setPrevProfileId] = useState<string | undefined>(undefined);
  if (profile && profile.id !== prevProfileId) {
    setPrevProfileId(profile.id);
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
    });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
      }).unwrap();

      dispatch(setUser(response.user));
      toast.success(isBn ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated');
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isBn ? 'প্রোফাইল আপডেট করা যায়নি' : 'Could not update your profile'
        )
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(isBn ? 'ছবির আকার ৫MB এর বেশি হতে পারবে না' : 'Image size cannot exceed 5MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await uploadAvatar(uploadData).unwrap();

      if (profile) {
        dispatch(setUser({ ...profile, avatar: response.avatarUrl }));
      }
      await refetch();

      toast.success(isBn ? 'ছবি আপলোড হয়েছে' : 'Photo updated');
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, isBn ? 'ছবি আপলোড করা যায়নি' : 'Could not upload the photo')
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const header = (
    <PageHeader
      title={isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
      description={
        isBn
          ? 'আপনার নাম ও ছবি আপডেট করুন। ফোন নম্বর ও ইমেইল পরিবর্তনের জন্য সাপোর্টে যোগাযোগ করুন।'
          : 'Update your name and photo. Contact support to change your phone number or email.'
      }
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="rounded-2xl border-border/70">
          <CardContent className="p-6">
            <div className="mb-8 flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError && !profile) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState
          isBn={isBn}
          title={isBn ? 'প্রোফাইল লোড করা যায়নি' : 'Failed to load your profile'}
          message={
            isBn
              ? 'আপনার প্রোফাইলের তথ্য সংগ্রহ করা যায়নি। আবার চেষ্টা করুন।'
              : 'We could not retrieve your profile details. Please try again.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {header}

      <Card className="rounded-2xl border-border/70">
        <CardContent className="p-5 sm:p-6 md:p-8">
          <div className="mb-8 flex flex-col items-center gap-5 border-b border-border/60 pb-6 sm:flex-row">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-muted bg-muted/50 sm:h-28 sm:w-28">
              {isUploading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : profile?.avatar ? (
                <CustomImage
                  src={profile.avatar}
                  alt={isBn ? 'প্রোফাইল ছবি' : 'Profile photo'}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 text-center sm:text-start">
              <h3 className="truncate text-lg font-semibold">
                {profile?.firstName} {profile?.lastName}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">{profile?.phone}</p>
              <label
                htmlFor="avatar-upload"
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted focus-within:ring-2 focus-within:ring-ring"
              >
                <Camera className="h-4 w-4" />
                {isUploading
                  ? isBn
                    ? 'আপলোড হচ্ছে...'
                    : 'Uploading...'
                  : isBn
                    ? 'ছবি পরিবর্তন করুন'
                    : 'Change photo'}
              </label>
              <input
                id="avatar-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="sr-only"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploading}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{isBn ? 'নামের প্রথমাংশ' : 'First name'}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder={isBn ? 'রহিম' : 'Rahim'}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{isBn ? 'নামের শেষাংশ' : 'Last name'}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder={isBn ? 'মিয়া' : 'Mia'}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Mobile number'}</Label>
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  readOnly
                  disabled
                  className="bg-muted/50"
                  aria-describedby="phone-hint"
                />
                <p
                  id="phone-hint"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {isBn
                    ? 'নিরাপত্তার জন্য নম্বর পরিবর্তন করা যায় না'
                    : 'Locked for account security'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{isBn ? 'ইমেইল' : 'Email address'}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  readOnly
                  disabled
                  className="bg-muted/50"
                  aria-describedby="email-hint"
                />
                <p id="email-hint" className="text-xs text-muted-foreground">
                  {isBn
                    ? 'ইমেইল পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন'
                    : 'Contact support to change your email'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isUpdating} className="w-full rounded-xl sm:w-auto">
                {isUpdating && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
