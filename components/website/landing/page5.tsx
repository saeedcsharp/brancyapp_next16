import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "saeed/i18n";
import styles from "./page5.module.css";

interface NoisePoint {
  y: number;
  offset: number;
}
interface Line {
  x: number;
  noisePoints: NoisePoint[];
  color: string;
}
interface SpecialLinePoint {
  x: number;
  y: number;
  amplitude: number;
  phase: number;
  frequency: number;
}

interface SpecialLine {
  points: SpecialLinePoint[];
  color: string;
  shadowColor: string;
  lineWidth: number;
  shadowWidth: number;
}
const Page5: React.FC = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeRef = useRef(0);
  const setCanvasSize = useCallback((canvas: HTMLCanvasElement) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);
  const noise = useCallback((x: number, y: number, time: number) => {
    const value = Math.sin(x * 0.1) * Math.cos(y * 0.1) * Math.sin(time * 0.002);
    return value * Math.sin(x * 0.05 + time * 0.001) * Math.cos(y * 0.05 + time * 0.002);
  }, []);
  const createLines = useCallback((canvas: HTMLCanvasElement): Line[] => {
    const isNarrowScreen = canvas.width < 800;
    const numberOfLines = isNarrowScreen ? 10 : 25;
    const pointsPerLine = isNarrowScreen ? 5 : 8;
    const margin = isNarrowScreen ? 0 : 50;
    const availableWidth = canvas.width - margin * 2;
    const lineColor = isNarrowScreen ? "#8f9bb310" : "#8f9bb360";
    const lineWidth = isNarrowScreen ? 1 : 2;

    return Array.from({ length: numberOfLines }, () => ({
      x: margin + Math.random() * availableWidth,
      noisePoints: Array.from({ length: pointsPerLine }, (_, j) => ({
        y: j === pointsPerLine - 1 ? canvas.height : (canvas.height * j) / (pointsPerLine - 3),
        offset: Math.random() * 100 - 50,
      })),
      color: lineColor,
      lineWidth: lineWidth,
    }));
  }, []);

  const createSpecialLine = useCallback((canvas: HTMLCanvasElement): SpecialLine => {
    const isNarrowScreen = canvas.width < 800;
    return {
      points: Array.from({ length: 10 }, (_, i) => ({
        x: 0,
        y: i === 50 ? canvas.height : (canvas.height * i) / 2,
        amplitude: Math.random() * 100 + 20,
        phase: Math.random() * Math.PI * 2,
        frequency: Math.random() * 0.02 + 0.01,
      })),
      color: "rgba(73, 131, 255, 0.8)",
      shadowColor: "rgba(73, 131, 255, 0.2)",
      lineWidth: isNarrowScreen ? 4 : 10,
      shadowWidth: isNarrowScreen ? 20 : 40,
    };
  }, []);
  const animateSpecialLine = useCallback(
    (ctx: CanvasRenderingContext2D, specialLine: SpecialLine, canvas: HTMLCanvasElement) => {
      ctx.beginPath();
      ctx.strokeStyle = specialLine.shadowColor;
      ctx.lineWidth = specialLine.shadowWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const centerX = canvas.width / 1.2;
      const time = timeRef.current;
      specialLine.points.forEach((point, index) => {
        const wave1 = Math.sin(time * 0.001 + point.phase) * point.amplitude;
        const wave2 = Math.cos(time * 0.002 + point.phase) * (point.amplitude * 0.5);
        const wave3 = Math.sin(time * 0.003 + point.phase + Math.PI) * (point.amplitude * 0.3);
        const x = centerX + wave1 + wave2 + wave3;
        if (index === 0) {
          ctx.moveTo(x, point.y);
        } else {
          const prevPoint = specialLine.points[index - 1];
          const xc = (x + prevPoint.x) / 2;
          const yc = (point.y + prevPoint.y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
        }
        point.x = x;
      });
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = specialLine.color;
      ctx.lineWidth = specialLine.lineWidth;
      specialLine.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          const prevPoint = specialLine.points[index - 1];
          const xc = (point.x + prevPoint.x) / 2;
          const yc = (point.y + prevPoint.y) / 2;
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc);
        }
      });
      ctx.stroke();
    },
    [],
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setCanvasSize(canvas);
    const lines = createLines(canvas);
    const specialLine = createSpecialLine(canvas);
    const handleResize = () => setCanvasSize(canvas);
    window.addEventListener("resize", handleResize);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        const points = line.noisePoints.map((point) => {
          const noiseValue = noise(line.x + point.offset, point.y, timeRef.current) * 200;
          return {
            x: line.x + noiseValue + point.offset,
            y: point.y,
          };
        });
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.stroke();
      });
      animateSpecialLine(ctx, specialLine, canvas);
      timeRef.current++;
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setCanvasSize, createLines, createSpecialLine, animateSpecialLine, noise]);
  const renderTitle = useMemo(() => {
    const text = t(LanguageKey.page5_whyBrancy);
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
    <section className={styles.page5}>
      <div className={styles.header}>
        <div className={styles.goli} />
        <div className={styles.title}>{renderTitle}</div>
      </div>
      <div className={styles.titleandline}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <div className={styles.stepscontainer}>
        {[
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
        ].map((step) => (
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
