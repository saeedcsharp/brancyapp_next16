import type { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import ErrorPage from "brancy/app/error";
import Loading from "brancy/components/notOk/loading";
import { NotifType, notify, notPackageNotify, ResponseType } from "brancy/components/notifications/notificationBox";
import { MethodType } from "brancy/helper/api";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { InstagramerAccountInfo, IOrderUserInfo, IRefreshToken, PushNotif } from "brancy/models/interfaces";

type SharedStateContextType = {
  value: PushNotif[];
  setValue: React.Dispatch<React.SetStateAction<PushNotif[]>>;
  userInfo: IOrderUserInfo | null;
  setUserInfo: React.Dispatch<React.SetStateAction<IOrderUserInfo | null>>;
};
export const InstaInfoContext = React.createContext<SharedStateContextType | undefined>(undefined);
const getAccountKey = (session: Session) =>
  `${session.user.id}:${session.user.currentIndex}:${session.user.instagramerIds[session.user.currentIndex]}`;

export const InstaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [navigation, setNavigation] = React.useState({ pathname });
  if (navigation.pathname !== pathname) setNavigation({ pathname });
  const requestedNavigationRef = useRef<typeof navigation | null>(null);
  const [readyNavigation, setReadyNavigation] = React.useState<typeof navigation | null>(null);
  const [completedRequests, setCompletedRequests] = React.useState(0);
  const isProtectedRoute = /^\/(advertise|customerads|home|market|message|page|search|setting|store|wallet)(\/|$)/.test(
    pathname || "",
  );
  const needsAccountSession = isProtectedRoute || pathname === "/upgrade";
  const [readySession, setReadySession] = React.useState<Session | null>(null);
  const [initializationError, setInitializationError] = React.useState<Error | null>(null);
  const requestedAccountRef = useRef<string | null>(null);
  const [value, setValue] = React.useState<PushNotif[]>([]);
  const [userInfo, setUserInfo] = React.useState<IOrderUserInfo | null>(null);
  const contextValue = useMemo(() => ({ value, setValue, userInfo, setUserInfo }), [value, userInfo]);
  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const refreshToken = useCallback(
    async (accountInfo?: InstagramerAccountInfo, redirect = true) => {
      if (!session || isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        const res = await clientFetchApi<boolean, IRefreshToken>("/api/user/RefreshToken", {
          methodType: MethodType.get,
          session: session,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          const instagramerIds = res.value.role.instagramerIds;
          const instagramerCount = instagramerIds.length;
          const currentIndex = session!.user.currentIndex;
          const newCurrentIndex = instagramerCount === 0 ? -1 : currentIndex >= instagramerCount ? 0 : currentIndex;
          const nextSession: Session = {
            ...session,
            expires: session.expires ?? new Date(0).toISOString(),
            user: {
              ...session.user,
              expireTime: res.value.expireTime,
              id: res.value.id,
              instagramerIds: res.value.role.instagramerIds,
              accessToken: res.value.token,
              socketAccessToken: res.value.socketAccessToken,
              currentIndex: newCurrentIndex,
              lastUpdate: Date.now(),
              commentPermission: accountInfo?.commentPermission ?? session?.user.commentPermission ?? false,
              insightPermission: accountInfo?.insightPermission ?? session?.user.insightPermission ?? false,
              messagePermission: accountInfo?.messagePermission ?? session?.user.messagePermission ?? false,
              publishPermission: accountInfo?.publishPermission ?? session?.user.publishPermission ?? false,
              website: accountInfo?.website ?? session?.user.website ?? null,
              biography: accountInfo?.biography ?? session?.user.biography ?? null,
            },
          };
          const updatedSession = (await update(nextSession)) ?? nextSession;
          if (redirect) router.replace("/");
          return updatedSession;
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [session, update, router],
  );

  const fetchTitleInfo = useCallback(
    async (accountSession: Session | null = session) => {
      if (isUpdatingRef.current) return;
      try {
        const res = await clientFetchApi<boolean, IOrderUserInfo>("/api/account/GetTitleInfo", {
          methodType: MethodType.get,
          session: accountSession,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        });
        if (res.succeeded) {
          setUserInfo(res.value);
        }
      } catch (_) {}
    },
    [session],
  );

  const GetAccountInfo = useCallback(
    async (accountSession: Session | null = session) => {
      if (!accountSession || isUpdatingRef.current) return;
      isUpdatingRef.current = true;
      lastUpdateRef.current = Date.now();
      requestedAccountRef.current = getAccountKey(accountSession);
      requestedNavigationRef.current = navigation;
      setInitializationError(null);

      try {
        let res = await clientFetchApi<boolean, InstagramerAccountInfo>("Instagramer/Account/GetInfo", {
          methodType: MethodType.get,
          session: accountSession,
          data: undefined,
          queries: undefined,
          onUploadProgress: undefined,
        });
        if (res.info.responseType === ResponseType.Forbidden) {
          await signOut({
            redirect: false, // Don't redirect the user after signing out
          });
          router.replace("/");
        } else if (res.info.responseType === ResponseType.PartnerNotExist) {
          isUpdatingRef.current = false;
          const refreshedSession = await refreshToken(res.value);
          if (!refreshedSession) setInitializationError(new Error("Unable to refresh session."));
        } else if (!res.succeeded) {
          // Handle HTTP errors
          await update({
            ...accountSession,
            user: {
              ...accountSession.user,
              error: `Failed to fetch data, status: ${res.statusCode}`,
              loginStatus: res.value.loginStatus,
              lastUpdate: Date.now(),
              profileUrl: res.value.profileUrl,
              packageExpireTime: res.value.packageExpireTime ?? accountSession.user.packageExpireTime ?? 0,
              createdTime: res.value.createdTime,
            },
          });
          setInitializationError(new Error(`Failed to fetch account information, status: ${res.statusCode}`));
          // setUser(res.value);
          // throw new Error(`Failed to fetch data, status: ${res.statusCode}`);
        } else if (res.succeeded) {
          if (res.value.packageExpireTime < Date.now() / 1000 && (res.value.loginByFb || res.value.loginByInsta))
            notPackageNotify();
          const nextSession: Session = {
            ...accountSession,
            user: {
              ...accountSession.user,
              loginStatus: res.value.loginStatus,
              lastUpdate: Date.now(),
              profileUrl: res.value.profileUrl,
              username: res.value.username,
              fullName: res.value.fullName ?? "",
              isShopper: res.value.isShopper,
              hasPackage: res.value.packageExpireTime * 1000 > Date.now(),
              isPrivate: res.value.isPrivate,
              isShopperOrInfluencer: res.value.isShopperOrInfluencer,
              isVerified: res.value.isVerified,
              packageExpireTime: res.value.packageExpireTime, // now available in context
              pk: res.value.pk,
              isInfluencer: res.value.isInfluencer,
              isBusiness: res.value.isBusiness,
              loginByFb: res.value.loginByFb,
              loginByInsta: res.value.loginByInsta,
              roles: res.value.roles,
              isPartner: res.value.isPartner,
              commentPermission: res.value.commentPermission,
              insightPermission: res.value.insightPermission,
              messagePermission: res.value.messagePermission,
              publishPermission: res.value.publishPermission,
              website: res.value.website,
              biography: res.value.biography,
              createdTime: res.value.createdTime,
            },
          };
          const updatedSession = (await update(nextSession)) ?? nextSession;
          setReadySession(updatedSession);
          setReadyNavigation(navigation);
          setInitializationError(null);
          // setUser(res.value);
        }
      } catch (error: any) {
        setInitializationError(error instanceof Error ? error : new Error("Unable to load account information."));
        // setUser((prev) => ({ ...prev!, error: error.message }));
      } finally {
        isUpdatingRef.current = false;
        lastUpdateRef.current = Date.now();
        setCompletedRequests((count) => count + 1);
      }
    },
    [session, update, refreshToken, router, navigation],
  );
  useEffect(() => {
    if (!needsAccountSession) return;
    if (status === "unauthenticated") router.replace("/");
    else if (status === "authenticated" && session?.user.currentIndex === -1 && isProtectedRoute) {
      router.replace("/user");
    } else if (
      isProtectedRoute &&
      readyNavigation === navigation &&
      session &&
      readySession &&
      getAccountKey(session) === getAccountKey(readySession) &&
      (typeof readySession.user.packageExpireTime !== "number" ||
        readySession.user.packageExpireTime * 1000 <= Date.now())
    ) {
      router.replace("/upgrade");
    }
  }, [needsAccountSession, isProtectedRoute, status, session, readySession, router, readyNavigation, navigation]);

  useEffect(() => {
    console.log("Running useEffect for session and account info updates...");
    if (!session) return;
    console.log("Session is available:", session);

    const currentTime = Date.now();
    console.log("Current time:", currentTime);
    const lastUpdate = Number(session.user.lastUpdate || 0);
    console.log("Last update time:", lastUpdate);
    const expireTime = session.user.expireTime * 1000;
    console.log("Expire time:", expireTime);

    // Prevent multiple rapid calls
    if (isUpdatingRef.current) return;

    // Check if token needs refresh (24 hours before expiry)
    if (expireTime - 864 * 1e6 < currentTime) {
      console.log("refreshing token...");
      void refreshToken(undefined, false).then((updatedSession) => {
        if (updatedSession && updatedSession.user.currentIndex > -1) {
          return GetAccountInfo(updatedSession);
        }
        if (updatedSession && updatedSession.user.currentIndex === -1 && !userInfo) {
          return fetchTitleInfo(updatedSession);
        }
        if (!updatedSession) setInitializationError(new Error("Unable to refresh session."));
      });
    }
    // Check if account info needs update (20 seconds since last update)
    else if (
      session.user.currentIndex > -1 &&
      (requestedNavigationRef.current !== navigation ||
        requestedAccountRef.current !== getAccountKey(session) ||
        currentTime - Math.max(lastUpdate, lastUpdateRef.current) > 20000)
    ) {
      console.log("GetAccountInfo called...");
      GetAccountInfo();
    }
    // Fetch user title info when in user panel (currentIndex === -1)
    if (session.user.currentIndex === -1 && !userInfo) {
      fetchTitleInfo();
    }
  }, [session, GetAccountInfo, refreshToken, fetchTitleInfo, userInfo, navigation, completedRequests]);

  const isAccountReady =
    readyNavigation === navigation &&
    !!session &&
    !!readySession &&
    getAccountKey(session) === getAccountKey(readySession);
  const isExpiredProtectedAccount =
    isProtectedRoute &&
    isAccountReady &&
    (typeof readySession.user.packageExpireTime !== "number" ||
      readySession.user.packageExpireTime * 1000 <= Date.now());
  const waitingForAccount =
    needsAccountSession &&
    (!session || (session.user.currentIndex === -1 ? isProtectedRoute : !isAccountReady) || isExpiredProtectedAccount);

  return (
    <InstaInfoContext value={contextValue}>
      {waitingForAccount ? (
        initializationError && requestedNavigationRef.current === navigation ? (
          <ErrorPage error={initializationError} reset={() => window.location.reload()} />
        ) : (
          <Loading />
        )
      ) : (
        children
      )}
    </InstaInfoContext>
  );
};
