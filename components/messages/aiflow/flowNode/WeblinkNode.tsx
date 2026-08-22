import React from "react";
import { useTranslation } from "react-i18next";
import InputBox from "brancy/components/design/inputBox/inputBox";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
import styles from "./WeblinkNode.module.css";
export const WeblinkNode: React.FC<BaseNodeProps> = ({ node, updateNodeData }) => {
  const [displayTitle, setDisplayTitle] = React.useState<string>("");
  const [shouldShake, setShouldShake] = React.useState<boolean>(false);
  const [isUrlInvalid, setIsUrlInvalid] = React.useState<boolean>(false);
  const [isFocused, setIsFocused] = React.useState<boolean>(false);
  const defaultPlaceholder = "https://example.com";
  const { t } = useTranslation();
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const formattedUrl = formatUrl(text);
      updateNodeData(node.id, { url: formattedUrl });
      extractTitle(formattedUrl);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const extractTitle = (url: string) => {
    if (!url) {
      setDisplayTitle("");
      return;
    }

    try {
      const urlObj = new URL(url);
      // استخراج دامنه اصلی
      let domain = urlObj.hostname;
      // حذف www
      domain = domain.replace(/^www\./, "");
      // استخراج نام اصلی (مثلا google از google.com)
      const domainParts = domain.split(".");
      if (domainParts.length >= 2) {
        const mainName = domainParts[0];
        // Capitalize اولین حرف
        setDisplayTitle(mainName.charAt(0).toUpperCase() + mainName.slice(1));
      } else {
        setDisplayTitle(domain);
      }
    } catch (err) {
      setDisplayTitle("");
    }
  };

  const formatUrl = (url: string): string => {
    if (!url) return "";
    const trimmed = url.trim();
    // اگر با www شروع شود، https:// اضافه کن
    if (trimmed.startsWith("www.")) {
      return `https://${trimmed}`;
    }
    // اگر هیچ پروتکلی نداشت و شبیه دامنه است، https:// اضافه کن
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && trimmed.includes(".")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const validateUrl = (url: string): boolean => {
    if (!url || url.trim() === "") {
      return true; // اگر خالی است، معتبر در نظر بگیر (dangerOnEmpty را فعال نکن)
    }
    try {
      const urlObj = new URL(url);
      // بررسی پروتکل معتبر
      const hasDomainSuffix = /\.[^.\s]+$/.test(urlObj.hostname);
      return (urlObj.protocol === "http:" || urlObj.protocol === "https:") && hasDomainSuffix;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentUrl = node.data?.url || "";

    // اگر مقدار فعلی placeholder است و کاربر در حال تایپ است
    // کل placeholder را پاک کن و فقط کاراکتر جدید را بگذار
    if (currentUrl === defaultPlaceholder && value.startsWith(defaultPlaceholder)) {
      // کاربر در حال اضافه کردن به placeholder است، پس placeholder را پاک کن
      const newChar = value.substring(defaultPlaceholder.length);
      updateNodeData(node.id, { url: newChar });
      setDisplayTitle("");
      setIsUrlInvalid(false);
      setShouldShake(false);
      return;
    }

    updateNodeData(node.id, { url: value });
    setIsUrlInvalid(false);
    setShouldShake(false);
    // اگر محتوا پاک شد، displayTitle را هم پاک کن
    if (!value || value.trim() === "") {
      setDisplayTitle("");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // وقتی focus می‌شود، اگر placeholder است، آن را انتخاب کن
    // تا با اولین تایپ جایگزین شود
  };

  const handleUrlBlur = () => {
    setIsFocused(false);
    const currentUrl = node.data?.url || "";

    // اگر خالی است، placeholder را برگردان
    if (!currentUrl || currentUrl.trim() === "") {
      updateNodeData(node.id, { url: defaultPlaceholder });
      setDisplayTitle("");
      return;
    }

    const formattedUrl = formatUrl(currentUrl);
    if (formattedUrl !== currentUrl) {
      updateNodeData(node.id, { url: formattedUrl });
    }
    // استخراج title بعد از فرمت URL
    if (formattedUrl) {
      extractTitle(formattedUrl);
    }
    // اعتبارسنجی بعد از فرمت
    const isValid = validateUrl(formattedUrl);

    // اگر URL معتبر نبود و متن وجود داشت، shake را فعال کن
    if (!isValid && formattedUrl && formattedUrl !== defaultPlaceholder) {
      setIsUrlInvalid(true);
      setShouldShake(false);
      requestAnimationFrame(() => setShouldShake(true));
      setTimeout(() => setShouldShake(false), 600);
    } else {
      setIsUrlInvalid(false);
      setShouldShake(false);
    }
  };

  // اگر URL تغییر کرد، title را به‌روز کن
  React.useEffect(() => {
    const currentUrl = node.data?.url;
    if (currentUrl && currentUrl !== defaultPlaceholder) {
      extractTitle(currentUrl);
    } else if (!currentUrl) {
      // اگر node بدون URL است، placeholder را تنظیم کن
      updateNodeData(node.id, { url: defaultPlaceholder });
    }
  }, [node.data?.url]);

  return (
    <div className={styles.container}>
      <div className="headerparent" style={{ paddingInline: "10px" }}>
        <span className="counter">
          {displayTitle && (
            <div
              className="counter"
              title={node.data?.url || ""}
              onClick={(e) => {
                e.stopPropagation();
                if (node.data?.url) {
                  window.open(node.data.url, "_blank", "noopener,noreferrer");
                }
              }}
              style={{ cursor: "pointer" }}>
              🔗 {displayTitle}
            </div>
          )}
          {!displayTitle && t(LanguageKey.linkURL)}
        </span>
        <img
          style={{ cursor: "pointer", width: "24px", height: "24px" }}
          title="ℹ️ paste"
          role="button"
          src="/copy.svg"
          onClick={(e) => {
            e.stopPropagation();
            handlePaste();
          }}
        />
      </div>

      <div>
        <InputBox
          className="textinputbox"
          type="url"
          placeHolder=""
          value={node.data?.url || defaultPlaceholder}
          handleInputChange={handleUrlChange}
          handleInputBlur={handleUrlBlur}
          handleInputonFocus={handleFocus}
          status={isUrlInvalid ? "danger" : "default"}
          shake={shouldShake}
          dangerOnEmpty={false}
        />
      </div>
    </div>
  );
};

// Height calculation for this node type
export const getWeblinkNodeHeight = (node: NodeData): number => {
  // اگر title وجود دارد، ارتفاع بیشتری نیاز است
  return 150; // input + title space
};

export const weblinkNodeClassName = styles.container;
