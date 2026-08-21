import Link from "next/link";
import { memo, useCallback, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import FiveStar from "brancy/components/fiveStar";
import { calculateSummary } from "brancy/helper/numberFormater";
import { LanguageKey } from "brancy/i18n";
import styles from "./featureBox.module.css";
import { IFeatureBox } from "brancy/models/interfaces";
interface FeatureBoxProps {
  data: IFeatureBox | null;
  handleShowTerms: () => void;
  handleShowHours: () => void;
  handleShowTerif: () => void;
  handleShowLottery: () => void;
}
const ICON_PROPS = {
  loading: "lazy" as const,
  decoding: "async" as const,
  className: styles.tileimage,
};
const FeatureBox = memo<FeatureBoxProps>(
  ({ data, handleShowTerms, handleShowHours, handleShowTerif, handleShowLottery }) => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLElement>(null);
    const dragStateRef = useRef({ startX: 0, startScrollLeft: 0, moved: false });
    const [isDragging, setIsDragging] = useState(false);
    interface TileContent {
      image?: { src: string; alt: string };
      title?: string;
      subtitle?: string | React.ReactNode;
      customContent?: React.ReactNode;
      titleClass?: string;
      subtitleClass?: string;
    }
    interface TileData {
      key: string;
      className: string;
      content: TileContent;
      clickable: boolean;
      href?: string;
      trackingName?: "workHour" | "enamad" | "terms" | "tariff" | "lottery";
    }
    const tileData = useMemo((): TileData[] => {
      if (!data) return [];
      const tiles: TileData[] = [
        {
          key: "follower",
          className: styles.follower,
          content: {
            image: {
              src: "/marketlink/market-follower.webp",
              alt: t(LanguageKey.Followers),
            },
            title: calculateSummary(data.followers),
            subtitle: t(LanguageKey.Followers),
            titleClass: styles.followerTitle,
            subtitleClass: styles.followerSubtitle,
          },
          clickable: false,
        },
      ];
      if (data.rate !== null) {
        tiles.push({
          key: "rate",
          className: styles.rate,
          content: {
            image: { src: "/marketlink/market-rate.webp", alt: "rate" },
            title: data.rate.toString(),
            customContent: <FiveStar rating={data.rate} />,
            titleClass: styles.rateTitle,
            subtitleClass: styles.rateSubtitle,
          },
          clickable: false,
        });
      }
      if (data.enemad?.length > 0) {
        tiles.push({
          key: "verified",
          className: styles.verified,
          content: {
            image: { src: "/marketlink/market-enamad.webp", alt: "اینماد تایید شده" },
            title: "اینماد",
            subtitle: (
              <>
                <img height="14" alt="نشان تایید" src="/badge-verified1.svg" />
                {t(LanguageKey.VERFIED)}
              </>
            ),
            titleClass: styles.verifiedTitle,
            subtitleClass: styles.verifiedSubtitle,
          },
          clickable: false,
        });
      }
      if (data.teriif) {
        tiles.push({
          key: "tariff",
          className: styles.teriif,
          content: {
            image: { src: "/marketlink/icon-price.webp", alt: "tariffs and prices" },
            title: "",
            subtitle: t(LanguageKey.pricing),
            titleClass: styles.tariffTitle,
            subtitleClass: styles.tariffSubtitle,
          },
          clickable: true,
          trackingName: "tariff",
        });
      }
      if (data.adsView !== null) {
        tiles.push({
          key: "ads",
          className: styles.success,
          content: {
            image: { src: "/marketlink/icon-ads.webp", alt: "advertising statistics" },
            title: "----",
            subtitle: t(LanguageKey.advertisestatistics_advertiser),
            titleClass: styles.adsTitle,
            subtitleClass: styles.adsSubtitle,
          },
          clickable: false,
        });
      }
      if (data.salesSuccess !== null) {
        tiles.push({
          key: "successful",
          className: styles.success,
          content: {
            image: { src: "/marketlink/market-success.webp", alt: "successful sales" },
            title: data.salesSuccess.toString(),
            subtitle: t(LanguageKey.page9_ticket_management),
            titleClass: styles.successTitle,
            subtitleClass: styles.successSubtitle,
          },
          clickable: false,
        });
      }
      if (data.isShopper) {
        tiles.push({
          key: "startAds",
          className: styles.start,
          content: {
            image: { src: "/marketlink/market-startorder.webp", alt: "start advertising" },
            customContent: (
              <div className={styles.btn} role="button">
                {t(LanguageKey.StartOrder)}
              </div>
            ),
            titleClass: styles.startTitle,
            subtitleClass: styles.startSubtitle,
          },
          clickable: true,
        });
      }
      if (data.isInfluencer) {
        tiles.push({
          key: "startShop",
          className: styles.start,
          content: {
            image: { src: "/marketlink/market-startorder.webp", alt: "start shopping" },
            customContent: (
              <div className={styles.btn} role="button">
                {t(LanguageKey.Startshoping)}
              </div>
            ),
            titleClass: styles.startTitle,
            subtitleClass: styles.startSubtitle,
          },
          clickable: true,
        });
      }
      tiles.push({
        key: "workHours",
        className: styles.workHours,
        content: {
          image: { src: "/marketlink/icon-work.webp", alt: "active business hours" },
          title: "",
          subtitle: t(LanguageKey.advertiseProperties_businesshours),
          titleClass: styles.workHoursTitle,
          subtitleClass: styles.workHoursSubtitle,
        },
        clickable: true,
        trackingName: "workHour",
      });
      tiles.push({
        key: "terms",
        className: styles.terms,
        content: {
          image: { src: "/marketlink/icon-terms.webp", alt: "terms and conditions" },
          title: "",
          subtitle: t(LanguageKey.footer_TermsAndConditions),
          titleClass: styles.termsTitle,
          subtitleClass: styles.termsSubtitle,
        },
        clickable: true,
        trackingName: "terms",
      });
      tiles.push({
        key: "lottery",
        className: styles.lottery,
        content: {
          image: { src: "/icon-lottery.svg", alt: t(LanguageKey.Lottery) },
          title: "",
          subtitle: t(LanguageKey.Lottery),
          titleClass: styles.lotteryTitle,
          subtitleClass: styles.lotterySubtitle,
        },
        clickable: true,
        trackingName: "lottery",
      });
      return tiles;
    }, [data, t]);
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        const focusableTiles = Array.from(containerRef.current?.querySelectorAll<HTMLElement>("button, a[href]") ?? []);
        const currentIndex = Math.max(0, focusableTiles.indexOf(document.activeElement as HTMLElement));
        switch (event.key) {
          case "ArrowLeft":
          case "ArrowRight": {
            if (!focusableTiles.length) return;
            event.preventDefault();
            const newIndex =
              event.key === "ArrowLeft"
                ? Math.max(0, currentIndex - 1)
                : Math.min(focusableTiles.length - 1, currentIndex + 1);

            focusableTiles[newIndex]?.focus();
            break;
          }
          case "Escape": {
            event.preventDefault();
            containerRef.current?.blur();
            break;
          }
        }
      },
      [tileData],
    );
    const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if ((event.target as HTMLElement).closest("button, a")) return;

      const container = containerRef.current;
      if (!container) return;

      dragStateRef.current = {
        startX: event.clientX,
        startScrollLeft: container.scrollLeft,
        moved: false,
      };
      container.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }, []);
    const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
      const container = containerRef.current;
      if (!container || !container.hasPointerCapture(event.pointerId)) return;

      const distance = event.clientX - dragStateRef.current.startX;
      if (Math.abs(distance) > 5) {
        dragStateRef.current.moved = true;
      }
      container.scrollLeft = dragStateRef.current.startScrollLeft - distance;
    }, []);
    const handlePointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
      const container = containerRef.current;
      if (container?.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      setIsDragging(false);
    }, []);
    const handleClickCapture = useCallback((event: React.MouseEvent<HTMLElement>) => {
      if (!dragStateRef.current.moved) return;

      event.preventDefault();
      event.stopPropagation();
      dragStateRef.current.moved = false;
    }, []);
    const handleModalTileClick = useCallback(
      (trackingName: "workHour" | "terms" | "tariff" | "lottery" | "enamad") => {
        switch (trackingName) {
          case "workHour":
            handleShowHours();
            break;
          case "terms":
            handleShowTerms();
            break;
          case "tariff":
            handleShowTerif();
            break;
          case "lottery":
            handleShowLottery();
            break;
          case "enamad":
            break;
        }
      },
      [handleShowHours, handleShowLottery, handleShowTerms, handleShowTerif],
    );
    if (!data) return null;
    return (
      <>
        <section
          id="featureBox"
          className={`${styles.all} ${isDragging ? styles.dragging : ""}`}
          ref={containerRef}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          onClickCapture={handleClickCapture}
          role="region"
          aria-label="features and capabilities"
          tabIndex={0}>
          {tileData.map((tile) => {
            const TileContent = () => (
              <>
                <div className={styles.fade} />
                <img {...ICON_PROPS} alt={tile.content.image?.alt || ""} src={tile.content.image?.src || ""} />
                <div className={styles.tiledescription}>
                  {tile.content.title && <span className={tile.content.titleClass}>{tile.content.title}</span>}
                  {tile.content.subtitle && <span className={tile.content.subtitleClass}>{tile.content.subtitle}</span>}
                  {tile.content.customContent}
                </div>
              </>
            );

            // برای تایل‌های modal (workHour, terms, tariff)
            if (tile.clickable && tile.trackingName) {
              return (
                <button
                  key={tile.key}
                  className={`${styles.tile} ${tile.className}`}
                  onClick={() => handleModalTileClick(tile.trackingName!)}
                  role="button"
                  tabIndex={0}
                  style={{ border: "none", background: "none" }}
                  aria-label={`${tile.content.image?.alt} - click`}>
                  <TileContent />
                </button>
              );
            }

            // برای تایل‌های دارای href (لینک‌های معمولی)
            if (tile.href) {
              return (
                <Link
                  key={tile.key}
                  href={tile.href}
                  className={`${styles.tile} ${tile.className}`}
                  // onClick={() => handleTileClick(tile.trackingName)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${tile.content.image?.alt} - click`}>
                  <TileContent />
                </Link>
              );
            }

            // برای تایل‌های غیرقابل کلیک
            return (
              <article
                key={tile.key}
                className={`${styles.tile} ${tile.className}`}
                role={tile.clickable ? "button" : "article"}
                tabIndex={tile.clickable ? 0 : -1}
                aria-label={tile.content.image?.alt}
                // onClick={
                //   tile.clickable
                //     ? () => handleTileClick(tile.trackingName)
                //     : undefined
                // }
              >
                <TileContent />
              </article>
            );
          })}
        </section>
      </>
    );
  },
);
FeatureBox.displayName = "FeatureBox";
export default FeatureBox;
