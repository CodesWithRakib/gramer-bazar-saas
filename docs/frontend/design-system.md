# Design System Audit & Token Architecture — Gramer Bazar

> Comprehensive evaluation of the global design system, color tokens, typography scales, hardcoded styles, and component duplications across `apps/web`.

---

## 1. Global Design System Issue Register

| Design System Dimension | Problem Discovered | Impact | Recommended Fix | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Color Tokens** | Raw hex values (`#FAFAFA`, `#0A0A0A`) in `DashboardLayout.tsx` and 15+ hardcoded raw Tailwind colors (`bg-cyan-600`, `bg-red-600`, `bg-amber-600`) in `ProductCard.tsx` | High | Centralize all tints into semantic tokens (`--color-background`, `--color-muted`, `--color-accent`) defined in `globals.css` | Open |
| **Typography** | Font stacks use Next.js fonts (`--font-inter`, `--font-noto-bengali`), but headings throughout customer and admin views use irregular text sizes (`text-2xl`, `text-3xl`, `text-xl`) without unified line-height tokens | Medium | Establish a standard typography scale (`h1: 2rem/2.5rem`, `h2: 1.5rem/2rem`, `h3: 1.25rem/1.75rem`, `body: 0.875rem/1.25rem`) | Open |
| **Spacing** | Grid gaps alternate inconsistently between `gap-3`, `gap-4`, `gap-6`, `gap-8`, and `gap-10` across dashboard pages | Medium | Standardize layout spacing on a 4-point / 8-point grid rhythm (e.g. `gap-4` for cards, `gap-6` for sections, `gap-8` for major grids) | Open |
| **Radius** | `--radius: 0.5rem` is configured in `globals.css`, but components mix `rounded-md` (button/input), `rounded-xl` (card), and `rounded-2xl` (hero/dashboard links) | Low | Standardize corner radiuses: `rounded-md` for interactive controls (buttons, inputs), `rounded-xl` for cards, `rounded-2xl` for large banners/containers | Open |
| **Shadows** | `shadow-xs`, `shadow-sm`, `shadow-md`, and custom drop shadows are applied haphazardly across catalog items and buttons | Medium | Standardize elevation: `shadow-xs` for subtle cards, `shadow-sm` for interactive hover cards, `shadow-lg` for modals/drawers | Open |
| **Borders** | Some components apply both `border` and `divide-y`, while others rely on `border-border/50` or `border-border/70` opacity overrides | Low | Enforce unified `border-border` token across all card and divider containers | Open |
| **Buttons** | `Button` component wraps with Framer Motion `motion.button` and enforces a 44px default height (`h-11`), while small variants use `h-9` | Medium | Document default `h-11` touch-friendly height; ensure `asChild` properly avoids nested button element warnings | Open |
| **Inputs** | Standard input height is 44px (`h-11`), but search inputs and filter inputs in admin tables often specify `h-9` or `h-10` with inline overrides | Medium | Add formal `size="sm" (36px)` and `size="default" (44px)` variants to `Input.tsx` | Open |
| **Badges** | `Badge` only has `default`, `secondary`, `destructive`, and `outline`, missing essential ecommerce statuses (`success`, `warning`, `info`) | High | Extend `badgeVariants` with `success` (green), `warning` (amber), and `info` (blue) variants | Open |
| **Cards** | Clean Radix/shadcn `Card`, but custom pages wrap it in extra redundant div wrappers with conflicting background colors | Medium | Remove nested duplicate wrapper divs in customer and seller view components | Open |
| **Dialogs & Drawers** | Modals and sheets are accessible via Radix UI, but mobile sheets lack bottom safe-area padding for modern mobile devices (iPhone home indicator) | Medium | Add `pb-safe` and `pb-6` to `SheetContent` components | Open |
| **Tables** | `data-table.tsx` uses custom table layout with pagination that differs visually from `AdminPagination.tsx` | High | Harmonize table pagination styles across all administrative and merchant views | Open |
| **Navigation** | Active navigation indicators differ: Storefront uses text color, Customer dashboard uses colored background with left pill indicator | Low | Keep visual distinction (storefront vs dashboard) as intentional role ergonomics | Intentional |
| **Breakpoints** | Standard Tailwind v4 breakpoints used (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`) | None | Fully aligned with modern responsive standards | Verified |
| **Icons** | Lucide React is used universally across the entire frontend application with consistent stroke width | None | Excellent consistency across all pages and features | Verified |

---

## 2. Duplication Audit

| Component / Pattern | Locations Found | Used By | Determination | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **`AdminPagination`** | 1. `apps/web/src/components/AdminPagination.tsx`<br>2. `apps/web/src/components/ui/AdminPagination.tsx`<br>3. `apps/web/src/components/ui/pagination.tsx` | Seller, Admin, Payouts, Disputes, Coupons | **Merge** | Delete `src/components/AdminPagination.tsx`. Keep `src/components/ui/AdminPagination.tsx` as the single shared data-table pagination component. |
| **`MobileBottomNav`** | 1. `apps/web/src/components/layout/MobileBottomNav.tsx`<br>2. `apps/web/src/components/navigation/MobileBottomNav.tsx` | Public Storefront layout | **Merge** | Delete the unused duplicate in `src/components/navigation/MobileBottomNav.tsx`. Standardize on `src/components/layout/MobileBottomNav.tsx`. |
| **`ShopCard`** | 1. Inline JSX in `apps/web/app/[lang]/(public)/shops/page.tsx` (80 lines) | Public shops listing | **Create shared component** | Extract into `apps/web/src/components/catalog/ShopCard.tsx` so shop listings and home page can reuse it without code duplication. |
| **`CustomerDisputesView`** | 1. `src/features/disputes/CustomerDisputesView.tsx`<br>2. `src/features/customer/disputes/components/CustomerDisputesView.tsx` | Customer Disputes | **Merge** | Remove duplicate file under `features/disputes/`, standardize imports under `features/customer/disputes/`. |
| **`CustomerReviewsView`** | 1. `src/features/reviews/CustomerReviewsView.tsx`<br>2. `src/features/customer/reviews/components/CustomerReviewsView.tsx` | Customer Reviews | **Merge** | Remove duplicate file under `features/reviews/`, standardize imports under `features/customer/reviews/`. |
| **`SellerViews`** | 1. `src/features/seller-portal/*`<br>2. `src/features/seller/*` | Seller Portal | **Merge** | Consolidate `seller-portal` views into canonical `src/features/seller/` domain directories. |
| **`RiderLayout`** | 1. `src/components/layouts/rider/RiderLayout.tsx`<br>2. `src/components/layouts/DashboardLayout.tsx` | Delivery Rider | **Merge** | Use `DashboardLayout(routeType="rider")` exclusively; decommission `RiderLayout.tsx`. |
| **`EmptyState`** | 1. `src/components/common/EmptyState.tsx`<br>2. Custom inline dashed boxes in `shops/page.tsx`, `orders/page.tsx` | Lists & Directories | **Create shared component** | Replace all custom ad-hoc dashed empty boxes with the centralized `<EmptyState>` component. |
| **`LoadingState`** | 1. `src/components/common/LoadingState.tsx`<br>2. `src/components/ui/Skeletons.tsx` | Data fetching | **Keep separate** | `LoadingState` is for full-page or section spinner states; `Skeletons.tsx` is for layout-preserving content placeholders. Both serve distinct UX needs. |

---

## 3. Hardcoded Style Audit

| Style Instance | Found In | Classification | Analysis & Remediation |
| :--- | :--- | :--- | :--- |
| `bg-[#FAFAFA] dark:bg-[#0A0A0A]` | `DashboardLayout.tsx:L324` | **Needs tokenization** | Hardcoded off-white and dark shades. Replace with semantic `bg-muted/30` or `bg-background` to respect global theme switching. |
| `bg-cyan-600 text-white` | `ProductCard.tsx:L65` | **Needs tokenization** | Raw color for fresh fish category badge. Replace with semantic `Badge` variant or centralized category token. |
| `bg-red-600 text-white` | `ProductCard.tsx:L87` | **Needs tokenization** | Raw color for meat category badge. Replace with `destructive` or semantic token. |
| `bg-orange-500 text-white` | `ProductCard.tsx:L110` | **Needs tokenization** | Raw color for fruits category badge. Replace with semantic amber token. |
| `bg-amber-600 text-white` | `ProductCard.tsx:L134` | **Needs tokenization** | Raw color for spices category badge. Replace with semantic amber token. |
| `bg-emerald-600 text-white` | `ProductCard.tsx:L156` | **Needs tokenization** | Raw color for vegetables category badge. Replace with `success` token. |
| `bg-blue-600 text-white` | `ProductCard.tsx:L213` | **Needs tokenization** | Raw color for gadgets category badge. Replace with `info` token. |
| `bg-purple-600 text-white` | `ProductCard.tsx:L232` | **Needs tokenization** | Raw color for fashion category badge. Replace with semantic accent token. |
| `text-amber-600 dark:text-amber-400` | `Header.tsx:L77` | **Needs tokenization** | Super admin navigation link in utility bar. Replace with semantic role tag. |
| `text-emerald-600 dark:text-emerald-400` | `Header.tsx:L99` | **Needs tokenization** | Seller portal navigation link in utility bar. Replace with semantic brand token. |
| `text-blue-600 dark:text-blue-400` | `Header.tsx:L110` | **Needs tokenization** | Rider portal navigation link in utility bar. Replace with semantic info token. |
| `themeColor: "#16a34a"` | `app/[lang]/layout.tsx:L23` | **Intentional** | PWA browser header chrome meta theme-color. Matches primary brand green `#16a34a`. |
| `mix-blend-multiply` | `Header.tsx:L181` | **Asset-specific** | Required for `/logo.jpg` transparent blend against light header background. |
| `h-[250px] md:h-[400px]` | `HomeClient.tsx:L52` | **Intentional** | Hero carousel fixed height constraints to prevent CLS (Cumulative Layout Shift). |
| `min-h-[400px]` | `EmptyState.tsx:L22` | **Intentional** | Standard layout height for centered empty-state containers. |
