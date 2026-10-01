'use client';

import React from 'react';
import { ThemePaletteSwitcher } from './ThemePaletteSwitcher';

export function ThemeDevToolbar({ lang = 'bn' }: { lang?: string }) {
  return (
    <div
      aria-label="Theme Palette & Toast Controls"
      className="fixed bottom-4 start-4 z-[9990] flex items-center gap-2 print:hidden"
    >
      <ThemePaletteSwitcher lang={lang} showToastDemo />
    </div>
  );
}
