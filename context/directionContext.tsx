import { useSession } from "next-auth/react";
import React, { createContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LoginStatus, packageStatus } from "saeed/helper/loadingStatus";
import startSignalR from "saeed/helper/pushNotif";

type Direction = "ltr" | "rtl";

export const DirectionContext = createContext<Direction>("ltr");

export const DirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<Direction>("ltr");
  const { data: session } = useSession();
  useEffect(() => {
    const currentLanguage = i18n.language || "en";
    const dir: Direction = currentLanguage === "fa" || currentLanguage === "ar" ? "rtl" : "ltr";
    setDirection(dir);
    // Set direction for all elements except those with ID 't'
    document.documentElement.dir = dir;
  }, [i18n.language]);
  useEffect(() => {
    if (!session || !LoginStatus(session) || !packageStatus(session)) return;
    startSignalR(session);
  }, [session]);
  return <DirectionContext.Provider value={direction}>{children}</DirectionContext.Provider>;
};
