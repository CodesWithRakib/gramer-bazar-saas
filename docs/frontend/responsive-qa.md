# Responsive & Accessibility QA Matrix — Gramer Bazar

> Systematic verification matrix evaluating viewport responsiveness across all device breakpoints and WCAG accessibility standards across core application workflows.

---

## 1. Responsive Issue Matrix

Evaluated against the standard device viewport spectrum:
- **320px**: Ultra-compact mobile (iPhone SE 1st gen, older Androids)
- **375px**: Standard compact mobile (iPhone SE 2nd/3rd gen)
- **390px**: Modern mobile (iPhone 12/13/14/15)
- **430px**: Large mobile (iPhone 14/15 Pro Max, Galaxy Ultra)
- **768px**: Portrait Tablet / iPad
- **1024px**: Landscape Tablet / Small Laptop
- **1280px**: Desktop standard
- **1440px+**: Large desktop & high-resolution monitors

### Status Legend:
- `✓` = Good / Fully Functional
- `△` = Needs Polish / Non-breaking visual quirk
- `✗` = Broken / Visual overlap or overflow
- `N/A` = Not Applicable

| Page / Flow | 320px | 375px | 390px | 430px | 768px | 1024px | 1280px | 1440px+ | Notes & Findings |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Home (`/`)** | △ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | On 320px, USP banner 2-col cards have slight text wrap on "খানসামা ও সংলগ্ন অঞ্চল". Rest is solid. |
| **Products (`/categories/[slug]`)** | △ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Mobile sheet filter works smoothly; on 320px, product cards benefit from tighter image padding. |
| **Product Details (`/products/[slug]`)** | △ | △ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Mobile lacks sticky bottom "Add to Cart" bar; user must scroll all the way back up to purchase. |
| **Verified Shops (`/shops`)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Responsive grid scales from 1 column on mobile to 4 columns on large desktop. |
| **Cart (`/cart`)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Clean stack; order summary card floats on desktop and rests at bottom on mobile. |
| **Checkout (`/checkout`)** | △ | △ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Long vertical flow on mobile without sticky order confirmation button at bottom. |
| **Login (`/login`)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auth card centers neatly; full width with 16px horizontal margins on small mobile. |
| **Customer Hub (`/customer`)** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **Double Header/Footer Bug** caused by `/customer` missing in `ClientLayoutWrapper` dashboard prefixes. |
| **Customer Orders (`/customer/orders`)** | △ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Status filter pills overflow on 320px without smooth horizontal scroll indicators. |
| **Rider Deliveries (`/rider/deliveries`)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Touch-friendly cards, high contrast, large status action buttons ideal for mobile use. |
| **Seller Products (`/seller/products`)** | △ | △ | △ | ✓ | ✓ | ✓ | ✓ | ✓ | Data table requires horizontal scrolling on viewports under 430px; card fallback recommended. |
| **Admin Users Table (`/admin/users-management`)** | △ | △ | △ | ✓ | ✓ | ✓ | ✓ | ✓ | Admin data-table scrolls horizontally cleanly on smaller viewports with fixed action menu. |

---

## 2. Accessibility (a11y) Issue Matrix

Evaluated against WCAG 2.1 AA criteria:
- **Keyboard Navigation**: Tab stops, Arrow keys, Enter/Space activation, Esc modal closing
- **Focus Indicators**: Visible focus rings with high contrast (`focus-visible:ring-2`)
- **Accessible Labels**: Form inputs associated with `<label>`, icon-only buttons having `aria-label` or `<span className="sr-only">`
- **Color Contrast**: 4.5:1 text-to-background ratio (3:1 for large text and UI components)
- **Screen Reader Support**: Semantic HTML, landmark regions, `aria-live` for dynamic changes

| Area / Component | Keyboard | Focus | Labels | Contrast | Screen Reader | Verification Status | Specific Findings & Remedies |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Global Header** | ✓ | ✓ | △ | ✓ | ✓ | Needs Review | Search input and theme toggles have focus rings; mobile search icon needs explicit `aria-label`. |
| **Auth Forms (Login / Register)** | ✓ | ✓ | ✓ | ✓ | ✓ | Verified | Form inputs use proper `<Label htmlFor={...}>`, password toggle button has `aria-label`. |
| **Product Card (`ProductCard.tsx`)** | ✓ | ✓ | ✓ | △ | ✓ | Needs Review | Category badges with white text on lighter yellow/orange backgrounds have contrast below 4.5:1. |
| **Checkout Flow** | ✓ | ✓ | ✓ | ✓ | ✓ | Verified | Radio button options for payment and address selection are fully keyboard controllable. |
| **Admin Data Table** | ✓ | ✓ | ✓ | ✓ | △ | Needs Review | Table pagination and row selection buttons work; table column headers need `aria-sort` attributes. |
| **Customer Orders** | ✓ | ✓ | ✓ | ✓ | ✓ | Verified | Order cards and tracking timeline use accessible semantic lists and buttons. |
| **Category Filter Drawer** | ✓ | ✓ | ✓ | ✓ | ✓ | Verified | Filter drawer traps focus properly and releases on Esc key via Radix UI Sheet primitive. |
| **Live Chat Widget** | △ | ✓ | ✓ | ✓ | △ | Needs Review | Floating chat trigger works; message thread needs `aria-live="polite"` for incoming messages. |

---

## 3. Responsive & a11y Remediation Checklist

- [ ] Fix `ClientLayoutWrapper` customer dashboard route prefix to resolve P0 double header/footer defect.
- [ ] Add mobile sticky bottom bar to `/products/[slug]` (Product Details) with Add to Cart and price summary.
- [ ] Add mobile sticky bottom confirmation bar to `/checkout`.
- [ ] Add smooth horizontal scroll masks to status filter pills on `/customer/orders`.
- [ ] Fix color contrast on `ProductCard` category badges by migrating to dark-text semantic badges.
- [ ] Add `aria-live="polite"` to `ChatWindow` for dynamic incoming message announcements.
- [ ] Add `aria-sort` to admin data table sortable headers.
- [ ] Ensure all icon-only buttons in Header and Footers have `<span className="sr-only">` text.
