import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageKey } from "../../../i18n";
import styles from "./page6.module.css";

interface UserData {
  name: string;
  image?: string;
  isEmpty?: boolean;
}
const userDataPool: UserData[] = [
  { name: "Skye Hester", image: "/no-profile.svg" },
  { name: "Amira Pitts", image: "/no-profile.svg" },
  { name: "Fernando Torres", image: "/no-profile.svg" },
  { name: "Mona Eslim", image: "/no-profile.svg" },
  { name: "Luella Scott", image: "/no-profile.svg" },
  { name: "Kellan Ashley", image: "/no-profile.svg" },
  { name: "Franco Phan", image: "/no-profile.svg" },
  { name: "Mila Blackburn", image: "/no-profile.svg" },
  { name: "Alexander Graham", image: "/no-profile.svg" },
  { name: "Cesar Schmitt", image: "/no-profile.svg" },
  { name: "Ryker Nash", image: "/no-profile.svg" },
  { name: "Rebecca May", image: "/no-profile.svg" },
  { name: "Jazlyn Fowler", image: "/no-profile.svg" },
  { name: "Ben Parsons", image: "/no-profile.svg" },
  { name: "Alfredo Bishop", image: "/no-profile.svg" },
  { name: "Adelynn Coffey", image: "/no-profile.svg" },
  { name: "Emma Watson", image: "/no-profile.svg" },
  { name: "James Smith", image: "/no-profile.svg" },
  { name: "Sarah Johnson", image: "/no-profile.svg" },
  { name: "Michael Brown", image: "/no-profile.svg" },
  { name: "Lisa Davis", image: "/no-profile.svg" },
  { name: "David Miller", image: "/no-profile.svg" },
  { name: "Jennifer Wilson", image: "/no-profile.svg" },
  { name: "Robert Taylor", image: "/no-profile.svg" },
  { name: "Patricia Anderson", image: "/no-profile.svg" },
  { name: "John Thomas", image: "/no-profile.svg" },
  { name: "Linda Martinez", image: "/no-profile.svg" },
  { name: "William Robinson", image: "/no-profile.svg" },
  { name: "Elizabeth Lee", image: "/no-profile.svg" },
  { name: "Richard Hall", image: "/no-profile.svg" },
];
const HexagonSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 118">
    <path
      fill="var(--color-white)"
      stroke="url(#hexagon-gradient)"
      className={styles.hexagonPath}
      d="m77.4 11.3 5.7 3.3q8.8 5 13.6 8.2c4.8 3.2 5.5 4.6 7 7.3q2.3 3.9 2.8 9.7c.5 5.9.4 9.2.4 16v6.5c0 6.8 0 11.8-.4 15.9s-1.2 7-2.8 9.7a23 23 0 0 1-7 7.2q-4.8 3.5-13.6 8.3l-5.7 3.3q-8.5 5.2-13.9 7.6c-5.4 2.4-6.7 2.5-9.8 2.5s-6.1-.8-9.8-2.5-8-4.2-14-7.6l-5.6-3.3q-8.8-4.9-13.6-8.3c-4.8-3.4-5.5-4.5-7-7.2S1.3 82.2.9 78.2s-.4-9.1-.4-16v-6.5c0-6.8 0-11.8.4-15.9s1.2-7 2.8-9.7 3.7-4.9 7-7.3q4.9-3.3 13.6-8.2l5.6-3.3q8.7-5.1 14-7.6c5.3-2.5 6.7-2.5 9.8-2.5s6.1.8 9.8 2.5 8 4.2 14 7.6Z"
    />
    <defs>
      <linearGradient id="hexagon-gradient" x1="50" y1="50" x2="50" y2="1" gradientUnits="userSpaceOnUse">
        <stop offset=".3" stopColor="var(--color-gray60)" />
        <stop offset="1" stopColor="var(--color-dark-blue)" />
      </linearGradient>
    </defs>
  </svg>
);
const UserHexagon: React.FC<UserData & { isChanging?: boolean }> = ({
  name,
  image,
  isEmpty = false,
  isChanging = false,
}) => {
  if (isEmpty) {
    return (
      <div className={`${styles.hexagon} ${styles.emptyHexagon}`}>
        <HexagonSVG className={styles.hexagonSVG} />
      </div>
    );
  }
  return (
    <div className={`${styles.hexagon} ${isChanging ? styles.changing : ""}`}>
      <HexagonSVG className={styles.hexagonSVG} />
      <div className={styles.hexagonContent}>
        {image ? (
          <img src={image} alt={name} width={50} height={50} className={styles.userImage} />
        ) : (
          <div className={styles.defaultAvatar} />
        )}
        <p className={styles.userName}>{name}</p>
      </div>
    </div>
  );
};
const GrayHexagon: React.FC = () => (
  <div className={styles.grayHexagon}>
    <svg className={styles.hexagonPath} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 68">
      <path d="m39 2 19 11a12 12 0 0 1 6 10v22a12 12 0 0 1-6 10L39 66q-7 3-13 0L7 55a12 12 0 0 1-6-10V23a12 12 0 0 1 6-10L26 2q7-3 13 0" />
    </svg>
  </div>
);

const Page6: React.FC = () => {
  const { t } = useTranslation();

  const titleContent = useMemo(() => {
    const text = t(LanguageKey.page6_Header);
    const words = text.split(" ");
    if (words.length < 1) return text;

    return (
      <>
        <span>{words[0]}</span>
        {words.length > 1 ? " " + words.slice(1).join(" ") : ""}
      </>
    );
  }, [t]);

  const [displayedUsers, setDisplayedUsers] = useState<(UserData & { isChanging?: boolean })[][]>([]);
  const lastChangedIndex = useRef<{ row: number; col: number }>({
    row: -1,
    col: -1,
  });
  const getRandomUser = () => {
    const randomIndex = Math.floor(Math.random() * userDataPool.length);
    return userDataPool[randomIndex];
  };
  const getRandomPosition = () => {
    let row, col;
    do {
      row = Math.floor(Math.random() * 4);
      col = Math.floor(Math.random() * (row === 3 ? 10 : 5));
    } while (row === lastChangedIndex.current.row && col === lastChangedIndex.current.col);
    lastChangedIndex.current = { row, col };
    return { row, col };
  };
  const changeRandomUser = () => {
    const { row, col } = getRandomPosition();
    setDisplayedUsers((prev) => {
      const newUsers = [...prev.map((row) => [...row])];
      newUsers[row][col] = { ...newUsers[row][col], isChanging: true };
      setTimeout(() => {
        setDisplayedUsers((prev) => {
          const newUsers = [...prev.map((row) => [...row])];
          newUsers[row][col] = { ...getRandomUser(), isChanging: false };
          return newUsers;
        });
      }, 500);
      return newUsers;
    });
  };
  useEffect(() => {
    const initialUsers = [
      Array(5)
        .fill(null)
        .map(() => getRandomUser()),
      Array(5)
        .fill(null)
        .map(() => getRandomUser()),
      Array(6)
        .fill(null)
        .map(() => getRandomUser()),
      Array(10)
        .fill(null)
        .map(() => getRandomUser()),
    ];
    setDisplayedUsers(initialUsers);
    lastChangedIndex.current = { row: -1, col: -1 };
  }, []);
  useEffect(() => {
    const interval = setInterval(changeRandomUser, 2000);
    return () => clearInterval(interval);
  }, []);
  const emptyHexagons = Array(15).fill({ isEmpty: true, name: "" });

  return (
    <section className={styles.page6}>
      <div className={styles.fadecircle} />
      <div className={styles.backgroundHexagons}>
        {emptyHexagons.map((_, index) => (
          <UserHexagon key={`empty-${index}`} {..._} />
        ))}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.goli} />
          <div>
            {titleContent}
            <div className={styles.explain}>{t(LanguageKey.page6_Explain)}</div>
          </div>
        </div>
      </div>
      <div className={styles.hexagonGrid}>
        {displayedUsers.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.hexagonRow}>
            <div className={styles.grayHexagons}>
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <GrayHexagon key={`gray-${rowIndex}-${index}`} />
                ))}
            </div>
            <div className={styles.userHexagons}>
              {row.map((user, colIndex) => (
                <UserHexagon key={`${rowIndex}-${colIndex}`} {...user} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Page6;
