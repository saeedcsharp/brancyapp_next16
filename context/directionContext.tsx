import { useSession } from "next-auth/react";
import React, { createContext, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LoginStatus, packageStatus } from "brancy/helper/loadingStatus";
import startSignalR from "brancy/helper/pushNotif";

type Direction = "ltr" | "rtl";

export const DirectionContext = createContext<Direction>("ltr");

export const DirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { data: session } = useSession();

  const direction = useMemo<Direction>(() => {
    const currentLanguage = i18n.language || "en";
    return currentLanguage === "fa" || currentLanguage === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  useEffect(() => {
    if (!session || !LoginStatus(session) || !packageStatus(session)) return;
    startSignalR(session);
  }, [session]);

  return <DirectionContext value={direction}>{children}</DirectionContext>;
};
