'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function InstallPrompt({ lang }: { lang: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const isBn = lang === 'bn';
  const pathname = usePathname();

  // Don't show in admin, seller, or rider routes
  const isProtected = pathname?.includes('/admin') || pathname?.includes('/seller') || pathname?.includes('/rider');

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      // Only show if not previously dismissed
      const hasDismissed = localStorage.getItem('gb-pwa-dismissed');
      if (!hasDismissed && !isProtected) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isProtected]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('gb-pwa-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-[80px] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">
            {isBn ? 'গ্রামের বাজার অ্যাপটি ইনস্টল করুন' : 'Install Gramer Bazar App'}
          </h3>
          <p className="text-xs text-primary-foreground/80">
            {isBn ? 'অফলাইনে কেনাকাটা করতে এবং দ্রুত ব্রাউজ করতে' : 'For offline shopping and faster browsing'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="secondary" onClick={handleInstall} className="h-8 text-xs px-3">
            {isBn ? 'ইনস্টল' : 'Install'}
          </Button>
          <button onClick={handleDismiss} className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1 shadow-md border hover:bg-muted">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
