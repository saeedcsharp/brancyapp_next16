import Compressor from "compressorjs";
import { useSession } from "next-auth/react";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { LanguageKey } from "brancy/i18n";
import { UploadFile } from "brancy/helper/api";
import styles from "./ImageNode.module.css";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";
const baseMediaUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL || "";
interface ImageNodeProps extends BaseNodeProps {
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
}

export const ImageNode: React.FC<ImageNodeProps> = ({ node, updateNodeData, setEditorState }) => {
  const { data: session } = useSession();
  const [imgUrl, setImgUrl] = useState<string | null>(node.data?.tempUrl || baseMediaUrl + node.data.imageUrl);
  const { t } = useTranslation();
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
      const validVideoTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
      ];

      const isValidImage = validImageTypes.some(
        (type) => file.type === type || file.name.toLowerCase().endsWith(type.split("/")[1]),
      );
      const isValidVideo = validVideoTypes.some(
        (type) => file.type === type || file.name.toLowerCase().match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i),
      );

      if (
        !isValidImage &&
        !isValidVideo &&
        file.type &&
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/")
      ) {
        toast.warn(t(LanguageKey.New_Flow_upload_unsupported_media));
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.warn(t(LanguageKey.New_Flow_uploadmaxsizeexceeded));
        return;
      }

      // اگر فایل ویدیو است، مستقیماً آن را آپلود کن
      if (isValidVideo) {
        setEditorState((prev: any) => ({
          ...prev,
          nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: 0 } : n)),
        }));

        // آپلود ویدیو بدون فشرده‌سازی
        UploadFile(session, file, (progress) => {
          setEditorState((prev: any) => ({
            ...prev,
            nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: progress } : n)),
          }));
        })
          .then((upload) => {
            setImgUrl(upload.showUrl);
            updateNodeData(node.id, {
              imageUrl: upload.fileName,
              tempUrl: upload.showUrl,
              isExist: false,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || "video/unknown",
              isVideo: true,
            });
            setEditorState((prev: any) => ({
              ...prev,
              nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
            }));
          })
          .catch((error) => {
            console.error("خطا در آپلود ویدیو:", error);
            setEditorState((prev: any) => ({
              ...prev,
              nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: undefined } : n)),
            }));
            toast.error(t(LanguageKey.New_Flow_uploadfilefailed));
          });

        e.target.value = "";
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
              isExist: false,
              fileName: compressedFileName,
              fileSize: finalFile.size,
              fileType: finalFile.type || file.type || "image/unknown",
              isVideo: false,
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

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept="image/*,image/heic,image/heif,video/*"
        className={styles.fileInput}
        id={`img-${node.id}`}
        onChange={handleImageUpload}
      />
      <label htmlFor={`img-${node.id}`} className="saveButton">
        <svg fill="#fff" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
          <path
            opacity=".4"
            d="M1.9 18.8a9 9 0 0 1 6.3-8.3l.5-.3.2-.5A9.4 9.4 0 0 1 27.3 11q0 .5.2.6l.6.3a7.9 7.9 0 0 1-1.9 15.5h-2.6l.9-.9c.65-.73.9-1.87.9-2.85a4 4 0 0 0-1-2.65 31 31 0 0 0-3-3.5q-1.5-1.2-3.4-1.4-1.8.1-3.4 1.4a31 31 0 0 0-3 3.5 3.7 3.7 0 0 0 0 5.3l1 1h-2.1a8.6 8.6 0 0 1-8.6-8.5"
          />
          <path d="M16.6 18.8q.29-.35.68-.53a1.9 1.9 0 0 1 2.32.52l3 3.6q.36.46.46 1.05.09.58-.14 1.14a2 2 0 0 1-.69.9q-.46.34-1.03.39h-6.3q-.6-.01-1.1-.37a2 2 0 0 1-.72-.94 2.2 2.2 0 0 1 .42-2.28zm-.6 6.64h4v7.4c0 .55-.21 1.1-.59 1.49a1.95 1.95 0 0 1-2.82 0c-.38-.4-.59-.94-.59-1.5z" />
        </svg>
        {t(LanguageKey.New_Flow_upload_imageorvideo)}
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

      {/* نمایش عکس یا ویدیو */}
      {node.data?.imageUrl && !node.uploadProgress && (
        <>
          {node.data?.isVideo ? (
            <video src={imgUrl || ""} controls className={styles.videoPreview}>
              {t(LanguageKey.New_Flow_unsupportedbrowser)}
            </video>
          ) : (
            <img src={imgUrl || ""} alt="Preview" className={styles.preview} />
          )}
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
  );
};

// Height calculation for this node type
export const getImageNodeHeight = (node: NodeData): number => {
  if (node.data?.imageUrl) {
    let height = node.data?.isVideo ? 220 : 180;
    if (node.data?.fileName) {
      height += 20;
    }
    return height;
  }
  return 60;
};

// Node container class name for styling the node border
export const imageNodeClassName = styles.nodeContainer;
