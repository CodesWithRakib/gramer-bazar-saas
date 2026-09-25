'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateUserMutation, Role } from '@/features/users/usersApi';
import { getApiErrorMessage } from '@/lib/apiError';
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
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminCreateUserPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const router = useRouter();
  const isBn = lang === 'bn';

  const [createUser, { isLoading }] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    role: Role.ADMIN,
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await createUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        password: formData.password,
        role: formData.role,
      }).unwrap();

      toast.success(
        isBn
          ? 'নতুন ব্যবহারকারী সফলভাবে তৈরি হয়েছে'
          : 'User created successfully'
      );
      router.push(`/${lang}/super-admin/admins`);
    } catch (err) {
      const msg = getApiErrorMessage(err) || (isBn ? 'ব্যবহারকারী তৈরি ব্যর্থ হয়েছে' : 'Failed to create user');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/super-admin`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isBn ? 'নতুন স্টাফ বা অ্যাডমিন তৈরি' : 'Create Staff or Admin User'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn
              ? 'নির্দিষ্ট রোলে নতুন সিস্টেম ইউজার যুক্ত করুন।'
              : 'Provision a new administrative or operational account.'}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{isBn ? 'নামের প্রথমাংশ' : 'First Name'}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                required
                disabled={isLoading}
                placeholder="Rahim"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{isBn ? 'নামের শেষাংশ' : 'Last Name'}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                required
                disabled={isLoading}
                placeholder="Uddin"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              required
              disabled={isLoading}
              placeholder="01711223344"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              disabled={isLoading}
              placeholder="admin@gramerbazar.com"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{isBn ? 'প্রাথমিক পাসওয়ার্ড' : 'Initial Password'}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
              disabled={isLoading}
              placeholder="••••••••"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>{isBn ? 'রোল নির্বাচন করুন' : 'Select Role'}</Label>
            <Select
              value={formData.role}
              onValueChange={(val: Role) => setFormData((p) => ({ ...p, role: val }))}
              disabled={isLoading}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.ADMIN}>ADMIN (System Administrator)</SelectItem>
                <SelectItem value={Role.SUPER_ADMIN}>SUPER_ADMIN (Master Control)</SelectItem>
                <SelectItem value={Role.SELLER}>SELLER (Shop Merchant)</SelectItem>
                <SelectItem value={Role.RIDER}>RIDER (Delivery Agent)</SelectItem>
                <SelectItem value={Role.CUSTOMER}>CUSTOMER (Regular Shopper)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-1/2 rounded-xl"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" className="w-1/2 rounded-xl" disabled={isLoading}>
              {isLoading ? (isBn ? 'তৈরি হচ্ছে...' : 'Creating...') : (isBn ? 'ব্যবহারকারী তৈরি করুন' : 'Create User')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
