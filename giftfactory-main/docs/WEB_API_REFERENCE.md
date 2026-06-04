# Web API Reference

All required APIs from MVE-service modules for the Gift Factory storefront.  
Base URL: `{NEXT_PUBLIC_API_BASE_URL}/api/v1` (e.g. `http://192.168.1.17:3000/api/v1`).

---

## Public (no auth)

### Products (`web/products`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/web/products` | List products (paginated, filters) | `fetchProducts(params)` |
| GET | `/web/products/suggest?q=` | Search suggestions | `fetchProductSuggest(q)` |
| GET | `/web/products/featured` | Featured products | `fetchFeaturedProducts()` |
| GET | `/web/products/deals?limit=` | Deal products | `fetchProductDeals({ limit })` |
| GET | `/web/products/recommended?limit=` | Recommended products | `fetchProductRecommended({ limit })` |
| GET | `/web/products/:productId/related` | Related products | `fetchRelatedProducts(productId)` |
| GET | `/web/products/:productId` | Product by ID | `fetchProductById(id)` |
| GET | `/web/products/:productId/reviews` | Product reviews | `fetchProductReviews(productId)` |
| POST | `/web/products/:productId/notify-in-stock` | Notify when in stock | `notifyInStock(productId, email)` |

### Categories (`web/categories`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/web-categories/categories/tree` | List root categories | `fetchCategories()` |
| GET | `/web/categories/:rootId/sub` | Sub-categories | `fetchSubCategories(rootId)` |

### Brands (`web/brands`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/web/brands` | List brands | `fetchBrands()` |

### Banners (`web/banners`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/web/banners` | List banners (optional `?position=`) | `fetchBanners(position)` |

### Theme (`web/theme`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/web/theme` | Theme / branding (logo, colors) | `fetchTheme()` |

### Blog (`web/blog`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/web/blog` | List posts (paginated) | `fetchBlogList(params)` |
| GET | `/web/blog/categories` | Blog categories | `fetchBlogCategories()` |
| GET | `/web/blog/:slug` | Post by slug | `fetchBlogBySlug(slug)` |

### Offers

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/offers/active` | Active offers | `fetchActiveOffers()` |

### Coupons / Discounts

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/coupons/validate/:code` | Validate coupon | (use `get(API_ENDPOINTS.coupons.validate(code))`) |
| GET | `/discounts/validate/:code` | Validate discount | (use `get(API_ENDPOINTS.discounts.validate(code))`) |

### FAQs (`faqs`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/faqs` | List all published FAQs | `fetchFaqs()` |

---

## Customer auth (`customer-auth`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| POST | `/customer-auth/login` | Login (email, password) | `loginCustomer(body)` |
| POST | `/customer-auth/login-with-otp` | Login with OTP | `loginWithOtp(body)` |
| POST | `/customer-auth/:email/otp` | Send OTP | `sendOtp(email)` |
| POST | `/customer-auth/otp-verification` | Verify OTP / signup | `verifyOtp(body)`, `verifyOtpSignup(body)` |
| POST | `/customer-auth/refresh-token` | Refresh tokens | `refreshToken(body)` |
| POST | `/customer/:email/forgot-password` | Forgot password | `forgotPassword(email)` |
| PATCH | `/customer/reset-password/:email` | Reset password (otp, password, confirmPassword) | `resetPassword(email, body)` |
| POST | `/customer/logout` | Logout | (use post) |
| GET | `/customer-auth/me` | Current customer | `getCustomerProfile(token)` |
| PATCH | `/customer/change-password` | Change password | `changePassword(body)` |
| PATCH | `/customer-auth/profile-update` | Update profile | (use patch) |

---

## Customer (auth required)

### Cart (`cart`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/cart` | Get carts | `fetchCart()` |
| POST | `/cart/item` | Add item (merchantId, item: productId, quantity, priceAtAddition, variantId?) | `addCartItem(body)` |
| PATCH | `/cart/:cartId/item` | Update item (itemId, quantity) | `updateCartItem(cartId, body)` |
| DELETE | `/cart/:cartId/item` | Remove item (itemId) | `removeCartItem(cartId, body)` |
| DELETE | `/cart/:cartId` | Delete cart | `deleteCart(cartId)` |

### Wishlist (`customer/wishlist`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/customer/wishlist` | Get wishlist | `fetchWishlist()` |
| POST | `/customer/wishlist` | Add (productId, productSlug, productUrl) | `addWishlistItem(body)` |
| DELETE | `/customer/wishlist/:wishlistId` | Remove | `removeWishlistItem(wishlistId)` |

### Orders (`customer/orders`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| POST | `/customer/orders` | Create order | `createOrder(body)` |
| GET | `/customer/orders` | List orders | `fetchOrders(params)` |
| GET | `/customer/orders/:orderId` | Order by ID | `fetchOrderById(orderId)` |
| GET | `/customer/orders/by-number/:orderNumber` | Order by number | `fetchOrderByOrderNumber(orderNumber)` |
| GET | `/customer/orders/track/:orderNumber` | Track order | `trackOrder(orderNumber)` |
| GET | `/customer/orders/:orderId/invoice` | Invoice data | `fetchOrderInvoice(orderId)` |
| PATCH | `/customer/orders/cancel/:orderId` | Cancel order | `cancelOrder(orderId)` |
| POST | `/customer/orders/:orderId/return-request` | Return request (reason, comment?) | `returnRequestOrder(orderId, body)` |
| POST | `/customer/orders/reorder/:orderId` | Reorder (optional paymentMethod, shippingAddress) | `reorder(orderId, body)` |

### Addresses (`customer/addresses`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| GET | `/customer/addresses` | List addresses | `fetchAddresses()` |
| POST | `/customer/addresses` | Add address | `addAddress(body)` |
| PATCH | `/customer/addresses/:addressId` | Update address | `updateAddress(addressId, body)` |
| DELETE | `/customer/addresses/:addressId` | Delete address | `deleteAddress(addressId)` |

### Reviews (`customer/reviews`)

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| POST | `/customer/reviews` | Submit review (productId, rating, comment?, orderId?) | `submitReview(body)` |

### Search history & recommendations

| Method | Path | Description | Frontend function |
|--------|------|-------------|-------------------|
| POST | `/customer/search-history` | Record search (query?, categoryId?) | `recordSearchHistory(body)` |
| GET | `/customer/recommended` | Recommended for you (limit?) | `fetchCustomerRecommended(params)` |

---

## Constants & client

- **Endpoints:** `giftfactory/src/constants/api.ts` (`API_ENDPOINTS`)
- **Client:** `giftfactory/src/lib/api.ts` (all `fetch*` / `add*` / `update*` / etc.)
- **Base URL:** `getApiBaseUrl()` in `constants/api.ts` (uses `NEXT_PUBLIC_API_BASE_URL` or `NEXT_PUBLIC_BASE_URL_LOCAL`)
