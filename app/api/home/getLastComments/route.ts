import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Instagramer/Home/GetLastComments";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
