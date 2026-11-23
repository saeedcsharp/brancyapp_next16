"use client";

import { useEffect } from "react";

// Must match the attribute on the blocked-page wrapper in renderRedirectInterface.tsx.
const VPN_BLOCK_MARKER = "data-vpn-block";

export default function ReloadTimer() {
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    // A blind reload during the VPN network switch makes Safari show "The network connection was lost" and kills this timer.
    const probe = async () => {
      try {
        const res = await fetch(window.location.href, { cache: "no-store", credentials: "same-origin" });
        if (res.ok && !(await res.text()).includes(VPN_BLOCK_MARKER)) {
          stopped = true;
          window.location.reload();
          return;
        }
      } catch {
        // Network still switching; retry.
      }
      if (!stopped) timer = setTimeout(probe, 1000);
    };

    timer = setTimeout(probe, 1000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  return null;
}
