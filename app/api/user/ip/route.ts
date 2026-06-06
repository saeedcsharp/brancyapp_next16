import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.json({ countryCode: null });
  }

  // Cloudflare sets cf-ipcountry, ArvanCloud sets ar-real-ip-country or similar.
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    request.headers.get("ar-real-ip-country") ||
    null;

  return NextResponse.json({ countryCode: country?.toLowerCase() ?? null });
}
