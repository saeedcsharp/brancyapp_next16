import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "brancy/i18n";
import styles from "./page5.module.css";

const Page5: React.FC = () => {
  const { t } = useTranslation();
  const lines = [
    { x: 60, start: 0, speed: 30, opacity: 0.68 },
    { x: 100, start: 1, speed: 36, opacity: 0.5 },
    { x: 160, start: 2, speed: 34, opacity: 0.36 },
    { x: 220, start: 3, speed: 38, opacity: 0.52 },
    { x: 280, start: 4, speed: 32, opacity: 0.68 },
    { x: 340, start: 2, speed: 35, opacity: 0.5 },
    { x: 400, start: 4, speed: 31, opacity: 0.65 },
    { x: 460, start: 1, speed: 37, opacity: 0.52 },
    { x: 520, start: 3, speed: 39, opacity: 0.68 },
    { x: 580, start: 0, speed: 33, opacity: 0.5 },
    { x: 720, start: 4, speed: 30, opacity: 0.36 },
    { x: 780, start: 2, speed: 36, opacity: 0.5 },
    { x: 840, start: 0, speed: 38, opacity: 0.67 },
    { x: 900, start: 3, speed: 32, opacity: 0.51 },
    { x: 960, start: 1, speed: 37, opacity: 0.68 },
    { x: 1020, start: 4, speed: 39, opacity: 0.52 },
    { x: 1080, start: 2, speed: 33, opacity: 0.36 },
    { x: 1140, start: 0, speed: 35, opacity: 0.5 },
    { x: 1200, start: 3, speed: 31, opacity: 0.68 },
    { x: 1260, start: 1, speed: 30, opacity: 0.52 },
  ];
  function createWaves(x: number) {
    return [
      `M ${x} -50 C ${x + 180} 80, ${x - 160} 260, ${x} 650 `,
      `M ${x} -50 C ${x - 220} 120, ${x + 190} 300,${x} 650`,
      `M ${x} -50 C ${x + 120} 180,${x - 240} 360,${x} 650`,
      `M ${x} -50 C ${x - 160} 60,${x + 230} 400,${x} 650`,
      `M ${x} -50 C ${x + 250} 220,${x - 120} 420,${x} 650`,
    ];
  }
  // -------------
  const renderTitle = useMemo(() => {
    const text = t(LanguageKey.page5_whyBrancy);
    const words = text.split(" ");
    if (words.length < 2) {
      return text;
    }
    return (
      <>
        {words[0] + " "}
        <span>{words[1]}</span>
        {words.length > 2 ? " " + words.slice(2).join(" ") : ""}
      </>
    );
  }, [t]);
  const steps = [
    {
      number: "01",
      title: t(LanguageKey.page5_title1),
      text: t(LanguageKey.page5_explain1),
    },
    {
      number: "02",
      title: t(LanguageKey.page5_title2),
      text: t(LanguageKey.page5_explain2),
    },
    {
      number: "03",
      title: t(LanguageKey.page5_title3),
      text: t(LanguageKey.page5_explain3),
    },
    {
      number: "04",
      title: t(LanguageKey.page5_title4),
      text: t(LanguageKey.page5_explain4),
    },
    {
      number: "05",
      title: t(LanguageKey.page5_title5),
      text: t(LanguageKey.page5_explain5),
    },
    {
      number: "06",
      title: t(LanguageKey.page5_title6),
      text: t(LanguageKey.page5_explain6),
    },
  ];

  return (
    <section className={styles.page5}>
      <div className={styles.header}>
        <div className={styles.goli} />
        <div className={styles.title}>{renderTitle}</div>
      </div>
      <div className={styles.titleandline}>
        <div className={styles.wrapper}>
          <svg className={styles.svg} viewBox="0 0 1300 600" preserveAspectRatio="none">
            {lines.map((line, index) => {
              const waves = createWaves(line.x);
              return (
                <path key={index} className={styles.line} d={waves[line.start]} style={{ opacity: line.opacity }}>
                  <animate
                    attributeName="d"
                    dur={`${line.speed}s`}
                    repeatCount="indefinite"
                    values={[waves[line.start], ...waves.filter((_, i) => i !== line.start), waves[line.start]].join(
                      ";",
                    )}
                  />
                </path>
              );
            })}
            {/* Brancy Blue Line */}
            <path className={styles.brandGlow} d="M650 -40 C 700 130,600 300,650 650">
              <animate
                attributeName="d"
                dur="14s"
                repeatCount="indefinite"
                values="M650 -40 C700 130,600 300,650 650;M650 -40 C620 150,680 320,650 650;M650 -40 C680 170,620 350,650 650;M650 -40 C700 130,600 300,650 650"
              />
            </path>
            <path className={styles.brandLine} d="M650 -40 C 700 130,600 300,650 650">
              <animate
                attributeName="d"
                dur="14s"
                repeatCount="indefinite"
                values="M650 -40 C700 130,600 300,650 650;M650 -40 C620 150,680 320,650 650;M650 -40 C680 170,620 350,650 650;M650 -40 C700 130,600 300,650 650"
              />
            </path>
          </svg>
        </div>
      </div>
      <div className={styles.stepscontainer}>
        {steps.map((step) => (
          <div className={styles.stepContent} key={step.number}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <h3>{step.title}</h3>
            </div>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Page5;
