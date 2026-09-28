"use client";

import { useEffect } from "react";

export default function ClientRedirect({ url }: { url: string }) {
  useEffect(() => {
    const timer = setTimeout(() => window.location.replace(url), 1000);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        padding: "1rem",
      }}>
      <a href={url} referrerPolicy="origin">
        Redirecting...
      </a>
    </div>
  );
}
