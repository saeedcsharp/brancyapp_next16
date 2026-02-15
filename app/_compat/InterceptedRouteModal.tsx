"use client";

import { ReactNode, MouseEvent, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

type InterceptedRouteModalProps = {
  children: ReactNode;
  fallbackPath: string;
};

export default function InterceptedRouteModal({ children, fallbackPath }: InterceptedRouteModalProps) {
  const router = useRouter();

  const close = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(fallbackPath);
  }, [fallbackPath, router]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const modalWindow = window as Window & { __closeInterceptedModal?: () => void };
    const previousCloseHandler = modalWindow.__closeInterceptedModal;

    document.body.style.overflow = "hidden";
    modalWindow.__closeInterceptedModal = close;

    return () => {
      document.body.style.overflow = originalOverflow;
      modalWindow.__closeInterceptedModal = previousCloseHandler;
    };
  }, [close]);

  const stop = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 250,
        backgroundColor: "var(--color-black80)",
        display: "flex",
        justifyContent: "stretch",
        alignItems: "stretch",
      }}>
      <div
        onClick={stop}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}>
        {children}
      </div>
    </div>
  );
}
