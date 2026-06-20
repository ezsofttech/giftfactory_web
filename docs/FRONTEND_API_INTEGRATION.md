# Frontend ↔ Backend API Integration Guide

> Auto-generated from the MVE-service backend controllers/DTOs and the `giftfactory` frontend API client.

## Base URL

| Environment | Base URL |
|---|---|
| Browser (client-side) | `/api/v1` (proxied via Next.js rewrites) |
| Server (SSR/auth) | `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1` |

All paths below are relative to the base URL.

## Response Envelope

Every backend response follows:

```json
{ "status": 200, "success": true, "message": "...", "data": <payload> }
```

Paginated routes add `meta: { page, limit, total, totalPages }`.

---

## 1. Product (Public — no auth)

| Method | Path | Frontend Helper | Notes |
|---|---|---|---|
| GET | `/web/products` | `fetchProducts(params)` | Query: `search`, `categoryId`, `brandId`, `vendorId`, `sortBy`, `order`, `page`, `limit` |
| GET | `/web/products/suggest` | `fetchProductSuggest(q)` | Query: `q` |
| GET | `/web/products/featured` | `fetchFeaturedProducts()` | |
| GET | `/web/products/deals` | `fetchProductDeals({ limit })` | Query: `limit` (max 24, default 12) |
| GET | `/web/products/recommended` | `fetchProductRecommended({ limit })` | Query: `limit` (max 24, default 12) |
| GET | `/web/products/:productId/related` | `fetchRelatedProducts(productId)` | |
| GET | `/web/products/:productId/reviews` | `fetchProductReviews(productId)` | Query: `page`, `limit` |
| POST | `/web/products/:productId/notify-in-stock` | `notifyInStock(productId, email)` | Body: `{ email }` |
| GET | `/web/products/:productId` | `fetchProductById(id)` | |

---

## 2. Cart (Auth: Bearer token)

### Authenticated User

| Method | Path | Frontend Helper | Request Body |
|---|---|---|---|
| POST | `/cart/item` | `addCartItem(body)` | `{ item: { variantId?, quantity, priceAtAddition? } }` |
| GET | `/cart` | `fetchCart()` | — |
| GET | `/cart/:cartId` | — (not used yet) | — |
| PATCH | `/cart/:cartId/item` | `updateCartItem(cartId, body)` | `{ itemId (required), quantity }` |
| DELETE | `/cart/:cartId/item` | `removeCartItem(cartId, body)` | `{ itemId (required) }` |
| DELETE | `/cart/:cartId` | `deleteCart(cartId)` | — |

### Key Rules

- **`addCartItem`**: Backend `CreateAndAddCartDto` accepts `{ item: { productId, variantId?, quantity } }`.
- **`updateCartItem`**: Backend `UpdateCartItemDto` requires `itemId` (`@IsString`) and `quantity` (≥ 1).
- **`removeCartItem`**: Backend `RemoveCartItemDto` requires `itemId` (`@IsString`).

### Guest Cart (session-based, no auth)

| Method | Path | Notes |
|---|---|---|
| POST | `/customer/cart/guest/item` | Header: `x-session-id` or cookie `cart_session_id` |
| POST | `/customer/cart/guest/items` | Bulk add. Body: `{ merchantId, items: [...] }` |
| GET | `/customer/cart/guest/list` | |
| GET | `/customer/cart/guest/:cartId` | |
| PATCH | `/customer/cart/guest/:cartId/item` | Same DTO as authenticated |
| DELETE | `/customer/cart/guest/:cartId/item` | Same DTO as authenticated |
| DELETE | `/customer/cart/guest/:cartId` | |
| POST | `/customer/cart/merge` | Merge guest cart into authenticated cart |

> Guest cart helpers are not yet implemented in the frontend API client.

---

## 3. Orders (Auth: Bearer token)

| Method | Path | Frontend Helper | Request Body / Params |
|---|---|---|---|
| POST | `/customer/orders` | `createOrder(body)` | See below |
| POST | `/customer/orders/from-cart/:cartId` | `createOrderFromCart(cartId, body)` | See below |
| GET | `/customer/orders` | `fetchOrders(params)` | Query: `search`, `status`, `sortBy`, `fromDate`, `lastDate`, `order`, `page`, `limit` |
| GET | `/customer/orders/:orderId` | `fetchOrderById(orderId)` | |
| GET | `/customer/orders/by-number/:orderNumber` | `fetchOrderByOrderNumber(orderNumber)` | |
| GET | `/customer/orders/track/:orderNumber` | `trackOrder(orderNumber)` | |
| GET | `/customer/orders/:orderId/invoice` | `fetchOrderInvoice(orderId)` | |
| POST | `/customer/orders/cancel/:orderId` | `cancelOrder(orderId)` | |
| POST | `/customer/orders/reorder/:orderId` | `reorder(orderId, body?)` | Body (optional): `{ paymentMethod?, shippingAddress? }` |
| POST | `/customer/orders/:orderId/return-request` | `returnRequestOrder(orderId, body)` | `{ requestType, reason, comment? }` |
| GET | `/customer/orders/return-requests/list` | `fetchReturnRequests(params?)` | Query: `search`, `requestType`, `sortBy`, `fromDate`, `lastDate`, `order`, `page`, `limit` |
| GET | `/customer/orders/return-requests/by-order-number/:orderNumber` | `fetchReturnRequestByOrderNumber(orderNumber)` | |

### `createOrder` — Request Body (CreateOrderDto)

```typescript
{
  items: { variantId: string; quantity: number }[];   // variantId is REQUIRED
  paymentMethod: "wallet" | "card" | "upi" | "cod" | "online";
  deliveryAddress: {                                  // primary field name
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country?: string;
    zipCode: string;                                  // 4–10 chars
  };
  couponCode?: string;
  shippingFee?: number;
}
```

### `createOrderFromCart` — Request Body (CreateOrderFromCartDto)

```typescript
{
  paymentMethod: "wallet" | "card" | "upi" | "cod" | "online";
  shippingFee: number;        // required
  shippingAddress: { ... };   // same shape as deliveryAddress above
  discountCode?: string;
}
```

### `returnRequestOrder` — Request Body (CreateReturnRequestDto)

```typescript
{
  requestType: "replacement" | "refund";   // backend enum ReturnType
  reason: string;                           // max 500 chars
  comment?: string;                         // max 1000 chars
}
```

### Enums

**PaymentMethod**: `wallet` | `card` | `upi` | `cod` | `online`

**OrderStatus**: `CREATED` | `PENDING` | `FAILED` | `PAYMENT_FAILED` | `CONFIRMED` | `PROCESSING` | `PACKED` | `CANCELLED` | `SHIPPED` | `OUT_FOR_DELIVERY` | `DELIVERED` | `RETURN_REQUESTED` | `REFUND_INITIATED` | `RETURN_APPROVED` | `RETURN_PICKED` | `RETURN_RECEIVED` | `REFUND_COMPLETED`

**ReturnRequestType**: `replacement` | `refund`

---

## 4. Wishlist (Auth: Bearer token)

| Method | Path | Frontend Helper | Request Body |
|---|---|---|---|
| POST | `/customer/wishlist` | `addWishlistItem(body)` | `{ productId, productSlug, productUrl }` |
| GET | `/customer/wishlist` | `fetchWishlist()` | — |
| DELETE | `/customer/wishlist/:wishlistId` | `removeWishlistItem(wishlistId)` | — |

---

## 5. Reviews

| Method | Path | Frontend Helper | Notes |
|---|---|---|---|
| GET | `/web/products/:productId/reviews` | `fetchProductReviews(productId)` | Public. Query: `page`, `limit` |
| POST | `/customer/reviews` | `submitReview(body)` | Auth. Body: `{ productId, rating (1–5), comment?, orderId? }` |

---

## 6. Auth (Customer)

| Method | Path | Frontend Helper |
|---|---|---|
| POST | `/customer-auth/login` | `loginCustomer({ email, password })` |
| POST | `/customer-auth/login-with-otp` | `loginWithOtp({ email, otp })` |
| POST | `/customer-auth/:email/otp` | `sendOtp(email)` |
| POST | `/customer-auth/otp-verification` | `verifyOtp({ email, otp })` |
| POST | `/customer-auth/email/registration` | `verifyOtpSignup({ email, otp, password })` |
| POST | `/customer-auth/refresh-token` | `refreshToken({ userId, refreshToken })` |
| GET | `/customer-auth/me` | `getCustomerProfile(token)` |
| POST | `/customer/:email/forgot-password` | `forgotPassword(email)` |
| PATCH | `/customer/reset-password/:email` | `resetPassword(email, { otp, password, confirmPassword })` |
| PATCH | `/customer/change-password` | `changePassword({ currentPassword, newPassword })` |

---

## 7. Other

| Method | Path | Frontend Helper | Notes |
|---|---|---|---|
| GET | `/web/categories` | `fetchCategories()` | Public |
| GET | `/web/categories/:rootId/sub` | `fetchSubCategories(rootId)` | Public |
| GET | `/web/brands` | `fetchBrands()` | Public |
| GET | `/web/banners` | `fetchBanners(position?)` | Public |
| GET | `/web/theme` | `fetchTheme()` | Public |
| GET | `/web/blog` | `fetchBlogList(params?)` | Public |
| GET | `/web/blog/categories` | `fetchBlogCategories()` | Public |
| GET | `/web/blog/:slug` | `fetchBlogBySlug(slug)` | Public |
| GET | `/web/sellers/:id` | `fetchSellerById(vendorId)` | Public |
| GET | `/offers/active` | `fetchActiveOffers()` | Public |
| GET | `/faqs` | `fetchFaqs()` | Public |
| GET/POST | `/customer/addresses` | `fetchAddresses()` / `addAddress(body)` | Auth |
| PATCH/DELETE | `/customer/addresses/:id` | `updateAddress(id, body)` / `deleteAddress(id)` | Auth |
| POST | `/customer/search-history` | `recordSearchHistory(body)` | Auth |
| GET | `/customer/recommended` | `fetchCustomerRecommended(params?)` | Auth |

---

## Frontend Files Reference

| File | Role |
|---|---|
| `src/constants/api.ts` | All endpoint path definitions |
| `src/lib/api.ts` | Typed API client functions (all listed above) |
| `src/lib/axios.ts` | Axios instance config (baseURL, interceptors) |
| `src/types/api.ts` | TypeScript interfaces for API responses |
| `src/app/cart/page.tsx` | Cart page — uses `fetchCart`, `updateCartItem`, `removeCartItem` |
| `src/app/checkout/page.tsx` | Checkout — uses `fetchCart`, `fetchProductById`, `createOrder` |
| `src/components/form/checkout-form.tsx` | Checkout form — builds `createOrder` payload with `deliveryAddress` |
| `src/app/products/[id]/page.tsx` | Product detail — uses `fetchProductById`, `addCartItem` |
| `src/components/card/main-product-card.tsx` | Product card — uses `addCartItem`, `fetchProductById`, wishlist APIs |
