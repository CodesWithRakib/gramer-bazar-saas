# Link & Navigation Audit

This document records the navigation integrity audit across all headers, sidebars, footers, and CTA components.

## Navigation Element Audit

| Component | Location | Destination Route | Status | Notes |
| --------- | -------- | ----------------- | ------ | ----- |
| Header Logo | Main Navbar | `/[lang]` | PASS | Navigates to localized homepage |
| Search Bar | Main Navbar | `/[lang]/search?q=...` | PASS | Passes query parameters |
| Categories Button | Main Navbar | `/[lang]/categories` | PASS | Category overlay & link |
| Flash Sale Link | Main Navbar | `/[lang]/flash-sale` | PASS | Deals page |
| Offers Link | Main Navbar | `/[lang]/offers` | PASS | Promotions page |
| Become a Seller | Header / Footer | `/[lang]/become-a-seller` | PASS | Application form |
| Become a Rider | Header / Footer | `/[lang]/become-a-rider` | PASS | Application form |
| Cart Icon | Main Header | `/[lang]/cart` | PASS | Opens cart drawer or cart page |
| Login / Register | Main Header | `/[lang]/login` / `/[lang]/register` | PASS | Directs guest users |
| User Profile Avatar | Main Header | `/[role]` | PASS | Redirects to active role dashboard |
| Customer Sidebar -> Orders | Customer Dashboard | `/[lang]/customer/orders` | PASS | Active route highlight works |
| Customer Sidebar -> Addresses | Customer Dashboard | `/[lang]/customer/addresses` | PASS | |
| Customer Sidebar -> Wishlist | Customer Dashboard | `/[lang]/customer/wishlist` | PASS | |
| Customer Sidebar -> Messages | Customer Dashboard | `/[lang]/customer/messages` | PASS | |
| Seller Sidebar -> Shop | Seller Dashboard | `/[lang]/seller/shop` | PASS | |
| Seller Sidebar -> Products | Seller Dashboard | `/[lang]/seller/products` | PASS | |
| Seller Sidebar -> Orders | Seller Dashboard | `/[lang]/seller/orders` | PASS | |
| Seller Sidebar -> Wallet | Seller Dashboard | `/[lang]/seller/wallet` | PASS | |
| Rider Sidebar -> Deliveries | Rider Dashboard | `/[lang]/rider/deliveries` | PASS | |
| Admin Sidebar -> Users | Admin Dashboard | `/[lang]/admin/users-management` | PASS | |
| Admin Sidebar -> Orders | Admin Dashboard | `/[lang]/admin/orders` | PASS | |
| Admin Sidebar -> Products | Admin Dashboard | `/[lang]/admin/products` | PASS | |
| Admin Sidebar -> Finance | Admin Dashboard | `/[lang]/admin/finance` | PASS | |
| Super Admin Sidebar -> Roles | Super Admin Dashboard | `/[lang]/super-admin/users-management` | PASS | |
| Super Admin Sidebar -> Settings | Super Admin Dashboard | `/[lang]/super-admin/settings` | PASS | |
| Header Logout Action | All Dashboards Header | Triggers Logout & Redirect | PASS | Logout resides in Header (Sidebar rule satisfied) |

---

## Verification Criteria
- No broken or dead links (`#`, `javascript:void(0)` or missing routes).
- Sidebar contains flat, role-specific navigation without hidden or inaccessible options.
- Header controls authentication logout.
