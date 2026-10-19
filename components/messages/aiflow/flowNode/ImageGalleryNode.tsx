import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import Compressor from "compressorjs";
import { useSession } from "next-auth/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { LanguageKey } from "brancy/i18n";
import { UploadFile } from "brancy/helper/api";
import styles from "./ImageGalleryNode.module.css";
import { BaseNodeProps, NodeData } from "brancy/components/messages/aiflow/flowNode/types";

const baseMediaUrl = getClientMediaBaseUrl();

// Single source of truth for the per-block image limit
export const IMAGE_GALLERY_MAX_ITEMS = 7;

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const THUMB_ROW_HEIGHT = 80;
const THUMBS_PER_ROW = 3;

interface ImageGalleryItem {
  imageUrl: string;
  tempUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

interface ImageGalleryNodeProps extends BaseNodeProps {
  setEditorState: React.Dispatch<React.SetStateAction<any>>;
}

const isImageFile = (file: File) =>
  file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|heic|heif|bmp|svg)$/i.test(file.name);

const compressImage = (file: File) =>
  new Promise<File>((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      mimeType: "image/jpeg",
      convertSize: 5000000,
      success: (result) => {
        const blob = result as Blob;
        const mimeType = blob.type || "image/jpeg";
        const extension = mimeType === "image/jpeg" ? ".jpg" : file.name.slice(file.name.lastIndexOf(".")) || "";
        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, extension), { type: mimeType }));
      },
      error: reject,
    });
  });

export const ImageGalleryNode: React.FC<ImageGalleryNodeProps> = ({ node, setEditorState }) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const images: ImageGalleryItem[] = node.data?.images || [];
  const isUploading = node.uploadProgress !== undefined;
  const isFull = images.length >= IMAGE_GALLERY_MAX_ITEMS;

  const setProgress = useCallback(
    (progress: number | undefined) => {
      setEditorState((prev: any) => ({
        ...prev,
        nodes: prev.nodes.map((n: any) => (n.id === node.id ? { ...n, uploadProgress: progress } : n)),
      }));
    },
    [node.id, setEditorState],
  );

  const appendImage = useCallback(
    (item: ImageGalleryItem) => {
      setEditorState((prev: any) => ({
        ...prev,
        nodes: prev.nodes.map((n: any) =>
          n.id === node.id ? { ...n, data: { ...n.data, images: [...(n.data?.images || []), item] } } : n,
        ),
      }));
    },
    [node.id, setEditorState],
  );

  const removeImage = useCallback(
    (index: number) => {
      setEditorState((prev: any) => ({
        ...prev,
        nodes: prev.nodes.map((n: any) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, images: (n.data?.images || []).filter((_: any, i: number) => i !== index) } }
            : n,
        ),
      }));
    },
    [node.id, setEditorState],
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      e.target.value = "";
      if (!selected.length) return;

      const validFiles = selected.filter(isImageFile);
      if (validFiles.length !== selected.length) toast.warn(t(LanguageKey.New_Flow_upload_unsupported_media));

      const sizedFiles = validFiles.filter((file) => file.size <= MAX_FILE_SIZE);
      if (sizedFiles.length !== validFiles.length) toast.warn(t(LanguageKey.New_Flow_uploadmaxsizeexceeded));

      const remaining = IMAGE_GALLERY_MAX_ITEMS - images.length;
      const files = sizedFiles.slice(0, remaining);
      if (sizedFiles.length > remaining) {
        toast.warn(t(LanguageKey.New_Flow_imagegallery_max_reached, { max: IMAGE_GALLERY_MAX_ITEMS }));
      }
      if (!files.length) return;

      setProgress(0);
      try {
        for (let i = 0; i < files.length; i++) {
          const finalFile = await compressImage(files[i]);
          const upload = await UploadFile(session, finalFile, (progress) => {
            setProgress(Math.round(((i + progress / 100) / files.length) * 100));
          });
          appendImage({
            imageUrl: upload.fileName,
            tempUrl: upload.showUrl,
            fileName: finalFile.name,
            fileSize: finalFile.size,
            fileType: finalFile.type || "image/unknown",
          });
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error(t(LanguageKey.New_Flow_uploadfilefailed));
      } finally {
        setProgress(undefined);
      }
    },
    [images.length, session, t, setProgress, appendImage],
  );

  return (
    <div className={styles.container}>
      <input
        type="file"
        multiple
        accept="image/*,image/heic,image/heif"
        className={styles.fileInput}
        id={`img-${node.id}`}
        onChange={handleImageUpload}
      />
      {!isFull && !isUploading && (
        <label htmlFor={`img-${node.id}`} className="saveButton">
          <svg fill="#fff" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
            <path
              opacity=".4"
              d="M1.9 18.8a9 9 0 0 1 6.3-8.3l.5-.3.2-.5A9.4 9.4 0 0 1 27.3 11q0 .5.2.6l.6.3a7.9 7.9 0 0 1-1.9 15.5h-2.6l.9-.9c.65-.73.9-1.87.9-2.85a4 4 0 0 0-1-2.65 31 31 0 0 0-3-3.5q-1.5-1.2-3.4-1.4-1.8.1-3.4 1.4a31 31 0 0 0-3 3.5 3.7 3.7 0 0 0 0 5.3l1 1h-2.1a8.6 8.6 0 0 1-8.6-8.5"
            />
            <path d="M16.6 18.8q.29-.35.68-.53a1.9 1.9 0 0 1 2.32.52l3 3.6q.36.46.46 1.05.09.58-.14 1.14a2 2 0 0 1-.69.9q-.46.34-1.03.39h-6.3q-.6-.01-1.1-.37a2 2 0 0 1-.72-.94 2.2 2.2 0 0 1 .42-2.28zm-.6 6.64h4v7.4c0 .55-.21 1.1-.59 1.49a1.95 1.95 0 0 1-2.82 0c-.38-.4-.59-.94-.59-1.5z" />
          </svg>
          {t(LanguageKey.New_Flow_upload_image)}
        </label>
      )}

      {isUploading && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${node.uploadProgress}%` }}>
            <span className={styles.progressText}>{node.uploadProgress}%</span>
          </div>
        </div>
      )}

      <div className={styles.counter}>
        {images.length}/{IMAGE_GALLERY_MAX_ITEMS}
      </div>

      {images.length > 0 && (
        <div className={styles.grid}>
          {images.map((image, index) => (
            <div key={`${image.imageUrl}-${index}`} className={styles.thumb}>
              <img src={image.tempUrl || baseMediaUrl + image.imageUrl} alt={image.fileName || "Preview"} />
              <img
                className={styles.removeIcon}
                role="button"
                title="ℹ️ delete"
                src="/delete-red.svg"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Height calculation for this node type
export const getImageGalleryNodeHeight = (node: NodeData): number => {
  const count = node.data?.images?.length || 0;
  const rows = Math.ceil(count / THUMBS_PER_ROW);
  const uploadHeight = count >= IMAGE_GALLERY_MAX_ITEMS ? 0 : 50;
  return uploadHeight + 30 + rows * THUMB_ROW_HEIGHT;
};

export const imagegalleryNodeClassName = styles.nodeContainer;
