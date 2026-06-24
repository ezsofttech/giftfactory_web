import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function apiOrigin(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL_LOCAL?.trim();
  if (!raw) return null;

  let base = raw.replace(/\/+$/, "");
  if (base.endsWith("/api/v1")) {
    base = base.slice(0, -7);
  }
  return base;
}

export async function GET() {
  const apiBase = apiOrigin();
  if (!apiBase) {
    return NextResponse.json(
      {
        status: "error",
        check: "ready",
        reason: "NEXT_PUBLIC_API_BASE_URL not set",
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${apiBase}/api/v1/health/live`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { status: "error", check: "ready", api: apiBase, upstreamStatus: res.status },
        { status: 503 },
      );
    }
  } catch {
    return NextResponse.json(
      { status: "error", check: "ready", api: apiBase, upstream: "unreachable" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    service: "giftfactory-web",
    check: "ready",
    api: apiBase,
  });
}
