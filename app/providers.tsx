"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import Notification from "brancy/components/notifications/notificationBox";
import { DirectionProvider } from "brancy/context/directionContext";
import { InstaProvider } from "brancy/context/instaInfoContext";

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
