import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./page3.module.css";

type TabData = {
  title: string;
  explain: string;
  link: string;
};

type State = {
  activeTab: number;
  activeCardIndex: number;
  animationKey: number;
  textArray: string[];
};

type Action =
  | { type: "SET_ACTIVE_TAB"; payload: number }
  | { type: "SET_ACTIVE_CARD"; payload: number }
  | { type: "INCREMENT_ANIMATION_KEY" }
  | { type: "SET_TEXT_ARRAY"; payload: string[] };

const initialState: State = {
  activeTab: 0,
  activeCardIndex: 0,
  animationKey: 0,
  textArray: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_ACTIVE_CARD":
      return { ...state, activeCardIndex: action.payload };
    case "INCREMENT_ANIMATION_KEY":
      return { ...state, animationKey: state.animationKey + 1 };
    case "SET_TEXT_ARRAY":
      return { ...state, textArray: action.payload };
    default:
      return state;
  }
};

const tabData: TabData[] = [
  {
    title: "more than one link",
    explain:
      "اگر می‌خواهید خواننده متن فارسی‌تان را کنار نگذارد و آن را تا انتها بخواهند، از ویرایش و بازخوانی متن غافل نشوید. سرویس ویرایش و بازخوانی متون فارسی شبکه مترجمین ایران این‌جا است تا متون فارسی‌تان را خوانش‌پذیر کند.",
    link: "https://www.google.com",
  },
  {
    title: "all market in your desk",
    explain:
      "Every step you take, no matter how small, is a stride toward your dreams. Keep moving forward with unwavering determination, for even the smallest progress is a victory on the path to greatness",
    link: "https://www.gcfgfdhgoogle.com",
  },
  {
    title: "advertise like a pro",
    explain:
      "Every step you take, no matter how small, is a stride toward your dreams. Keep moving forward with unwavering determination, for even the smallest progress is a victory on the path to greatness",
    link: "https://www.gdfgfgjhoogle.com",
  },
  {
    title: "Stores for more sales",
    explain:
      "Every step you take, no matter how small, is a stride toward your dreams. Keep moving forward with unwavering determination, for even the smallest progress is a victory on the path to greatness",
    link: "https://www.googledfhghjk.com",
  },
];

const cardImages = [
  [
    [
      "brancy/components/website/landing/qwer.png",
      "brancy/components/website/landing/tyui.png",
      "brancy/components/website/landing/asdf.png",
      "brancy/components/website/landing/ghjk.png",
    ],
    [
      "brancy/components/website/landing/ewrt.png",
      "brancy/components/website/landing/yuio.png",
      "brancy/components/website/landing/sdfg.png",
      "brancy/components/website/landing/hjkl.png",
    ],
    [
      "brancy/components/website/landing/erty.png",
      "brancy/components/website/landing/uiop.png",
      "brancy/components/website/landing/dfgh.png",
      "brancy/components/website/landing/jkl;.png",
    ],
    [
      "brancy/components/website/landing/rtyu.png",
      "brancy/components/website/landing/iop[].png",
      "brancy/components/website/landing/fghj.png",
      "brancy/components/website/landing/kldf.png",
    ],
  ],
  [
    [
      "brancy/components/website/landing/q.png",
      "brancy/components/website/landing/w.png",
      "brancy/components/website/landing/e.png",
      "brancy/components/website/landing/r.png",
    ],
    [
      "brancy/components/website/landing/t.png",
      "brancy/components/website/landing/y.png",
      "brancy/components/website/landing/u.png",
      "brancy/components/website/landing/i.png",
    ],
    [
      "brancy/components/website/landing/o.png",
      "brancy/components/website/landing/p.png",
      "brancy/components/website/landing/a.png",
      "brancy/components/website/landing/s.png",
    ],
    [
      "brancy/components/website/landing/d.png",
      "brancy/components/website/landing/f.png",
      "brancy/components/website/landing/g.png",
      "brancy/components/website/landing/h.png",
    ],
  ],
  [
    [
      "brancy/components/website/landing/j.png",
      "brancy/components/website/landing/k.png",
      "brancy/components/website/landing/l.png",
      "brancy/components/website/landing/z.png",
    ],
    [
      "brancy/components/website/landing/x.png",
      "brancy/components/website/landing/c.png",
      "brancy/components/website/landing/v.png",
      "brancy/components/website/landing/b.png",
    ],
    [
      "brancy/components/website/landing/n.png",
      "brancy/components/website/landing/m",
      "brancy/components/website/landing/qw.png",
      "brancy/components/website/landing/er.png",
    ],
    [
      "brancy/components/website/landing/ty.png",
      "brancy/components/website/landing/ui.png",
      "brancy/components/website/landing/op.png",
      "brancy/components/website/landing/as.png",
    ],
  ],
  [
    [
      "brancy/components/website/landing/df.png",
      "brancy/components/website/landing/gh.png",
      "brancy/components/website/landing/jk.png",
      "brancy/components/website/landing/zx.png",
    ],
    [
      "brancy/components/website/landing/cv.png",
      "brancy/components/website/landing/bn.png",
      "brancy/components/website/landing/qaz.png",
      "brancy/components/website/landing/wsx.png",
    ],
    [
      "brancy/components/website/landing/edc.png",
      "brancy/components/website/landing/rfv.png",
      "brancy/components/website/landing/tgb.png",
      "brancy/components/website/landing/yhn.png",
    ],
    [
      "brancy/components/website/landing/ujm.png",
      "brancy/components/website/landing/ikl.png",
      "brancy/components/website/landing/qa.png",
      "brancy/components/website/landing/ws.png",
    ],
  ],
];

const Page2 = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleTabChange = useCallback((index: number) => {
    dispatch({ type: "SET_ACTIVE_TAB", payload: index });
    dispatch({ type: "INCREMENT_ANIMATION_KEY" });
  }, []);

  const handleCardChange = useCallback((index: number) => {
    dispatch({ type: "SET_ACTIVE_CARD", payload: index });
  }, []);

  const currentTabData = useMemo(() => tabData[state.activeTab], [state.activeTab]);
  const currentCardImages = useMemo(() => cardImages[state.activeTab], [state.activeTab]);

  useEffect(() => {
    const text = currentTabData.explain;
    const words = text.split(/(\s+)/).filter((word) => word.length > 0);
    dispatch({ type: "SET_TEXT_ARRAY", payload: words });
  }, [currentTabData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch({ type: "SET_ACTIVE_CARD", payload: (state.activeCardIndex + 1) % 4 });
    }, 10000);
    return () => clearInterval(intervalId);
  }, [state.activeCardIndex]);

  const renderTitle = useMemo(() => {
    const text = t(LanguageKey.page3_text1);
    const words = text.split(" ");
    if (words.length < 2) return text;

    return (
      <>
        {words[0] + " "}
        <span>{words[1]}</span>
        {words.length > 2 ? " " + words.slice(2).join(" ") : ""}
      </>
    );
  }, [t]);

  return (
    <section className={styles.page3}>
      <>
        <div className={styles.header}>
          <div className={styles.goli} />
          <div className={styles.title}>{renderTitle}</div>
        </div>
        <div className={`${styles.page3leftswith} translate`}>
          <div className={`${styles[`activeTab${state.activeTab + 1}`]}`} />
          {tabData.map((_, index) => (
            <div
              key={index}
              className={styles.page3leftswithitem}
              onClick={() => handleTabChange(index)}
              style={{ color: state.activeTab === index ? "var(--color-dark-blue)" : "" }}>
              {["وبسایت", "درگاه پرداخت", "بایو لینک", "ساب ادمین"][index]}
            </div>
          ))}
        </div>
        <div className={styles.content}>
          <div className={styles.page3left}>
            <div key={`title-${state.animationKey}`} className={styles.page3title}>
              {currentTabData.title}
            </div>
            <div key={`explain-${state.animationKey}`} className={styles.page3explain}>
              {state.textArray.map((word, index) => (
                <span
                  key={index}
                  className={`${styles.letter} ${word.trim() === "" ? styles.space : ""}`}
                  style={{ animationDelay: `${index * 50}ms` }}>
                  {word}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.page3right}>
            <div className={styles.cardsWrapper}>
              {currentCardImages.map((images, cardIndex) => (
                <div
                  key={cardIndex}
                  data-card={cardIndex}
                  className={`${styles.cardsWrapperchild} ${
                    state.activeCardIndex === cardIndex ? styles.active : styles.inactive
                  }`}
                  onClick={() => handleCardChange(cardIndex)}
                  style={
                    {
                      "--index": state.activeCardIndex === cardIndex ? 0 : (cardIndex - state.activeCardIndex + 4) % 4,
                    } as React.CSSProperties
                  }>
                  <div className={styles.cardsWrappercontent}>
                    {images.map((src, imgIndex) => (
                      <img
                        loading="lazy"
                        decoding="async"
                        key={imgIndex}
                        className={styles[`cardsWrapperimage${imgIndex + 1}`]}
                        src={src}
                        alt=""
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    </section>
  );
};

export default Page2;
