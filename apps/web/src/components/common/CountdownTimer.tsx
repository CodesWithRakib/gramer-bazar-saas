'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  lang?: string;
  className?: string;
  variant?: 'default' | 'hero';
  onExpire?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(target: Date): TimeRemaining {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isExpired: false };
}

export function CountdownTimer({
  targetDate,
  lang = 'en',
  className = '',
  variant = 'default',
  onExpire,
}: CountdownTimerProps) {
  const isBn = lang === 'bn';
  const target = new Date(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => calculateTimeRemaining(target));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(target);
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-xs font-bold text-destructive px-2.5 py-1 bg-destructive/10 rounded-md">
        {isBn ? 'অফার শেষ হয়েছে' : 'Offer Expired'}
      </span>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  const isHero = variant === 'hero';

  const digitClasses = isHero
    ? 'bg-white text-neutral-900 font-extrabold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm shadow-md min-w-[28px] sm:min-w-[34px] text-center border border-white/40'
    : 'bg-background text-foreground border border-border px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm shadow-xs min-w-[24px] sm:min-w-[28px] text-center';

  const secDigitClasses = isHero
    ? 'bg-rose-600 text-white font-extrabold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm shadow-md min-w-[28px] sm:min-w-[34px] text-center border border-rose-500/50 animate-pulse'
    : 'bg-destructive text-destructive-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm shadow-xs min-w-[24px] sm:min-w-[28px] text-center animate-pulse';

  const labelClasses = isHero
    ? 'text-[9px] sm:text-[10px] text-white/90 font-semibold font-sans mt-0.5'
    : 'text-[8px] sm:text-[9px] text-muted-foreground font-sans mt-0.5';

  const colonClasses = isHero
    ? 'text-white/60 font-bold text-xs sm:text-sm -mt-3'
    : 'text-muted-foreground text-xs sm:text-sm -mt-3';

  return (
    <div
      className={`flex items-center gap-1 sm:gap-1.5 font-mono text-xs sm:text-sm font-bold ${className}`}
    >
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <span className={digitClasses}>{pad(timeLeft.days)}</span>
          <span className={labelClasses}>{isBn ? 'দিন' : 'd'}</span>
        </div>
      )}
      {timeLeft.days > 0 && <span className={colonClasses}>:</span>}

      <div className="flex flex-col items-center">
        <span className={digitClasses}>{pad(timeLeft.hours)}</span>
        <span className={labelClasses}>{isBn ? 'ঘণ্টা' : 'h'}</span>
      </div>
      <span className={colonClasses}>:</span>

      <div className="flex flex-col items-center">
        <span className={digitClasses}>{pad(timeLeft.minutes)}</span>
        <span className={labelClasses}>{isBn ? 'মিনিট' : 'm'}</span>
      </div>
      <span className={colonClasses}>:</span>

      <div className="flex flex-col items-center">
        <span className={secDigitClasses}>{pad(timeLeft.seconds)}</span>
        <span className={labelClasses}>{isBn ? 'সেকেন্ড' : 's'}</span>
      </div>
    </div>
  );
}
