"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import Notification from "brancy/components/notifications/notificationBox";
import { DirectionProvider } from "brancy/context/directionContext";
import { InstaProvider } from "brancy/context/instaInfoContext";
import i18n from "brancy/i18n";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Apply stored language after hydration to avoid SSR mismatch.
    // i18n is initialized with 'en' to match SSR output; here we switch
    // to the user's actual stored language on the client.
    const lng = window.localStorage.getItem("language");
    if (lng && lng !== "en") {
      i18n.changeLanguage(lng);
    }
  }, []);

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} refetchWhenOffline={false}>
      <DirectionProvider>
        <InstaProvider>{children}</InstaProvider>
      </DirectionProvider>
      <Notification />
    </SessionProvider>
  );
}
