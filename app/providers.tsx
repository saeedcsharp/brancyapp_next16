"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import Notification from "../components/notifications/notificationBox";
import { DirectionProvider } from "../context/directionContext";
import { InstaProvider } from "../context/instaInfoContext";

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
