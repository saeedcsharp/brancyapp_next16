import { NextRequest } from "next/server";
import { proxyToBrancy } from "brancy/app/api/_lib/proxy";

const fixedSubUrl = "Instagramer/link/CreateLink";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
