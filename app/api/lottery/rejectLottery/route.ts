import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Instagramer/Lottery/RejectLottery";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
