export type BreadcrumbEntry = {
  label: string;
  /** `null` for the current page (not linked) */
  href: string | null;
};

const STATIC_LABELS: Record<string, string> = {
  products: "Shop",
  search: "Search",
  cart: "Cart",
  checkout: "Checkout",
  orders: "Orders",
  wishlist: "Wishlist",
  profile: "Profile",
  addresses: "Addresses",
  settings: "Settings",
  help: "Help",
  blog: "Blog",
  about: "About",
  shipping: "Shipping",
  returns: "Returns",
  privacy: "Privacy",
  conditions: "Terms & Conditions",
  careers: "Careers",
  press: "Press",
  advertise: "Advertise",
  affiliate: "Affiliate",
  sellers: "Sellers",
  sell: "Sell",
  login: "Login",
  signup: "Sign up",
  newsletter: "Newsletter",
  unsubscribe: "Unsubscribe",
  menu: "Menu",
  dummy: "Demo",
  "interest-ads": "Interest-based ads",
};

function isProbablyOpaqueId(s: string): boolean {
  if (/^[a-f\d]{24}$/i.test(s)) return true;
  if (/^[a-f\d-]{32,36}$/i.test(s)) return true;
  return s.length > 28 && /^[a-z\d_-]+$/i.test(s);
}

function titleFromSlug(slug: string): string {
  try {
    const decoded = decodeURIComponent(slug);
    return decoded
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return slug;
  }
}

function labelForSegment(seg: string, parent: string | null, isLast: boolean): string {
  if (STATIC_LABELS[seg]) return STATIC_LABELS[seg];
  if (parent === "products" && isProbablyOpaqueId(seg)) return "Product";
  if (parent === "orders" && isProbablyOpaqueId(seg)) return "Order details";
  if (parent === "sellers" && isProbablyOpaqueId(seg)) return "Seller";
  if (parent === "blog") return titleFromSlug(seg);
  return titleFromSlug(seg);
}

/**
 * Builds breadcrumb trail from a pathname (no query string).
 * Returns an empty array for `/` so the bar can be hidden on home.
 */
export function getBreadcrumbsFromPath(pathname: string): BreadcrumbEntry[] {
  const normalized = pathname.split("?")[0] ?? pathname;
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) return [];

  const items: BreadcrumbEntry[] = [{ label: "Home", href: "/" }];

  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    acc += `/${seg}`;
    const parent = i > 0 ? segments[i - 1]! : null;
    const isLast = i === segments.length - 1;
    const label = labelForSegment(seg, parent, isLast);
    items.push({
      label,
      href: isLast ? null : acc,
    });
  }

  return items;
}
