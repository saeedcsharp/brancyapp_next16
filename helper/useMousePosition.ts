import { useEffect, useLayoutEffect, useRef } from "react";
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width:768px)").matches
  );
};
const useMousePosition = (): boolean => {
  const active = useRef(false);
  const raf = useRef<number>(0);
  const lastX = useRef(-1);
  const lastY = useRef(-1);
  const pendingX = useRef(0);
  const pendingY = useRef(0);
  const width = useRef(1);
  const height = useRef(1);
  const invWidth = useRef(1);
  const invHeight = useRef(1);
  const thresholdSq = 128; // 8px
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobileDevice()) {
      document.documentElement.style.cssText += "--x:1;--y:58;--xp:0;--yp:.06;";
      return;
    }
    active.current = true;
    const root = document.documentElement.style;
    const updateViewport = () => {
      width.current = window.innerWidth;
      height.current = window.innerHeight;
      invWidth.current = 1 / width.current;
      invHeight.current = 1 / height.current;
    };
    updateViewport();
    const flush = () => {
      raf.current = 0;
      const x = pendingX.current;
      const y = pendingY.current;
      if (x === lastX.current && y === lastY.current) return;
      lastX.current = x;
      lastY.current = y;
      const xp = Math.round(x * invWidth.current * 10) / 10;
      const yp = Math.round(y * invHeight.current * 10) / 10;
      root.cssText += `--x:${x};--y:${y};--xp:${xp};--yp:${yp};`;
    };
    const onMove = (e: MouseEvent) => {
      const x = e.clientX | 0;
      const y = e.clientY | 0;
      const dx = x - lastX.current;
      const dy = y - lastY.current;
      if (dx * dx + dy * dy < thresholdSq) return;
      pendingX.current = x;
      pendingY.current = y;
      if (!raf.current) {
        raf.current = requestAnimationFrame(flush);
      }
    };
    const onResize = () => {
      updateViewport();
      pendingX.current = lastX.current;
      pendingY.current = lastY.current;
      if (!raf.current) {
        raf.current = requestAnimationFrame(flush);
      }
    };
    const onVisibility = () => {
      if (document.hidden) {
        window.removeEventListener("mousemove", onMove);
        if (raf.current) {
          cancelAnimationFrame(raf.current);
          raf.current = 0;
        }
      } else {
        window.addEventListener("mousemove", onMove, { passive: true });
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);
  return active.current;
};
export default useMousePosition;
