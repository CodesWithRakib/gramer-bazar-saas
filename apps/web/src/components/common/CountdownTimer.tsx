'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  lang?: string;
  className?: string;
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

export function CountdownTimer({ targetDate, lang = 'en', className = '', onExpire }: CountdownTimerProps) {
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

  return (
    <div className={`flex items-center gap-1.5 font-mono text-xs md:text-sm font-bold ${className}`}>
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <span className="bg-background text-foreground border border-border px-2 py-1 rounded shadow-xs">
            {pad(timeLeft.days)}
          </span>
          <span className="text-[9px] text-muted-foreground font-sans mt-0.5">
            {isBn ? 'দিন' : 'd'}
          </span>
        </div>
      )}
      {timeLeft.days > 0 && <span className="text-muted-foreground">:</span>}

      <div className="flex flex-col items-center">
        <span className="bg-background text-foreground border border-border px-2 py-1 rounded shadow-xs">
          {pad(timeLeft.hours)}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans mt-0.5">
          {isBn ? 'ঘণ্টা' : 'h'}
        </span>
      </div>
      <span className="text-muted-foreground">:</span>

      <div className="flex flex-col items-center">
        <span className="bg-background text-foreground border border-border px-2 py-1 rounded shadow-xs">
          {pad(timeLeft.minutes)}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans mt-0.5">
          {isBn ? 'মিনিট' : 'm'}
        </span>
      </div>
      <span className="text-muted-foreground">:</span>

      <div className="flex flex-col items-center">
        <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded shadow-xs animate-pulse">
          {pad(timeLeft.seconds)}
        </span>
        <span className="text-[9px] text-muted-foreground font-sans mt-0.5">
          {isBn ? 'সেকেন্ড' : 's'}
        </span>
      </div>
    </div>
  );
}
