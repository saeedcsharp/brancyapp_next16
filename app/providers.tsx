"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import Notification from "saeed/components/notifications/notificationBox";
import { DirectionProvider } from "saeed/context/directionContext";
import { InstaProvider } from "saeed/context/instaInfoContext";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0} refetchWhenOffline={false}>
      <DirectionProvider>
        <InstaProvider>{children}</InstaProvider>
      </DirectionProvider>
      <Notification />
    </SessionProvider>
  );
}
