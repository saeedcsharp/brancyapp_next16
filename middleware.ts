import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { readFileSync } from "fs";
function getAuthSecret(): string {
  try {
    const secret = readFileSync("/run/secrets/brancyapp_jwt_token", "utf8").trim();
    if (secret) return secret;
  } catch {}
  const secret = process.env.NEXTAUTH_SECRET;
  return secret || "9feJvapw9jpevAe9p8phvpaivIaWehv89paHVewf";
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const isInstagramerRoute = [
    "/advertise",
    "/customerads",
    "/home",
    "/market",
    "/message",
    "/page",
    "/search",
    "/setting",
    "/store",
    "/wallet",
  ].some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`));

  if (!isInstagramerRoute) {
    return NextResponse.next();
  }

  if (token.currentIndex === -1) {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  if (typeof token.packageExpireTime !== "number" || token.packageExpireTime * 1e3 <= Date.now()) {
    return NextResponse.redirect(new URL("/upgrade", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/advertise/:path*",
    "/customerads/:path*",
    "/home/:path*",
    "/market/:path*",
    "/message/:path*",
    "/page/:path*",
    "/search/:path*",
    "/setting/:path*",
    "/store/:path*",
    "/wallet/:path*",
    "/customershop/:path*",
    "/user/:path*",
  ],
};

export const runtime = "nodejs";
