# Seed data for B2B products

## Backend-ready shape

The frontend shows **variations** and **quantity-based pricing** only when the product document includes them. Use the types and seed in this folder to align your API.

### Product document (relevant B2B fields)

- **`b2bPriceTiers`** (optional): `{ minQty, maxQty?, price, label? }[]`  
  - Example: `[{ minQty: 1, maxQty: 99, price: 405 }, { minQty: 100, maxQty: 999, price: 337 }, { minQty: 1000, maxQty: null, price: 268 }]`
- **`variations`** (optional): `{ name, key?, options }[]`  
  - **`options`** can be:
    - `string[]` – display value only
    - `{ value: string; id?: string; sku?: string; priceAdjust?: number }[]` – for cart/order (id/sku)
- **`moq`** (optional): number  
- **`rfqAvailable`** (optional): boolean  
- **`b2bPrice`** (optional): number (single B2B price when no tiers)

### Seed usage

- **`SEED_B2B_PRICE_TIERS`** – use to seed or PATCH products with quantity-based pricing.
- **`SEED_PRODUCT_VARIATIONS`** – use to seed or PATCH products with variation attributes (option id/sku for backend).
- **`SEED_PRODUCT_B2B_FIELDS`** – combined payload to merge into a product for seeding.

If the API returns these fields on a product, the product page will show the B2B tiered pricing table and the Variations section. If not, only the simple B2B price (or “on request”) and RFQ are shown.
