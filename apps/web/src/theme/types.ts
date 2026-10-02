/**
 * Centralized Color Palette Types for Gramer Bazar
 */

export interface ColorTokens {
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
  sidebar: string;
  sidebarForeground: string;
}

export interface ContrastMetric {
  pair: string;
  ratio: number;
  rating: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  isAccessible: boolean;
}

export interface ThemePalette {
  id: string;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn: string;
  description: string;
  descriptionBn: string;
  category: 'organic-green' | 'corporate-blue' | 'modern-teal' | 'natural-warm' | 'heritage-accent';
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  backgroundHex: string;
  foregroundHex: string;
  tokens: {
    light: ColorTokens;
  };
  contrastMetrics: ContrastMetric[];
}
