import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ImageCompressor from "compressorjs";
import { useSession } from "next-auth/react";
import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  internalNotify,
  InternalResponseType,
  NotifType,
  notify,
  ResponseType,
} from "saeed/components/notifications/notificationBox";
import { convertHeicToJpeg } from "saeed/helper/convertHeicToJPEG";
import { LanguageKey } from "saeed/i18n";
import { MediaType } from "saeed/models/page/post/preposts";
import { IProduct_Media, ISuggestedMedia } from "saeed/models/store/IProduct";
import styles from "./media.module.css";

const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;
const MAX_UPLOADS = 5;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const IMAGE_COMPRESSION_OPTIONS = {
  quality: 0.95,
  maxWidth: 700,
  maxHeight: 700,
  mimeType: "jpeg",
} as const;

interface MediaProps {
  coverUrl: string;
  productMedia: IProduct_Media[];
  mediaSuggested: ISuggestedMedia;
  toggleNext: { toggle: boolean; isNext: boolean };
  upadteCteateFromMeida: (isNext: boolean, media: IProduct_Media[]) => void;
}

interface ImagePopupProps {
  imageSrc: string;
  onClose: () => void;
}

const ImagePopup = React.memo(({ imageSrc, onClose }: ImagePopupProps) => (
  <div className="dialogBg" onClick={onClose} role="dialog" aria-label="Image Preview">
    <img className={styles.popupContent} src={imageSrc} alt="Enlarged product image" role="img" />
  </div>
));
ImagePopup.displayName = "ImagePopup";

// Sortable item component
function SortableItem({
  media,
  index,
  onDelete,
  onReplace,
  onView,
  onToggleVisibility,
}: {
  media: IProduct_Media;
  index: number;
  onDelete: (index: number) => void;
  onReplace: (index: number) => void;
  onView: (src: string) => void;
  onToggleVisibility: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: index.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className={styles.thumbnailmedia}>
        <img
          className={`${styles.thumbnailmediapicture} ${media.isHidden && "fadeDiv"}`}
          role="button"
          title="ℹ️ media picture"
          src={media.thumbnailMediaUrl.length > 0 ? basePictureUrl + media.thumbnailMediaUrl : media.base64Url}
        />
        <div className={`${styles.thumbnailmediasetting} ${media.isHidden && "fadeDiv"}`}>
          <img
            className={styles.thumbnailicon}
            title="ℹ️ photo type"
            src={media.mediaType === MediaType.Image ? "/mediapicture.svg" : "/mediavideo.svg"}
          />
          {!media.isDefault && (
            <div className={styles.thumbnailmediabtn}>
              <img
                className={styles.thumbnailiconstg}
                title="ℹ️ view large"
                src="/icon-view.svg"
                onClick={() =>
                  onView(
                    media.thumbnailMediaUrl.length > 0 ? basePictureUrl + media.thumbnailMediaUrl : media.base64Url
                  )
                }
              />
              {!media.key && !media.fromSuggestion && (
                <img
                  onClick={() => onReplace(media.index)}
                  className={styles.thumbnailiconstg}
                  title="ℹ️ replace"
                  src="/replacemedia.svg"
                />
              )}
              <img
                className={styles.thumbnailiconstg}
                onClick={() => onDelete(media.index)}
                title="ℹ️ delete"
                src="/deletemedia.svg"
              />
            </div>
          )}
        </div>
        <div className={styles.thumbnailmediainfo}>
          <div {...attributes} {...listeners}>
            <img style={{ width: "35px" }} title="ℹ️ Drag to Move" src="/draginline.svg" />
          </div>
          <div
            className={`${styles.pictureorder} ${!media.isHidden ? styles.pictureorderfalse : ""}`}
            title={`ℹ️ show or hide ${index + 2}`}
            onClick={() => onToggleVisibility(media.index)}>
            {index + 2}
          </div>
          {media.isDefault ? (
            <img style={{ width: "35px" }} title="ℹ️ Recently Uploaded" src="/instagram.svg" />
          ) : media.fromSuggestion ? (
            <img style={{ width: "35px" }} title="ℹ️ suggest picture" src="/new.svg" />
          ) : (
            <img style={{ width: "35px" }} title="ℹ️ Recently Uploaded" src="/new.svg" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Media({
  coverUrl,
  productMedia,
  mediaSuggested,
  upadteCteateFromMeida,
  toggleNext,
}: MediaProps) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputRefReplace = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [productMediaInfo, setProductMediaInfo] = useState<IProduct_Media[]>(productMedia);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [popupImage, setPopupImage] = useState<string | null>(null);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // const _arrayBufferToBase64 = useCallback((buffer: ArrayBuffer): string => {
  //   return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  // }, []);

  function _arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  const handleSpanClick = useCallback((index: number): void => {
    setProductMediaInfo((prev) => prev.map((x) => (x.index !== index ? x : { ...x, isHidden: !x.isHidden })));
  }, []);

  const compressAndUpload = useCallback(
    async (file: File) => {
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
      try {
        const result = await new Promise<Blob>((resolve, reject) => {
          new ImageCompressor(file, {
            ...IMAGE_COMPRESSION_OPTIONS,
            success: resolve,
            error: reject,
          });
        });

        const arrayBuffer = await result.arrayBuffer();
        const arrayToString = _arrayBufferToBase64(arrayBuffer as ArrayBuffer);
        const base64Url = `data:image/jpeg;base64,${arrayToString}`;

        setProductMediaInfo((prev) => {
          if (selectedIndex !== null) {
            return prev.map((x) => (x.index !== selectedIndex ? x : { ...x, base64Url }));
          }

          const newMedia: IProduct_Media = {
            base64Url,
            childrenId: null,
            index: 0,
            isDefault: false,
            isHidden: false,
            mediaType: MediaType.Image,
            thumbnailMediaUrl: "",
            key: null,
          };

          return [newMedia, ...prev].map((arr, idx) => ({
            ...arr,
            index: idx,
          }));
        });
      } catch (error) {
        console.error("Image compression failed:", error);
        notify(ResponseType.Unexpected, NotifType.Error);
      }
    },
    [selectedIndex, _arrayBufferToBase64]
  );

  const handleFileDrop = useCallback(
    (file: File) => {
      compressAndUpload(file);
    },
    [compressAndUpload]
  );

  const isSupportedExtension = useCallback((file: File) => {
    return SUPPORTED_IMAGE_TYPES.includes(file.type);
  }, []);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file && isSupportedExtension(file)) {
      compressAndUpload(file);
    }
    e.target.value = "";
  };

  const handleUploadImage = () => {
    const customCount = productMediaInfo.filter((x) => !x.isDefault && !x.key && !x.fromSuggestion);
    if (customCount.length >= MAX_UPLOADS) {
      internalNotify(InternalResponseType.ExceedPermittedUploadMedia, NotifType.Warning);
      return;
    }
    if (inputRef.current) {
      setSelectedIndex(null);
      inputRef.current.click();
    }
  };

  const handleReplaceImage = (index: number) => {
    if (inputRefReplace.current) {
      setSelectedIndex(index);
      inputRefReplace.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const customCount = productMediaInfo.filter((x) => !x.isDefault && !x.key && !x.fromSuggestion);
    if (customCount.length >= MAX_UPLOADS) {
      internalNotify(InternalResponseType.ExceedPermittedUploadMedia, NotifType.Warning);
      return;
    }
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && isSupportedExtension(droppedFile)) {
      handleFileDrop(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProductMediaInfo((items) => {
        const oldIndex = items.findIndex((item) => item.index.toString() === active.id);
        const newIndex = items.findIndex((item) => item.index.toString() === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update indices after reordering
        return newItems.map((item, idx) => ({
          ...item,
          index: idx,
        }));
      });
    }
  };

  function handleDeleteCustomeMedia(index: number) {
    const newArray = productMediaInfo.filter((x) => x.index !== index);
    const reindexedArray = newArray.map((item, idx) => ({
      ...item,
      index: idx,
    }));
    setProductMediaInfo(reindexedArray);
  }

  const handleSuggestionClick = (key: string, url: string) => {
    const isAlreadySelected = productMediaInfo.some((item) => item.key === key);

    if (isAlreadySelected) {
      setProductMediaInfo((prev) => prev.filter((x) => x.key !== key));
    } else {
      const newMediaItem: IProduct_Media = {
        base64Url: "",
        childrenId: null,
        index: productMediaInfo.length,
        isDefault: false,
        isHidden: false,
        mediaType: MediaType.Image,
        thumbnailMediaUrl: url,
        key: key,
        fromSuggestion: true,
        suggestedIndex: 0,
      };
      setProductMediaInfo([...productMediaInfo, newMediaItem]);
    }
  };

  useEffect(() => {
    if (loading) {
      setLoading(false);
      return;
    }
    upadteCteateFromMeida(toggleNext.isNext, productMediaInfo);
  }, [toggleNext]);

  useEffect(() => {
    const selectedIndices = productMediaInfo.filter((x) => x.key !== null).map((x) => x.key!);
    setSelectedSuggestions(selectedIndices);
  }, [productMediaInfo]);

  const remainingUploads = useMemo(() => {
    return MAX_UPLOADS - productMediaInfo.filter((x) => !x.isDefault && !x.key && !x.fromSuggestion).length;
  }, [productMediaInfo]);

  return (
    <>
      <div className={styles.Media} role="region" aria-label="Product Media Management">
        {popupImage && <ImagePopup imageSrc={popupImage} onClose={() => setPopupImage(null)} />}
        <div className="headerandinput">
          <div className="title" role="heading" aria-level={2}>
            {t(LanguageKey.product_mediatitle)}
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className={styles.medialist} role="list" aria-label="Product Images">
              <div className={styles.thumbnailmedia}>
                <img
                  className={styles.thumbnailmediapicture}
                  title="Cover Image"
                  alt="Product cover image"
                  src={basePictureUrl + coverUrl}
                  role="img"
                />
                <div className={styles.thumbnailmediasetting}>
                  <img
                    className={styles.thumbnailicon}
                    title="Media Type Indicator"
                    alt="Media type icon"
                    src="/mediavideo.svg"
                    role="img"
                  />
                </div>
                <div className={styles.thumbnailmediainfo}>
                  <div className={styles.pictureorderfalse} title="ℹ️ pictures cover photo">
                    {t(LanguageKey.cover)}
                  </div>
                  <img style={{ width: "35px" }} title="ℹ️ from instagram" src="/instagram.svg" />
                </div>
              </div>

              <SortableContext
                items={productMediaInfo.map((item) => item.index.toString())}
                strategy={horizontalListSortingStrategy}>
                <div className={styles.test}>
                  {productMediaInfo.map((media, index) => (
                    <SortableItem
                      key={index}
                      media={media}
                      index={index}
                      onDelete={handleDeleteCustomeMedia}
                      onReplace={handleReplaceImage}
                      onView={(src) => setPopupImage(src)}
                      onToggleVisibility={handleSpanClick}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </DndContext>
        </div>

        {mediaSuggested.medias.length > 0 && (
          <div className="headerandinput">
            <div className="headerandinput">
              <div className="title" role="heading" aria-level={2}>
                {t(LanguageKey.product_SuggestedImages)}
              </div>
              <div className="explain">{t(LanguageKey.product_SuggestedImagesExplain)} </div>
            </div>
            <div
              className={styles.suggestedmedia}
              onMouseDown={(e) => {
                const slider = e.currentTarget;
                slider.classList.add(styles.active);
                const startX = e.pageX - slider.offsetLeft;
                const scrollLeft = slider.scrollLeft;

                const onMouseMove = (e: MouseEvent) => {
                  const x = e.pageX - slider.offsetLeft;
                  const walk = (x - startX) * 1; // Adjust scroll speed
                  slider.scrollLeft = scrollLeft - walk;
                };

                const onMouseUp = () => {
                  slider.classList.remove(styles.active);
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                };

                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}>
              {mediaSuggested.medias.map((v, index) => (
                <div
                  key={v.key}
                  className={styles.thumbnailmediasuggested}
                  onClick={() => handleSuggestionClick(v.key, v.url)}>
                  <img className={styles.thumbnailmediapicture} title="ℹ️ media picture" src={basePictureUrl + v.url} />
                  <div className={styles.suggestedthumbnailsetting} title="ℹ️ select picture to add to product">
                    <img className={styles.thumbnailicon} title="ℹ️ photo type" src="/mediapicture.svg" />
                  </div>
                  {selectedSuggestions.includes(v.key) && (
                    <div className={styles.selectedMask}>
                      <img style={{ width: "35px" }} title="ℹ️ selected media picture " src="/tickff.svg" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={`${styles.uploadmedianew} ${remainingUploads === 0 ? styles.fadedUpload : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleUploadImage}
          title="Upload media"
          role="button"
          aria-label="Upload media - click or drag and drop"
          tabIndex={0}>
          <input
            onChange={handleImageChange}
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg"
            style={{ display: "none" }}
            aria-label="File input"
          />
          <input
            onChange={handleImageChange}
            ref={inputRefReplace}
            type="file"
            accept="image/png, image/jpeg"
            style={{ display: "none" }}
          />
          <svg width="50px" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
            <path
              d="M8 .5h24A7.5 7.5 0 0 1 39.5 8v24a7.5 7.5 0 0 1-7.5 7.5H8A7.5 7.5 0 0 1 .5 32V8A7.5 7.5 0 0 1 8 .5Z"
              stroke="var(--color-gray60)"
            />
            <path
              d="M16.67 23.33 20 20m0 0 3.33 3.33M20 20v7.5m6.67-3.55a4.57 4.57 0 0 0-2.92-8.12.5.5 0 0 1-.45-.25 6.25 6.25 0 1 0-9.81 7.58"
              stroke="var(--text-h1)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            <span
              style={{
                color: "var(--color-dark-blue)",
                fontWeight: "var(--weight-700)",
              }}>
              {t(LanguageKey.product_clicktoupload)}
              <br></br>
              {t(LanguageKey.product_ordragdrop)}
            </span>
          </span>

          <span className="explain">PNG - JPG (max:20 MB)</span>
          <span className="explain">
            {t(LanguageKey.uploadsRemaining)}: <strong>{remainingUploads}</strong>
          </span>
        </div>
      </div>
    </>
  );
}
