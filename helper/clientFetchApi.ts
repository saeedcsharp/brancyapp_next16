import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { MethodType, IResult, StringDitionaryItem } from "brancy/helper/api";
import { ResponseType } from "brancy/components/notifications/notificationBox";
import { resolveBackendSubUrl } from "brancy/helper/apiRouteMap";

const API_BASE_URL = "https://api.brancy.app/";

function normalizeResult<J>(raw: any, statusCode = 500, errorMessage = ""): IResult<J> {
  return {
    succeeded: raw?.succeeded ?? false,
    value: (raw?.value ?? null) as J,
    info: (raw?.info ?? {
      exception: null,
      message: "",
      needsChallenge: false,
      actionBlockEnd: null,
      responseType: ResponseType.Unexpected,
    }) as any,
    statusCode,
    errorMessage,
  };
}

function getSessionAccessToken(session: Session | null | undefined): string {
  return (session?.user as any)?.accessToken ?? "";
}

function getSessionInstagramerId(session: Session | null | undefined): string {
  const user = session?.user as any;
  const currentIndex = Number(user?.currentIndex ?? -1);
  const instagramerIds = Array.isArray(user?.instagramerIds) ? user.instagramerIds : [];
  if (currentIndex >= 0 && currentIndex < instagramerIds.length) {
    return String(instagramerIds[currentIndex]);
  }
  return "-1";
}

interface FetchOptions<T> {
  session?: Session | null;
  accessToken?: string | null;
  methodType?: MethodType;
  data?: any;
  queries?: StringDitionaryItem[];
  onUploadProgress?: (numb: number) => void;
}

function lowerFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function toLocalApiPath(endpointOrPath: string): string {
  if (!endpointOrPath) return "/api/health/check";
  if (endpointOrPath.startsWith("/api/")) {
    const cleanApiPath = endpointOrPath.split("?")[0];
    const parts = cleanApiPath.split("/").filter(Boolean);
    if (parts.length >= 3) {
      return `/${parts[0]}/${parts[1]}/${lowerFirst(parts[2])}`;
    }
    return cleanApiPath;
  }

  const clean = endpointOrPath.split("?")[0];
  const segments = clean.split("/").filter(Boolean);

  if (segments.length >= 3) {
    return `/api/${segments[1].toLowerCase()}/${lowerFirst(segments[2])}`;
  }

  if (segments.length === 2) {
    return `/api/${segments[0].toLowerCase()}/${lowerFirst(segments[1])}`;
  }

  return `/api/general/${segments[0] ?? "check"}`;
}

/**
 * Check if a local API path belongs to /api/user/* (must stay server-side).
 */
function isUserRoute(localPath: string): boolean {
  const clean = localPath.split("?")[0].toLowerCase();
  return clean.startsWith("/api/user/") || clean === "/api/user";
}

/**
 * Build the direct backend URL for a given backend sub-URL and query parameters.
 */
function buildDirectUrl(subUrl: string, queries: StringDitionaryItem[] = []): string {
  const url = new URL(subUrl, API_BASE_URL);
  for (const item of queries) {
    if (item?.value !== undefined) {
      url.searchParams.append(item.key, item.value);
    }
  }
  return url.toString();
}

/**
 * Call the backend directly from the client (bypassing Next.js API route).
 */
async function fetchDirect<TRes>(
  backendSubUrl: string,
  methodType: MethodType,
  accessToken: string,
  instagramerId: string,
  data: any,
  queries: StringDitionaryItem[],
  onUploadProgress?: (numb: number) => void,
  session?: Session | null,
): Promise<IResult<TRes>> {
  try {
    const targetUrl = buildDirectUrl(backendSubUrl, queries);

    const res = await fetch(targetUrl, {
      method: methodType === MethodType.post ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ?? "",
        instagramerId,
      },
      body: methodType === MethodType.post ? JSON.stringify(data) : undefined,
      cache: "no-store",
    });

    if (onUploadProgress) onUploadProgress(100);

    if (res.status === 401 && session?.user?.loginByInsta) {
      signOut({ callbackUrl: "/" });
      return normalizeResult<TRes>(null, 401, "Unauthorized");
    }

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    return normalizeResult<TRes>(json, res.status, res.statusText);
  } catch (error: any) {
    return normalizeResult<TRes>(null, 500, error?.message ?? "Unexpected");
  }
}

/**
 * Call through the Next.js API proxy (used only for /api/user/* routes).
 */
async function fetchViaProxy<TRes>(
  localPath: string,
  methodType: MethodType,
  accessToken: string,
  instagramerId: string,
  data: any,
  queries: StringDitionaryItem[],
  onUploadProgress?: (numb: number) => void,
  session?: Session | null,
): Promise<IResult<TRes>> {
  try {
    const res = await fetch(localPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ?? "",
        instagramerId,
      },
      body: JSON.stringify({ methodType, data, queries }),
    });

    if (onUploadProgress) onUploadProgress(100);

    if (res.status === 401 && session?.user?.loginByInsta) {
      signOut({ callbackUrl: "/" });
      return normalizeResult<TRes>(null, 401, "Unauthorized");
    }

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    return normalizeResult<TRes>(json, res.status, res.statusText);
  } catch (error: any) {
    return normalizeResult<TRes>(null, 500, error?.message ?? "Unexpected");
  }
}

export async function clientFetchApi<TReq, TRes>(
  path: string,
  options: FetchOptions<TReq> = {},
): Promise<IResult<TRes>> {
  const { session, methodType = MethodType.get, data, queries = [], onUploadProgress } = options;

  const accessToken = options.accessToken ?? getSessionAccessToken(session);
  const instagramerId = session ? getSessionInstagramerId(session) : "-1";
  const localPath = toLocalApiPath(path);

  // /api/user/* → keep going through Next.js API proxy (server-side)
  if (isUserRoute(localPath)) {
    return fetchViaProxy<TRes>(
      localPath,
      methodType,
      accessToken,
      instagramerId,
      data,
      queries,
      onUploadProgress,
      session,
    );
  }

  // All other routes → call backend directly from client
  const backendSubUrl = resolveBackendSubUrl(localPath);
  if (backendSubUrl) {
    return fetchDirect<TRes>(
      backendSubUrl,
      methodType,
      accessToken,
      instagramerId,
      data,
      queries,
      onUploadProgress,
      session,
    );
  }

  // Fallback: if route not found in map, try to infer the correct backend path
  // based on the scope prefix patterns used in the codebase.
  const parts = localPath.split("?")[0].split("/").filter(Boolean);
  if (parts.length >= 3) {
    const scope = parts[1].toLowerCase();
    const action = parts[2];

    // Map scope to the correct backend service prefix
    const SCOPE_PREFIX_MAP: Record<string, string> = {
      account: "Instagramer/Account",
      address: "User/Address",
      ai: "Instagramer/AI",
      autoacceptfollower: "Instagramer/AutoAcceptFollower",
      authorize: "Business/Authorize",
      bio: "Instagramer/Bio",
      comment: "Instagramer/Comment",
      dayevent: "Instagramer/DayEvent",
      flow: "Instagramer/Flow",
      hashtag: "Instagramer/hashtag",
      home: "Instagramer/Home",
      instagramer: "Instagramer",
      likecomment: "Instagramer/LikeComment",
      likelastpostfollower: "Instagramer/LikeLastPostFollower",
      link: "Instagramer/Link",
      lottery: "Instagramer/Lottery",
      message: "Instagramer/Message",
      order: "Shopper/Order",
      post: "Instagramer/Post",
      preinstagramer: "PreInstagramer",
      product: "shopper/Product",
      psg: "Instagramer/PSG",
      session: "User/Session",
      shop: "user/shop",
      statistics: "Instagramer/Statistics",
      story: "Instagramer/Story",
      systemticket: "User/SystemTicket",
      ticket: "Instagramer/Ticket",
      uisetting: "Instagramer/UiSetting",
      unfollowallfollowing: "Instagramer/UnfollowAllFollowing",
      users: "Instagramer/Users",
    };

    const prefix = SCOPE_PREFIX_MAP[scope];
    const fallbackSubUrl = prefix ? `${prefix}/${action}` : `${scope}/${action}`;

    return fetchDirect<TRes>(
      fallbackSubUrl,
      methodType,
      accessToken,
      instagramerId,
      data,
      queries,
      onUploadProgress,
      session,
    );
  }

  // Last resort: proxy through Next.js
  return fetchViaProxy<TRes>(
    localPath,
    methodType,
    accessToken,
    instagramerId,
    data,
    queries,
    onUploadProgress,
    session,
  );
}

export async function clientFetchApiWithAccessToken<TReq, TRes>(
  path: string,
  options: FetchOptions<TReq> = {},
): Promise<IResult<TRes>> {
  return clientFetchApi<TReq, TRes>(path, {
    ...options,
    session: undefined,
  });
}
