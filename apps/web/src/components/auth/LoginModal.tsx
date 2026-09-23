'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setLoginModalOpen, setCredentials } from '@/store/slices/authSlice';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/features/auth/authApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginModal({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.auth.isLoginModalOpen);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const handleClose = () => {
    dispatch(setLoginModalOpen(false));
    // Reset state after transition
    setTimeout(() => {
      setStep('phone');
      setPhone('');
      setOtp('');
      setErrorMsg('');
    }, 300);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!phone || phone.length < 11) {
      setErrorMsg(isBn ? 'দয়া করে একটি সঠিক মোবাইল নম্বর দিন' : 'Please enter a valid mobile number');
      return;
    }

    try {
      await sendOtp({ phone }).unwrap();
      setStep('otp');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP'));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp || otp.length < 4) {
      setErrorMsg(isBn ? 'সঠিক ওটিপি দিন' : 'Enter a valid OTP');
      return;
    }

    try {
      const res = await verifyOtp({ phone, otp }).unwrap();
      dispatch(setCredentials({ 
        user: res.user,
        accessToken: res.accessToken
      }));
      handleClose();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'ভুল ওটিপি' : 'Invalid OTP'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBn ? 'লগইন বা রেজিস্টার করুন' : 'Login or Register'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone'
              ? (isBn ? 'আপনার মোবাইল নম্বর দিন' : 'Enter your mobile number to continue')
              : (isBn ? `আমরা ${phone} নম্বরে একটি কোড পাঠিয়েছি` : `We sent a code to ${phone}`)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {errorMsg && (
            <div className="mb-4 text-sm text-destructive font-medium">
              {errorMsg}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}</Label>
                <Input
                  id="phone"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSending}
                  type="tel"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending 
                  ? (isBn ? 'অপেক্ষা করুন...' : 'Sending...') 
                  : (isBn ? 'পরবর্তী' : 'Continue')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">{isBn ? 'ওটিপি কোড' : 'OTP Code'}</Label>
                <Input
                  id="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isVerifying}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isVerifying}>
                  {isVerifying 
                    ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...') 
                    : (isBn ? 'যাচাই করুন' : 'Verify')}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep('phone')}
                  disabled={isVerifying}
                >
                  {isBn ? 'নম্বর পরিবর্তন করুন' : 'Change Number'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center border-t pt-4">
            <a 
              href={`/${lang}/login`} 
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={handleClose}
            >
              {isBn ? 'অ্যাডমিন/সেলার লগইন' : 'Admin / Seller Login'}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
