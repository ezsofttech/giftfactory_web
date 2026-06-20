import { getApiBaseUrl } from "@/constants/api";

export type PincodeLocationData = {
  pincode: string;
  block?: string;
  state?: string;
  city?: string;
  country?: string;
};

type PincodeApiResponse = {
  status?: number;
  success?: boolean;
  message?: string;
  data?: PincodeLocationData | null;
};

/**
 * Resolves URL for GET /api/v1/pincode/:code
 * - NEXT_PUBLIC_PINCODE_API_BASE_URL (e.g. https://api.giftfactory.com) if set
 * - Else browser: same-origin /api/v1/... (Next rewrites when API base is configured)
 * - Else absolute API base from env, then https://api.giftfactory.com
 */
export function resolvePincodeRequestUrl(pincode: string): string {
  const clean = pincode.replace(/\D/g, "");
  const path = `/pincode/${encodeURIComponent(clean)}`;

  const pinOrigin = process.env.NEXT_PUBLIC_PINCODE_API_BASE_URL?.trim().replace(/\/$/, "");
  if (pinOrigin) return `${pinOrigin}/api/v1${path}`;

  const base = getApiBaseUrl();
  if (base.startsWith("http")) return `${base}${path}`;

  if (typeof window !== "undefined") return `/api/v1${path}`;

  const fallback = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") || "https://api.giftfactory.com";
  return `${fallback}/api/v1${path}`;
}

export async function fetchPincodeDetails(pincode: string): Promise<PincodeLocationData | null> {
  const clean = pincode.replace(/\D/g, "");
  if (clean.length < 6) return null;

  const url = resolvePincodeRequestUrl(clean);
  const res = await fetch(url, { method: "GET", headers: { accept: "application/json" } });
  if (!res.ok) return null;

  const json = (await res.json()) as PincodeApiResponse;
  if (!json.success || !json.data?.pincode) return null;

  return {
    pincode: json.data.pincode,
    block: json.data.block,
    state: json.data.state,
    city: json.data.city,
    country: json.data.country,
  };
}
