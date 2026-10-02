# Disputes API Specification

All routes are mounted under `/api/v1/disputes` and guarded by `JwtAuthGuard` and `RolesGuard`.

---

## 1. Customer Endpoints

### `POST /api/v1/disputes/customer`
Create a new dispute for a delivered order.
- **Roles**: `CUSTOMER`
- **Body**:
  ```json
  {
    "orderId": "uuid",
    "reason": "DAMAGED",
    "description": "Item was crushed on delivery",
    "evidenceImages": ["https://.../img1.jpg"]
  }
  ```
- **Response**: `201 Created`

### `GET /api/v1/disputes/customer`
List all disputes submitted by the authenticated customer.
- **Roles**: `CUSTOMER`
- **Response**: `200 OK` (Array of disputes)

### `GET /api/v1/disputes/customer/:id`
Get full details and message history of a specific dispute.
- **Roles**: `CUSTOMER`
- **Response**: `200 OK`

### `POST /api/v1/disputes/customer/:id/messages`
Add a reply message or additional evidence attachment to the dispute.
- **Roles**: `CUSTOMER`
- **Body**:
  ```json
  {
    "message": "Here is additional proof",
    "attachment": "https://.../receipt.pdf"
  }
  ```

---

## 2. Seller Endpoints

### `GET /api/v1/disputes/seller`
List all disputes raised against orders sold by the authenticated seller.
- **Roles**: `SELLER`

### `GET /api/v1/disputes/seller/:id`
Get dispute details and messages.
- **Roles**: `SELLER`

### `POST /api/v1/disputes/seller/:id/messages`
Send a seller rebuttal or response message to the dispute thread.
- **Roles**: `SELLER`
- **Body**:
  ```json
  {
    "message": "We packaged the goods carefully in bubble wrap",
    "attachment": "https://.../packaging-proof.jpg"
  }
  ```

---

## 3. Super Admin & Admin Endpoints

### `GET /api/v1/disputes/admin`
List all disputes platform-wide with customer, seller, order, and internal note relationships.
- **Roles**: `ADMIN`, `SUPER_ADMIN`

### `GET /api/v1/disputes/admin/:id`
Full dispute dossier including internal notes.
- **Roles**: `ADMIN`, `SUPER_ADMIN`

### `POST /api/v1/disputes/admin/:id/messages`
Post an official admin response into the dispute conversation.
- **Roles**: `ADMIN`, `SUPER_ADMIN`

### `POST /api/v1/disputes/admin/:id/note`
Add a private internal note visible exclusively to staff.
- **Roles**: `ADMIN`, `SUPER_ADMIN`
- **Body**:
  ```json
  {
    "note": "Verified delivery courier notes; packaging was damaged in transit."
  }
  ```

### `POST /api/v1/disputes/admin/:id/resolve`
Officially resolve the dispute with automatic financial settlement.
- **Roles**: `ADMIN`, `SUPER_ADMIN`
- **Body**:
  ```json
  {
    "resolutionType": "FULL_REFUND",
    "refundAmount": 450.00,
    "adminDecision": "Full refund issued to customer due to courier negligence.",
    "internalNote": "Settled from seller balance."
  }
  ```

### `POST /api/v1/disputes/admin/:id/reject`
Officially reject the dispute.
- **Roles**: `ADMIN`, `SUPER_ADMIN`
- **Body**:
  ```json
  {
    "reason": "Provided images show item was undamaged and working properly.",
    "internalNote": "Customer claims unverified."
  }
  ```
