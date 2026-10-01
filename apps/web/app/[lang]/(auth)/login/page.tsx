'use client';

import React, { useState, use, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { getApiErrorMessage } from '@/lib/apiError';
import { setCredentials } from '@/store/slices/authSlice';
import {
  useLoginWithPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

function LoginForm({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const isBn = lang === 'bn';

  const redirectParam = searchParams.get('redirect');

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Password login state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP login state
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const [loginWithPassword, { isLoading: isPasswordLoading }] = useLoginWithPasswordMutation();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const handleRoleRedirect = (roles: string[]) => {
    if (redirectParam && redirectParam.startsWith('/')) {
      const isSuperAdminRoute = redirectParam.includes('/super-admin');
      const isAdminRoute = redirectParam.includes('/admin') && !isSuperAdminRoute;
      const isSellerRoute = redirectParam.includes('/seller');
      const isRiderRoute = redirectParam.includes('/rider');

      if (isSuperAdminRoute) {
        if (roles.includes('SUPER_ADMIN')) {
          router.push(redirectParam);
          return;
        }
        router.push(`/${lang}/unauthorized`);
        return;
      }
      if (isAdminRoute) {
        if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
          router.push(redirectParam);
          return;
        }
        router.push(`/${lang}/unauthorized`);
        return;
      }
      if (isSellerRoute) {
        if (roles.includes('SELLER')) {
          router.push(redirectParam);
          return;
        }
        router.push(`/${lang}/unauthorized`);
        return;
      }
      if (isRiderRoute) {
        if (roles.includes('RIDER')) {
          router.push(redirectParam);
          return;
        }
        router.push(`/${lang}/unauthorized`);
        return;
      }
      router.push(redirectParam);
      return;
    }

    if (roles.includes('SUPER_ADMIN')) {
      router.push(`/${lang}/super-admin`);
    } else if (roles.includes('ADMIN')) {
      router.push(`/${lang}/admin`);
    } else if (roles.includes('SELLER')) {
      router.push(`/${lang}/seller`);
    } else if (roles.includes('RIDER')) {
      router.push(`/${lang}/rider`);
    } else {
      router.push(`/${lang}/customer`);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!emailOrPhone.trim()) {
      setErrorMsg(isBn ? 'ইমেইল বা মোবাইল নম্বর দিন' : 'Please provide an email or phone number');
      return;
    }
    if (!password) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড দিন' : 'Please provide your password');
      return;
    }

    try {
      const res = await loginWithPassword({
        emailOrPhone: emailOrPhone.trim(),
        password,
      }).unwrap();

      dispatch(
        setCredentials({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        })
      );
      handleRoleRedirect(res.user.roles || []);
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err) ||
          (isBn
            ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।'
            : 'Login failed. Please verify credentials.')
      );
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpPhone || otpPhone.trim().length < 11) {
      setErrorMsg(
        isBn
          ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)'
          : 'Please enter a valid 11-digit mobile number'
      );
      return;
    }

    try {
      await sendOtp({ phone: otpPhone.trim() }).unwrap();
      setOtpStep('otp');
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err) ||
          (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to dispatch verification code')
      );
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg(isBn ? '৬ সংখ্যার ওটিপি কোড দিন' : 'Please provide the 6-digit OTP code');
      return;
    }

    try {
      const res = await verifyOtp({
        phone: otpPhone.trim(),
        otp: otpCode.trim(),
      }).unwrap();

      dispatch(
        setCredentials({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        })
      );
      handleRoleRedirect(res.user.roles || []);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'ভুল ওটিপি কোড' : 'Invalid OTP code'));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5">
      {/* Header Info */}
      <div className="mb-6 space-y-1.5 text-center sm:text-start">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {isBn ? 'স্বাগতম' : 'Welcome back'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {isBn
            ? 'আপনার অ্যাকাউন্টে প্রবেশ করতে লগইন করুন।'
            : 'Sign in to access your Gramer Bazar account.'}
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-muted/80 rounded-xl mb-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setAuthMode('password');
            setErrorMsg('');
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 ${
            authMode === 'password'
              ? 'bg-background text-primary shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{isBn ? 'পাসওয়ার্ড' : 'Password'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('otp');
            setErrorMsg('');
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 ${
            authMode === 'otp'
              ? 'bg-background text-primary shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{isBn ? 'মোবাইল ওটিপি' : 'Mobile OTP'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Password Mode Form */}
      {authMode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="emailOrPhone" className="text-xs font-semibold text-foreground/90">
              {isBn ? 'ইমেইল বা মোবাইল নম্বর' : 'Email or Mobile Number'}
            </Label>
            <div className="relative">
              <Input
                id="emailOrPhone"
                type="text"
                autoComplete="username"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={
                  isBn ? '01XXXXXXXXX অথবা email@example.com' : '01XXXXXXXXX or email@example.com'
                }
                disabled={isPasswordLoading}
                required
                className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
                {isBn ? 'পাসওয়ার্ড' : 'Password'}
              </Label>
              <Link
                href={`/${lang}/forgot-password`}
                className="text-xs text-primary hover:underline font-semibold"
              >
                {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPasswordLoading}
                required
                className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <Label
              htmlFor="rememberMe"
              className="text-xs text-muted-foreground cursor-pointer font-medium select-none"
            >
              {isBn ? 'আমাকে মনে রাখুন' : 'Remember me'}
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-bold mt-2 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
            disabled={isPasswordLoading}
          >
            {isPasswordLoading
              ? isBn
                ? 'লগইন হচ্ছে...'
                : 'Signing in...'
              : isBn
                ? 'লগইন করুন'
                : 'Sign In'}
          </Button>
        </form>
      ) : (
        <div>
          {otpStep === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otpPhone" className="text-xs font-semibold text-foreground/90">
                  {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
                </Label>
                <div className="relative">
                  <Input
                    id="otpPhone"
                    type="tel"
                    autoComplete="tel"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    disabled={isSendingOtp}
                    required
                    className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
                  />
                  <div className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isBn
                    ? 'আপনার মোবাইল নম্বরে ৬ সংখ্যার ওটিপি কোড পাঠানো হবে।'
                    : 'A 6-digit verification code will be sent to this number.'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-bold mt-2 shadow-md shadow-primary/25 hover:shadow-lg transition-all"
                disabled={isSendingOtp}
              >
                {isSendingOtp
                  ? isBn
                    ? 'ওটিপি পাঠানো হচ্ছে...'
                    : 'Sending OTP...'
                  : isBn
                    ? 'ওটিপি পাঠান'
                    : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otpCode" className="text-xs font-semibold text-foreground/90">
                  {isBn ? 'ওটিপি কোড দিন' : 'Enter Verification Code'}
                </Label>
                <div className="relative">
                  <Input
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    disabled={isVerifyingOtp}
                    autoFocus
                    required
                    maxLength={6}
                    className="h-11 rounded-xl pe-10 text-center tracking-widest text-base font-mono border-border/80 shadow-2xs"
                  />
                  <div className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground text-center mt-1">
                  {isBn ? `${otpPhone} নম্বরে কোড পাঠানো হয়েছে` : `Code sent to ${otpPhone}`}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-bold shadow-md shadow-primary/25"
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp
                  ? isBn
                    ? 'যাচাই করা হচ্ছে...'
                    : 'Verifying...'
                  : isBn
                    ? 'যাচাই ও লগইন'
                    : 'Verify & Sign In'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setOtpStep('phone');
                  setErrorMsg('');
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1 font-medium"
              >
                {isBn ? '← মোবাইল নম্বর পরিবর্তন করুন' : '← Change mobile number'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Register Prompt */}
      <div className="mt-6 pt-5 border-t border-border/60 text-center text-xs">
        <span className="text-muted-foreground">
          {isBn ? 'নতুন ব্যবহারকারী?' : "Don't have an account?"}{' '}
        </span>
        <Link href={`/${lang}/register`} className="font-bold text-primary hover:underline ms-1">
          {isBn ? 'রেজিস্টার করুন' : 'Create an Account'}
        </Link>
      </div>

      {/* Partner Links */}
      <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-2 gap-2.5 text-xs text-center text-muted-foreground">
        <Link
          href={`/${lang}/become-a-seller`}
          className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all text-foreground font-semibold border border-border/60"
        >
          <Store className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{isBn ? 'সেলার হতে আবেদন' : 'Become a Seller'}</span>
        </Link>
        <Link
          href={`/${lang}/become-a-rider`}
          className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all text-foreground font-semibold border border-border/60"
        >
          <Bike className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{isBn ? 'রাইডার হতে আবেদন' : 'Become a Rider'}</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar with Language Switcher */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
        >
          <BrandLogo lang={lang} variant="full" width={140} height={38} />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={lang} />
        </div>
      </header>

      {/* Main Content: Split-Screen on Desktop */}
      <main className="flex-1 flex min-h-0">
        {/* Left Visual Showcase (Desktop Only, Full-Bleed with Atmospheric Overlay) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden text-white border-e border-border/40">
          {/* Background Image */}
          <Image
            src="/banners/banner-village-market.jpg"
            alt={isBn ? 'গ্রামের বাজার' : 'Gramer Bazar Marketplace'}
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
          {/* Directional Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/35 z-0" />

          {/* Top Pill */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isBn ? 'হাইপার-লোকাল গ্রামীণ মার্কেটপ্লেস' : 'Hyperlocal Rural Commerce'}
              </span>
            </span>
          </div>

          {/* Center Editorial Narrative */}
          <div className="relative z-10 space-y-4 max-w-lg my-auto py-8">
            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {isBn
                ? 'স্থানীয় কৃষক ও উদ্যোক্তাদের সেরা পণ্য আপনার দোরগোড়ায়'
                : 'Authentic Rural Commerce Direct from Farms to Doorsteps'}
            </h2>
            <p className="text-sm xl:text-base text-white/85 leading-relaxed font-medium">
              {isBn
                ? 'শতভাগ খাঁটি মধু, ঘানিভাঙা সরিষার তেল, তাজা শাকসবজি ও দেশি মাছ সরাসরি খামারিদের কাছ থেকে দ্রুত ডেলিভারিতে পান।'
                : 'Direct access to authentic village produce, local harvests, and verified merchants delivered with speed and care.'}
            </p>
          </div>

          {/* Bottom Floating Glassmorphic Trust Metric Cards */}
          <div className="relative z-10 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
                <p className="text-base sm:text-lg font-black text-white">১০০% খাঁটি</p>
                <p className="text-[11px] text-white/80 font-medium">
                  {isBn ? 'খামার উৎপাদিত' : 'Farm Fresh'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
                <p className="text-base sm:text-lg font-black text-white">
                  {isBn ? 'নিরাপদ' : 'Safe'}
                </p>
                <p className="text-[11px] text-white/80 font-medium">
                  {isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
                <p className="text-base sm:text-lg font-black text-white">
                  {isBn ? 'দ্রুত' : 'Speedy'}
                </p>
                <p className="text-[11px] text-white/80 font-medium">
                  {isBn ? 'লোকাল রাইডার' : 'Local Riders'}
                </p>
              </div>
            </div>

            {/* Testimonial Banner */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs text-white/90">
              <span className="font-semibold">
                {isBn
                  ? 'খানসামা ও দিনাজপুরের বিশ্বস্ত মার্কেটপ্লেস'
                  : 'Serving Dinajpur & rural markets'}
              </span>
              <span className="text-amber-300 font-bold tracking-wider">★★★★★</span>
            </div>
          </div>
        </div>

        {/* Right Form Area with Framed Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-muted/25 dark:bg-muted/5 overflow-y-auto">
          <Suspense
            fallback={
              <div className="w-full max-w-md mx-auto p-8 text-center text-xs text-muted-foreground">
                Loading...
              </div>
            }
          >
            <LoginForm lang={lang} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
