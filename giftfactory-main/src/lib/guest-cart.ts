/**
 * Guest cart — persists in localStorage for unauthenticated users.
 * Items are synced to the server on login and then cleared.
 */

const GUEST_CART_KEY = "gf_guest_cart";
const GUEST_CART_ID_KEY = "gf_guest_cart_id";
const GUEST_CART_UPDATED_EVENT = "guest-cart-updated";

export function getGuestCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_CART_ID_KEY);
}

export function saveGuestCartId(cartId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_ID_KEY, cartId);
}

export function clearGuestCartId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_ID_KEY);
}

export function getOrCreateGuestSessionId(): string {
  let id = getGuestCartId();
  if (!id) {
    id = "gs_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    saveGuestCartId(id);
  }
  return id;
}

export interface GuestCartItem {
  productId: string;
  /** May be undefined if added from a list card — resolved during sync */
  variantId?: string;
  quantity: number;
  priceAtAddition: number;
  title?: string;
  thumbnail?: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emitGuestCartUpdated() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(GUEST_CART_UPDATED_EVENT));
}

export function getGuestCart(): GuestCartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GuestCartItem[];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  emitGuestCartUpdated();
}

export function clearGuestCart(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(GUEST_CART_KEY);
  clearGuestCartId();
  emitGuestCartUpdated();
}

export function addToGuestCart(item: GuestCartItem): void {
  const cart = getGuestCart();
  const existingIdx = cart.findIndex(
    (i) =>
      i.productId === item.productId &&
      (item.variantId ? i.variantId === item.variantId : true)
  );
  if (existingIdx !== -1) {
    cart[existingIdx].quantity += item.quantity;
    cart[existingIdx].priceAtAddition = item.priceAtAddition;
  } else {
    cart.push(item);
  }
  saveGuestCart(cart);
}

export function updateGuestCartItem(
  productId: string,
  variantId: string | undefined,
  quantity: number
): void {
  const cart = getGuestCart().map((i) => {
    if (i.productId === productId && i.variantId === variantId) {
      return { ...i, quantity };
    }
    return i;
  });
  saveGuestCart(cart);
}

export function removeFromGuestCart(
  productId: string,
  variantId: string | undefined
): void {
  const cart = getGuestCart().filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  );
  saveGuestCart(cart);
}

export function guestCartCount(): number {
  return getGuestCart().reduce((sum, i) => sum + i.quantity, 0);
}
