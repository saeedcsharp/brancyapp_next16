import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "./index.module.css";

const SignOut = () => {
  const router = useRouter();
  const { data: session, update } = useSession();

  const signOut2 = async () => {
    await signOut({
      redirect: false, // Don't redirect the user after signing out
    });

    // Commented code for csrf token and custom signout
    // const res = await fetch("/api/auth/csrf");
    // const csrf = await res.text();
    // var res2 = await fetch("/api/auth/signout", {
    //   method: "POST",
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: csrf
    // });
    // console.log(res2);
    // await update(null);

    router.push("/"); // Redirect to the home page
  };

  return (
    <>
      <div
        className="dialogBg"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <div className={styles.popupsignup} style={{ alignItems: "flex-end" }}>
          <svg
            onClick={() => router.push("/home")}
            className={styles.closebtn}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16">
            <path
              d="M15.3 14.2a.8.8 0 1 1-1 1L8 9.2l-6.2 6.2a.8.8 0 1 1-1-1l6-6.4L.7 1.8a.8.8 0 1 1 1-1l6.3 6L14.2.7a.8.8 0 1 1 1 1L9.2 8z"
              fill="var(--text-h1)"
            />
          </svg>

          <div className={styles.form}>
            <div className={styles.welcometext1}>
              are you sure !?
              <div className={styles.welcometext2}>
                you are attempting to logout
                <br />
                from your Brancy panel
              </div>
            </div>
            <button className="stopButton" onClick={signOut2}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignOut;
