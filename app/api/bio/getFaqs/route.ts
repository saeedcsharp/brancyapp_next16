import { NextRequest } from "next/server";
import { proxyToBrancy } from "brancy/app/api/_lib/proxy";

const fixedSubUrl = "Instagramer/bio/GetFaqs";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
