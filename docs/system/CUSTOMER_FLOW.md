# Customer User Journey Documentation

## Complete Customer Journey

```text
Discovery (Homepage / Search / Categories)
   ↓
Product Details & Decision
   ↓
Add to Cart & Address Selection
   ↓
Checkout (COD or SSLCOMMERZ Digital Gateway)
   ↓
Realtime Order Tracking Timeline
   ↓
Order Delivery & Confirmation
   ↓
Review & Rating Submission
```

### 1. Discovery (`/[lang]`, `/[lang]/search`, `/[lang]/categories`)
- Customer searches items in English or Bangla. Filters by price, brand, or category.

### 2. Cart & Checkout (`/[lang]/cart`, `/[lang]/customer/checkout`)
- Adds items to cart, manages quantities.
- Selects or creates shipping address (`/[lang]/customer/addresses`).
- Chooses Cash on Delivery or Digital Gateway payment.

### 3. Order Management (`/[lang]/customer/orders`)
- Views live status progression (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `READY_FOR_PICKUP` -> `OUT_FOR_DELIVERY` -> `DELIVERED`).
- Communicates with seller or rider via in-app floating chat widget.

### 4. Post-Purchase Actions (`/[lang]/customer/disputes`, `/[lang]/customer/reviews`)
- Creates dispute requests for damaged or missing items.
- Submits reviews and 1-5 star ratings for fulfilled products.
