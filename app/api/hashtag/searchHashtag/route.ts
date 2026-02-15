import { NextRequest } from "next/server";
import { proxyToBrancy } from "../../_lib/proxy";

const fixedSubUrl = "Instagramer/hashtag/searchHashtag";

export async function POST(request: NextRequest) {
  return proxyToBrancy(request, fixedSubUrl);
}
