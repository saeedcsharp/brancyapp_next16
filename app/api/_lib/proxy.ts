import { NextRequest, NextResponse } from "next/server";
import { getServerApiBaseUrl } from "brancy/helper/apiBaseUrl";

interface StringDitionaryItem {
  key: string;
  value?: string;
}

function buildExternalUrl(subUrl: string, queries: StringDitionaryItem[] = [], host?: string | null): string {
  const url = new URL(subUrl, getServerApiBaseUrl(host));
  for (const item of queries) {
    if (item?.value !== undefined) {
      url.searchParams.append(item.key, item.value);
    }
  }
  return url.toString();
}

function toErrorResult(message: string) {
  return {
    succeeded: false,
    value: null,
    info: {
      exception: null,
      message,
      needsChallenge: false,
      actionBlockEnd: null,
      responseType: 0,
    },
    statusCode: 500,
    errorMessage: message,
  };
}

export async function proxyToBrancy(request: NextRequest, fixedSubUrl: string) {
  try {
    const payload = await request.json();
    const methodType = Number(payload?.methodType ?? 0);
    const subUrl = typeof payload?.subUrl === "string" && payload.subUrl.trim() ? payload.subUrl : fixedSubUrl;
    const data = payload?.data;
    const queries: StringDitionaryItem[] = Array.isArray(payload?.queries) ? payload.queries : [];

    const targetUrl = buildExternalUrl(subUrl, queries, request.headers.get("host"));

    const upstreamResponse = await fetch(targetUrl, {
      method: methodType === 1 ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("authorization") ?? "",
        instagramerId: request.headers.get("instagramerid") ?? "-1",
      },
      body: methodType === 1 ? JSON.stringify(data) : undefined,
      cache: "no-store",
    });
    if (upstreamResponse.status === 401) {
      console.log("Unauthorized response from upstream API, signing out user.");
      const res = NextResponse.json(toErrorResult("Unauthorized"), { status: 401 });
      res.cookies.delete("next-auth.session-token");
      res.cookies.delete("__Secure-next-auth.session-token");
      return res;
    }
    const text = await upstreamResponse.text();

    return new NextResponse(text, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": upstreamResponse.headers.get("Content-Type") ?? "application/json",
        "X-Upstream-URL": targetUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(toErrorResult(error?.message ?? "Unexpected proxy error"), { status: 500 });
  }
}
