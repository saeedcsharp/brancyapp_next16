import { useSession } from "next-auth/react";
import React, { KeyboardEvent, MouseEvent, useCallback, useId, useMemo, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

import Dotmenu from "brancy/components/design/dotMenu/dotMenu";
import Slider, { SliderSlide } from "brancy/components/design/slider/slider";
import Loading from "brancy/components/notOk/loading";

import { LoginStatus, RoleAccess } from "brancy/helper/loadingStatus";

import { LanguageKey } from "brancy/i18n";
import { PartnerRole } from "brancy/models/_AccountInfo/InstagramerAccountInfo";
import { IHashtag } from "brancy/models/page/tools/tools";

import styles from "brancy/components/page/tools/hashtaglist/hashtags.module.css";

interface HashtagListItem {
  listId: number;
  listName: string;
  hashtags: string[];
}

const RTL_PATTERN = /[\u0600-\u06FF]/;

const Hashtags = (props: {
  data: IHashtag | null;
  displayNewList: (e: MouseEvent) => void;
  onCopyHashtags: (hashtags: string[]) => void;
  onDeleteClick: (listId: number, listName: string, hashtags: string[]) => void;
  onEditClick: (listId: number, listName: string, hashtags: string[]) => void;
}) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const headerRef = useRef<HTMLButtonElement>(null);
  const addNewRef = useRef<HTMLDivElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [isPending, startTransition] = useTransition();

  const headerId = useId();
  const contentId = useId();

  const { onCopyHashtags, onDeleteClick, onEditClick, displayNewList } = props;

  const isLoggedIn = useMemo(() => LoginStatus(session), [session]);
  const hasAccess = useMemo(() => RoleAccess(session, PartnerRole.PageView), [session]);

  const loadingStatus = useMemo(() => {
    if (!isLoggedIn || !hasAccess) return true;
    return !props.data;
  }, [isLoggedIn, hasAccess, props.data]);

  const handleCircleClick = useCallback(() => {
    startTransition(() => {
      setIsHidden((prevState) => !prevState);
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCircleClick();
      }
    },
    [handleCircleClick]
  );

  const handleMenuClick = useCallback(
    (action: string, listItem: HashtagListItem) => {
      const { listId, listName, hashtags } = listItem;

      switch (action) {
        case t(LanguageKey.edit):
          onEditClick(listId, listName, hashtags);
          break;
        case t(LanguageKey.copylist):
          onCopyHashtags(hashtags);
          break;
        case t(LanguageKey.delete):
          onDeleteClick(listId, listName, hashtags);
          break;
      }
    },
    [t, onCopyHashtags, onDeleteClick, onEditClick]
  );

  const menuData = useMemo(
    () => (listItem: HashtagListItem) =>
      [
        {
          icon: "/edit-1.svg",
          value: t(LanguageKey.edit),
          onClick: () => handleMenuClick(t(LanguageKey.edit), listItem),
        },
        {
          icon: "/copy.svg",
          value: t(LanguageKey.copylist),
          onClick: () => handleMenuClick(t(LanguageKey.copylist), listItem),
        },
        {
          icon: "/delete.svg",
          value: t(LanguageKey.delete),
          onClick: () => handleMenuClick(t(LanguageKey.delete), listItem),
        },
      ],
    [t, handleMenuClick]
  );

  const cardHeightStyle = useMemo(
    () => ({
      gridRowEnd: isHidden ? "span 10" : "span 82",
    }),
    [isHidden]
  );

  const renderHashtagListItem = useCallback(
    (listItem: HashtagListItem) => (
      <article className="headerandinput" aria-labelledby={`list-${listItem.listId}`}>
        <header className="headerparent">
          <div className="headertext">
            <span id={`list-${listItem.listId}`}>{listItem.listName}</span>
            <span className="counter" aria-label={`${listItem.hashtags.length} از 200 هشتگ`}>
              ({listItem.hashtags.length}/200)
            </span>
          </div>
          <Dotmenu data={menuData(listItem)} />
        </header>
        <section className={styles.myhashtagList} aria-label="لیست هشتگ‌ها">
          {listItem.hashtags.map((tag: string) => (
            <div
              key={tag}
              className={`${styles.tagHashtag} ${RTL_PATTERN.test(tag) ? styles.rtlTag : ""}`}
              role="listitem">
              <img
                className={styles.hashtagicon}
                alt=""
                src="/icon-hashtag.svg"
                aria-hidden="true"
                loading="lazy"
                width="16"
                height="16"
              />
              {tag}
            </div>
          ))}
        </section>
      </article>
    ),
    [menuData]
  );

  const handleNewListClick = useCallback(
    (e: MouseEvent) => {
      if (!isLoggedIn) return;
      displayNewList(e);
    },
    [isLoggedIn, displayNewList]
  );

  const handleNewListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === "Enter" || e.key === " ") && isLoggedIn) {
        e.preventDefault();
        displayNewList(e as unknown as MouseEvent);
      }
    },
    [isLoggedIn, displayNewList]
  );

  if (loadingStatus) {
    return (
      <section className="tooBigCard" style={cardHeightStyle} aria-busy="true" aria-label="در حال بارگذاری">
        <Loading />
      </section>
    );
  }

  return (
    <section className="tooBigCard" style={cardHeightStyle} aria-labelledby={headerId}>
      <button
        ref={headerRef}
        type="button"
        className="headerChild"
        onClick={handleCircleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={!isHidden}
        aria-controls={contentId}
        id={headerId}>
        <span className="circle" aria-hidden="true"></span>
        <h2 className="Title">{t(LanguageKey.pageTools_MyList)}</h2>
      </button>
      <div
        id={contentId}
        className={`${styles.all} ${!isHidden ? styles.show : ""}`}
        role="region"
        aria-labelledby={headerId}
        aria-hidden={isHidden}>
        {props.data && (
          <>
            <div
              ref={addNewRef}
              onClick={handleNewListClick}
              onKeyDown={handleNewListKeyDown}
              className={styles.addnewlink}
              aria-label="ایجاد لیست جدید هشتگ"
              role="button"
              tabIndex={0}>
              <div className={styles.addnewicon} aria-hidden="true">
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <path
                    opacity=".4"
                    d="M5 23.21v-9l.17-5.59A7.3 7.3 0 0 1 6.6 4.71q.48-.6 1.09-1.1a7 7 0 0 1 3.88-1.44C13.04 2 15.13 2 17.4 2c.84 0 1.6 0 2.3.25q.22.07.43.18c.67.32 1.2.86 1.8 1.46l7.1 7.16c.7.7 1.32 1.31 1.65 2.12s.33 1.69.33 2.67v5.18l-.23 6.47c-.23 1.74-.72 3.21-1.88 4.38s-2.62 1.67-4.36 1.9c-1.67.23-3.79.23-6.43.23h-2.33v-4.1h2.6a3.35 3.35 0 1 0 0-6.7h-2.6v-2.6a3.34 3.34 0 1 0-6.68 0v2.6z"
                    fill="var(--color-dark-blue)"
                  />
                  <path
                    d="M19.02 2.2q.24.08.46.18c.72.32 1.28.84 1.92 1.43l7.56 7.02a7 7 0 0 1 1.75 2.08q.22.52.29 1.09h-3.13c-2.16 0-3.19 0-4.56-.17a6 6 0 0 1-3.57-1.43 5.2 5.2 0 0 1-1.56-3.3C18 7.84 18 6.88 18 4.9V2q.53.05 1.02.2M12.5 33a1.3 1.3 0 0 0 1.3-1.3v-3.9h3.9a1.3 1.3 0 0 0 0-2.6h-3.9v-3.9a1.3 1.3 0 0 0-2.6 0v3.9H7.3a1.3 1.3 0 0 0 0 2.6h3.9v3.9a1.3 1.3 0 0 0 1.3 1.3"
                    fill="var(--color-dark-blue)"
                  />
                </svg>
              </div>
              <div className={styles.addnewcontent}>
                <strong className={styles.addnewheader}>{t(LanguageKey.pageTools_CreateNewList)}</strong>
                <div className="explain">{t(LanguageKey.pageTools_CreateNewListexplain)}</div>
              </div>
            </div>

            {props.data.hashtagList && props.data.hashtagList.length > 0 && (
              <Slider itemsPerSlide={2}>
                {props.data.hashtagList.map((listItem) => (
                  <SliderSlide key={listItem.listId}>{renderHashtagListItem(listItem)}</SliderSlide>
                ))}
              </Slider>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default React.memo(Hashtags);
