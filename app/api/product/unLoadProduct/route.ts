import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "shopper/Product/UnLoadProduct";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
