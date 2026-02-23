import Compressor from "compressorjs";
import { useSession } from "next-auth/react";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import InputText from "brancy/components/design/inputText";
import TextArea from "brancy/components/design/textArea/textArea";
import { LanguageKey } from "brancy/i18n/languageKeys";
import { UploadFile } from "brancy/helper/api";
import styles from "brancy/components/messages/aiflow/flowNode/GenericItemNode.module.css";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL || "";

interface GenericItemNodeProps extends BaseNodeProps {
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
  updateStateWithHistory: (updater: (prev: any) => any) => void;
}

export const GenericItemNode: React.FC<GenericItemNodeProps> = ({
  node,
  updateNodeData,
  setEditorState,
  updateStateWithHistory,
}) => {
  const { data: session } = useSession();
  const [imgUrl, setImgUrl] = useState<string | null>(
    node.data?.tempUrl || (node.data.imageUrl ? baseMediaUrl + node.data.imageUrl : null),
  );
  const [displayTitle, setDisplayTitle] = React.useState<string>("");
  const [shouldShake, setShouldShake] = React.useState<boolean>(false);
  const [isTitleFocused, setIsTitleFocused] = React.useState<boolean>(false);
  const { t } = useTranslation();
  const defaultTitlePlaceholder = t(LanguageKey.New_Flow_message_title);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/heic",
        "image/heif",
        "image/bmp",
        "image/svg+xml",
      ];

      const isValidImage = validImageTypes.some(
        (type) => file.type === type || file.name.toLowerCase().endsWith(type.split("/")[1]),
      );
      if (!isValidImage && file.type && !file.type.startsWith("image/")) {
        toast.warn(t(LanguageKey.New_Flow_upload_unsupported_media));
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.warn(t(LanguageKey.New_Flow_uploadmaxsizeexceeded));
        return;
      }
      // برای تصاویر، ابتدا فشرده‌سازی و سپس آپلود
      setEditorState((prev: any) => ({
        ...prev,
        nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: 0 } : n)),
      }));

      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
        mimeType: "image/jpeg",
        convertSize: 5000000, // فایل‌های بزرگتر از 5MB به JPEG تبدیل می‌شوند
        success: async (compressedFile) => {
          try {
            // CompressorJS returns a Blob; convert it to a proper File
            const blob = compressedFile as Blob;
            const mimeType = blob.type || "image/jpeg";
            const extension = mimeType === "image/jpeg" ? ".jpg" : file.name.slice(file.name.lastIndexOf(".")) || "";
            const compressedFileName = file.name.replace(/\.[^/.]+$/, extension);
            const finalFile = new File([blob], compressedFileName, {
              type: mimeType,
            });

            // آپلود فایل فشرده‌شده (اکنون یک File واقعی است)
            const uploadMedia = await UploadFile(session, finalFile, (progress) => {
              setEditorState((prev: any) => ({
                ...prev,
                nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: progress } : n)),
              }));
            });
            setImgUrl(uploadMedia.showUrl);
            updateNodeData(node.id, {
              imageUrl: uploadMedia.fileName,
              tempUrl: uploadMedia.showUrl,
              image: uploadMedia.showUrl,
              fileName: compressedFileName,
              fileSize: finalFile.size,
              fileType: finalFile.type || file.type || "image/unknown",
              isVideo: false,
              isExist: false,
            });
            setEditorState((prev: any) => ({
              ...prev,
              nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
            }));
          } catch (error) {
            console.error("خطا در آپلود تصویر:", error);
            setEditorState((prev: any) => ({
              ...prev,
              nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
            }));
            toast.error(t(LanguageKey.New_Flow_uploadfilefailed));
          }
        },
        error: (err) => {
          console.error("خطا در فشرده‌سازی تصویر:", err);
          setEditorState((prev: any) => ({
            ...prev,
            nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
          }));
          toast.error(t(LanguageKey.New_Flow_uploadfilefailed));
        },
      });

      e.target.value = "";
    },
    [node.id, updateNodeData, setEditorState, t, session],
  );
  const handlePaste = async (field: string) => {
    try {
      let text = await navigator.clipboard.readText();
      // محدودیت کاراکتر: title و subtitle حداکثر 140، weblink بدون محدودیت
      if (field === "title" || field === "subtitle") {
        text = text.substring(0, 140);
      }
      if (field === "weblink") {
        const formattedUrl = formatUrl(text);
        updateNodeData(node.id, { weblink: formattedUrl });
        extractTitle(formattedUrl);
      } else {
        updateNodeData(node.id, { [field]: text });
      }
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
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const addButton = useCallback(() => {
    const currentButtons = node.data?.buttons || ["Button 1"];
    const newButtonLabel = `Button ${currentButtons.length + 1}`;
    const newButtons = [...currentButtons, newButtonLabel];
    const newOutputId = `button${currentButtons.length + 1}`;

    updateStateWithHistory((prev: any) => ({
      ...prev,
      nodes: prev.nodes.map((n: any) => {
        if (n.id === node.id) {
          const newButtonOutput = {
            id: newOutputId,
            type: "output" as const,
            label: newButtonLabel,
          };
          return {
            ...n,
            buttonOutputs: [...(n.buttonOutputs || []), newButtonOutput],
            data: {
              ...n.data,
              buttons: newButtons,
            },
          };
        }
        return n;
      }),
    }));
  }, [node, updateStateWithHistory]);

  const removeButton = useCallback(
    (index: number) => {
      const currentButtons = node.data?.buttons || [];
      // if (currentButtons.length <= 1) {
      //   return;
      // }

      const newButtons = currentButtons.filter((_: any, idx: number) => idx !== index);
      const outputToRemove = (node.buttonOutputs || [])[index];

      updateStateWithHistory((prev: any) => ({
        ...prev,
        nodes: prev.nodes.map((n: any) => {
          if (n.id === node.id) {
            return {
              ...n,
              buttonOutputs: (n.buttonOutputs || []).filter((_: any, idx: number) => idx !== index),
              data: {
                ...n.data,
                buttons: newButtons,
              },
            };
          }
          return n;
        }),
        connections: prev.connections.filter(
          (c: any) => !(c.sourceNodeId === node.id && c.sourceSocketId === outputToRemove?.id),
        ),
      }));
    },
    [node, updateStateWithHistory],
  );

  // اگر URL تغییر کرد، title را به‌روز کن
  React.useEffect(() => {
    if (node.data?.weblink) {
      extractTitle(node.data.weblink);
    }
  }, [node.data?.weblink]);

  // Initialize title with default placeholder if empty
  React.useEffect(() => {
    if (!node.data?.title || node.data.title === "") {
      updateNodeData(node.id, { title: defaultTitlePlaceholder });
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Title */}
      <div className="headerandinput">
        <div className="headerparent" style={{ paddingInline: "10px" }}>
          <label className={styles.label}>{t(LanguageKey.New_Flow_message_title)}</label>
          <img
            onClick={() => handlePaste("title")}
            style={{ cursor: "pointer", width: "20px", height: "20px" }}
            title="ℹ️ paste"
            role="button"
            src="/copy.svg"
          />
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <InputText
            className="textinputbox"
            value={node.data?.title === defaultTitlePlaceholder ? "" : node.data?.title || ""}
            maxLength={140}
            handleInputChange={(e) => {
              updateNodeData(node.id, { title: e.target.value });
            }}
            handleInputonFocus={(e) => {
              setIsTitleFocused(true);
              if (node.data?.title === defaultTitlePlaceholder) {
                updateNodeData(node.id, { title: "" });
              }
            }}
            handleInputBlur={(e) => {
              setIsTitleFocused(false);
              if (!node.data?.title || node.data.title.trim() === "") {
                updateNodeData(node.id, { title: defaultTitlePlaceholder });
              }
            }}
            placeHolder={defaultTitlePlaceholder}
          />
        </div>
      </div>

      {/* Subtitle */}
      <div className="headerandinput">
        <div className="headerparent" style={{ paddingInline: "10px" }}>
          <label className={styles.label}>{t(LanguageKey.New_Flow_message_description)}</label>
          <img
            onClick={() => handlePaste("subtitle")}
            style={{ cursor: "pointer", width: "20px", height: "20px" }}
            title="ℹ️ paste"
            role="button"
            src="/copy.svg"
          />
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ height: "150px", minHeight: "150px", maxHeight: "150px" }}>
          <TextArea
            className="captiontextarea"
            value={node.data?.subtitle || ""}
            maxLength={140}
            handleInputChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateNodeData(node.id, { subtitle: e.target.value })
            }
            placeHolder={t(LanguageKey.New_Flow_message_description)}
            role="textbox"
            title="Subtitle input"
          />
        </div>
      </div>

      {/* Weblink (validated) */}
      <div className="headerandinput">
        <div className="headerparent" style={{ paddingInline: "10px" }}>
          <label className={styles.label}>
            {displayTitle && (
              <span
                title={node.data?.weblink || ""}
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.data?.weblink) {
                    window.open(node.data.weblink, "_blank", "noopener,noreferrer");
                  }
                }}
                style={{ cursor: "pointer" }}>
                🔗 {displayTitle}
              </span>
            )}
            {!displayTitle && t(LanguageKey.linkURL)}
          </label>
          <img
            onClick={() => handlePaste("weblink")}
            style={{ cursor: "pointer", width: "20px", height: "20px" }}
            title="ℹ️ paste"
            role="button"
            src="/copy.svg"
          />
        </div>
        <div className={shouldShake ? styles.shakeHorizontal : ""} onClick={(e) => e.stopPropagation()}>
          <InputText
            className="textinputbox"
            type="url"
            value={node.data?.weblink || ""}
            handleInputChange={(e) => {
              const value = e.target.value;
              updateNodeData(node.id, { weblink: value });
              if (!value || value.trim() === "") {
                setDisplayTitle("");
              }
            }}
            handleInputBlur={() => {
              const currentUrl = node.data?.weblink || "";
              const formattedUrl = formatUrl(currentUrl);
              if (formattedUrl !== currentUrl) {
                updateNodeData(node.id, { weblink: formattedUrl });
              }
              if (formattedUrl) {
                extractTitle(formattedUrl);
              }
              const isValid = validateUrl(formattedUrl);
              if (!isValid && formattedUrl) {
                setShouldShake(true);
                setTimeout(() => setShouldShake(false), 3600);
              }
            }}
            placeHolder="https://example.com"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className={styles.field} style={{ marginTop: "10px" }}>
        <input
          type="file"
          accept="image/*,image/heic,image/heif"
          className={styles.fileInput}
          id={`img-${node.id}`}
          onChange={handleImageUpload}
          onClick={(e) => e.stopPropagation()}
        />
        <label htmlFor={`img-${node.id}`} className="cancelButton">
          <svg
            fill="var(--color-dark-blue)"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 36">
            <path
              opacity=".4"
              d="M1.9 18.8a9 9 0 0 1 6.3-8.3l.5-.3.2-.5A9.4 9.4 0 0 1 27.3 11q0 .5.2.6l.6.3a7.9 7.9 0 0 1-1.9 15.5h-2.6l.9-.9c.65-.73.9-1.87.9-2.85a4 4 0 0 0-1-2.65 31 31 0 0 0-3-3.5q-1.5-1.2-3.4-1.4-1.8.1-3.4 1.4a31 31 0 0 0-3 3.5 3.7 3.7 0 0 0 0 5.3l1 1h-2.1a8.6 8.6 0 0 1-8.6-8.5"
            />
            <path d="M16.6 18.8q.29-.35.68-.53a1.9 1.9 0 0 1 2.32.52l3 3.6q.36.46.46 1.05.09.58-.14 1.14a2 2 0 0 1-.69.9q-.46.34-1.03.39h-6.3q-.6-.01-1.1-.37a2 2 0 0 1-.72-.94 2.2 2.2 0 0 1 .42-2.28zm-.6 6.64h4v7.4c0 .55-.21 1.1-.59 1.49a1.95 1.95 0 0 1-2.82 0c-.38-.4-.59-.94-.59-1.5z" />
          </svg>

          {t(LanguageKey.New_Flow_upload_image)}
        </label>

        {/* Progress Bar */}
        {node.uploadProgress !== undefined && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${node.uploadProgress}%` }}>
                <span className={styles.progressText}>{node.uploadProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/*نمایش عکس */}
        {imgUrl && !node.uploadProgress && (
          <>
            <img src={imgUrl || ""} alt="Preview" className={styles.preview} />

            {/* نمایش اطلاعات فایل */}
            {node.data?.fileName && (
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>
                  {node.data.isVideo ? "🎬" : "🖼️"} {node.data.fileName}
                </span>
                <span className={styles.fileSize}>Size: {(node.data.fileSize / 1024).toFixed(2)} KB</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Buttons */}
      <div className={styles.buttonsSection}>
        {node.data?.buttons?.map((btn: string, idx: number) => (
          <div key={idx} className={styles.buttonItem}>
            <div className={styles.inputTextparent} onClick={(e) => e.stopPropagation()}>
              <InputText
                className="textinputbox"
                value={btn}
                maxLength={40}
                handleInputChange={(e) => {
                  const newButtons = [...(node.data?.buttons || [])];
                  newButtons[idx] = e.target.value;
                  const newButtonOutputs = [...(node.buttonOutputs || [])];
                  if (newButtonOutputs[idx]) {
                    newButtonOutputs[idx] = {
                      ...newButtonOutputs[idx],
                      label: e.target.value || `Button ${idx + 1}`,
                    };
                  }

                  updateNodeData(node.id, { buttons: newButtons });
                  // به‌روزرسانی buttonOutputs
                  setEditorState((prev: any) => ({
                    ...prev,
                    nodes: prev.nodes.map((n: any) =>
                      n.id === node.id ? { ...n, buttonOutputs: newButtonOutputs } : n,
                    ),
                  }));
                }}
                placeHolder={`Button ${idx + 1}`}
              />
            </div>
            <img
              onClick={(e) => {
                e.stopPropagation();
                const currentButtons = node.data?.buttons || [];
                if (currentButtons.length > 0) {
                  removeButton(idx);
                }
              }}
              role="button"
              style={{
                cursor: "pointer",
                width: "30px",
                height: "30px",
                padding: "5px",
                opacity: 1,
              }}
              title="ℹ️ delete"
              src="/delete-red.svg"
            />
          </div>
        ))}
        {(!node.data?.buttons || node.data.buttons.length < 3) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addButton();
            }}
            className="saveButton">
            <strong>+</strong> {t(LanguageKey.New_Flow_add_button)}
          </button>
        )}
      </div>
    </div>
  );
};

// Height calculation for this node type
export const getGenericItemNodeHeight = (node: NodeData): number => {
  const baseHeight = 340; // title + subtitle (150px TextArea) + weblink + image input + buttons label
  const buttonCount = node.data?.buttons?.length || 1;

  // Calculate image/video height
  let mediaHeight = 0;
  if (node.data?.image) {
    mediaHeight = node.data?.isVideo ? 220 : 180; // Video needs more space than image
    if (node.data?.fileName) {
      mediaHeight += 30; // File info section
    }
  }

  // Progress bar height
  const progressHeight = node.uploadProgress !== undefined ? 30 : 0;

  const addButtonHeight = !node.data?.buttons || node.data.buttons.length < 3 ? 35 : 0;
  return baseHeight + buttonCount * 35 + mediaHeight + progressHeight + addButtonHeight;
};

// Node container class name for styling the node border
export const genericitemNodeClassName = styles.nodeContainer;
