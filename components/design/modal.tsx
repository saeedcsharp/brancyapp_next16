import { CSSProperties, memo, useCallback, useEffect, useState } from "react";

interface ModalProps {
  closePopup: () => void;
  children: React.ReactNode;
  classNamePopup: "popup" | "popupMini" | "popupMedia" | "popupProfile" | "popupSendFile" | "popupLarge";
  showContent: boolean;
  style?: CSSProperties;
}

const Modal = memo(({ closePopup, children, classNamePopup, showContent, style }: ModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(showContent);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        setIsClosing(true);
        setTimeout(() => {
          closePopup();
        }, 300);
      }
    },
    [closePopup]
  );

  useEffect(() => {
    if (showContent) {
      setIsClosing(false);
      setShouldRender(true);
      document.body.style.overflow = "hidden";
    } else if (shouldRender) {
      setIsClosing(true);
      document.body.style.overflow = "";
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showContent, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <div
        className={`dialogBg ${isClosing ? "closing" : ""}`}
        onClick={handleBackdropClick}
        role="presentation"
        aria-hidden="true"
      />
      <div
        className={`${classNamePopup} ${isClosing ? "closing" : ""}`}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title">
        {children}
      </div>
    </>
  );
});

Modal.displayName = "Modal";

export default Modal;
