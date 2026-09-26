'use client';

import React, { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { getApiErrorMessage } from '@/lib/apiError';
import { setCredentials } from '@/store/slices/authSlice';
import { useRegisterMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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
      setErrorMsg(
        getApiErrorMessage(err) ||
          (isBn ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Registration failed. Please check information.')
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar with Language Switcher */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-border/40 shrink-0">
        <Link href={`/${lang}`} className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
          <BrandLogo lang={lang} variant="full" width={140} height={38} />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={lang} />
        </div>
      </header>

      {/* Main Content: Split-Screen on Desktop */}
      <main className="flex-1 flex min-h-0">
        {/* Left Visual Area (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-muted/30 border-r border-border/60">
          <div className="space-y-4 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isBn ? 'নতুন গ্রাহক নিবন্ধন' : 'Join Gramer Bazar'}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              {isBn
                ? 'তাজা ও খাঁটি গ্রাম্য পণ্যের সাথে যুক্ত হোন'
                : 'Discover authentic, fresh products direct from local farms'}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? 'একটি অ্যাকাউন্ট খুলে সহজেই আপনার পছন্দের পণ্য অর্ডার করুন, অর্ডার ট্র্যাক করুন এবং সেরা অফার উপভোগ করুন।'
                : 'Create an account to track orders in real-time, save your favourite local sellers, and enjoy seamless doorstep delivery.'}
            </p>
          </div>

          <div className="my-8 relative rounded-xl overflow-hidden border border-border/60 shadow-xs aspect-[16/10] max-w-lg">
            <Image
              src="/banners/banner-village-market.jpg"
              alt={isBn ? 'গ্রামের বাজার' : 'Gramer Bazar Marketplace'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/60 max-w-lg text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">{isBn ? 'সহজ অর্ডার' : 'Easy Ordering'}</p>
                <p className="text-[11px] mt-0.5">{isBn ? 'দ্রুত কেনাকাটা' : 'Fast checkout'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">{isBn ? 'লাইভ ট্র্যাকিং' : 'Live Tracking'}</p>
                <p className="text-[11px] mt-0.5">{isBn ? 'অর্ডার আপডেট' : 'Real-time updates'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">{isBn ? 'গ্রাহক সহায়তা' : 'Help & Support'}</p>
                <p className="text-[11px] mt-0.5">{isBn ? 'সার্বক্ষণিক সেবা' : 'Dedicated care'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Brand Link */}
            <div className="lg:hidden mb-6">
              <Link href={`/${lang}`} className="inline-flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  <Store className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-foreground tracking-tight">
                  {isBn ? 'গ্রামের বাজার' : 'Gramer Bazar'}
                </span>
              </Link>
            </div>

            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isBn
                  ? 'তাজা ও খাঁটি গ্রাম্য পণ্যের দুনিয়ায় আপনাকে স্বাগতম'
                  : 'Join Gramer Bazar for authentic rural produce and groceries.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-medium">
                    {isBn ? 'নামের প্রথমাংশ' : 'First Name'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={isBn ? 'আব্দুর' : 'John'}
                      required
                      disabled={isLoading}
                      className="h-10 pr-9 text-sm"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-medium">
                    {isBn ? 'নামের শেষাংশ' : 'Last Name'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={isBn ? 'রহিম' : 'Doe'}
                      required
                      disabled={isLoading}
                      className="h-10 pr-9 text-sm"
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">
                  {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    required
                    disabled={isLoading}
                    className="h-10 pr-9 text-sm"
                  />
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  {isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    disabled={isLoading}
                    className="h-10 pr-9 text-sm"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">
                  {isBn ? 'পাসওয়ার্ড' : 'Password'}
                </Label>
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
                    className="h-10 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isBn ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন' : 'Must be at least 6 characters'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium mt-3"
                disabled={isLoading}
              >
                {isLoading
                  ? isBn
                    ? 'অ্যাকাউন্ট তৈরি হচ্ছে...'
                    : 'Creating Account...'
                  : isBn
                  ? 'রেজিস্টার করুন'
                  : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/60 text-center text-xs">
              <span className="text-muted-foreground">
                {isBn ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
              </span>
              <Link href={`/${lang}/login`} className="font-semibold text-primary hover:underline">
                {isBn ? 'লগইন করুন' : 'Sign In'}
              </Link>
            </div>

            {/* Partner Program Links */}
            <div className="mt-5 p-3.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
              <p className="font-semibold text-foreground mb-1">
                {isBn ? 'ব্যবসায়ী বা রাইডার হতে চান?' : 'Want to Sell or Deliver?'}
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                {isBn
                  ? 'সেলার বা রাইডার হতে সরাসরি আমাদের পার্টনার পোর্টালে আবেদন করুন।'
                  : 'Apply through our partner programs to join our merchant or delivery network.'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/${lang}/become-a-seller`}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-background border border-border hover:bg-muted text-foreground font-medium transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isBn ? 'সেলার আবেদন' : 'Seller Program'}</span>
                </Link>
                <Link
                  href={`/${lang}/become-a-rider`}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-background border border-border hover:bg-muted text-foreground font-medium transition-colors"
                >
                  <Bike className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isBn ? 'রাইডার আবেদন' : 'Rider Program'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
