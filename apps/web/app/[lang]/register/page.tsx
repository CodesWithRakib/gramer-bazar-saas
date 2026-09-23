'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useRegisterStaffMutation } from '@/features/auth/authApi';
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
import Link from 'next/link';

export default function StaffRegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const dispatch = useDispatch();
  const isBn = lang === 'bn';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    role: 'SELLER',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [registerStaff, { isLoading }] = useRegisterStaffMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await registerStaff(formData).unwrap();
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      
      const roles = res.user.roles || [];
      if (roles.includes('SELLER')) {
        router.push(`/${lang}/seller`);
      } else if (roles.includes('RIDER')) {
        router.push(`/${lang}/rider`);
      } else {
        router.push(`/${lang}/profile`);
      }
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' : 'Registration failed'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg bg-card border rounded-2xl shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isBn ? 'স্টাফ রেজিস্ট্রেশন' : 'Staff Registration'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isBn ? 'নতুন সেলার বা রাইডার অ্যাকাউন্ট খুলুন' : 'Create a new Seller or Rider account'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{isBn ? 'নামের প্রথমাংশ' : 'First Name'}</Label>
              <Input id="firstName" value={formData.firstName} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{isBn ? 'নামের শেষাংশ' : 'Last Name'}</Label>
              <Input id="lastName" value={formData.lastName} onChange={handleChange} required disabled={isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{isBn ? 'পাসওয়ার্ড' : 'Password'}</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label>{isBn ? 'রোল নির্বাচন করুন' : 'Select Role'}</Label>
            <Select 
              value={formData.role} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELLER">{isBn ? 'সেলার (Seller)' : 'Seller'}</SelectItem>
                <SelectItem value="RIDER">{isBn ? 'রাইডার (Rider)' : 'Rider'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading 
              ? (isBn ? 'অপেক্ষা করুন...' : 'Registering...') 
              : (isBn ? 'রেজিস্টার' : 'Register')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isBn ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে?' : "Already have an account?"}{' '}
          </span>
          <Link href={`/${lang}/login`} className="font-semibold text-primary hover:underline">
            {isBn ? 'লগইন করুন' : 'Login here'}
          </Link>
        </div>
      </div>
    </div>
  );
}
