

# Frontend domain schema (canonical)

This document defines **one naming convention** for domain objects used in the React app: **camelCase** in JavaScript/JSX.  
When the backend returns **snake_case**, normalize at the **API/service layer** (not scattered in components).

---

## Conventions

| Rule | Choice |
|------|--------|
| Property names in app code | `camelCase` |
| API request/response if backend is snake_case | Map in `services/*.js` (or a small `normalizeX()` helper) |
| IDs | `number` (or `string` if backend uses UUIDs — align with backend) |
| Dates | ISO `string` (e.g. `createdAt`) |
| Money | `number` in smallest unit or major unit — **pick one** and document in `SiteConfig` / checkout |
| Nullable fields | Use `null` when “known empty”; omit optional fields when unknown |

---

## Entity: `Product`

**Used for:** catalog, product detail, admin CRUD, cart snapshots (subset).

| Property | Type | Required | Notes |
|----------|------|----------|--------|
| `id` | number | yes | |
| `title` | string | yes | |
| `description` | string | no | |
| `price` | number | yes | |
| `originalPrice` | number \| null | no | Sale/compare-at |
| `imageUrl` | string \| null | no | |
| `stock` | number | no | Default sensible: `0` or omit |
| `sold` | number | no | |
| `purchaseCount` | number | no | Prefer one of `sold` / `purchaseCount`; deprecate duplicate |
| `featured` | boolean | no | |
| `bestseller` | boolean | no | |
| `category` | string | no | |
| `format` | string | no | e.g. ebook / bundle |
| `type` | string | no | if distinct from `format` |
| `pages` | number | no | |
| `createdAt` | string | no | ISO |
| `updatedAt` | string \| null | no | ISO |
| `offerEndDate` | string \| null | no | **Single** end date for promos; drop parallel `discountEndDate` unless backend needs both |

**Deprecated / merge rules**

- Prefer **`offerEndDate`** only. If legacy data has both `discountEndDate` and `offerEndDate`, pick: `offerEndDate ?? discountEndDate`.

---

## Entity: `Order`

**Used for:** checkout, confirmation, admin orders, user history.

| Property | Type | Required | Notes |
|----------|------|----------|--------|
| `id` | number | yes | |
| `orderNumber` | string | no | Human-readable |
| `userId` | number | no | |
| `productId` | number | no | **If** orders are single-product; extend to `items[]` when multi-line |
| `amount` | number | yes | |
| `status` | string | yes | e.g. `pending` \| `completed` \| `failed` |
| `paymentMethod` | string \| null | no | |
| `createdAt` | string | no | ISO |
| `updatedAt` | string | no | ISO |
| `product` | `Product` (partial) \| null | no | Nested ref from API |
| `user` | `User` (partial) \| null | no | Nested ref from API |

**API boundary (current code):** `orderService.createOrder` sends `{ product_id, amount }` — keep that mapping in the service; **app** should pass `{ productId, amount }`.

---

## Entity: `User`

**Used for:** auth context, profile, admin user table.

| Property | Type | Required | Notes |
|----------|------|----------|--------|
| `id` | number | yes | |
| `email` | string | yes | |
| `name` | string | yes | |
| `role` | string | yes | e.g. `admin` \| `user` |
| `isActive` | boolean | no | Admin-only |
| `isVerified` | boolean | no | Email verification status |
| `createdAt` | string | no | ISO |
| `ordersCount` | number | no | Admin aggregates |

**Never** store `password` in client state (mock data only for local dev).

---

## Entity: `AuthResponse`

| Property | Type | Required |
|----------|------|----------|
| `user` | `User` | yes |
| `token` | string | yes |

---

## Entity: `CartItem`

Cart line: **product snapshot + quantity** (not necessarily full `Product`).

| Property | Type | Required | Notes |
|----------|------|----------|--------|
| `id` | number | yes | Product id |
| `title` | string | yes | |
| `price` | number | no | |
| `originalPrice` | number | no | |
| `imageUrl` | string | no | |
| `description` | string | no | |
| `category` | string | no | |
| `format` | string | no | |
| `quantity` | number | yes | ≥ 1 |

---

## Entity: `ServiceOffering`

**Used for:** services landing + detail (often driven by i18n keys).

| Property | Type | Required | Notes |
|----------|------|----------|--------|
| `id` | number | yes | |
| `titleKey` | string | yes | i18n key |
| `title` | string | no | Resolved label (if pre-resolved) |
| `description` | string | no | Resolved or key |
| `icon` | string | yes | Icon identifier |
| `imageUrl` | string | no | |
| `category` | string | yes | |
| `features` | string[] | yes | |
| `price` | number \| null | no | |
| `featured` | boolean | yes | |

---

## Entity: `SiteConfig`

| Property | Type | Required | Notes |
|----------|------|----------|--------|
| `siteName` | string | yes | Fixed display name in app |
| `currency` | string | yes | e.g. `FCFA` |
| `currencySymbol` | string | no | |

Additional keys from `appService.getSiteConfig()` should be **documented here** as they appear (avoid silent spread).

---

## Entity: `SocialLinks`

| Property | Type | Required |
|----------|------|----------|
| `whatsapp` | string | no |
| `facebook` | string | no |
| `youtube` | string | no |

---

## Payload: `CreateOrderInput` (app → service)

| Property | Type | Required |
|----------|------|----------|
| `productId` | number | yes |
| `amount` | number | yes |

Service maps to API body as needed.

---

## Payload: `ProcessPaymentInput` (app → service)

Normalize to one shape:

| Property | Type | Required | Notes |
|----------|------|----------|--------|
| `paymentMethod` | string | yes | e.g. `stripe`, `flutterwave`, `mobile_money`, `online` |
| `paymentProvider` | string | no | When relevant |
| `paymentData` | object | no | Provider-specific |
| `email` | string | no | If required by provider |

Avoid parallel fields `method` vs `paymentMethod` in the same object — pick **`paymentMethod`** (+ `paymentProvider`).

---

## Migration map (legacy → canonical)

Use this when normalizing API responses or cleaning components.

### Product

| Legacy key(s) | Canonical |
|---------------|-----------|
| `image_url` | `imageUrl` |
| `original_price` | `originalPrice` |
| `purchase_count` | `purchaseCount` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `discount_end_date`, `offer_end_date` | `offerEndDate` (merge per rule above) |

### Order

| Legacy key(s) | Canonical |
|---------------|-----------|
| `order_number` | `orderNumber` |
| `user_id` | `userId` |
| `product_id` | `productId` |
| `payment_method` | `paymentMethod` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |

### User

| Legacy key(s) | Canonical |
|---------------|-----------|
| `is_active` | `isActive` |
| `created_at` | `createdAt` |
| `orders_count` | `ordersCount` |

### Cart / UI

| Legacy key(s) | Canonical |
|---------------|-----------|
| `image_url` (on line items) | `imageUrl` |
| `original_price` | `originalPrice` |

---

## Suggested implementation order

1. Add **`normalizeProduct`**, **`normalizeOrder`**, **`normalizeUser`** in e.g. `frontend/src/utils/normalize.js`.
2. Call them from **`productService` / `orderService` / `authService`** right after `response.data`.
3. Replace component-level `x?.image_url || x?.imageUrl` with **`imageUrl` only**.
4. Collapse duplicate date fields to **`offerEndDate`**.
5. Align payment objects to **`ProcessPaymentInput`**.

---

## Backend (FastAPI) alignment

The API under `backend/` is aligned with the frontend shapes:

- **Products:** ORM stores `content_format` (DB column `format`); JSON exposes `format` plus camelCase mirrors (`imageUrl`, `originalPrice`, `discountEndDate`, `offerEndDate`, `purchaseCount`, `createdAt`, `updatedAt`) and `discount_end_date` / `download_count` computed fields. Added optional `category`, `pages`, `bestseller`.
- **Orders:** Payment accepts **camelCase** `paymentMethod`, `paymentProvider`, `paymentData`, `email`. `online` (Stripe) maps to enum `online`; responses include nested **`user`** `{ id, name, email }` and camelCase mirrors (`orderNumber`, `total`, `paymentMethod`, `createdAt`, …).
- **Config:** `GET /api/config` returns **camelCase** `siteName`, `currencySymbol`, `socialLinks`; `PUT` supports optional **`youtube`** on social links.
- **Users:** `UserResponse` includes **`isActive`** and **`createdAt`** computed fields alongside snake_case.

**PostgreSQL:** Use `DATABASE_URL=postgresql://...` in `backend/.env` (see `backend/.env.example`). Tables are created via `Base.metadata.create_all` / `init_db`; add new columns with Alembic or by recreating tables in dev.

---

## Optional: TypeScript

If you migrate to TS, promote this file into `types/domain.ts` + `zod` schemas for runtime validation at the API edge.
