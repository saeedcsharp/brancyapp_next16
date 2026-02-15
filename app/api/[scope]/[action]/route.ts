import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.brancy.app/";

interface StringDitionaryItem {
  key: string;
  value?: string;
}

function buildExternalUrl(subUrl: string, queries: StringDitionaryItem[] = []): string {
  const url = new URL(subUrl, API_BASE_URL);
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

export async function POST(request: NextRequest, { params }: { params: Promise<{ scope: string; action: string }> }) {
  try {
    const resolvedParams = await params;
    const payload = await request.json();

    const methodType = Number(payload?.methodType ?? 0);
    const subUrl =
      typeof payload?.subUrl === "string" && payload.subUrl.trim().length > 0
        ? payload.subUrl
        : `${resolvedParams.scope}/${resolvedParams.action}`;
    const data = payload?.data;
    const queries: StringDitionaryItem[] = Array.isArray(payload?.queries) ? payload.queries : [];

    const targetUrl = buildExternalUrl(subUrl, queries);

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

    const text = await upstreamResponse.text();

    return new NextResponse(text, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": upstreamResponse.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error: any) {
    return NextResponse.json(toErrorResult(error?.message ?? "Unexpected proxy error"), { status: 500 });
  }
}
