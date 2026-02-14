import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "./whatsapp.module.css";
const Whatsapp = () => {
  const router = useRouter();
  //  return <Soon />;
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
      <main className={styles.parent}>
        <div className={styles.pincontainer}>
          <div className={styles.header}>
            <div className={styles.image}>
              <img className={styles.pictureIcon} alt="whatsapp" src="/whatsapp.svg" />
            </div>
            <div className={styles.title}>
              download <strong>Brancy</strong> on your device
              <br></br>
              to connect Whatsapp
            </div>

            <div className="saveButton">Download Brancy.App</div>
            <div className={styles.explain}>
              You can login with your whatsapp account to see message from your contact and answer them right here!
              <br></br>
              <br></br>
              *Brancy never see or share your data!{" "}
            </div>
          </div>
        </div>
      </main>
    )
  );
};

export default Whatsapp;
