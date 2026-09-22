'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { use, useState, useEffect, useRef } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, User, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomImage } from '@/components/ui/CustomImage';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';

export default function PersonalInfoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const dispatch = useDispatch();

  const { data: profile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [prevProfileId, setPrevProfileId] = useState<string | undefined>(
    undefined,
  );
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
      }).unwrap();
      
      dispatch(setUser(response.user));
      toast.success(isBn ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে' : 'Profile updated successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || (isBn ? 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' : 'Failed to update profile'));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isBn ? 'ছবির সাইজ ৫MB এর বেশি হতে পারবে না' : 'File size cannot exceed 5MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await uploadAvatar(uploadData).unwrap();
      
      // Update redux store with new avatar
      if (profile) {
        dispatch(setUser({ ...profile, avatar: response.avatarUrl }));
      }
      
      toast.success(isBn ? 'ছবি সফলভাবে আপলোড হয়েছে' : 'Avatar uploaded successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || (isBn ? 'ছবি আপলোড করতে সমস্যা হয়েছে' : 'Failed to upload avatar'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="w-24 h-24 rounded-full" />
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

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      return url.replace(/\/api$/, '');
    }
    return 'http://localhost:3001';
  };

  const getFullAvatarUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${getApiBaseUrl()}${path}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold">{isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}</h2>
        <p className="text-muted-foreground text-sm">
          {isBn ? 'আপনার ব্যক্তিগত তথ্য আপডেট করুন' : 'Update your personal details here'}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-muted bg-muted/50 flex items-center justify-center relative">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : profile?.avatar ? (
                  <CustomImage 
                    src={getFullAvatarUrl(profile.avatar) as string} 
                    alt="Avatar" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
                
                {/* Hover overlay */}
                {!isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp"
              />
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-lg">{profile?.firstName} {profile?.lastName}</h3>
              <p className="text-muted-foreground text-sm mb-2">{profile?.phone}</p>
              <Button variant="outline" size="sm" onClick={handleAvatarClick} disabled={isUploading}>
                {isUploading 
                  ? (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...') 
                  : (isBn ? 'ছবি পরিবর্তন করুন' : 'Change Avatar')
                }
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">{isBn ? 'নামের প্রথমাংশ' : 'First Name'}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{isBn ? 'নামের শেষাংশ' : 'Last Name'}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</Label>
                <Input
                  id="phone"
                  value={profile?.phone || ''}
                  disabled
                  className="bg-muted/50"
                  title={isBn ? 'ফোন নম্বর পরিবর্তন করা যাবে না' : 'Phone number cannot be changed'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted/50"
                  title={isBn ? 'ইমেইল পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন' : 'Contact support to change email'}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isBn ? 'সেভ করুন' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
