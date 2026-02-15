import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Instagramer/Home/GetLastMessages";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
