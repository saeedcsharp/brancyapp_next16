import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import styles from "./business.module.css";

const typeCards = [
  {
    slug: "shop",
    label: "Shop",
    description: "Explore verified sellers & their product catalogues.",
    icon: "🛍️",
    cardClass: styles.typeCardShop,
    iconClass: styles.typeCardIconShop,
  },
  {
    slug: "advertise",
    label: "Advertise",
    description: "Find advertisers & influencers for your campaigns.",
    icon: "📣",
    cardClass: styles.typeCardAdvertise,
    iconClass: styles.typeCardIconAdv,
  },
  {
    slug: "vshop",
    label: "VShop",
    description: "Discover virtual shops with exclusive digital offers.",
    icon: "🏪",
    cardClass: styles.typeCardVShop,
    iconClass: styles.typeCardIconVShop,
  },
];

export default function Business() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  if (session && session.user.currentIndex > -1) {
    router.push("/");
    return null;
  }

  return (
    session?.user.currentIndex === -1 && (
      <div className={styles.container}>
        <div className={styles.typeGrid}>
          {typeCards.map((card) => (
            <Link
              key={card.slug}
              href={`/user/business/${card.slug}`}
              className={`${styles.typeCard} ${card.cardClass}`}>
              <div className={`${styles.typeCardIcon} ${card.iconClass}`}>{card.icon}</div>
              <p className={styles.typeCardTitle}>{card.label}</p>
              <p className={styles.typeCardDesc}>{card.description}</p>
              <span className={styles.typeCardArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    )
  );
}
