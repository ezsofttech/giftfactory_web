import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "giftfactory-web",
    check: "liveness",
    env: process.env.APP_ENV ?? process.env.NODE_ENV ?? "unknown",
  });
}
