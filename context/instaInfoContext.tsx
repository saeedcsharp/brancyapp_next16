import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { NotifType, notify, notPackageNotify, ResponseType } from "saeed/components/notifications/notificationBox";
import { InstagramerAccountInfo, IRefreshToken } from "saeed/models/_AccountInfo/InstagramerAccountInfo";
import { MethodType } from "saeed/helper/api";
import { PushNotif } from "saeed/models/push/pushNotif";
import { clientFetchApi } from "saeed/helper/clientFetchApi";
type SharedStateContextType = {
  value: PushNotif[];
  setValue: React.Dispatch<React.SetStateAction<PushNotif[]>>;
};
export const InstaInfoContext = React.createContext<SharedStateContextType | undefined>(undefined);
export const InstaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [value, setValue] = React.useState<PushNotif[]>([]);
  const contextValue = useMemo(() => ({ value, setValue }), [value]);
  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const refreshToken = useCallback(
    async (accountInfo?: InstagramerAccountInfo) => {
      if (isUpdatingRef.current) return;
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
          const updatedSession = await update({
            ...session,
            user: {
              ...session?.user,
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
          });
          router.replace("/");
        } else notify(res.info.responseType, NotifType.Warning);
      } catch (error) {
        notify(ResponseType.Unexpected, NotifType.Error);
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [session, update, router],
  );

  const GetAccountInfo = useCallback(async () => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      let res = await clientFetchApi<boolean, InstagramerAccountInfo>("Instagramer" + "/Account/GetInfo", {
        methodType: MethodType.get,
        session: session,
        data: undefined,
        queries: undefined,
        onUploadProgress: undefined,
      });
      if (res.info.responseType === ResponseType.Forbidden) {
        await signOut({
          redirect: false, // Don't redirect the user after signing out
        });
      } else if (res.info.responseType === ResponseType.PartnerNotExist) {
        await refreshToken(res.value);
      } else if (!res.succeeded) {
        // Handle HTTP errors
        await update({
          ...session,
          user: {
            ...session?.user,
            error: `Failed to fetch data, status: ${res.statusCode}`,
            loginStatus: res.value.loginStatus,
            lastUpdate: Date.now(),
            profileUrl: res.value.profileUrl,
          },
        });
        // setUser(res.value);
        // throw new Error(`Failed to fetch data, status: ${res.statusCode}`);
      } else if (res.succeeded) {
        if (res.value.packageExpireTime < Date.now() / 1000) notPackageNotify();
        const updatedSession = await update({
          ...session,
          user: {
            ...session?.user,
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
          },
        });

        // setUser(res.value);
      }
    } catch (error: any) {
      // setUser((prev) => ({ ...prev!, error: error.message }));
    } finally {
      isUpdatingRef.current = false;
    }
  }, [session, update, refreshToken]);
  useEffect(() => {
    if (!session) return;

    const currentTime = Date.now();
    const lastUpdate = Number(session.user.lastUpdate || 0);
    const expireTime = session.user.expireTime * 1000;

    // Prevent multiple rapid calls
    if (isUpdatingRef.current) return;

    // Check if token needs refresh (24 hours before expiry)
    if (expireTime - 864 * 1e6 < currentTime) {
      refreshToken();
    }
    // Check if account info needs update (20 seconds since last update)
    else if (currentTime - lastUpdate > 20000) {
      GetAccountInfo();
    }
  }, [session, GetAccountInfo, refreshToken]);

  return <InstaInfoContext value={contextValue}>{children}</InstaInfoContext>;
};
