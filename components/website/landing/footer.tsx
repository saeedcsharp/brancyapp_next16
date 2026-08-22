import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./footer.module.css";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [isIR, serIsIr] = useState(false);
  const [enemadImageSrc, setEnemadImageSrc] = useState(
    "https://trustseal.enamad.ir/logo.aspx?id=745725&Code=4jzLwvZYKySIQKV7TZv1oleWBHSAyBzv",
  );
  const sections = useMemo(
    () => [
      {
        title: t(LanguageKey.footer_Brancy),
        links: [
          {
            text: t(LanguageKey.footer_AboutUs),
            href: "/Accessibility/About-Us",
          },
          {
            text: t(LanguageKey.footer_ContactUs),
            href: "/Accessibility/Contact-Us",
          },
          {
            text: t(LanguageKey.footer_JoinUs),
            href: "/Accessibility/join-Us",
          },
          // {
          //   text: t(LanguageKey.footer_OrgChart),
          //   href: "Accessibility/OrgChart",
          // },
        ],
      },
      {
        title: t(LanguageKey.footer_Solutions),
        links: [
          { text: t(LanguageKey.footer_HelpCenter), href: "/Accessibility/Help-Center" },
          { text: t(LanguageKey.footer_Support), href: "/Accessibility/Support" },
          { text: t(LanguageKey.footer_FAQ), href: "/Accessibility/FAQ" },
          { text: t(LanguageKey.footer_ReportAnIssue), href: "/Accessibility/Report-an-Issue" },
        ],
      },
      {
        title: t(LanguageKey.footer_TrustLegal),
        links: [
          { text: t(LanguageKey.footer_TermsAndConditions), href: "/Accessibility/Terms-and-conditions" },
          { text: t(LanguageKey.footer_PrivacyNotice), href: "/Accessibility/privacy-policy" },
          { text: t(LanguageKey.footer_CookieNotice), href: "/Accessibility/Cookie-Notice" },
        ],
      },
      {
        title: t(LanguageKey.footer_Blog),
        links: [
          { text: t(LanguageKey.footer_ProductUpdates), href: "/Accessibility/Product-Updates" },
          { text: t(LanguageKey.footer_Articles), href: "/Accessibility/Articles" },
          { text: t(LanguageKey.footer_LatestNews), href: "/Accessibility/Latest-news" },
          { text: t(LanguageKey.footer_FollowUs), href: "/Accessibility/Follow-Us" },
        ],
      },
    ],
    [t],
  );
  useEffect(() => {
    if (typeof window === "undefined") return; // برای SSR ایمن
    const host = window.location.hostname;
    serIsIr(host.includes("brancy.ir") || host === "localhost" || host === "127.0.0.1");
  }, []);
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {isIR && (
          <>
            <div className={styles.footersectiontable}>
              <div className={styles.footerbody}>
                <address>
                  آدرس: اصفهان - خیابان هاتف - کوچه یخچال - ساختمان برنسی
                  <br />
                  تلفن: <a href="tel:+989138664066">09138664066</a>
                </address>
                <br />
                <a
                  href="https://trustseal.enamad.ir/?id=745725&Code=4jzLwvZYKySIQKV7TZv1oleWBHSAyBzv"
                  target="_blank"
                  referrerPolicy="origin"
                  aria-label="eNamad Trust Badge">
                  <img
                    referrerPolicy="origin"
                    src={enemadImageSrc}
                    onError={() => {
                      if (enemadImageSrc !== "/landing/icon-verified.png") {
                        setEnemadImageSrc("/landing/icon-verified.png");
                      }
                    }}
                    alt="نماد اعتماد الکترونیکی"
                    style={{
                      cursor: "pointer",
                      width: "50px",
                      height: "50px",
                    }}
                    data-code="4jzLwvZYKySIQKV7TZv1oleWBHSAyBzv'"></img>
                </a>
              </div>
            </div>
          </>
        )}
        {sections.map((section, idx) => (
          <div key={idx} className={styles.footersectiontable}>
            {section.title}
            <div className={styles.footerbody}>
              {section.links.map((link, jdx) => (
                <Link key={jdx} className={styles.link} href={link.href}>
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
};

export default React.memo(Footer);
