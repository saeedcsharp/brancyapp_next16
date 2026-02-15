import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Instagramer/Statistics/GetBestFollowers";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
