import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "brancy/components/design/dotMenu/dotMenu.module.css";

type MenuPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

interface DotMenuOption {
  icon: string | React.ReactNode;
  value: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
interface DotmenuProps {
  data: DotMenuOption[];
  showSetting?: boolean;
  onToggle?: (isOpen: boolean) => void;
  handleClickOnIcon?: (id: string) => void;
  menuPosition?: MenuPosition;
}
const Dotmenu: React.FC<DotmenuProps> = ({ data, showSetting, onToggle, handleClickOnIcon, menuPosition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const getMenuPositionClass = () => {
    if (!menuPosition) return "";
    switch (menuPosition) {
      case "topLeft":
        return styles.topleft;
      case "topRight":
        return styles.topright;
      case "bottomLeft":
        return styles.bottomleft;
      case "bottomRight":
        return styles.bottomright;
      default:
        return "";
    }
  };

  const getIconBorderRadiusClass = () => {
    if (!menuPosition) return "";
    switch (menuPosition) {
      case "topLeft":
        return styles.icontopleft;
      case "topRight":
        return styles.icontopright;
      case "bottomLeft":
        return styles.iconbottomleft;
      case "bottomRight":
        return styles.iconbottomright;
      default:
        return "";
    }
  };
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onToggle?.(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);
  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (!isOpen) {
        setShowMenu(true);
        setIsOpen(true);
        onToggle?.(true);
      } else {
        setIsOpen(false);
        onToggle?.(false);
        closeTimerRef.current = window.setTimeout(() => {
          setShowMenu(false);
          closeTimerRef.current = null;
        }, 300);
      }
    },
    [isOpen, onToggle]
  );
  const handleOptionClick = useCallback(
    (option: DotMenuOption, e: React.MouseEvent) => {
      e.stopPropagation();

      if (option.onClick) {
        option.onClick();
      } else if (handleClickOnIcon) {
        handleClickOnIcon(option.value);
      }
      setIsOpen(false);
      onToggle?.(false);
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = window.setTimeout(() => {
        setShowMenu(false);
        closeTimerRef.current = null;
      }, 300);
    },
    [handleClickOnIcon, onToggle]
  );
  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <div
        onClick={handleToggle}
        className={`${styles.DotIconContainer} ${
          isOpen ? (menuPosition ? getIconBorderRadiusClass() : styles.open) : ""
        }`}
        style={isOpen ? { background: "var(--color-light-blue)" } : {}}>
        <svg className={`${styles.twoDotIcon} ${isOpen ? styles.twoDotIconhover : ""}`} fill="none" viewBox="0 0 14 5">
          <path d="M2.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m9 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
        </svg>
      </div>
      {showMenu && (
        <div className={`${styles.OptionsContainer} ${getMenuPositionClass()} ${isOpen ? styles.enter : styles.exit}`}>
          {data.map((option, index) => (
            <div key={index} className={styles.optionLine} onClick={(e) => handleOptionClick(option, e)}>
              <div className={styles.optionIcon}>
                {typeof option.icon === "string" ? (
                  <img src={option.icon} alt={option.value} loading="lazy" decoding="async" />
                ) : (
                  option.icon
                )}
              </div>
              <div className={styles.optionText}>{option.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Dotmenu;
