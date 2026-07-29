import { ReactNode, use, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DirectionContext } from "brancy/context/directionContext";
import styles from "./tooltip.module.css";

type TooltipTriggerType = "attention" | "tooltip";

interface TooltipProps {
  children?: ReactNode;
  tooltipValue: string | ReactNode;
  position?: "top" | "bottom" | "left" | "right" | "LTR" | "RTL";
  onHover?: boolean;
  onClick?: boolean;
  className?: string;
  triggerType?: TooltipTriggerType;
  style?: React.CSSProperties;
  delay?: number; // Delay in milliseconds before showing tooltip on hover
  forceShow?: boolean; // Force tooltip to be visible
  forceShowDuration?: number; // Duration in milliseconds for forceShow (default: 3000ms)
}

const Tooltip = ({
  children,
  tooltipValue,
  position = "top",
  onHover,
  onClick,
  className = "",
  triggerType,
  delay = 200,
  forceShow = false,
  forceShowDuration = 3000,
  style,
}: TooltipProps) => {
  // Convert undefined to default values: onHover defaults to true if neither is set
  const hoverEnabled = onHover !== undefined ? onHover : !onClick;
  const clickEnabled = onClick !== undefined ? onClick : false;
  const [isVisible, setIsVisible] = useState(false);
  const [clickActive, setClickActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forceShowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<React.CSSProperties | null>(null);
  const direction = use(DirectionContext);
  const triggerIconSrc = triggerType === "attention" ? "/attention.svg" : "/tooltip.svg";

  // Update visibility when forceShow changes
  useEffect(() => {
    if (forceShow) {
      setTooltipPosition(null);
      setIsVisible(true);
      // Clear any existing timeout
      if (forceShowTimeoutRef.current) {
        clearTimeout(forceShowTimeoutRef.current);
      }
      // Auto-hide after forceShowDuration
      forceShowTimeoutRef.current = setTimeout(() => {
        if (!clickActive && !hoverEnabled) {
          setIsVisible(false);
        }
      }, forceShowDuration);
    } else if (!clickActive && !forceShow) {
      setIsVisible(false);
    }

    return () => {
      if (forceShowTimeoutRef.current) {
        clearTimeout(forceShowTimeoutRef.current);
      }
    };
  }, [forceShow, hoverEnabled, clickActive, forceShowDuration]);

  // Calculate actual position based on LTR/RTL
  const getActualPosition = (): "top" | "bottom" | "left" | "right" => {
    if (position === "LTR") {
      // LTR: left for RTL languages, right for LTR languages
      return direction === "rtl" ? "left" : "right";
    } else if (position === "RTL") {
      // RTL: right for RTL languages, left for LTR languages
      return direction === "rtl" ? "right" : "left";
    }
    return position as "top" | "bottom" | "left" | "right";
  };

  const actualPosition = getActualPosition();

  useLayoutEffect(() => {
    if (!isVisible) return;

    const updateTooltipPosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const gap = 15;

      if (actualPosition === "top") {
        setTooltipPosition({ bottom: window.innerHeight - rect.top + gap, left: centerX });
      } else if (actualPosition === "bottom") {
        setTooltipPosition({ top: rect.bottom + gap, left: centerX });
      } else if (actualPosition === "left") {
        setTooltipPosition({ right: window.innerWidth - rect.left + gap, top: centerY });
      } else {
        setTooltipPosition({ left: rect.right + gap, top: centerY });
      }
    };

    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);
    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [actualPosition, isVisible]);

  // Handle hover events
  const handleMouseEnter = () => {
    if (hoverEnabled && !clickActive && !forceShow) {
      timeoutRef.current = setTimeout(() => {
        setTooltipPosition(null);
        setIsVisible(true);
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (hoverEnabled && !clickActive && !forceShow) {
      setIsVisible(false);
    }
  };

  // Handle click events
  const handleClick = (e: React.MouseEvent) => {
    if (clickEnabled) {
      e.stopPropagation();
      setTooltipPosition(null);
      setClickActive(!clickActive);
      setIsVisible(!isVisible);
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (clickActive && !containerRef.current?.contains(target) && !tooltipRef.current?.contains(target)) {
        setIsVisible(false);
        setClickActive(false);
      }
    };

    if (clickActive) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clickActive]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.tooltipContainer} ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}>
      {triggerType ? (
        <img
          className={styles.triggerIcon}
          src={triggerIconSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      ) : (
        children
      )}
      {typeof document !== "undefined" &&
        isVisible &&
        tooltipPosition &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`${styles.tooltip} ${styles[actualPosition]} ${
              isVisible ? (styles as any).visible || "visible" : ""
            }`}
            style={tooltipPosition}
            role="tooltip"
            aria-live="polite">
            <div className={styles.tooltipContent}>{tooltipValue}</div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Tooltip;
