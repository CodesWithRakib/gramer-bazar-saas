'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import {
  useLoginWithPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Eye, EyeOff, ShieldCheck, Phone, Mail, Lock, Store, Bike } from 'lucide-react';

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
    // If a redirect URL was requested, inspect role permissions
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

      // Default safe redirect (customer pages, checkout, cart, public routes)
      router.push(redirectParam);
      return;
    }

    // Role-neutral default destinations
    if (roles.includes('SUPER_ADMIN')) {
      router.push(`/${lang}/super-admin`);
    } else if (roles.includes('ADMIN')) {
      router.push(`/${lang}/admin`);
    } else if (roles.includes('SELLER')) {
      router.push(`/${lang}/seller`);
    } else if (roles.includes('RIDER')) {
      router.push(`/${lang}/rider`);
    } else {
      router.push(`/${lang}/customer/profile`);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await loginWithPassword({ emailOrPhone, password }).unwrap();
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      handleRoleRedirect(res.user.roles || []);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Login failed. Please check your credentials.'));
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpPhone || otpPhone.length < 11) {
      setErrorMsg(isBn ? 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' : 'Please enter a valid 11-digit mobile number');
      return;
    }

    try {
      await sendOtp({ phone: otpPhone }).unwrap();
      setOtpStep('otp');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP'));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.length < 4) {
      setErrorMsg(isBn ? 'সঠিক ওটিপি কোড দিন' : 'Please enter the verification code');
      return;
    }

    try {
      const res = await verifyOtp({ phone: otpPhone, otp: otpCode }).unwrap();
      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      handleRoleRedirect(res.user.roles || []);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'ভুল ওটিপি কোড' : 'Invalid OTP code'));
    }
  };

  return (
    <div className="w-full max-w-md bg-card border rounded-2xl shadow-lg p-6 sm:p-8">
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
          {isBn ? 'স্বাগতম' : 'Welcome Back'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isBn ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in to access your account'}
        </p>
      </div>

      {/* Auth Mode Toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl mb-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => { setAuthMode('password'); setErrorMsg(''); }}
          className={`py-2 rounded-lg transition-all ${
            authMode === 'password'
              ? 'bg-card text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isBn ? 'পাসওয়ার্ড দিয়ে' : 'With Password'}
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
          className={`py-2 rounded-lg transition-all ${
            authMode === 'otp'
              ? 'bg-card text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {isBn ? 'মোবাইল ওটিপি' : 'Mobile OTP'}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {authMode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone">{isBn ? 'ইমেইল বা মোবাইল নম্বর' : 'Email or Mobile Number'}</Label>
            <div className="relative">
              <Input
                id="emailOrPhone"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={isBn ? '01XXXXXXXXX অথবা email@example.com' : '01XXXXXXXXX or email@example.com'}
                disabled={isPasswordLoading}
                required
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{isBn ? 'পাসওয়ার্ড' : 'Password'}</Label>
              <Link
                href={`/${lang}/forgot-password`}
                className="text-xs text-primary font-medium hover:underline"
              >
                {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isPasswordLoading}
                required
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
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-muted-foreground/30 text-primary focus:ring-primary"
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground cursor-pointer">
              {isBn ? 'আমাকে মনে রাখুন' : 'Remember me'}
            </Label>
          </div>

          <Button type="submit" className="w-full mt-2 h-11 text-base font-semibold" disabled={isPasswordLoading}>
            {isPasswordLoading
              ? (isBn ? 'লগইন হচ্ছে...' : 'Signing in...')
              : (isBn ? 'লগইন করুন' : 'Sign In')}
          </Button>
        </form>
      ) : (
        <div>
          {otpStep === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpPhone">{isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}</Label>
                <div className="relative">
                  <Input
                    id="otpPhone"
                    type="tel"
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    disabled={isSendingOtp}
                    required
                    className="pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isBn ? 'আমরা একটি ৬ সংখ্যার ওটিপি কোড পাঠাব' : 'We will send a 6-digit OTP code to this number'}
                </p>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSendingOtp}>
                {isSendingOtp
                  ? (isBn ? 'ওটিপি পাঠানো হচ্ছে...' : 'Sending OTP...')
                  : (isBn ? 'ওটিপি পাঠান' : 'Send OTP')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpCode">{isBn ? 'ওটিপি কোড দিন' : 'Enter Verification Code'}</Label>
                <div className="relative">
                  <Input
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    disabled={isVerifyingOtp}
                    autoFocus
                    required
                    className="pr-10 text-center tracking-widest text-lg font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {isBn ? `${otpPhone} নম্বরে কোড পাঠানো হয়েছে` : `Code sent to ${otpPhone}`}
                </p>
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isVerifyingOtp}>
                {isVerifyingOtp
                  ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                  : (isBn ? 'যাচাই ও লগইন' : 'Verify & Sign In')}
              </Button>

              <button
                type="button"
                onClick={() => { setOtpStep('phone'); setErrorMsg(''); }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-2"
              >
                {isBn ? '← নম্বর পরিবর্তন করুন' : '← Change mobile number'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Register Footer */}
      <div className="mt-8 pt-6 border-t text-center text-sm">
        <span className="text-muted-foreground">
          {isBn ? 'নতুন ব্যবহারকারী?' : "Don't have an account?"}{' '}
        </span>
        <Link href={`/${lang}/register`} className="font-semibold text-primary hover:underline">
          {isBn ? 'রেজিস্টার করুন' : 'Create an Account'}
        </Link>
      </div>

      {/* Partner Links */}
      <div className="mt-6 pt-4 border-t/60 grid grid-cols-2 gap-2 text-xs text-center text-muted-foreground">
        <Link
          href={`/${lang}/become-a-seller`}
          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium text-foreground/80"
        >
          <Store className="w-3.5 h-3.5 text-primary" />
          <span>{isBn ? 'সেলার আবেদন' : 'Sell with Us'}</span>
        </Link>
        <Link
          href={`/${lang}/become-a-rider`}
          className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors font-medium text-foreground/80"
        >
          <Bike className="w-3.5 h-3.5 text-primary" />
          <span>{isBn ? 'রাইডার আবেদন' : 'Deliver with Us'}</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-muted/20 px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md bg-card border rounded-2xl p-8 text-center text-muted-foreground">
          Loading...
        </div>
      }>
        <LoginForm lang={lang} />
      </Suspense>
    </div>
  );
}
