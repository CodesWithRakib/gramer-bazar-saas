# Gramer Bazar — Design System Architecture & Token Strategy

This document outlines the foundation, token conventions, component patterns, and future design-token evolution for **Gramer Bazar**.

---

## 1. Architectural Philosophy

Gramer Bazar serves rural producers, shopkeepers, logistics riders, and urban consumers across Bangladesh. The design system is built upon four non-negotiable principles:
1. **Zero Hardcoded Colors:** All interface components consume semantic CSS custom properties (`var(--primary)`, `var(--card)`, etc.) or Tailwind utility aliases (`bg-primary`, `text-card-foreground`).
2. **Bilingual Typography First:** Bengali script requires slightly larger optical line-heights (1.6 to 1.7) and proportional baseline alignment when paired with Latin English fonts.
3. **Ergonomic Rural Mobile Usability:** Minimum tap targets of 44px for primary mobile touchpoints; high contrast under bright outdoor village sunlight.
4. **Safe Sandbox Evolution:** Production styles remain 100% stable while new palettes and typography are evaluated in the development playground (`/design-playground`).

---

## 2. Typography Architecture

### Hierarchy & Scale

```text
Display     → 36px - 44px (Hero headlines, festival banner promotions)
H1          → 28px - 32px (Top-level view & category titles)
H2          → 22px - 24px (Section titles, shop showcase titles)
H3          → 18px - 20px (Card titles, modal headers, drawer titles)
H4          → 16px (Sub-headings, form group titles)
Body Large  → 16px / 1.6 (Lead blurbs, order summary leads)
Body        → 14px / 1.55 (Standard paragraphs, reviews, product details)
Body Small  → 12px / 1.5 (Timestamp lines, metadata, seller area tags)
Caption     → 11px (Legal notices, breadcrumbs, copyright)
Button      → 14px Bold (Primary/secondary action labels)
Input       → 14px Regular (Form controls, search bars)
Table       → 12px Tabular Numerals (Financial tables, order SKU rows)
Badge       → 11px Bold Uppercase (Discounts, inventory alerts)
```

### Font Stacking Strategy
```css
/* Bangla-First Stack */
--font-bengali: var(--font-bangla), var(--font-english), ui-sans-serif, sans-serif;

/* Mixed / English-First Stack */
--font-sans: var(--font-english), var(--font-bangla), ui-sans-serif, sans-serif;
```

---

## 3. Color Token Architecture

All colors are expressed as HSL triples without the `hsl()` wrapper inside CSS variables:
```css
--primary: 142 76% 36%;
```
This enables Tailwind CSS v4 and opacity modifications using native modern CSS:
```css
--color-primary: hsl(var(--primary));
background-color: hsl(var(--primary) / 0.85); /* 85% opacity */
```

### Semantic Token Taxonomy

| Semantic Token | Purpose & Role | Example Value (Fresh Green) |
| :--- | :--- | :--- |
| `--background` | Page background wash | `120 10% 98.5%` |
| `--foreground` | Main high-contrast reading text | `155 45% 11%` |
| `--card` | Background for product & stat cards | `0 0% 100%` |
| `--card-foreground` | Content inside cards | `155 45% 11%` |
| `--primary` | Primary brand accent and call-to-action | `142 76% 36%` |
| `--primary-foreground` | Label on primary buttons | `0 0% 100%` (White) |
| `--secondary` | Subtle pill backgrounds, filter chips | `145 35% 95%` |
| `--secondary-foreground` | Label on secondary surfaces | `145 76% 20%` |
| `--muted` | Inactive pagination, input placeholders | `140 18% 95%` |
| `--muted-foreground` | Secondary helper descriptions | `150 14% 45%` |
| `--border` | Dividers, card boundaries, input strokes | `140 20% 89%` |
| `--price` | Bold Bengali currency displays (`৳ BDT`) | `142 82% 28%` |
| `--discount` | Sale badges (`-২০% ছাড়`) | `354 78% 54%` |
| `--rating` | Star ratings | `38 92% 44%` (Gold) |

---

## 4. Spacing & Radius System

- **Spacing Scale:** Standard 4px grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Border Radius:**
  - Small elements (Badges, tags): `var(--radius-sm)` (4px)
  - Interactive controls (Buttons, inputs): `var(--radius-md)` (6px - 8px)
  - Containers (Cards, modals, drawers): `var(--radius-lg)` (12px - 16px)

---

## 5. Standard Component Guidelines

### Buttons
- **Primary:** `bg-primary text-primary-foreground font-bold hover:opacity-95 shadow-xs`
- **Secondary:** `bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80`
- **Outline:** `border border-border bg-surface text-foreground hover:bg-secondary/40`
- **Destructive:** `bg-destructive text-destructive-foreground font-bold hover:opacity-90`

### Product Cards
- Explicit height constraint on product image wrappers with fallback icons.
- Store/Farm badge at the top (`text-xs font-semibold text-primary`).
- Prominent price display with tabular numerals (`text-xl font-extrabold font-mono`).
- Add to Cart button with minimum 40px touch height and loading state support.

### Forms & Inputs
- Always provide associated `<label>` with Bengali translation.
- Error states must use `border-destructive text-destructive` with accessible explanatory text.
- Focus rings utilize `ring-2 ring-primary/20 border-primary`.

---

## 6. Future Design Token Strategy

1. **Centralized Source of Truth:** `apps/web/src/theme/` contains all token models, palettes, and font configurations.
2. **Mobile Parity:** The exported JSON schema (`apps/web/src/theme/font-loader.ts` → `generateJsonSnippet`) is structured for direct consumption by React Native / Flutter mobile applications.
3. **No Global Overwrite Rule:** Global tokens in `apps/web/app/globals.css` are modified only after stakeholder review in the `/design-playground`.
