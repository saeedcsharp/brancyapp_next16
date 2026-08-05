"use client";

import styles from "./page.module.css";

const floatingMedia = [
  { src: "/landing/hiroimg1.png", alt: "Brancy dashboard preview", className: styles.mediaOne },
  { src: "/landing/hiroimg2.png", alt: "Brancy analytics preview", className: styles.mediaTwo },
  { src: "/landing/hiroimg3.png", alt: "Brancy scheduling preview", className: styles.mediaThree },
  { src: "/landing/hiroimg4.png", alt: "Brancy commerce preview", className: styles.mediaFour },
  { src: "/landing/hiroimg5.png", alt: "Brancy workspace preview", className: styles.mediaFive },
];

function setPointerTilt(event: { currentTarget: HTMLDivElement; clientX: number; clientY: number }) {
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  card.style.setProperty("--tilt-x", `${x * 7}deg`);
  card.style.setProperty("--tilt-y", `${y * -7}deg`);
  card.style.setProperty("--glow-x", `${(x + 1) * 50}%`);
  card.style.setProperty("--glow-y", `${(y + 1) * 50}%`);
}

function resetPointerTilt(event: { currentTarget: HTMLDivElement }) {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");
  event.currentTarget.style.setProperty("--tilt-y", "0deg");
  event.currentTarget.style.setProperty("--glow-x", "50%");
  event.currentTarget.style.setProperty("--glow-y", "50%");
}

function updateScrollProgress(event: { currentTarget: HTMLElement }) {
  const root = event.currentTarget;
  const maxScroll = root.scrollHeight - root.clientHeight;
  const progress = maxScroll > 0 ? root.scrollTop / maxScroll : 0;
  root.style.setProperty("--scroll-progress", progress.toString());
}

export default function Page1() {
  return (
    <main className={styles.page} onScroll={updateScrollProgress}>
      <section className={styles.hero}>
        <div className={styles.ambientGlow} />
        <header className={styles.navbar}>
          <a className={styles.brand} href="#top" aria-label="Brancy home">
            <span className={styles.brandMark}>b</span>
            <span>brancy</span>
          </a>
          <span className={styles.navKicker}>BUSINESS, UNTANGLED</span>
          <span className={styles.navStatus}>
            <i /> all systems clear
          </span>
        </header>

        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>The command center for your digital world</p>
          <h1>
            Everything
            <br />
            <em>in orbit.</em>
          </h1>
          <p className={styles.heroLead}>
            Your content, commerce, community, and growth tools.
            <br />
            One calm place to make it all move.
          </p>
        </div>

        <div className={styles.mediaField} aria-hidden="true">
          <div className={styles.bentoFrame} />
          {floatingMedia.map((media) => (
            <img key={media.src} src={media.src} alt={media.alt} className={`${styles.mediaCard} ${media.className}`} />
          ))}
          <div className={styles.bentoRail}>
            <span className={styles.railLogo}>b</span>
            <span className={styles.railLine} />
            <span>01</span>
            <span>02</span>
            <span>03</span>
            <span>04</span>
          </div>
          <div className={`${styles.floatingIcon} ${styles.iconOne}`}>
            <img src="/landing/page2_analytics.svg" alt="" />
          </div>
          <div className={`${styles.floatingIcon} ${styles.iconTwo}`}>
            <img src="/landing/page2_orders.svg" alt="" />
          </div>
          <div className={`${styles.floatingIcon} ${styles.iconThree}`}>
            <img src="/landing/page2_calendar.svg" alt="" />
          </div>
          <div className={`${styles.floatingIcon} ${styles.iconFour}`}>
            <img src="/landing/page2_contentpublishing.svg" alt="" />
          </div>
        </div>

        <div className={styles.loginAnchor}>
          <div className={styles.loginCard} onPointerMove={setPointerTilt} onPointerLeave={resetPointerTilt}>
            <span className={styles.loginPill}>BRANCY / 01</span>
            <p>
              enter your number
              <br />
              <strong>to login</strong>
            </p>
            <span className={styles.loginArrow}>↗</span>
            <div className={styles.cardSheen} />
          </div>
          <span className={styles.cardHint}>
            hover to enter <b>scroll to explore</b>
          </span>
        </div>

        <div className={styles.scrollCue}>
          <span /> scroll to arrange the noise
        </div>
      </section>
    </main>
  );
}
