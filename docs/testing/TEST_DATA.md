# Gramer Bazar — Test Data & Seed Matrix

This document defines the authoritative test data matrix, seed credentials, test SKUs, and data lifecycle strategies used in Gramer Bazar QA automation.

---

## 1. Seeded User Credentials

All seed accounts are initialized via `apps/api/src/seeder/seed.service.ts` or `POST /api/v1/dev/seed`:

| Role | Email | Phone Number | Password | Notes |
|---|---|---|---|---|
| **SUPER_ADMIN** | `admin@gramerbazar.com` | `+8801700000001` | `password123` | Full administrative root access |
| **ADMIN** | `admin@gramerbazar.com` | `+8801700000001` | `password123` | Operational role |
| **SELLER** | `seller1@gramerbazar.com` | `+8801711000011` | `Shop@GramerBazar2026!` | Primary test merchant (Debiganj Agro) |
| **SELLER (Secondary)** | `seller2@gramerbazar.com` | `+8801711000012` | `Shop@GramerBazar2026!` | Secondary merchant |
| **CUSTOMER** | `customer1@gramerbazar.com` | `+8801700000002` | `Customer@GramerBazar2026!` | Primary test customer (Rahim Uddin) |
| **CUSTOMER (Secondary)** | `customer2@gramerbazar.com` | `+8801700000003` | `Customer@GramerBazar2026!` | Secondary customer |
| **RIDER** | `rider1@gramerbazar.com` | `+8801712000001` | `Rider@GramerBazar2026!` | Active courier partner (Babul Mia) |
| **RIDER (Secondary)** | `rider2@gramerbazar.com` | `+8801712000002` | `Rider@GramerBazar2026!` | Secondary courier partner |

---

## 2. Seeded Merchants & Storefronts

1. **Debiganj Organic Agro** (`seller1`)
   - Category: Fresh Vegetables & Organic Grains
   - District: Panchagarh
   - Status: `VERIFIED`

2. **Bhawal Dairy & Ghee** (`seller2`)
   - Category: Dairy, Pure Cow Milk & Cultured Ghee
   - District: Gazipur
   - Status: `VERIFIED`

---

## 3. Product Catalog SKUs

Standard seeded products available for checkout tests:
- **Organic Mustard Oil (ঘানি ভাঙা সরিষার তেল)**: 1L Bottle, ৳260
- **Sundarbans Raw Honey (সুন্দরবনের প্রাকৃতিক মধু)**: 500g Jar, ৳450
- **Debiganj Nazirshail Rice (নাজিরশাইল চাল)**: 5kg Bag, ৳420
- **Deshi Ghee (খাঁটি গাওয়া ঘি)**: 250g Glass Jar, ৳380

---

## 4. Development OTP Endpoint

For automated OTP journeys without external SMS gateway dependencies:
- **Endpoint**: `GET /api/v1/dev/otp/:phone`
- **Availability**: Enabled in `NODE_ENV !== 'production'`
- **Behavior**: Retrieves the most recent active 6-digit verification code generated for that phone number.
- **Example Usage**:
  ```typescript
  const otpRes = await ctx.get(`${API}/dev/otp/${phone}`);
  const { code } = (await otpRes.json()).data;
  await page.getByLabel(/Verification Code|OTP/i).fill(code);
  ```

---

## 5. Test Data Lifecycle & Isolation

1. **Idempotence**: Every test suite cleans up or scopes its creations to unique dynamic timestamps or UUIDs (`Date.now()`, `orderId.slice(0, 8)`).
2. **Context Isolation**: Always construct fresh `playwrightRequest.newContext()` instances per role to avoid cookie or session collision.
3. **Database Seeding**: To reset the test database to the pristine baseline, run:
   ```bash
   pnpm -C apps/api run seed
   ```
