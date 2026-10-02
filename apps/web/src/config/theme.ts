/**
 * Gramer Bazar - Centralized Color & Theme System
 *
 * This configuration defines the central theme palettes for the entire application.
 * Palettes can be changed here centrally (ACTIVE_THEME) or dynamically via the
 * useThemePalette hook / ThemePaletteProvider.
 */

import { THEME_PALETTES } from '@/theme/palettes';
import { ColorTokens } from '@/theme/types';

export type ThemePaletteId =
  | 'fresh-green'
  | 'emerald'
  | 'forest'
  | 'blue-commerce'
  | 'teal'
  | 'olive'
  | 'terracotta'
  | 'burgundy'
  // Backward compatibility aliases
  | 'clean'
  | 'fresh'
  | 'premium'
  | 'modern'
  | 'warm';

export type ThemeColorTokens = ColorTokens;

export interface ThemePaletteDefinition {
  id: ThemePaletteId;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  primaryHex: string;
  accentHex: string;
  tokens: {
    light: ThemeColorTokens;
    dark?: ThemeColorTokens;
  };
}

/**
 * DEFAULT ACTIVE THEME PALETTE
 * Change this value to switch the active palette globally from a single line of code!
 */
export const ACTIVE_THEME: ThemePaletteId = 'terracotta';

export const THEME_STORAGE_KEY = 'gramer_bazar_theme_palette';

// Map 8 core palettes from theme/palettes.ts
export const AVAILABLE_THEMES: Record<string, ThemePaletteDefinition> = {
  'fresh-green': {
    id: 'fresh-green',
    nameEn: THEME_PALETTES['fresh-green'].name,
    nameBn: THEME_PALETTES['fresh-green'].nameBn,
    descriptionEn: THEME_PALETTES['fresh-green'].description,
    descriptionBn: THEME_PALETTES['fresh-green'].descriptionBn,
    primaryHex: THEME_PALETTES['fresh-green'].primaryHex,
    accentHex: THEME_PALETTES['fresh-green'].accentHex,
    tokens: {
      light: THEME_PALETTES['fresh-green'].tokens.light,
    },
  },
  emerald: {
    id: 'emerald',
    nameEn: THEME_PALETTES['emerald'].name,
    nameBn: THEME_PALETTES['emerald'].nameBn,
    descriptionEn: THEME_PALETTES['emerald'].description,
    descriptionBn: THEME_PALETTES['emerald'].descriptionBn,
    primaryHex: THEME_PALETTES['emerald'].primaryHex,
    accentHex: THEME_PALETTES['emerald'].accentHex,
    tokens: {
      light: THEME_PALETTES['emerald'].tokens.light,
    },
  },
  forest: {
    id: 'forest',
    nameEn: THEME_PALETTES['forest'].name,
    nameBn: THEME_PALETTES['forest'].nameBn,
    descriptionEn: THEME_PALETTES['forest'].description,
    descriptionBn: THEME_PALETTES['forest'].descriptionBn,
    primaryHex: THEME_PALETTES['forest'].primaryHex,
    accentHex: THEME_PALETTES['forest'].accentHex,
    tokens: {
      light: THEME_PALETTES['forest'].tokens.light,
    },
  },
  'blue-commerce': {
    id: 'blue-commerce',
    nameEn: THEME_PALETTES['blue-commerce'].name,
    nameBn: THEME_PALETTES['blue-commerce'].nameBn,
    descriptionEn: THEME_PALETTES['blue-commerce'].description,
    descriptionBn: THEME_PALETTES['blue-commerce'].descriptionBn,
    primaryHex: THEME_PALETTES['blue-commerce'].primaryHex,
    accentHex: THEME_PALETTES['blue-commerce'].accentHex,
    tokens: {
      light: THEME_PALETTES['blue-commerce'].tokens.light,
    },
  },
  teal: {
    id: 'teal',
    nameEn: THEME_PALETTES['teal'].name,
    nameBn: THEME_PALETTES['teal'].nameBn,
    descriptionEn: THEME_PALETTES['teal'].description,
    descriptionBn: THEME_PALETTES['teal'].descriptionBn,
    primaryHex: THEME_PALETTES['teal'].primaryHex,
    accentHex: THEME_PALETTES['teal'].accentHex,
    tokens: {
      light: THEME_PALETTES['teal'].tokens.light,
    },
  },
  olive: {
    id: 'olive',
    nameEn: THEME_PALETTES['olive'].name,
    nameBn: THEME_PALETTES['olive'].nameBn,
    descriptionEn: THEME_PALETTES['olive'].description,
    descriptionBn: THEME_PALETTES['olive'].descriptionBn,
    primaryHex: THEME_PALETTES['olive'].primaryHex,
    accentHex: THEME_PALETTES['olive'].accentHex,
    tokens: {
      light: THEME_PALETTES['olive'].tokens.light,
    },
  },
  terracotta: {
    id: 'terracotta',
    nameEn: THEME_PALETTES['terracotta'].name,
    nameBn: THEME_PALETTES['terracotta'].nameBn,
    descriptionEn: THEME_PALETTES['terracotta'].description,
    descriptionBn: THEME_PALETTES['terracotta'].descriptionBn,
    primaryHex: THEME_PALETTES['terracotta'].primaryHex,
    accentHex: THEME_PALETTES['terracotta'].accentHex,
    tokens: {
      light: THEME_PALETTES['terracotta'].tokens.light,
    },
  },
  burgundy: {
    id: 'burgundy',
    nameEn: THEME_PALETTES['burgundy'].name,
    nameBn: THEME_PALETTES['burgundy'].nameBn,
    descriptionEn: THEME_PALETTES['burgundy'].description,
    descriptionBn: THEME_PALETTES['burgundy'].descriptionBn,
    primaryHex: THEME_PALETTES['burgundy'].primaryHex,
    accentHex: THEME_PALETTES['burgundy'].accentHex,
    tokens: {
      light: THEME_PALETTES['burgundy'].tokens.light,
    },
  },

  // Aliases for previous names to prevent broken states
  clean: {
    id: 'clean',
    nameEn: 'Palette A — Sovereign Emerald (Default)',
    nameBn: 'প্যালেট ক — সোভারেন এমারেল্ড (ডিফল্ট)',
    descriptionEn: 'Executive botanical emerald, crisp slate neutrals.',
    descriptionBn: 'আভিজাত্যপূর্ণ গভীর বোটানিক্যাল এমারেল্ড ও আধুনিক মার্জিত নিউট্রাল ডিজাইন।',
    primaryHex: THEME_PALETTES['emerald'].primaryHex,
    accentHex: THEME_PALETTES['emerald'].accentHex,
    tokens: {
      light: THEME_PALETTES['emerald'].tokens.light,
    },
  },
  fresh: {
    id: 'fresh',
    nameEn: 'Palette B — Fresh Local Commerce',
    nameBn: 'প্যালেট খ — তাজা গ্রামীণ কমার্স',
    descriptionEn: 'Lush organic leaf green, morning dew mist, fresh farm aesthetic.',
    descriptionBn: 'তাজা শাকসবজি ও মাঠের ফসলের সতেজ শ্যামল পাতা সবুজ রং।',
    primaryHex: THEME_PALETTES['fresh-green'].primaryHex,
    accentHex: THEME_PALETTES['fresh-green'].accentHex,
    tokens: {
      light: THEME_PALETTES['fresh-green'].tokens.light,
    },
  },
  premium: {
    id: 'premium',
    nameEn: 'Palette C — Deep Forest Reserve',
    nameBn: 'প্যালেট গ — ডিপ ফরেস্ট রিজার্ভ',
    descriptionEn: 'Prestigious woodland evergreen, dignified contrast.',
    descriptionBn: 'গভীর বনজ সবুজ ও মার্জিত প্রিমিয়াম এক্সক্লুসিভ আভিজাত্য।',
    primaryHex: THEME_PALETTES['forest'].primaryHex,
    accentHex: THEME_PALETTES['forest'].accentHex,
    tokens: {
      light: THEME_PALETTES['forest'].tokens.light,
    },
  },
  modern: {
    id: 'modern',
    nameEn: 'Palette D — Meghna Modern Commerce',
    nameBn: 'প্যালেট ঘ — মেঘনা মডার্ন কমার্স',
    descriptionEn: 'Professional marine blue, deep navy, modern fintech trust.',
    descriptionBn: 'পেশাদার নদীমাতৃক নীল ও প্রযুক্তিগত আর্থিক লেনদেনের নির্ভরযোগ্য রং।',
    primaryHex: THEME_PALETTES['blue-commerce'].primaryHex,
    accentHex: THEME_PALETTES['blue-commerce'].accentHex,
    tokens: {
      light: THEME_PALETTES['blue-commerce'].tokens.light,
    },
  },
  warm: {
    id: 'warm',
    nameEn: 'Palette E — Harvest Gold & Terracotta',
    nameBn: 'প্যালেট ঙ — সোনালী ফসল ও পোড়ামাটি',
    descriptionEn: 'Sun-ripened crops, warm mustard field, rural Bengal hospitality.',
    descriptionBn: 'পাকা ধানের সোনালী আভা ও গ্রামীণ ফসলের উষ্ণ আতিথেয়তা।',
    primaryHex: THEME_PALETTES['terracotta'].primaryHex,
    accentHex: THEME_PALETTES['terracotta'].accentHex,
    tokens: {
      light: THEME_PALETTES['terracotta'].tokens.light,
    },
  },
};

export function getThemePalette(id: string): ThemePaletteDefinition {
  return AVAILABLE_THEMES[id] || AVAILABLE_THEMES['terracotta'];
}
