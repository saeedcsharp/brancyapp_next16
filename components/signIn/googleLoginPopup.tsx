import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

interface GoogleLoginPopupProps {
  googleAuthUrl: string; // آدرس سرور API که کاربر رو به Google OAuth هدایت میکنه
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export function useGoogleLoginPopup({
  googleAuthUrl,
  onSuccess,
  onError,
  onClose,
}: GoogleLoginPopupProps) {
  const popupRef = useRef<Window | null>(null);
  const { update } = useSession();

  const onSuccessRef = useRef<GoogleLoginPopupProps["onSuccess"]>(onSuccess);
  const onErrorRef = useRef<GoogleLoginPopupProps["onError"]>(onError);
  const onCloseRef = useRef<GoogleLoginPopupProps["onClose"]>(onClose);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // گوش دادن به پیام از popup
    const handleMessage = async (event: MessageEvent) => {
      // بررسی origin برای امنیت
      if (event.origin !== window.location.origin) {
        return;
      }

      // بررسی نوع پیام
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        // آپدیت کردن session
        await update();

        // بستن popup به صورت اجباری
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }

        // فراخوانی callback موفقیت
        onSuccessRef.current?.();

        // ریدایرکت در پنجره اصلی (نه داخل پاپ‌آپ)
        window.location.assign("/home");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      // بستن popup اگر هنوز باز است
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [update]);

  const openGooglePopup = () => {
    // محاسبه موقعیت مرکزی popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // باز کردن popup
    const popup = window.open(
      googleAuthUrl,
      "Google Login",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      onErrorRef.current?.(
        "Failed to open popup. Please check your browser settings."
      );
      return;
    }

    popupRef.current = popup;

    // بررسی اینکه popup بسته شده یا نه
    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        popupRef.current = null;
        onCloseRef.current?.();
      }
    }, 500);
  };

  return { openGooglePopup };
}

// کامپوننت دکمه برای استفاده راحت‌تر
interface GoogleLoginButtonProps extends GoogleLoginPopupProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function GoogleLoginButton({
  googleAuthUrl,
  onSuccess,
  onError,
  onClose,
  children,
  className,
  disabled,
}: GoogleLoginButtonProps) {
  const { openGooglePopup } = useGoogleLoginPopup({
    googleAuthUrl,
    onSuccess,
    onError,
    onClose,
  });

  return (
    <button
      onClick={openGooglePopup}
      disabled={disabled}
      className={className}
      type="button">
      {children || "Login with Google"}
    </button>
  );
}
