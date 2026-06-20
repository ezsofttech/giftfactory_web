/**
 * Backend-ready seed data: products with MOQ and bulk pricing (b2bPriceTiers).
 * Matches scripts/seed-products.json structure for seeding backend.
 */
import type { ApiB2BPriceTier, ApiProductVariation } from "@/types/api";

/** Single product seed: MOQ + bulk pricing + variations */
export interface SeedProductB2B {
  title?: string;
  slug?: string;
  defaultPrice?: number;
  moq: number;
  rfqAvailable?: boolean;
  b2bPriceTiers: ApiB2BPriceTier[];
  variations: ApiProductVariation[];
}

/** B2B price tiers for quantity-based (bulk) pricing */
export const SEED_B2B_PRICE_TIERS: ApiB2BPriceTier[] = [
  { minQty: 1, maxQty: 99, price: 405, label: "1 - 99 pieces" },
  { minQty: 100, maxQty: 999, price: 337, label: "100 - 999 pieces" },
  { minQty: 1000, maxQty: null, price: 268, label: ">= 1,000 pieces" },
];

/** Product variations with id/sku for cart/order */
export const SEED_PRODUCT_VARIATIONS: ApiProductVariation[] = [
  {
    name: "Electric current type",
    key: "electric_current",
    options: [
      { value: "AC", id: "opt-ac", sku: "AC" },
      { value: "DC", id: "opt-dc", sku: "DC" },
    ],
  },
  {
    name: "Model number",
    key: "model",
    options: [
      { value: "GZ380A/GZ380B", id: "opt-gz380ab", sku: "GZ380AB" },
      { value: "GZ380C", id: "opt-gz380c", sku: "GZ380C" },
    ],
  },
  {
    name: "Air volume",
    key: "air_volume",
    options: [
      { value: "4600 m³/h - 5800 m³/h", id: "opt-46-58", sku: "AV46-58" },
      { value: "6000 m³/h - 7000 m³/h", id: "opt-60-70", sku: "AV60-70" },
    ],
  },
  {
    name: "Speed",
    key: "speed",
    options: [
      { value: "2900r/min", id: "opt-2900", sku: "SP2900" },
      { value: "3450r/min", id: "opt-3450", sku: "SP3450" },
    ],
  },
];

/** Default B2B fields applied when no per-product seed */
export const SEED_PRODUCT_B2B_FIELDS: SeedProductB2B = {
  moq: 1,
  rfqAvailable: true,
  b2bPriceTiers: SEED_B2B_PRICE_TIERS,
  variations: SEED_PRODUCT_VARIATIONS,
};

/** Full seed structure: per-product MOQ + bulk pricing (matches seed-products.json) */
export const SEED_PRODUCTS_WITH_B2B: SeedProductB2B[] = [
  {
    title: "Industrial Blower Unit",
    slug: "industrial-blower-unit",
    defaultPrice: 450,
    moq: 10,
    rfqAvailable: true,
    b2bPriceTiers: [
      { minQty: 10, maxQty: 99, price: 405, label: "10 - 99 pieces" },
      { minQty: 100, maxQty: 499, price: 337, label: "100 - 499 pieces" },
      { minQty: 500, maxQty: 999, price: 295, label: "500 - 999 pieces" },
      { minQty: 1000, maxQty: null, price: 268, label: ">= 1,000 pieces" },
    ],
    variations: SEED_PRODUCT_VARIATIONS,
  },
  {
    title: "Premium Gift Box Set",
    slug: "premium-gift-box-set",
    defaultPrice: 1299,
    moq: 24,
    rfqAvailable: true,
    b2bPriceTiers: [
      { minQty: 24, maxQty: 99, price: 1099, label: "24 - 99 pieces" },
      { minQty: 100, maxQty: 499, price: 999, label: "100 - 499 pieces" },
      { minQty: 500, maxQty: null, price: 899, label: ">= 500 pieces" },
    ],
    variations: [
      {
        name: "Size",
        key: "size",
        options: [
          { value: "Small", id: "opt-sm", sku: "S" },
          { value: "Medium", id: "opt-md", sku: "M" },
          { value: "Large", id: "opt-lg", sku: "L" },
        ],
      },
    ],
  },
  {
    title: "Custom Printed Mugs",
    slug: "custom-printed-mugs",
    defaultPrice: 349,
    moq: 50,
    rfqAvailable: true,
    b2bPriceTiers: [
      { minQty: 50, maxQty: 199, price: 299, label: "50 - 199 pieces" },
      { minQty: 200, maxQty: 999, price: 249, label: "200 - 999 pieces" },
      { minQty: 1000, maxQty: null, price: 199, label: ">= 1,000 pieces" },
    ],
    variations: [],
  },
];
