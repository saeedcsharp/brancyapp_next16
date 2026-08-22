import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./dotMenu.module.css";
type DotMenuPlacement = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
export interface DotMenuOption {
  id?: string;
  icon: string | React.ReactNode;
  value: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
interface DotMenuProps {
  data?: DotMenuOption[];
  options?: DotMenuOption[];
  showSetting?: boolean;
  onToggle?: (isOpen: boolean) => void;
  handleClickOnIcon?: (id: string) => void;
  onOptionSelect?: (value: string) => void;
  placement?: DotMenuPlacement;
  ariaLabel?: string;
}
const placementClasses: Record<DotMenuPlacement, { menu: string; trigger: string }> = {
  topLeft: { menu: styles.topLeft, trigger: styles.triggerTopLeft },
  topRight: { menu: styles.topRight, trigger: styles.triggerTopRight },
  bottomLeft: { menu: styles.bottomLeft, trigger: styles.triggerBottomLeft },
  bottomRight: { menu: styles.bottomRight, trigger: styles.triggerBottomRight },
};
const getPlacementCoordinates = (triggerRect: DOMRect, placement?: DotMenuPlacement): React.CSSProperties => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  switch (placement) {
    case "topLeft":
      return { position: "fixed", right: viewportWidth - triggerRect.left, bottom: viewportHeight - triggerRect.top };
    case "topRight":
      return { position: "fixed", left: triggerRect.right, bottom: viewportHeight - triggerRect.top };
    case "bottomLeft":
      return { position: "fixed", right: viewportWidth - triggerRect.left, top: triggerRect.bottom };
    case "bottomRight":
      return { position: "fixed", left: triggerRect.right, top: triggerRect.bottom };
    default:
      if (document.documentElement.dir === "rtl") {
        return { position: "fixed", left: triggerRect.right, top: triggerRect.bottom };
      }
      return { position: "fixed", right: viewportWidth - triggerRect.left, top: triggerRect.bottom };
  }
};
const DotMenu: React.FC<DotMenuProps> = ({
  data,
  options,
  onToggle,
  handleClickOnIcon,
  onOptionSelect,
  placement,
  ariaLabel = "More options",
}) => {
  const menuOptions = options ?? data ?? [];
  const resolvedPlacement = placement;
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [menuCoordinates, setMenuCoordinates] = useState<React.CSSProperties | null>(null);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeMenu = useCallback(
    (restoreFocus = false) => {
      setIsOpen(false);
      setFocusIndex(null);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setShowMenu(false);
        setMenuCoordinates(null);
      }
      onToggle?.(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [onToggle],
  );
  const openMenu = useCallback(
    (nextFocusIndex: number | null = 0) => {
      if (menuOptions.length === 0) return;
      setShowMenu(true);
      setIsOpen(true);
      setFocusIndex(nextFocusIndex);
      setMenuCoordinates(null);
      onToggle?.(true);
    },
    [menuOptions.length, onToggle],
  );
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        closeMenu();
      }
    };
    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [closeMenu, isOpen]);
  useLayoutEffect(() => {
    if (!showMenu) return;

    const updatePlacement = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      setMenuCoordinates(getPlacementCoordinates(trigger.getBoundingClientRect(), resolvedPlacement));
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [resolvedPlacement, showMenu]);
  useEffect(() => {
    if (isOpen && focusIndex !== null) optionRefs.current[focusIndex]?.focus();
  }, [focusIndex, isOpen]);
  const handleToggle = useCallback(() => {
    if (isOpen) closeMenu();
    else openMenu();
  }, [closeMenu, isOpen, openMenu]);
  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        openMenu(0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        openMenu(menuOptions.length - 1);
      }
    },
    [menuOptions.length, openMenu],
  );
  const handleOptionClick = useCallback(
    (option: DotMenuOption) => {
      if (option.onClick) {
        option.onClick();
      } else if (onOptionSelect) {
        onOptionSelect(option.value);
      } else if (handleClickOnIcon) {
        handleClickOnIcon(option.value);
      }
      closeMenu(true);
    },
    [closeMenu, handleClickOnIcon, onOptionSelect],
  );
  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key === "Tab") {
        closeMenu();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const currentIndex = focusIndex ?? 0;
      const nextIndex =
        event.key === "ArrowDown"
          ? (currentIndex + 1) % menuOptions.length
          : event.key === "ArrowUp"
            ? (currentIndex - 1 + menuOptions.length) % menuOptions.length
            : event.key === "Home"
              ? 0
              : menuOptions.length - 1;
      setFocusIndex(nextIndex);
    },
    [closeMenu, focusIndex, menuOptions.length],
  );
  const placementClass = resolvedPlacement ? placementClasses[resolvedPlacement] : undefined;
  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.isOpen : ""} ${isOpen ? (placementClass?.trigger ?? "") : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={showMenu ? menuId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          handleToggle();
        }}
        onKeyDown={handleTriggerKeyDown}
        disabled={menuOptions.length === 0}>
        <svg className={styles.triggerIcon} fill="none" viewBox="0 0 14 5" aria-hidden="true" focusable="false">
          <path d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
        </svg>
      </button>
      {typeof document !== "undefined" && showMenu && menuCoordinates
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className={`${styles.menu} ${placementClass?.menu ?? ""} ${isOpen ? styles.enter : styles.exit}`}
              style={menuCoordinates}
              role="menu"
              aria-label={ariaLabel}
              onKeyDown={handleMenuKeyDown}
              onAnimationEnd={() => {
                if (!isOpen) {
                  setShowMenu(false);
                  setMenuCoordinates(null);
                }
              }}>
              {menuOptions.map((option, index) => (
                <button
                  key={option.id ?? `${option.value}-${index}`}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={focusIndex === index ? 0 : -1}
                  className={styles.menuItem}
                  style={option.style}
                  onClick={() => handleOptionClick(option)}>
                  <span className={styles.menuItemIcon} aria-hidden="true">
                    {typeof option.icon === "string" ? (
                      <img src={option.icon} alt="" loading="lazy" decoding="async" />
                    ) : (
                      option.icon
                    )}
                  </span>
                  <span className={styles.menuItemLabel}>{option.value}</span>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
export default DotMenu;
