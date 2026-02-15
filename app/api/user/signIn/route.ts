import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "User/signIn";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
