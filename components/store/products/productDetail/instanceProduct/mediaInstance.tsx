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
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { internalNotify, InternalResponseType, NotifType } from "../../../../notifications/notificationBox";
import { convertHeicToJpeg } from "../../../../../helper/convertHeicToJPEG";
import { LanguageKey } from "../../../../../i18n";
import { MediaType } from "../../../../../models/page/post/preposts";
import { IMediaInstanceInfo, ISuggestedMedia } from "../../../../../models/store/IProduct";
import styles from "./media.module.css";
const basePictureUrl = process.env.NEXT_PUBLIC_BASE_MEDIA_URL;

// Sortable item component
function SortableItem({
  item,
  index,
  onView,
  onReplace,
  onDelete,
  onToggleVisibility,
  onDeleteSuggestion,
}: {
  item: IMediaInstanceInfo;
  index: number;
  onView: (url: string) => void;
  onReplace: (index: number) => void;
  onDelete: (index: number) => void;
  onToggleVisibility: (index: number) => void;
  onDeleteSuggestion: (key: string) => void;
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
        {item.childMedia && (
          <img
            className={`${styles.thumbnailmediapicture} ${item.isHidden && "fadeDiv"}`}
            role="button"
            title="ℹ️ media picture"
            src={basePictureUrl + item.childMedia.thumbnailMediaUrl}
          />
        )}
        {item.customMedia && !item.customMedia.isSuggested && (
          <img
            className={`${styles.thumbnailmediapicture} ${item.isHidden && "fadeDiv"}`}
            role="button"
            title="ℹ️ media picture"
            src={basePictureUrl + item.customMedia.thumbnailMediaUrl}
          />
        )}
        {item.customMedia && item.customMedia.isSuggested && (
          <img
            className={`${styles.thumbnailmediapicture} ${item.isHidden && "fadeDiv"}`}
            role="button"
            title="ℹ️ media picture"
            src={basePictureUrl + item.customMedia.mediaUrl}
          />
        )}
        {item.uploadMedia && (
          <img
            className={`${styles.thumbnailmediapicture} ${item.isHidden && "fadeDiv"}`}
            role="button"
            title="ℹ️ media picture"
            src={item.uploadMedia.base64Url}
          />
        )}
        <div className={`${styles.thumbnailmediasetting} ${item.isHidden && "fadeDiv"}`}>
          <img
            className={styles.thumbnailicon}
            title="ℹ️ photo type"
            src={item.mediaType === MediaType.Image ? "/mediapicture.svg" : "/mediavideo.svg"}
          />
          {
            <div className={styles.thumbnailmediabtn}>
              <img
                className={styles.thumbnailiconstg}
                title="ℹ️ view large"
                src="/icon-view.svg"
                onClick={() =>
                  onView(
                    item.uploadMedia
                      ? item.uploadMedia.base64Url
                      : item.childMedia
                      ? basePictureUrl + item.childMedia.thumbnailMediaUrl
                      : basePictureUrl + item.customMedia!.thumbnailMediaUrl
                  )
                }
              />
              {item.uploadMedia && (
                <>
                  <img
                    onClick={() => onReplace(item.index)}
                    className={styles.thumbnailiconstg}
                    title="ℹ️ replace"
                    src="/replacemedia.svg"
                  />
                  <img
                    className={styles.thumbnailiconstg}
                    onClick={() => onDelete(item.index)}
                    title="ℹ️ delete"
                    src="/deletemedia.svg"
                  />
                </>
              )}
              {item.customMedia && item.customMedia.isSuggested && item.customMedia.key && (
                <>
                  <img
                    className={styles.thumbnailiconstg}
                    onClick={() => onDeleteSuggestion(item.customMedia!.key!)}
                    title="ℹ️ delete"
                    src="/deletemedia.svg"
                  />
                </>
              )}
            </div>
          }
        </div>
        <div className={styles.thumbnailmediainfo}>
          <img style={{ width: "35px" }} title="ℹ️ Drag to Move" src="/draginline.svg" {...attributes} {...listeners} />
          <div
            className={`${styles.pictureorder} ${!item.isHidden ? styles.pictureorderfalse : ""}`}
            title={`ℹ️ show or hide ${index + 2}`}
            onClick={() => {
              if (item.uploadMedia) return;
              onToggleVisibility(item.index);
            }}>
            {index + 2}
          </div>

          <img style={{ width: "35px" }} title="ℹ️ Recently Uploaded" src="/new.svg" />
        </div>
      </div>
    </div>
  );
}

export default function MediaInstance({
  coverUrl,
  productMedia,
  upadteCteateFromMeida,
  toggleNext,
  suggestedMedias,
}: {
  coverUrl: string;
  productMedia: IMediaInstanceInfo[];
  toggleNext: { toggle: boolean; isNext: boolean };
  suggestedMedias: ISuggestedMedia;
  upadteCteateFromMeida: (isNext: boolean, media: IMediaInstanceInfo[]) => void;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputRefReplace = useRef<HTMLInputElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<{ id: number | null; key: string }[]>(
    productMedia
      .filter((x) => x.customMedia && x.customMedia.isSuggested)
      .map((z) => ({ id: z.customMedia!.id, key: z.customMedia!.key! }))
  );
  const [productMediaInfo, setProductMediaInfo] = useState<IMediaInstanceInfo[]>(productMedia);
  const [popupImage, setPopupImage] = useState<string | null>(null);

  // Set up dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function _arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function handleSpanClick(index: number) {
    setProductMediaInfo((prev) => prev.map((x) => (x.index !== index ? x : { ...x, isHidden: !x.isHidden })));
  }

  function ImagePopup({ imageSrc, onClose }: { imageSrc: string; onClose: () => void }) {
    return (
      <div className="dialogBg" onClick={onClose}>
        <div className={styles.popupContent}>
          <div className={styles.closebtn} onClick={onClose}>
            <img src="/close-box.svg" alt="close" title="close" />
          </div>
          <img src={imageSrc} alt="Popup Image" />
        </div>
      </div>
    );
  }

  function compressAndUpload(file: File) {
    new ImageCompressor(file, {
      quality: 0.95,
      maxWidth: 700,
      maxHeight: 700,
      mimeType: "jpeg",
      success(result) {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayToString = _arrayBufferToBase64(reader.result as ArrayBuffer);
          if (selectedIndex !== null) {
            setProductMediaInfo((prev) =>
              prev.map((x) =>
                x.index !== selectedIndex
                  ? x
                  : {
                      ...x,
                      uploadMedia: {
                        ...x.uploadMedia!,
                        base64Url: "data:image/jpeg;base64," + arrayToString,
                      },
                    }
              )
            );
          } else {
            const newArray = [
              {
                uploadMedia: {
                  base64Url: "data:image/jpeg;base64," + arrayToString,
                  mediaType: MediaType.Image,
                  thumbnailMediaUrl: "",
                  index: 0,
                },
                key: null,
                childMedia: null,
                customMedia: null,
                index: 0,
                isHidden: false,
                mediaType: MediaType.Image,
              },
              ...productMediaInfo,
            ];
            for (let arr of newArray) {
              arr.index = newArray.indexOf(arr);
            }
            setProductMediaInfo(newArray);
          }
        };
        reader.readAsArrayBuffer(result);
      },
      error(error) {
        console.error(error.message);
      },
    });
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let file = await convertHeicToJpeg(e.target.files?.[0]!);
    if (!file) return;
    if (file.type.startsWith("image/")) {
      compressAndUpload(file);
    }
    e.target.value = "";
  };

  const handleUploadImage = () => {
    const customCount = productMediaInfo.filter((x) => x.customMedia);
    const uploadMedia = productMediaInfo.filter((x) => x.uploadMedia);
    if (customCount.filter((x) => !x.customMedia?.key).length + uploadMedia.length >= 5) {
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

  function handleDeleteCustomeMedia(index: number) {
    const newArray = productMediaInfo.filter((x) => x.index !== index);
    for (let arr of newArray) {
      arr.index = newArray.indexOf(arr);
    }
    setProductMediaInfo(newArray);
  }

  function handleDeleteSuggestion(key: string) {
    setProductMediaInfo((prev) => prev.filter((x) => x.uploadMedia || (x.customMedia && x.customMedia.key !== key)));
    setSelectedSuggestions((prev) => prev.filter((x) => x.key !== key));
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const customCount = productMediaInfo.filter((x) => x.customMedia);
    const uploadMedia = productMediaInfo.filter((x) => x.uploadMedia);
    if (customCount.length + uploadMedia.length >= 5) {
      internalNotify(InternalResponseType.ExceedPermittedUploadMedia, NotifType.Warning);
      return;
    }
    const droppedFiles: File[] = Array.from(e.dataTransfer.files);
    const file = droppedFiles[0];
    if (file && file.type === "image/jpeg") {
      compressAndUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Handle DragEnd from dnd-kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProductMediaInfo((items) => {
        const oldIndex = items.findIndex((item) => item.index.toString() === active.id);
        const newIndex = items.findIndex((item) => item.index.toString() === over.id);

        const newArray = arrayMove(items, oldIndex, newIndex);

        // Update indices after reordering
        for (let i = 0; i < newArray.length; i++) {
          newArray[i].index = i;
        }

        return newArray;
      });
    }
  };

  const handleSuggestionClick = (id: number, url: string, key: string) => {
    const isSelectedSuggest = productMediaInfo.some((x) => x.customMedia?.id === id);
    if (isSelectedSuggest) return;
    const isAlreadySelected = productMediaInfo.some((item) => item.customMedia && item.customMedia.key === key);
    if (isAlreadySelected) {
      setProductMediaInfo((prev) => prev.filter((x) => x.uploadMedia || (x.customMedia && x.customMedia.key !== key)));
      setSelectedSuggestions((prev) => prev.filter((x) => x.key !== key));
    } else {
      const newMediaItem: IMediaInstanceInfo = {
        uploadMedia: null,
        childMedia: null,
        customMedia: {
          createdTime: Date.now(),
          index: productMediaInfo.length,
          id: 0,
          isHidden: false,
          isSuggested: true,
          mediaType: MediaType.Image,
          mediaUrl: url,
          productId: 0,
          thumbnailMediaUrl: "",
          key: key,
        },
        index: productMediaInfo.length,
        isHidden: false,
        mediaType: MediaType.Image,
      };
      setProductMediaInfo([...productMediaInfo, newMediaItem]);
      setSelectedSuggestions((prev) => [...prev, { id: null, key: key }]);
    }
  };

  useEffect(() => {
    if (loading) {
      setLoading(false);
      return;
    }
    upadteCteateFromMeida(toggleNext.isNext, productMediaInfo);
  }, [toggleNext]);

  return (
    <>
      <div className={styles.Media}>
        {popupImage && <ImagePopup imageSrc={popupImage} onClose={() => setPopupImage(null)} />}
        <div className="headerandinput">
          <div className="title">{t(LanguageKey.product_mediatitle)}</div>

          {/* dnd-kit implementation */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className={styles.medialist}>
              <div className={styles.thumbnailmedia}>
                <img
                  className={styles.thumbnailmediapicture}
                  title="ℹ️ media picture"
                  src={basePictureUrl + coverUrl}
                />
                <div className={styles.thumbnailmediasetting}>
                  <img className={styles.thumbnailicon} title="ℹ️ photo type" src="/mediavideo.svg" />
                </div>
                <div className={styles.thumbnailmediainfo}>
                  <div className={styles.pictureorderfalse} title="ℹ️ pictures cover photo">
                    {t(LanguageKey.cover)}
                  </div>
                  <img style={{ width: "35px" }} title="ℹ️ from instagram" src="/instagram.svg" />
                </div>
              </div>

              <div className={styles.test}>
                <SortableContext
                  items={productMediaInfo.map((_, i) => i.toString())}
                  strategy={horizontalListSortingStrategy}>
                  {productMediaInfo.map((item, index) => (
                    <SortableItem
                      key={index}
                      item={item}
                      index={index}
                      onView={setPopupImage}
                      onReplace={handleReplaceImage}
                      onDelete={handleDeleteCustomeMedia}
                      onToggleVisibility={handleSpanClick}
                      onDeleteSuggestion={handleDeleteSuggestion}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>
          </DndContext>
        </div>

        {suggestedMedias.medias.length > 0 && (
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
              {suggestedMedias.medias.map((v) => (
                <div
                  key={v.key}
                  className={styles.thumbnailmediasuggested}
                  onClick={() => handleSuggestionClick(v.mediaId!, v.url, v.key)}>
                  <img className={styles.thumbnailmediapicture} title="ℹ️ media picture" src={basePictureUrl + v.url} />
                  <div className={styles.suggestedthumbnailsetting} title="ℹ️ select picture to add to product">
                    <img className={styles.thumbnailicon} title="ℹ️ photo type" src="/mediapicture.svg" />
                  </div>
                  {selectedSuggestions.find((x) => (x.id && x.id === v.mediaId) || x.key === v.key) && (
                    <div className={styles.selectedMask}>
                      <img style={{ width: "35px" }} title="ℹ️ selected media picture " src="/tickff.svg" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <input onChange={handleImageChange} ref={inputRefReplace} type="file" style={{ display: "none" }} />
        <div
          className={styles.uploadmedia}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleUploadImage}
          title="ℹ️ upload media">
          <input
            onChange={handleImageChange}
            ref={inputRef}
            type="file"
            accept="image/jpeg"
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
            <span style={{ color: "var(--color-dark-blue)", fontWeight: "700" }}>
              {t(LanguageKey.product_clicktoupload)}{" "}
            </span>
            <span>{t(LanguageKey.product_ordragdrop)}</span>
          </span>
          <span>PNG - JPG (max:20 MB)</span>
        </div>
      </div>
    </>
  );
}
