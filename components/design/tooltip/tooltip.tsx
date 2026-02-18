import { ReactNode, use, useEffect, useRef, useState } from "react";
import { DirectionContext } from "../../../context/directionContext";
import styles from "./tooltip.module.css";

interface TooltipProps {
  children: ReactNode;
  tooltipValue: string | ReactNode;
  position?: "top" | "bottom" | "left" | "right" | "LTR" | "RTL";
  onHover?: boolean;
  onClick?: boolean;
  className?: string;
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
  delay = 200,
  forceShow = false,
  forceShowDuration = 3000,
}: TooltipProps) => {
  // Convert undefined to default values: onHover defaults to true if neither is set
  const hoverEnabled = onHover !== undefined ? onHover : !onClick;
  const clickEnabled = onClick !== undefined ? onClick : false;
  const [isVisible, setIsVisible] = useState(false);
  const [clickActive, setClickActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forceShowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const direction = use(DirectionContext);

  // Update visibility when forceShow changes
  useEffect(() => {
    if (forceShow) {
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
    } else if (!hoverEnabled || (!clickActive && !forceShow)) {
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

  // Handle hover events
  const handleMouseEnter = () => {
    if (hoverEnabled && !clickActive && !forceShow) {
      timeoutRef.current = setTimeout(() => {
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
      setClickActive(!clickActive);
      setIsVisible(!isVisible);
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clickActive && tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
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
      ref={tooltipRef}
      className={`${styles.tooltipContainer} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}>
      {children}
      <div
        className={`${styles.tooltip} ${styles[actualPosition]} ${
          isVisible ? (styles as any).visible || "visible" : ""
        }`}
        role="tooltip"
        aria-live="polite">
        <div className={styles.tooltipContent}>{tooltipValue}</div>
      </div>
    </div>
  );
};

export default Tooltip;
