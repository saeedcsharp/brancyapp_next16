import Head from "next/head";
import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../i18n";
import styles from "./signInPage1.module.css";
const LandingSignIn = lazy(() => import("./landingSignIn"));
const SignInPage1 = (props: { handleShowVerification: (preUserToken: string) => void }) => {
  const { t, i18n } = useTranslation();
  const signInParentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [, startTransition] = useTransition();
  const rotatingTexts = useMemo(
    () => [
      t(LanguageKey.page1_services),
      t(LanguageKey.page1_analytics),
      t(LanguageKey.page1_transportation),
      t(LanguageKey.page1_financial_solutions),
      t(LanguageKey.page1_customer_communication),
      t(LanguageKey.page1_content_management),
      t(LanguageKey.page1_artificial_intelligence),
      t(LanguageKey.page1_tools),
      t(LanguageKey.page1_advertises),
    ],
    [i18n.language]
  );
  const deferredText = useDeferredValue(rotatingTexts[currentIndex]);
  const rotatingContainerStyle = useMemo<React.CSSProperties>(
    () => ({
      display: "flex",
      height: "75px",
      position: "relative",
      overflow: "hidden",
    }),
    []
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [rotatingTexts.length]);
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        startTransition(() => {
          setIsVisible(entry.isIntersecting);
        });
      });
    },
    [startTransition]
  );
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: "100px",
    });
    observer.observe(sectionRef.current);
    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);
  const ImageElements = useMemo(() => {
    const svgLines = [1, 2, 3, 4, 5].map((num) => (
      <img key={`svgline${num}`} className={styles[`svgline${num}`]} src={`/landing/hiro_svgline${num}.svg`} />
    ));
    return { svgLines };
  }, []);
  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/landing/hiroimg1.png" />
      </Head>
      <section ref={sectionRef} className={styles.page1}>
        <div className={styles.hiroesignin}>
          <div className={styles.hirotitleall}>
            {t(LanguageKey.page1_text1)}
            <div className={styles.test}>
              <span> {t(LanguageKey.page1_text2)}</span>
              <div style={rotatingContainerStyle}>
                <span className={styles.text1}>{deferredText}</span>
              </div>
            </div>
          </div>
          <div className={styles.quicksigninparent}>
            <div className={styles.quicksignin}>
              <div className={styles.quicksignintext}>{t(LanguageKey.page1_StartNow)}</div>
              <Suspense fallback={<div>Loading...</div>}>
                <LandingSignIn handleShowVerification={props.handleShowVerification} />
              </Suspense>
            </div>
            <div className={styles.rainbowbackground}></div>
            <div className={styles.quicksigninfade}></div>
          </div>
        </div>
        <div className={styles.hiroelements}>
          <div className={styles.hirosvg}>{ImageElements.svgLines}</div>
          <div className={styles.hiroimg}>
            <div className={styles.element1}>
              <div className={styles.svgicon5}>
                {[1, 2, 3, 1, 2, 3].map((num, index) => (
                  <img
                    key={`svgicon1_${index}`}
                    className={styles.svgiconchild}
                    src={`/landing/svgicon_1_${num}.svg`}
                    alt="icon"
                    // unoptimized
                    width={30}
                    height={30}
                  />
                ))}
              </div>
              <img className={styles.svgimg1} src="/landing/hiroimg1.png" />
            </div>
            <div className={styles.element2}>
              <div className={styles.svgicon4}>
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <img
                      key={i}
                      className={styles.svgiconchild}
                      src="/landing/svgicon_2_1.svg"
                      alt="icon"
                      // unoptimized
                      width={30}
                      height={30}
                    />
                  ))}
              </div>
              <img className={styles.svgimg2} src="/landing/hiroimg2.png" />
            </div>
            <div className={styles.element3}>
              <div className={styles.svgicon2}>
                {Array(2)
                  .fill([1, 2, 3])
                  .flat()
                  .map((num, index) => (
                    <img
                      key={`svgicon3_${index}`}
                      className={styles.svgiconchild}
                      src={`/landing/svgicon_3_${num}.svg`}
                      alt="icon"
                      // unoptimized
                      width={30}
                      height={30}
                    />
                  ))}
              </div>
              <img className={styles.svgimg3} src="/landing/hiroimg3.png" />
            </div>
            <div className={styles.element4}>
              <div className={styles.svgicon3}>
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <img
                      key={i}
                      className={styles.svgiconchild}
                      src="/landing/svgicon_4_1.svg"
                      alt="icon"
                      // unoptimized
                      width={30}
                      height={30}
                    />
                  ))}
              </div>
              <img className={styles.svgimg4} src="/landing/hiroimg4.png" />
            </div>
            <div className={styles.element5}>
              <div className={styles.svgicon1}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <img
                    key={`svgicon5_${num}`}
                    className={styles.svgiconchild}
                    src={`/landing/svgicon_5_${num}.svg`}
                    alt="icon"
                    // unoptimized
                    width={30}
                    height={30}
                  />
                ))}
              </div>
              <img className={styles.svgimg5} src="/landing/hiroimg5.png" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default SignInPage1;
