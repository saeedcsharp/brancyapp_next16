import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import { IContactAndMap } from "brancy/models/market/myLink";
import styles from "brancy/components/market/myLink/contactAndMap.module.css";

const MapWrapper = memo(({ mapProps }: { mapProps: any }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Delay rendering to avoid double mounting issues in Next.js 15
    timerRef.current = setTimeout(() => {
      setShouldRender(true);
    }, 100);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const loadingContent = useMemo(
    () => (
      <div
        style={{
          width: "100%",
          height: "450px",
          backgroundColor: "var(--color-gray10)",
          borderRadius: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-h1)",
        }}>
        <div className={styles.loader}>
          <svg className={styles.svg} viewBox="25 25 50 50">
            <circle r="20" cy="50" cx="50"></circle>
          </svg>
        </div>
      </div>
    ),
    []
  );

  if (!shouldRender) {
    return loadingContent;
  }

  return <OpenStreetMapComponent {...mapProps} />;
});
const OpenStreetMapComponent = dynamic(() => import("brancy/components/mainLeaftlet"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "450px",
        backgroundColor: "var(--color-gray10)",
        borderRadius: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-h1)",
      }}>
      <div className={styles.loader}>
        <svg className={styles.svg} viewBox="25 25 50 50">
          <circle r="20" cy="50" cx="50"></circle>
        </svg>
      </div>
    </div>
  ),
});
const ContactAndMap = memo(({ data }: { data: IContactAndMap | null }) => {
  const { t, i18n } = useTranslation();
  const [isContentVisible, setIsContentVisible] = useState(true);
  const contentRef = useRef<HTMLElement>(null);
  const sectionId = useId();
  const buttonId = useId();

  const toggleContentVisibility = useCallback(() => {
    setIsContentVisible((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleContentVisibility();
      }
    },
    [toggleContentVisibility]
  );

  useEffect(() => {
    if (isContentVisible && contentRef.current) {
      const firstLink = contentRef.current.querySelector("a");
      if (firstLink) {
        firstLink.focus();
      }
    }
  }, [isContentVisible]);
  const contactText = useMemo(() => {
    const fullText = t(LanguageKey.footer_ContactUs);
    const words = fullText.split(" ");
    return {
      firstWord: words[0] || "",
      restWords: words.slice(1).join(" "),
    };
  }, [t, i18n.language]);
  const contactInfo = useMemo(() => {
    if (!data?.contact) return null;
    const { phoneNumber, email, address, lat, lng } = data.contact;
    const emptyText = t(LanguageKey.pageStatistics_EmptyList);
    return {
      phoneNumber: phoneNumber?.trim() || emptyText,
      email: email?.trim() || emptyText,
      address: address?.trim() || emptyText,
      hasValidLocation: !!(lat && lng && Number(lat) !== 0 && Number(lng) !== 0),
      location: { lat: Number(lat) || 0, lng: Number(lng) || 0 },
      emptyText,
    };
  }, [data?.contact, t]);

  const contactItems = useMemo(() => {
    if (!contactInfo) return [];
    return [
      {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 32 32"
            className={styles.contacticon}
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M16.67 9.25c-5.93 0-3.18 4.53-6.95 4.53-3.64 0-5.05.68-5.05-3.93.06-.52-.9-5.15 12-5.15s11.94 4.62 12 5.14c0 4.63-1.41 3.93-5.05 3.93-3.78 0-1.02-4.52-6.95-4.52M26.69 17v4.7c0 3.28-2.05 5.6-5.33 5.6h-9.4c-3.28 0-5.32-2.32-5.32-5.6v-4.68" />
            <path d="M19.6 19.23a2.92 2.92 0 1 0-5.86 0 2.92 2.92 0 0 0 5.85 0" />
          </svg>
        ),
        alt: "icon phone",
        value: contactInfo.phoneNumber,
        href: contactInfo.phoneNumber !== contactInfo.emptyText ? `tel:${contactInfo.phoneNumber}` : null,
        ariaLabel: contactInfo.phoneNumber !== contactInfo.emptyText ? `tel: ${contactInfo.phoneNumber}` : null,
        dir: "ltr",
      },
      {
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 32 32"
            className={styles.contacticon}
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M28.67 14.73v-3.44c0-3.69-2.46-6.69-6.11-6.69H10.78c-3.65 0-6.11 3-6.11 6.69v8.24c0 3.68 2.46 6.68 6.1 6.67h4.59m8.39-14.58-5.33 4.34c-1 .8-2.43.8-3.44 0l-5.37-4.34m12.03 15.95L22.6 20m2.82 7.57.96-7.57M28 21.92h-7.67m7.34 3.73H20" />
          </svg>
        ),
        alt: "email icon",
        value: contactInfo.email,
        href: contactInfo.email !== contactInfo.emptyText ? `mailto:${contactInfo.email}` : null,
        ariaLabel: contactInfo.email !== contactInfo.emptyText ? `email to ${contactInfo.email}` : null,
        dir: "ltr",
      },
    ];
  }, [contactInfo]);

  const mapProps = useMemo(() => {
    if (!contactInfo?.hasValidLocation || !data?.contact?.showMap) return null;
    return {
      handleSelectPosition: () => {},
      location: contactInfo.location,
      draggable: false,
      scrollWheelZoom: false,
    };
  }, [contactInfo?.hasValidLocation, contactInfo?.location, data?.contact?.showMap]);
  if (!data) return null;
  return (
    <div key="contactAndMap" id="contact" className={styles.all}>
      <div className={styles.header}>
        <button
          id={buttonId}
          className={styles.header}
          onClick={toggleContentVisibility}
          onKeyDown={handleKeyDown}
          aria-expanded={isContentVisible}
          aria-controls={sectionId}
          aria-labelledby={`${buttonId}-title`}
          type="button">
          <img
            className={styles.headerimg}
            title="contact and map information"
            src="/marketlink/market-contact.webp"
            alt="contact and map section toggle"
            loading="lazy"
            width={150}
            height={150}
          />
          <h2 id={`${buttonId}-title`} className={styles.headertext}>
            <span className={styles.headertextblue}>{contactText.firstWord}</span>
            {contactText.restWords}
          </h2>
        </button>
      </div>
      <section
        ref={contentRef}
        id={sectionId}
        className={`${styles.content} ${isContentVisible ? styles.contentShow : ""}`}
        aria-hidden={!isContentVisible}>
        {contactInfo ? (
          <>
            <div className={styles.contactlist} role="list">
              <div className={styles.contactboxtop}>
                {contactItems.map((item, index) => (
                  <div key={index} className={styles.contactbox} role="listitem">
                    <div className={styles.contacticon}>{item.icon}</div>
                    <div className={styles.contactdetail}>
                      {item.href ? (
                        <a href={item.href} aria-label={item.ariaLabel || undefined} dir={item.dir}>
                          {item.value}
                        </a>
                      ) : (
                        <span>{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.contactbox} role="listitem">
                <svg className={styles.contacticon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32">
                  <path
                    d="M19.65 14.41a3.31 3.31 0 1 0-6.63 0 3.31 3.31 0 0 0 6.63 0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M16.33 28.33s-9.7-6.32-9.94-14.2c-.17-5.54 4.45-10.47 9.94-10.47s10.12 4.93 9.95 10.47c-.25 8.04-9.95 14.2-9.95 14.2z" />
                </svg>

                <div className={styles.contactdetail}>
                  {contactInfo.address !== contactInfo.emptyText ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        contactInfo.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${contactInfo.address} in Google Maps`}>
                      {contactInfo.address}
                    </a>
                  ) : (
                    <span>{contactInfo.address}</span>
                  )}
                </div>
              </div>
            </div>
            {mapProps && (
              <div className={styles.map} role="region" aria-label={`loacation: ${contactInfo.address}`}>
                <MapWrapper mapProps={mapProps} />
              </div>
            )}
          </>
        ) : (
          <div className={styles.contactlist}>
            <p>{t(LanguageKey.pageStatistics_EmptyList)}</p>
          </div>
        )}
      </section>
    </div>
  );
});
ContactAndMap.displayName = "ContactAndMap";
export default ContactAndMap;
