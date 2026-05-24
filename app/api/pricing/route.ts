import { NextRequest, NextResponse } from "next/server";
import { getInternalApiBaseUrl, getServerApiBaseUrl } from "brancy/helper/apiBaseUrl";

function detectCountryCode(request: NextRequest, apiBase: string): string {
  // Arvan Cloud header (Iran)
  const arvan = request.headers.get("X-Country-Code");
  if (arvan) return arvan;

  // Cloudflare header
  const cf = request.headers.get("Cf-Ipcountry");
  if (cf) return cf;

  // Fallback: derive from the resolved API base URL
  // If we're hitting the IR or local (patran.ir) backend → IR prices
  if (apiBase.includes("brancy.ir") || apiBase.includes("patran.ir")) return "IR";

  return "US";
}

export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  const apiBase = getInternalApiBaseUrl(host);
  const countryCode = detectCountryCode(request, apiBase);

  try {
    const url = new URL("MyLink/GetPackagePrices", apiBase);
    url.searchParams.set("countryCode", countryCode);

    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // cache for 24 hours
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch prices" }, { status: response.status });
    }

    const data = await response.json();

    // Unwrap doubly nested response: { succeeded, value: { isSuccess, value: [...] } }
    let prices: unknown[] = [];
    if (Array.isArray(data)) {
      prices = data;
    } else if (Array.isArray(data?.value?.value)) {
      prices = data.value.value;
    } else if (Array.isArray(data?.value)) {
      prices = data.value;
    }

    return NextResponse.json(prices);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
