import { redirect } from "next/navigation";

/**
 * Global customer login page – redirects to signup which has both Sign In and Sign Up.
 * Preserves callbackUrl and other search params.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.callbackUrl && typeof params.callbackUrl === "string") {
    q.set("callbackUrl", params.callbackUrl);
  }
  if (params.tab && typeof params.tab === "string") {
    q.set("tab", params.tab);
  }
  const query = q.toString();
  redirect(query ? `/signup?${query}` : "/signup");
}
