/**
 * Gramer Bazar - Centralized Color & Theme System
 *
 * This configuration defines the central theme palettes for the entire application.
 * Palettes can be changed here centrally (ACTIVE_THEME) or dynamically via the
 * useThemePalette hook / ThemePaletteProvider.
 */

export type ThemePaletteId = 'clean' | 'fresh' | 'premium' | 'modern' | 'warm';

export interface ThemeColorTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
  surface: string;
  surfaceMuted: string;
  price: string;
  discount: string;
  discountForeground: string;
  rating: string;
  stock: string;
  stockForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  destructive: string;
  destructiveForeground: string;
  info: string;
  infoForeground: string;
}

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
    dark: ThemeColorTokens;
  };
}

/**
 * DEFAULT ACTIVE THEME PALETTE
 * Change this value to switch the active palette globally from a single line of code!
 */
export const ACTIVE_THEME: ThemePaletteId = 'clean';

export const THEME_STORAGE_KEY = 'gramer_bazar_theme_palette';

export const AVAILABLE_THEMES: Record<ThemePaletteId, ThemePaletteDefinition> = {
  clean: {
    id: 'clean',
    nameEn: 'Palette A — Clean Marketplace',
    nameBn: 'প্যালেট ক — পরিচ্ছন্ন বাজার',
    descriptionEn:
      'Professional, trustworthy, commerce-oriented with balanced forest green and crisp neutrals.',
    descriptionBn: 'পেশাদার, নির্ভরযোগ্য এবং স্বচ্ছ গ্রামীণ ই-কমার্স ভিজ্যুয়াল ডিজাইন।',
    primaryHex: '#16a34a',
    accentHex: '#dcfce7',
    tokens: {
      light: {
        background: '0 0% 98%',
        foreground: '222.2 84% 4.9%',
        card: '0 0% 100%',
        cardForeground: '222.2 84% 4.9%',
        popover: '0 0% 100%',
        popoverForeground: '222.2 84% 4.9%',
        primary: '142.1 76.2% 36.3%',
        primaryForeground: '355.7 100% 97.3%',
        primaryHover: '142.1 76.2% 31%',
        secondary: '210 40% 96.1%',
        secondaryForeground: '222.2 47.4% 11.2%',
        muted: '210 40% 96.1%',
        mutedForeground: '215.4 16.3% 46.9%',
        accent: '142.1 40% 96%',
        accentForeground: '142.1 76.2% 25%',
        border: '214.3 31.8% 91.4%',
        input: '214.3 31.8% 91.4%',
        ring: '142.1 76.2% 36.3%',
        surface: '0 0% 100%',
        surfaceMuted: '210 40% 98%',
        price: '142.1 76.2% 32%',
        discount: '0 84.2% 60.2%',
        discountForeground: '210 40% 98%',
        rating: '38 92% 50%',
        stock: '142 76% 36%',
        stockForeground: '355.7 100% 97.3%',
        success: '142 76% 36%',
        successForeground: '355.7 100% 97.3%',
        warning: '38 92% 50%',
        warningForeground: '48 96% 89%',
        destructive: '0 84.2% 60.2%',
        destructiveForeground: '210 40% 98%',
        info: '214 95% 54%',
        infoForeground: '210 40% 98%',
      },
      dark: {
        background: '222.2 84% 4.9%',
        foreground: '210 40% 98%',
        card: '222.2 84% 4.9%',
        cardForeground: '210 40% 98%',
        popover: '222.2 84% 4.9%',
        popoverForeground: '210 40% 98%',
        primary: '142.1 70.6% 45.3%',
        primaryForeground: '144.9 80.4% 10%',
        primaryHover: '142.1 70.6% 50%',
        secondary: '217.2 32.6% 17.5%',
        secondaryForeground: '210 40% 98%',
        muted: '217.2 32.6% 17.5%',
        mutedForeground: '215 20.2% 65.1%',
        accent: '217.2 32.6% 17.5%',
        accentForeground: '210 40% 98%',
        border: '217.2 32.6% 17.5%',
        input: '217.2 32.6% 17.5%',
        ring: '142.1 70.6% 45.3%',
        surface: '222.2 84% 6%',
        surfaceMuted: '217.2 32.6% 14%',
        price: '142.1 70.6% 45.3%',
        discount: '0 62.8% 50%',
        discountForeground: '210 40% 98%',
        rating: '38 92% 50%',
        stock: '142 70% 45%',
        stockForeground: '144.9 80.4% 10%',
        success: '142 70% 45%',
        successForeground: '144.9 80.4% 10%',
        warning: '38 92% 50%',
        warningForeground: '48 96% 89%',
        destructive: '0 62.8% 45%',
        destructiveForeground: '210 40% 98%',
        info: '214 95% 54%',
        infoForeground: '210 40% 98%',
      },
    },
  },

  fresh: {
    id: 'fresh',
    nameEn: 'Palette B — Fresh Local Commerce',
    nameBn: 'প্যালেট খ — সতেজ স্থানীয় বাণিজ্য',
    descriptionEn:
      'Vibrant organic leaf green, fresh morning mist surfaces, perfect for fresh produce and groceries.',
    descriptionBn: 'তাজা শাকসবজি ও ফলমূলের জন্য প্রাকৃতিকভাবে সতেজ ও প্রাণবন্ত রঙের বিন্যাস।',
    primaryHex: '#15803d',
    accentHex: '#ecfccb',
    tokens: {
      light: {
        background: '140 20% 99%',
        foreground: '150 40% 8%',
        card: '0 0% 100%',
        cardForeground: '150 40% 8%',
        popover: '0 0% 100%',
        popoverForeground: '150 40% 8%',
        primary: '152 76% 36%',
        primaryForeground: '0 0% 100%',
        primaryHover: '152 76% 30%',
        secondary: '145 35% 95%',
        secondaryForeground: '152 65% 15%',
        muted: '145 25% 94%',
        mutedForeground: '150 15% 44%',
        accent: '85 55% 92%',
        accentForeground: '152 70% 20%',
        border: '145 24% 88%',
        input: '145 24% 88%',
        ring: '152 76% 36%',
        surface: '0 0% 100%',
        surfaceMuted: '145 30% 97%',
        price: '152 80% 30%',
        discount: '352 85% 58%',
        discountForeground: '0 0% 100%',
        rating: '42 96% 48%',
        stock: '152 72% 34%',
        stockForeground: '0 0% 100%',
        success: '152 76% 36%',
        successForeground: '0 0% 100%',
        warning: '42 96% 48%',
        warningForeground: '42 96% 92%',
        destructive: '352 85% 58%',
        destructiveForeground: '0 0% 100%',
        info: '200 90% 48%',
        infoForeground: '0 0% 100%',
      },
      dark: {
        background: '150 35% 5%',
        foreground: '140 20% 96%',
        card: '150 35% 7%',
        cardForeground: '140 20% 96%',
        popover: '150 35% 7%',
        popoverForeground: '140 20% 96%',
        primary: '152 70% 45%',
        primaryForeground: '150 60% 8%',
        primaryHover: '152 70% 50%',
        secondary: '150 25% 14%',
        secondaryForeground: '140 20% 94%',
        muted: '150 20% 14%',
        mutedForeground: '145 15% 62%',
        accent: '150 25% 16%',
        accentForeground: '140 20% 94%',
        border: '150 20% 16%',
        input: '150 20% 16%',
        ring: '152 70% 45%',
        surface: '150 30% 8%',
        surfaceMuted: '150 25% 12%',
        price: '152 70% 48%',
        discount: '352 75% 54%',
        discountForeground: '0 0% 100%',
        rating: '42 96% 50%',
        stock: '152 70% 45%',
        stockForeground: '150 60% 8%',
        success: '152 70% 45%',
        successForeground: '150 60% 8%',
        warning: '42 96% 50%',
        warningForeground: '42 96% 92%',
        destructive: '352 75% 52%',
        destructiveForeground: '0 0% 100%',
        info: '200 90% 52%',
        infoForeground: '0 0% 100%',
      },
    },
  },

  premium: {
    id: 'premium',
    nameEn: 'Palette C — Premium Minimal',
    nameBn: 'প্যালেট গ — প্রিমিয়াম মিনিমাল',
    descriptionEn:
      'Understated luxury with deep Nordic pine, alabaster surfaces, and refined typography.',
    descriptionBn: 'আভিজাত্যপূর্ণ শান্ত সাইপ্রেস গ্রিন ও মার্জিত মিনিমালিস্টিক স্টাইল।',
    primaryHex: '#1f4d45',
    accentHex: '#e2ece9',
    tokens: {
      light: {
        background: '220 15% 98.5%',
        foreground: '220 30% 10%',
        card: '0 0% 100%',
        cardForeground: '220 30% 10%',
        popover: '0 0% 100%',
        popoverForeground: '220 30% 10%',
        primary: '168 52% 26%',
        primaryForeground: '160 30% 98%',
        primaryHover: '168 52% 21%',
        secondary: '215 20% 95%',
        secondaryForeground: '215 30% 15%',
        muted: '215 15% 93%',
        mutedForeground: '215 12% 48%',
        accent: '168 25% 94%',
        accentForeground: '168 55% 18%',
        border: '215 18% 89%',
        input: '215 18% 89%',
        ring: '168 52% 26%',
        surface: '0 0% 100%',
        surfaceMuted: '215 15% 97%',
        price: '168 60% 22%',
        discount: '348 76% 50%',
        discountForeground: '0 0% 100%',
        rating: '35 85% 48%',
        stock: '168 50% 28%',
        stockForeground: '160 30% 98%',
        success: '168 60% 30%',
        successForeground: '160 30% 98%',
        warning: '35 85% 48%',
        warningForeground: '35 85% 90%',
        destructive: '348 76% 50%',
        destructiveForeground: '0 0% 100%',
        info: '215 80% 50%',
        infoForeground: '0 0% 100%',
      },
      dark: {
        background: '215 25% 6%',
        foreground: '215 15% 96%',
        card: '215 25% 8%',
        cardForeground: '215 15% 96%',
        popover: '215 25% 8%',
        popoverForeground: '215 15% 96%',
        primary: '168 45% 44%',
        primaryForeground: '168 60% 8%',
        primaryHover: '168 45% 49%',
        secondary: '215 18% 15%',
        secondaryForeground: '215 15% 94%',
        muted: '215 15% 14%',
        mutedForeground: '215 10% 64%',
        accent: '168 25% 16%',
        accentForeground: '215 15% 94%',
        border: '215 15% 16%',
        input: '215 15% 16%',
        ring: '168 45% 44%',
        surface: '215 25% 9%',
        surfaceMuted: '215 20% 13%',
        price: '168 50% 48%',
        discount: '348 65% 52%',
        discountForeground: '0 0% 100%',
        rating: '35 85% 52%',
        stock: '168 45% 44%',
        stockForeground: '168 60% 8%',
        success: '168 45% 44%',
        successForeground: '168 60% 8%',
        warning: '35 85% 52%',
        warningForeground: '35 85% 90%',
        destructive: '348 65% 50%',
        destructiveForeground: '0 0% 100%',
        info: '215 75% 55%',
        infoForeground: '0 0% 100%',
      },
    },
  },

  modern: {
    id: 'modern',
    nameEn: 'Palette D — Modern Tech Commerce',
    nameBn: 'প্যালেট ঘ — আধুনিক টেক বাণিজ্য',
    descriptionEn: 'High-tech cyber jade and dynamic cool neutrals with modern SaaS clarity.',
    descriptionBn: 'উচ্চমানের সাইবার জেড ও আধুনিক ক্লাউড ইন্টারফেস নান্দনিকতা।',
    primaryHex: '#10b981',
    accentHex: '#ccfbf1',
    tokens: {
      light: {
        background: '215 25% 98%',
        foreground: '222 50% 8%',
        card: '0 0% 100%',
        cardForeground: '222 50% 8%',
        popover: '0 0% 100%',
        popoverForeground: '222 50% 8%',
        primary: '162 82% 35%',
        primaryForeground: '0 0% 100%',
        primaryHover: '162 82% 30%',
        secondary: '215 28% 95%',
        secondaryForeground: '220 40% 14%',
        muted: '215 24% 94%',
        mutedForeground: '217 18% 46%',
        accent: '172 65% 93%',
        accentForeground: '162 85% 20%',
        border: '215 22% 90%',
        input: '215 22% 90%',
        ring: '162 82% 35%',
        surface: '0 0% 100%',
        surfaceMuted: '215 25% 96%',
        price: '162 85% 30%',
        discount: '345 88% 58%',
        discountForeground: '0 0% 100%',
        rating: '45 95% 48%',
        stock: '162 80% 34%',
        stockForeground: '0 0% 100%',
        success: '162 82% 35%',
        successForeground: '0 0% 100%',
        warning: '45 95% 48%',
        warningForeground: '45 95% 90%',
        destructive: '345 88% 58%',
        destructiveForeground: '0 0% 100%',
        info: '218 95% 56%',
        infoForeground: '0 0% 100%',
      },
      dark: {
        background: '222 40% 6%',
        foreground: '215 25% 96%',
        card: '222 40% 8%',
        cardForeground: '215 25% 96%',
        popover: '222 40% 8%',
        popoverForeground: '215 25% 96%',
        primary: '162 76% 45%',
        primaryForeground: '222 50% 6%',
        primaryHover: '162 76% 50%',
        secondary: '220 25% 15%',
        secondaryForeground: '215 25% 94%',
        muted: '220 20% 15%',
        mutedForeground: '218 15% 64%',
        accent: '172 30% 17%',
        accentForeground: '215 25% 94%',
        border: '220 20% 17%',
        input: '220 20% 17%',
        ring: '162 76% 45%',
        surface: '222 40% 9%',
        surfaceMuted: '222 30% 13%',
        price: '162 76% 48%',
        discount: '345 75% 56%',
        discountForeground: '0 0% 100%',
        rating: '45 95% 52%',
        stock: '162 76% 45%',
        stockForeground: '222 50% 6%',
        success: '162 76% 45%',
        successForeground: '222 50% 6%',
        warning: '45 95% 52%',
        warningForeground: '45 95% 90%',
        destructive: '345 75% 52%',
        destructiveForeground: '0 0% 100%',
        info: '218 90% 60%',
        infoForeground: '0 0% 100%',
      },
    },
  },

  warm: {
    id: 'warm',
    nameEn: 'Palette E — Warm Community',
    nameBn: 'প্যালেট ঙ — উষ্ণ গ্রামীণ সমাজ',
    descriptionEn:
      'Artisanal cedar moss, warm oatmeal parchment, and earthy tones with rural warmth.',
    descriptionBn: 'মাটির গন্ধ মাখা উষ্ণ সিডার মস ও গ্রামীণ হাট-বাজারের আন্তরিক মেজাজ।',
    primaryHex: '#2e743a',
    accentHex: '#fef3c7',
    tokens: {
      light: {
        background: '38 25% 98.5%',
        foreground: '30 35% 10%',
        card: '0 0% 100%',
        cardForeground: '30 35% 10%',
        popover: '0 0% 100%',
        popoverForeground: '30 35% 10%',
        primary: '138 46% 32%',
        primaryForeground: '40 60% 98%',
        primaryHover: '138 46% 27%',
        secondary: '36 30% 94%',
        secondaryForeground: '30 40% 14%',
        muted: '36 22% 93%',
        mutedForeground: '30 15% 46%',
        accent: '32 50% 92%',
        accentForeground: '28 65% 22%',
        border: '36 20% 88%',
        input: '36 20% 88%',
        ring: '138 46% 32%',
        surface: '0 0% 100%',
        surfaceMuted: '36 28% 96%',
        price: '138 52% 26%',
        discount: '14 78% 52%',
        discountForeground: '0 0% 100%',
        rating: '36 90% 48%',
        stock: '138 45% 32%',
        stockForeground: '40 60% 98%',
        success: '138 48% 34%',
        successForeground: '40 60% 98%',
        warning: '36 90% 48%',
        warningForeground: '36 90% 90%',
        destructive: '14 78% 52%',
        destructiveForeground: '0 0% 100%',
        info: '205 85% 50%',
        infoForeground: '0 0% 100%',
      },
      dark: {
        background: '30 25% 6%',
        foreground: '38 20% 96%',
        card: '30 25% 8%',
        cardForeground: '38 20% 96%',
        popover: '30 25% 8%',
        popoverForeground: '38 20% 96%',
        primary: '138 42% 44%',
        primaryForeground: '30 30% 6%',
        primaryHover: '138 42% 49%',
        secondary: '32 20% 15%',
        secondaryForeground: '38 20% 94%',
        muted: '32 15% 15%',
        mutedForeground: '35 12% 64%',
        accent: '32 25% 17%',
        accentForeground: '38 20% 94%',
        border: '32 15% 17%',
        input: '32 15% 17%',
        ring: '138 42% 44%',
        surface: '30 25% 9%',
        surfaceMuted: '30 20% 13%',
        price: '138 46% 48%',
        discount: '14 70% 54%',
        discountForeground: '0 0% 100%',
        rating: '36 90% 52%',
        stock: '138 42% 44%',
        stockForeground: '30 30% 6%',
        success: '138 42% 44%',
        successForeground: '30 30% 6%',
        warning: '36 90% 52%',
        warningForeground: '36 90% 90%',
        destructive: '14 70% 50%',
        destructiveForeground: '0 0% 100%',
        info: '205 75% 55%',
        infoForeground: '0 0% 100%',
      },
    },
  },
};

export function getThemePalette(id: ThemePaletteId): ThemePaletteDefinition {
  return AVAILABLE_THEMES[id] || AVAILABLE_THEMES.clean;
}
