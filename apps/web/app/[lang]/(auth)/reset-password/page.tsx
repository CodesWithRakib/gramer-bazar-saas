'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPasswordMutation, useSendOtpMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';

function ResetPasswordForm({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBn = lang === 'bn';

  const initialPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  const handleResend = async () => {
    if (!phone) return;
    try {
      await sendOtp({ phone }).unwrap();
      setErrorMsg('');
      setSuccessMsg(isBn ? 'নতুন ওটিপি কোড পাঠানো হয়েছে' : 'A new OTP code has been sent');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'কোড পুনরায় পাঠাতে ব্যর্থ' : 'Failed to resend code'));
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(isBn ? 'উভয় পাসওয়ার্ড এক হতে হবে' : 'Passwords do not match');
      return;
    }

    try {
      await resetPassword({ phone, otp, newPassword }).unwrap();
      setSuccessMsg(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! লগইন করুন।' : 'Password reset successfully! Please sign in.');
      setTimeout(() => {
        router.push(`/${lang}/login`);
      }, 2000);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' : 'Failed to reset password. Check your OTP.'));
    }
  };

  return (
    <div className="w-full max-w-md bg-card border rounded-xl p-6 sm:p-8">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {isBn ? 'নতুন পাসওয়ার্ড নির্ধারণ' : 'Set New Password'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isBn ? 'ভেরিফিকেশন কোড ও নতুন পাসওয়ার্ড লিখুন' : 'Enter your verification code and choose a new password'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isResetting}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="otp">{isBn ? '৬ সংখ্যার ওটিপি কোড' : '6-digit OTP Code'}</Label>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !phone}
              className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'পুনরায় কোড পাঠান' : 'Resend Code'}</span>
            </button>
          </div>
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            required
            disabled={isResetting}
            className="tracking-widest font-mono text-center text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">{isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={isResetting}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            disabled={isResetting}
          />
        </div>

        <Button type="submit" className="w-full mt-2 h-11 text-base font-semibold" disabled={isResetting}>
          {isResetting
            ? (isBn ? 'পরিবর্তন করা হচ্ছে...' : 'Resetting Password...')
            : (isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Reset Password')}
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t text-center">
        <Link
          href={`/${lang}/login`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Back to Login'}</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Brand Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BrandLogo lang={lang} variant="full" width={140} height={38} />
        </Link>
        <LanguageSwitcher currentLocale={lang} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={
          <div className="w-full max-w-md bg-card border rounded-xl p-8 text-center text-muted-foreground">
            Loading...
          </div>
        }>
          <ResetPasswordForm lang={lang} />
        </Suspense>
      </main>
    </div>
  );
}
