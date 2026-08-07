import React, { useCallback, useEffect, useId, useRef, useState } from "react";
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
  /** @deprecated Use options instead. */
  data?: DotMenuOption[];
  options?: DotMenuOption[];
  /** @deprecated This prop was never read by DotMenu and is retained for compatibility. */
  showSetting?: boolean;
  onToggle?: (isOpen: boolean) => void;
  /** @deprecated Use onOptionSelect instead. */
  handleClickOnIcon?: (id: string) => void;
  onOptionSelect?: (value: string) => void;
  /** @deprecated Use placement instead. */
  menuPosition?: DotMenuPlacement;
  placement?: DotMenuPlacement;
  ariaLabel?: string;
}
const placementClasses: Record<DotMenuPlacement, { menu: string; trigger: string }> = {
  topLeft: { menu: styles.topLeft, trigger: styles.triggerTopLeft },
  topRight: { menu: styles.topRight, trigger: styles.triggerTopRight },
  bottomLeft: { menu: styles.bottomLeft, trigger: styles.triggerBottomLeft },
  bottomRight: { menu: styles.bottomRight, trigger: styles.triggerBottomRight },
};
const DotMenu: React.FC<DotMenuProps> = ({
  data,
  options,
  onToggle,
  handleClickOnIcon,
  onOptionSelect,
  menuPosition,
  placement,
  ariaLabel = "More options",
}) => {
  const menuOptions = options ?? data ?? [];
  const resolvedPlacement = placement ?? menuPosition;
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeMenu = useCallback(
    (restoreFocus = false) => {
      setIsOpen(false);
      setFocusIndex(null);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setShowMenu(false);
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
      onToggle?.(true);
    },
    [menuOptions.length, onToggle],
  );
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDownOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [closeMenu, isOpen]);
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
    <div ref={menuRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.isOpen : ""} ${isOpen ? (placementClass?.trigger ?? "") : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={showMenu ? menuId : undefined}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        disabled={menuOptions.length === 0}>
        <svg className={styles.triggerIcon} fill="none" viewBox="0 0 14 5" aria-hidden="true" focusable="false">
          <path d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
        </svg>
      </button>
      {showMenu && (
        <div
          id={menuId}
          className={`${styles.menu} ${placementClass?.menu ?? ""} ${isOpen ? styles.enter : styles.exit}`}
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={handleMenuKeyDown}
          onAnimationEnd={() => {
            if (!isOpen) setShowMenu(false);
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
        </div>
      )}
    </div>
  );
};
export default DotMenu;
