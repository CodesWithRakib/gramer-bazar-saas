'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ThemePaletteId,
  ThemePaletteDefinition,
  ACTIVE_THEME,
  AVAILABLE_THEMES,
  THEME_STORAGE_KEY,
  getThemePalette,
} from '@/config/theme';

interface ThemePaletteContextType {
  palette: ThemePaletteId;
  setPalette: (id: ThemePaletteId) => void;
  currentTheme: ThemePaletteDefinition;
  availablePalettes: ThemePaletteDefinition[];
}

const ThemePaletteContext = createContext<ThemePaletteContextType | null>(null);

function getInitialPalette(): ThemePaletteId {
  if (typeof window === 'undefined') return ACTIVE_THEME;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemePaletteId | null;
    // Migrate legacy default themes to the new primary brand palette
    if (stored === 'fresh-green' || stored === 'clean') {
      localStorage.setItem(THEME_STORAGE_KEY, ACTIVE_THEME);
      return ACTIVE_THEME;
    }
    if (stored && AVAILABLE_THEMES[stored]) {
      return stored;
    }
  } catch {
    // Ignore localStorage errors
  }
  return ACTIVE_THEME;
}

export function ThemePaletteProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<ThemePaletteId>(getInitialPalette);

  const currentTheme = useMemo(() => getThemePalette(palette), [palette]);

  // Apply Palette Tokens directly to documentElement CSS Variables
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.setAttribute('data-theme', palette);

    const tokens = currentTheme.tokens.light;
    if (tokens) {
      const rootStyle = document.documentElement.style;
      Object.entries(tokens).forEach(([key, value]) => {
        rootStyle.setProperty(`--${key}`, value as string);
      });
    }
  }, [palette, currentTheme]);

  const setPalette = (id: ThemePaletteId) => {
    if (!AVAILABLE_THEMES[id]) return;
    setPaletteState(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === THEME_STORAGE_KEY &&
        e.newValue &&
        AVAILABLE_THEMES[e.newValue as ThemePaletteId]
      ) {
        setPaletteState(e.newValue as ThemePaletteId);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const availablePalettes = useMemo(
    () =>
      Object.values(AVAILABLE_THEMES).filter(
        // Filter out backward compatible aliases so only unique distinct palettes show in UI pickers
        (p, index, self) => self.findIndex((s) => s.nameEn === p.nameEn) === index
      ),
    []
  );

  const value = useMemo(
    () => ({
      palette,
      setPalette,
      currentTheme,
      availablePalettes,
    }),
    [palette, currentTheme, availablePalettes]
  );

  return <ThemePaletteContext.Provider value={value}>{children}</ThemePaletteContext.Provider>;
}

export function useThemePalette(): ThemePaletteContextType {
  const context = useContext(ThemePaletteContext);
  if (!context) {
    throw new Error('useThemePalette must be used within a ThemePaletteProvider');
  }
  return context;
}
