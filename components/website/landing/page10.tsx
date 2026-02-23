import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import FiveStar from "../../fiveStar";
import { LanguageKey } from "../../../i18n";
import styles from "./page10.module.css";
const reviews = [
  {
    title: "مدیریت شبکه های اجتماعی کامل ترین ابزار",
    description:
      "برنسی یکی‌ از بهترین راهکارهای مدیریت شبکه های اجتماعی در ایران است که هرروز شاهد پیشرفت و بهبودش هستم و لذت استفاده از امکاناتشان در حد ابزارهای جهانی است.",
    name: "علی حاجی‌محمدی",
    role: "بنیانگذار همیار وردپرس و ژاکت",
    rating: 2,
    image: "/no-profile.svg",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    name: "reviewer name 1",
    role: "",
    rating: 5,
    image: "/no-profile.svg",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    name: "reviewer name 1",
    role: "",
    rating: 5,
    image: "/no-profile.svg",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    name: "reviewer name 2",
    role: "",
    rating: 3,
    image: "/no-profile.svg",
  },
  {
    title: "لورم ایپسوم متن ساختگی",
    description: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.",
    name: "reviewer name 3",
    role: "",
    rating: 4,
    image: "/no-profile.svg",
  },
];

const Page10 = () => {
  const { t } = useTranslation();
  const [scrollPos, setScrollPos] = useState({ isAtStart: true, isAtEnd: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const reviewsContainerRef = useRef<HTMLDivElement>(null);
  const scrollByCard = useCallback((direction: 1 | -1) => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    const card = container.firstElementChild as HTMLElement | null;
    if (!card) return;
    const { width } = card.getBoundingClientRect();
    container.scrollBy({ left: direction * width, behavior: "smooth" });
  }, []);
  const isScrolling = useRef(false);
  const handleScroll = useCallback(() => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    if (!isScrolling.current) {
      isScrolling.current = true;
      requestAnimationFrame(() => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const isRTL = document.documentElement.dir === "rtl";
        setScrollPos(
          isRTL
            ? { isAtStart: Math.abs(scrollLeft) >= scrollWidth - clientWidth, isAtEnd: scrollLeft === 0 }
            : { isAtStart: scrollLeft === 0, isAtEnd: scrollLeft + clientWidth >= scrollWidth }
        );
        isScrolling.current = false;
      });
    }
  }, []);
  useEffect(() => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const [wavesInView, setWavesInView] = useState(true);
  const wavesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!wavesRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setWavesInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(wavesRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.page10} ref={containerRef}>
      <div className={styles.titlecenter}> {t(LanguageKey.page10_header)}</div>
      <div className={styles.reviews} ref={reviewsContainerRef}>
        {reviews.map((review, index) => (
          <div key={index} className={styles.reviewbox}>
            <div className={styles.reviewboxtitle}>{review.title}</div>
            <div className={styles.reviewboxexplain}>{review.description}</div>
            <div className={`${styles.reviewboxdetail} translate`}>
              <div className={styles.reviewprofile}>
                <img
                  loading="lazy"
                  decoding="async"
                  className="instagramimage"
                  alt="profile image"
                  src={review.image}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/no-profile.svg";
                  }}
                />
              </div>
              <div className="headerandinput">
                <div className="instagramusername">{review.name}</div>
                {review.role && <div className="explain">{review.role}</div>}
                <FiveStar rating={review.rating} />
              </div>
              <svg className={styles.iconq} xmlns="http://www.w3.org/2000/svg" fill="var(--color-gray10)">
                <path
                  stroke="var(--color-gray60)"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 1q9 0 14 4 6 5 5 17 1 24-6 32-7 7-27 10l-3-3V49l2-3 11-2 3-2 2-2-1-4-4-2q-7 0-11-4-4-3-4-11Q1 9 6 5t14-4Zm50 0q9 0 14 4 6 5 5 17 1 24-6 32-7 7-27 10l-3-3V49l2-3 12-2 2-2 1-2v-4l-4-2q-7 0-11-4-4-3-4-12t5-13 14-4Z"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.navigationreview}>
        <svg
          className={`${styles.backward} ${scrollPos.isAtStart ? styles.fade : ""}`}
          viewBox="0 0 22 22"
          fill="none"
          onClick={() => scrollByCard(-1)}>
          <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".4" />
          <path
            fill="var(--text-h1)"
            d="m12.2 7 .6.2q.3.6 0 1l-2.2 2.2-.1.4.1.4 2.2 2.1q.3.6 0 1-.6.5-1 0l-2.2-2a2 2 0 0 1 0-2.9l2.1-2.2z"
          />
        </svg>
        <svg
          className={`${styles.forward} ${scrollPos.isAtEnd ? styles.fade : ""}`}
          viewBox="0 0 22 22"
          fill="none"
          onClick={() => scrollByCard(1)}>
          <path stroke="var(--text-h2)" d="M11 21a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" opacity=".4" />
          <path
            fill="var(--text-h1)"
            d="M10 14.6q-.4 0-.6-.2a1 1 0 0 1 0-1l2.1-2.2.2-.4-.2-.4-2.1-2.1a1 1 0 0 1 0-1q.5-.5 1 0l2.1 2q.6.8.6 1.5 0 .8-.6 1.5l-2 2.1z"
          />
        </svg>
      </div>
      <div className={styles.waves} ref={wavesRef} style={{ animationPlayState: wavesInView ? "running" : "paused" }}>
        <svg
          className={styles.wavesvg}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 1440 522"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1911 77c-238-56-414-61-532-29-166 44-195 73-336 73-172 0-227-11-386-69C533 4 276 10 22 101"
            stroke="url(#linear)"
          />
          <defs>
            <linearGradient id="linear" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--color-dark-yellow)" />
              <stop offset="33%" stopColor="var(--color-light-red)" />
              <stop offset="66%" stopColor="var(--color-purple)" />
              <stop offset="100%" stopColor="var(--color-dark-blue)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
};
export default Page10;
