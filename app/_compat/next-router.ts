"use client";

import React, { ComponentType } from "react";
import { useParams, usePathname, useRouter as useAppRouter, useSearchParams } from "next/navigation";

type QueryValue = string | string[] | undefined;
type Query = Record<string, QueryValue>;

export type NextRouter = {
  pathname: string;
  route: string;
  asPath: string;
  query: Query;
  basePath: string;
  isReady: boolean;
  isFallback: boolean;
  isLocaleDomain: boolean;
  isPreview: boolean;
  push: (url: string | { pathname?: string; query?: Record<string, unknown> }) => Promise<boolean>;
  replace: (url: string | { pathname?: string; query?: Record<string, unknown> }) => Promise<boolean>;
  reload: () => void;
  back: () => void;
  prefetch: (url: string) => Promise<void>;
  events: {
    on: () => void;
    off: () => void;
    emit: () => void;
  };
};

const events = {
  on: () => {},
  off: () => {},
  emit: () => {},
};

function toHref(url: string | { pathname?: string; query?: Record<string, unknown> }): string {
  if (typeof url === "string") return url;
  const pathname = url.pathname || "/";
  const query = url.query || {};
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
      return;
    }
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function getAsPath(pathname: string, searchParams: URLSearchParams | null): string {
  const query = searchParams?.toString() || "";
  return query ? `${pathname}?${query}` : pathname;
}

function buildQuery(params: ReturnType<typeof useParams>, searchParams: ReturnType<typeof useSearchParams>): Query {
  const query: Query = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    query[key] = value as QueryValue;
  });

  if (searchParams) {
    searchParams.forEach((value, key) => {
      if (query[key] === undefined) {
        query[key] = value;
      } else if (Array.isArray(query[key])) {
        query[key] = [...(query[key] as string[]), value];
      } else {
        query[key] = [query[key] as string, value];
      }
    });
  }

  return query;
}

export function useRouter(): NextRouter {
  const appRouter = useAppRouter();
  const pathname = usePathname() || "/";
  const params = useParams();
  const searchParams = useSearchParams();

  return {
    pathname,
    route: pathname,
    asPath: getAsPath(pathname, searchParams),
    query: buildQuery(params, searchParams),
    basePath: "",
    isReady: true,
    isFallback: false,
    isLocaleDomain: false,
    isPreview: false,
    push: async (url) => {
      appRouter.push(toHref(url));
      return true;
    },
    replace: async (url) => {
      appRouter.replace(toHref(url));
      return true;
    },
    reload: () => {
      if (typeof window !== "undefined") window.location.reload();
    },
    back: () => appRouter.back(),
    prefetch: async (url: string) => appRouter.prefetch(url),
    events,
  };
}

export function withRouter<T extends Record<string, unknown>>(Component: ComponentType<T>) {
  return function Wrapped(props: Omit<T, "router">) {
    const router = useRouter();
    return React.createElement(Component, {
      ...(props as T),
      router: router as unknown as T["router"],
    });
  };
}

const singletonRouter: Pick<NextRouter, "push" | "replace" | "reload" | "back" | "prefetch" | "events"> = {
  push: async (url) => {
    if (typeof window !== "undefined") window.location.assign(toHref(url));
    return true;
  },
  replace: async (url) => {
    if (typeof window !== "undefined") window.location.replace(toHref(url));
    return true;
  },
  reload: () => {
    if (typeof window !== "undefined") window.location.reload();
  },
  back: () => {
    if (typeof window !== "undefined") window.history.back();
  },
  prefetch: async () => {},
  events,
};

export default singletonRouter;
