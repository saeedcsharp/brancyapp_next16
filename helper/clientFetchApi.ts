import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { MethodType, IResult, StringDitionaryItem } from "saeed/helper/api";
import { ResponseType } from "saeed/components/notifications/notificationBox";

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

function withQuery(path: string, queries: StringDitionaryItem[] = []): string {
  return path;
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
    console.log("parts...", parts);
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

export async function clientFetchApi<TReq, TRes>(
  path: string,
  options: FetchOptions<TReq> = {},
): Promise<IResult<TRes>> {
  const { session, methodType = MethodType.get, data, queries = [], onUploadProgress } = options;

  const accessToken = options.accessToken ?? getSessionAccessToken(session);
  const instagramerId = session ? getSessionInstagramerId(session) : "-1";
  const localPath = toLocalApiPath(path);

  try {
    const res = await fetch(withQuery(localPath, queries), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ?? "",
        instagramerId,
      },
      body: JSON.stringify({ methodType, data, queries }),
    });

    if (onUploadProgress) onUploadProgress(100);

    if (res.status === 401) {
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

export async function clientFetchApiWithAccessToken<TReq, TRes>(
  path: string,
  options: FetchOptions<TReq> = {},
): Promise<IResult<TRes>> {
  return clientFetchApi<TReq, TRes>(path, {
    ...options,
    session: undefined,
  });
}
