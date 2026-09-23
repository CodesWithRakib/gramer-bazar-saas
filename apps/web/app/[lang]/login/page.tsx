'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useLoginWithPasswordMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function StaffLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const dispatch = useDispatch();
  const isBn = lang === 'bn';

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [loginWithPassword, { isLoading }] = useLoginWithPasswordMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await loginWithPassword({ emailOrPhone, password }).unwrap();
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      
      const roles = res.user.roles || [];
      if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
        router.push(`/${lang}/admin`);
      } else if (roles.includes('SELLER')) {
        router.push(`/${lang}/seller`);
      } else if (roles.includes('RIDER')) {
        router.push(`/${lang}/rider`);
      } else {
        router.push(`/${lang}/profile`);
      }
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'লগইন ব্যর্থ হয়েছে' : 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isBn ? 'স্টাফ লগইন' : 'Staff Login'}
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isBn ? 'অ্যাডমিন, সেলার বা রাইডার হিসেবে লগইন করুন' : 'Login as Admin, Seller, or Rider'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-destructive/10 text-destructive text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone">{isBn ? 'ইমেইল বা ফোন নম্বর' : 'Email or Phone'}</Label>
            <Input
              id="emailOrPhone"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="staff@example.com"
              disabled={isLoading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{isBn ? 'পাসওয়ার্ড' : 'Password'}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading 
              ? (isBn ? 'অপেক্ষা করুন...' : 'Logging in...') 
              : (isBn ? 'লগইন' : 'Login')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isBn ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
          </span>
          <Link href={`/${lang}/register`} className="font-semibold text-primary hover:underline">
            {isBn ? 'রেজিস্টার করুন' : 'Register here'}
          </Link>
        </div>
      </div>
    </div>
  );
}
