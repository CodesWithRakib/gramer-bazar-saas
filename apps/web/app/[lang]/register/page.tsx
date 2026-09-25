'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useRegisterMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Eye, EyeOff, User, Phone, Mail, Lock, Store, Bike, Sparkles } from 'lucide-react';

export default function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
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
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password.length < 6) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    try {
      const res = await register({
        ...formData,
        role: 'CUSTOMER',
      }).unwrap();

      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      router.push(`/${lang}`);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Registration failed. Please check your information.'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-lg bg-card border rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-md">
              গ
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              {isBn ? 'গ্রামের বাজার' : 'Gramer Bazar'}
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? 'তাজা ও খাঁটি গ্রাম্য পণ্যের দুনিয়ায় আপনাকে স্বাগতম' : 'Join us for fresh and authentic rural products'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{isBn ? 'নামের প্রথমাংশ' : 'First Name'}</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={isBn ? 'আব্দুর' : 'John'}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{isBn ? 'নামের শেষাংশ' : 'Last Name'}</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={isBn ? 'রহিম' : 'Doe'}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                required
                disabled={isLoading}
                className="pr-10"
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                disabled={isLoading}
                className="pr-10"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{isBn ? 'পাসওয়ার্ড' : 'Password'}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isBn ? 'কমপক্ষে ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন' : 'Must be at least 6 characters'}
            </p>
          </div>

          <Button type="submit" className="w-full mt-4 h-11 text-base font-semibold" disabled={isLoading}>
            {isLoading
              ? (isBn ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...')
              : (isBn ? 'রেজিস্টার করুন' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center text-sm">
          <span className="text-muted-foreground">
            {isBn ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
          </span>
          <Link href={`/${lang}/login`} className="font-semibold text-primary hover:underline">
            {isBn ? 'লগইন করুন' : 'Sign In'}
          </Link>
        </div>

        {/* Partner Application Banner */}
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              {isBn ? 'ব্যবসায়ী বা রাইডার হতে চান?' : 'Want to Sell or Deliver?'}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {isBn
              ? 'সেলার বা রাইডার হতে সরাসরি আমাদের পার্টনার পোর্টালে আবেদন করুন। অ্যাডমিন কর্তৃক যাচাইয়ের পর আপনার অ্যাকাউন্ট সক্রিয় হবে।'
              : 'Apply through our partner programs. Your account will be activated upon admin review.'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              href={`/${lang}/become-a-seller`}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-background border hover:bg-muted font-medium text-foreground transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-primary" />
              <span>{isBn ? 'সেলার আবেদন' : 'Seller Program'}</span>
            </Link>
            <Link
              href={`/${lang}/become-a-rider`}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-background border hover:bg-muted font-medium text-foreground transition-colors"
            >
              <Bike className="w-3.5 h-3.5 text-primary" />
              <span>{isBn ? 'রাইডার আবেদন' : 'Rider Program'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
