import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "./telegram.module.css";
const Telegram = () => {
  //  return <Soon />;
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });
  if (session?.user.currentIndex === -1) router.push("/user");
  return (
    session &&
    session!.user.currentIndex !== -1 && (
      <div className={styles.parent}>
        <div className={styles.pincontainer}>
          <div className={styles.header}>
            <div className={styles.image}>
              <img className={styles.pictureIcon} alt="telegram" src="/telegram.svg" />
            </div>
            <div className={styles.title}>
              download <strong>Brancy</strong> on your device
              <br></br>
              to connect Telegram
            </div>

            <div className="saveButton">Download Brancy.App</div>
            <div className={styles.explain}>
              You can login with your Telegram account to see message from your contact and answer them right here!
              <br></br>
              <br></br>
              *Brancy never see or share your data!{" "}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Telegram;
