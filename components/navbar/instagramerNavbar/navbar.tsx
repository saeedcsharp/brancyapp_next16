import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "brancy/components/navbar/instagramerNavbar/navbar.module.css";

interface INavbar {
  id: string;
  items: string[];
  indexValue: string;
  initialSlide: number;
}

const Navbar = (props: { data: INavbar }) => {
  const position = useRef(null);

  useEffect(() => {
    const element = document.getElementById("section-1");
    if (element) {
      // 👇 Will scroll smoothly to the top of the next section
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <nav className={styles.pageTitleSet}>
        {props.data.items.map((v, i) => (
          <Link
            href={`/${props.data.indexValue}/${v}`}
            id={v}
            key={i}
            className={styles.pageTitle}
            aria-current={v === props.data.id ? "page" : undefined}
            title={`Navigate to ${v}`}>
            {v === props.data.id ? (
              <img
                alt={`Current page: ${v}`}
                src="/page-pointer1.svg"
                className={styles.pagePointer1Icon}
                id="section-1"
                aria-hidden="true"
              />
            ) : (
              <div className={styles.pagePointer1Icon}></div>
            )}

            {v === props.data.id ? <b className={styles.title1}>{v}</b> : <div className={styles.title2}>{v}</div>}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
