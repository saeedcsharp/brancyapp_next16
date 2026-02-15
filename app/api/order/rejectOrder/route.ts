import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Shopper/Order/RejectOrder";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
