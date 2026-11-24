import DotLoaders from "brancy/components/design/loader/dotLoaders";
import { NotifType, notify, ResponseType } from "brancy/components/notifications/notificationBox";
import Loading from "brancy/components/notOk/loading";
import { MethodType } from "brancy/helper/api";
import { getClientMediaBaseUrl } from "brancy/helper/apiBaseUrl";
import { clientFetchApi } from "brancy/helper/clientFetchApi";
import { CharacterType } from "brancy/models/enums";
import { IGetMedia, IGetMedias } from "brancy/models/interfaces";
import { Session } from "next-auth";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./CharacterSheetPicker.module.css";

const SUCCESS_MEDIA_STATUS = 2;

interface CharacterSheetPickerProps {
  session: Session | null;
  selectedUrls: string[];
  onSelect: (media: IGetMedia) => void;
  onClose: () => void;
}

export default function CharacterSheetPicker({ session, selectedUrls, onSelect, onClose }: CharacterSheetPickerProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<IGetMedia[]>([]);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCharacterSheets = useCallback(
    async (cursor: string | null) => {
      if (!session) return;
      const response = await clientFetchApi<null, IGetMedias>("/api/mediaai/GetImages", {
        session,
        methodType: MethodType.get,
        queries: [
          { key: "mediaCreationStatus", value: SUCCESS_MEDIA_STATUS.toString() },
          { key: "nextMaxId", value: cursor ?? "" },
          { key: "characterType", value: CharacterType.All.toString() },
        ],
      });
      if (!response.succeeded) {
        notify(response.info?.responseType ?? ResponseType.Unexpected, NotifType.Error, response.errorMessage);
        return;
      }
      const newItems = Array.isArray(response.value?.items) ? response.value.items : [];
      setItems((current) => (cursor ? [...current, ...newItems] : newItems));
      setNextMaxId(response.value?.nextMaxId || null);
    },
    [session],
  );

  useEffect(() => {
    setLoading(true);
    fetchCharacterSheets(null).finally(() => setLoading(false));
  }, [fetchCharacterSheets]);

  const loadMore = async () => {
    if (!nextMaxId || loadingMore) return;
    setLoadingMore(true);
    await fetchCharacterSheets(nextMaxId);
    setLoadingMore(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className="title" id="modal-title">
          {t("Character sheet")}
        </div>
        <button type="button" className="cancelButton" style={{ width: "auto" }} onClick={onClose}>
          {t("Close")}
        </button>
      </div>
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className={styles.empty}>{t("No character sheets found.")}</div>
      ) : (
        <div className={styles.grid}>
          {items.map((media) => {
            const isSelected = selectedUrls.includes(media.thumbnailUrl);
            return (
              <button
                type="button"
                key={media.id}
                className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                disabled={isSelected}
                onClick={() => onSelect(media)}
                title={media.prompt}>
                <img
                  className={styles.preview}
                  src={getClientMediaBaseUrl() + media.thumbnailUrl}
                  alt={media.prompt || `#${media.id}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/cover.svg";
                  }}
                />
                <span className={styles.caption}>{media.prompt || `#${media.id}`}</span>
              </button>
            );
          })}
        </div>
      )}
      {!loading && nextMaxId && (
        <button type="button" className="cancelButton" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? <DotLoaders /> : t("Load more")}
        </button>
      )}
    </div>
  );
}
