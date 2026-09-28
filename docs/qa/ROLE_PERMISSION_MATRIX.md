# Role & Permission Matrix

This document defines authorization rules across all system roles in Gramer Bazar.

## Roles

1. **Guest**: Unauthenticated public visitor.
2. **Customer**: Registered buyer.
3. **Seller**: Registered vendor owning a shop.
4. **Rider**: Delivery rider.
5. **Admin**: Platform operations administrator.
6. **Super Admin**: System owner with complete control.

---

## Action Matrix

| Resource / Action | Guest | Customer | Seller | Rider | Admin | Super Admin |
| ----------------- | ----- | -------- | ------ | ----- | ----- | ----------- |
| View Public Catalog | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed |
| Place Order / Checkout | Denied | Allowed | Denied | Denied | Denied | Denied |
| Manage Own Address Book | Denied | Allowed | Allowed | Allowed | Allowed | Allowed |
| Manage Own Wishlist | Denied | Allowed | Allowed | Allowed | Allowed | Allowed |
| View Own Orders | Denied | Allowed | Allowed | Allowed | Allowed | Allowed |
| Cancel Own Pending Order | Denied | Allowed | Denied | Denied | Allowed | Allowed |
| Manage Shop Details | Denied | Denied | Own Shop | Denied | Allowed | Allowed |
| Create/Edit Seller Products | Denied | Denied | Own Products | Denied | Allowed | Allowed |
| Update Order Status (Seller) | Denied | Denied | Own Orders | Denied | Allowed | Allowed |
| Accept/Update Delivery (Rider) | Denied | Denied | Denied | Assigned | Allowed | Allowed |
| Request Wallet Payout | Denied | Denied | Allowed | Allowed | Denied | Denied |
| Approve/Reject Payouts | Denied | Denied | Denied | Denied | Allowed | Allowed |
| Review Seller Applications | Denied | Denied | Denied | Denied | Allowed | Allowed |
| Review Rider Applications | Denied | Denied | Denied | Denied | Allowed | Allowed |
| Manage Marketplace Categories | Denied | Denied | Denied | Denied | Allowed | Allowed |
| View Platform Analytics | Denied | Denied | Denied | Denied | Allowed | Allowed |
| Manage System Users & Roles | Denied | Denied | Denied | Denied | Denied | Allowed |
| Configure Gateway & System Settings | Denied | Denied | Denied | Denied | Denied | Allowed |
| Access Superadmin Audit Logs | Denied | Denied | Denied | Denied | Denied | Allowed |

---

## Protection Mechanisms

- **Frontend Navigation Guards**: Next.js route protection in dashboard layouts redirects unauthorized users to `/[lang]/unauthorized` or `/[lang]/login`.
- **Backend API Protection**: NestJS `JwtAuthGuard` and `RolesGuard` with `@Roles(Role.ADMIN, ...)` decorators validate user access tokens and roles on every request.
- **Data Ownership Guards**: Backend services enforce object-level ownership checks (e.g. `order.customerId === user.id`, `shop.sellerId === user.id`).
