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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', palette);
  }, [palette]);

  const setPalette = (id: ThemePaletteId) => {
    if (!AVAILABLE_THEMES[id]) return;
    setPaletteState(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // Ignore localStorage errors
    }
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === THEME_STORAGE_KEY &&
        e.newValue &&
        AVAILABLE_THEMES[e.newValue as ThemePaletteId]
      ) {
        const nextId = e.newValue as ThemePaletteId;
        setPaletteState(nextId);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const currentTheme = useMemo(() => getThemePalette(palette), [palette]);
  const availablePalettes = useMemo(() => Object.values(AVAILABLE_THEMES), []);

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
