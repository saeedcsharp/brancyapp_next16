import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Business/Authorize/SaveSupportLogestic";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
