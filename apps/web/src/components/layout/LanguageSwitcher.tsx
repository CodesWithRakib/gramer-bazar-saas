'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, Locale } from '@/config/i18n';

interface LanguageSwitcherProps {
  currentLocale: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

const LANGUAGES = [
  { code: 'bn', label: 'বাংলা', shortLabel: 'বাং', flag: '🇧🇩' },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
];

function persistLocalePreference(newLocale: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = newLocale;
    try {
      localStorage.setItem('gb_locale', newLocale);
    } catch {
      // Ignore
    }
  }
}

export function LanguageSwitcher({
  currentLocale,
  variant = 'ghost',
  size = 'sm',
  className = '',
  showLabel = true,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();

  const activeLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // 1. Persist user choice in cookie and localStorage
    persistLocalePreference(newLocale);

    // 2. Compute target pathname preserving exact route namespace, dynamic slugs, and sub-paths
    let targetPath = pathname;
    const segments = pathname.split('/');
    if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
      targetPath = segments.join('/');
    } else {
      targetPath = `/${newLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
    }

    // 5. Retain all existing URL search parameters (filters, pagination, tabs, query, etc.)
    const queryString = searchParams?.toString();
    const finalUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

    // 6. Fast client-side navigation without full-page flash or socket disconnect
    router.push(finalUrl);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-1.5 font-medium rounded-full ${className}`}
          aria-label={`Select language. Current language is ${activeLang.label}`}
        >
          <Globe className="h-4 w-4 opacity-80" />
          {showLabel && (
            <span className="text-xs uppercase font-semibold">
              {activeLang.shortLabel}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 p-1 rounded-xl shadow-lg border-muted">
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === currentLocale;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLocaleChange(lang.code)}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer ${
                isSelected ? 'bg-primary/10 text-primary font-semibold' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
