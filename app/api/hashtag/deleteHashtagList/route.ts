import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Instagramer/hashtag/DeleteHashtagList";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
