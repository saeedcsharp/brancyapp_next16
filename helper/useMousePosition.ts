import { useEffect, useLayoutEffect, useRef } from "react";

// Use useLayoutEffect on client, useEffect during SSR
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Function to detect mobile devices
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia("(max-width: 768px)").matches)
  );
};

// Return a boolean indicating if mouse tracking is active
const useMousePosition = (): boolean => {
  // Create refs that won't be undefined during SSR
  const lastValues = useRef({ x: 0, y: 0, xp: 0, yp: 0 });
  const rafId = useRef<number | null>(null);
  const windowSize = useRef({ width: 0, height: 0 });
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastCallTime = useRef(0);
  const isUpdating = useRef(false);
  const isActive = useRef(false);
  const isMobile = useRef(false);
  const pendingUpdate = useRef<{ x: number; y: number } | null>(null);
  const cssVariablesRef = useRef<{ x: number; y: number; xp: number; yp: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    // Check if window exists (client-side only)
    if (typeof window === "undefined") return;

    // Check if it's a mobile device
    isMobile.current = isMobileDevice();

    // Only activate on non-mobile devices
    isActive.current = !isMobile.current;

    // If it's a mobile device, set default CSS variables and exit early
    if (isMobile.current) {
      // Batch CSS updates to minimize reflows
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--x", "0");
      rootStyle.setProperty("--y", "0");
      rootStyle.setProperty("--xp", "0.5");
      rootStyle.setProperty("--yp", "0.5");
      return;
    }

    // Initialize window size values now that we're on the client
    windowSize.current = { width: window.innerWidth, height: window.innerHeight };

    // Higher threshold for better performance, especially on touch devices
    const threshold = 8;
    // Throttle interval in ms - only process events every 16ms (roughly 60fps)
    const throttleInterval = 16;

    const updateWindowSize = () => {
      windowSize.current = { width: window.innerWidth, height: window.innerHeight };
    };

    // Batch CSS updates to minimize reflows
    const updateCSSVariables = () => {
      if (!cssVariablesRef.current) return;

      const { x, y, xp, yp } = cssVariablesRef.current;
      const rootStyle = document.documentElement.style;

      // Use a single batch update instead of multiple setProperty calls
      rootStyle.cssText = `
        ${rootStyle.cssText
          .split(";")
          .filter(
            (prop) => !prop.includes("--x") && !prop.includes("--y") && !prop.includes("--xp") && !prop.includes("--yp")
          )
          .join(";")};
        --x: ${x.toFixed(1)};
        --y: ${y.toFixed(1)};
        --xp: ${xp.toFixed(3)};
        --yp: ${yp.toFixed(3)};
      `;

      cssVariablesRef.current = null;
    };

    const updatePosition = (x: number, y: number) => {
      // Skip update if already processing an update
      if (isUpdating.current) {
        // Store the latest position for the next frame
        pendingUpdate.current = { x, y };
        return;
      }

      const { width: w, height: h } = windowSize.current;
      const xp = x / w;
      const yp = y / h;

      const xDiff = Math.abs(x - lastValues.current.x);
      const yDiff = Math.abs(y - lastValues.current.y);

      // Only schedule RAF if there's a significant change in position
      if (xDiff > threshold || yDiff > threshold) {
        // Cancel any existing animation frame to avoid queuing
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }

        // Only request a new frame if we're not already processing one
        if (!isUpdating.current) {
          isUpdating.current = true;

          // Store the values to update in the next frame
          cssVariablesRef.current = { x, y, xp, yp };
          lastValues.current = { x, y, xp, yp };

          rafId.current = requestAnimationFrame(() => {
            // Update CSS variables in a single batch
            updateCSSVariables();

            rafId.current = null;
            isUpdating.current = false;

            // Process any pending updates that came in during this frame
            if (pendingUpdate.current) {
              const { x: pendingX, y: pendingY } = pendingUpdate.current;
              pendingUpdate.current = null;
              // Use setTimeout to avoid blocking the main thread
              setTimeout(() => updatePosition(pendingX, pendingY), 0);
            }
          });
        }
      }
    };

    // Throttled pointer move handler with immediate rejection of frequent calls
    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now();
      // Skip updates that come too quickly
      if (now - lastCallTime.current < throttleInterval) return;

      lastCallTime.current = now;
      updatePosition(e.clientX, e.clientY); // Use clientX/Y for better cross-browser support
    };

    // Improved debounced resize handler
    const handleResize = () => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);

      // Only trigger resize updates when user has finished resizing
      resizeTimeout.current = setTimeout(() => {
        if (window.innerWidth !== windowSize.current.width || window.innerHeight !== windowSize.current.height) {
          updateWindowSize();
          // Update position after resize to maintain correct proportions
          updatePosition(lastValues.current.x, lastValues.current.y);
        }
      }, 200);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Clean up resources when tab is hidden
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        isUpdating.current = false;
        pendingUpdate.current = null;
        cssVariablesRef.current = null;
      }
    };

    // Use passive event listeners for better performance
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
    };
  }, []);

  return isActive.current;
};

export default useMousePosition;
