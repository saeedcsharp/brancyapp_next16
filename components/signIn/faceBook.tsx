import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function FaceBook(props: {
  preInstaToken: string;
  // redirectType: RedirectType;
  backToInstaId: () => void;
  removeMask: () => void;
  sendInstaId: () => void;
}) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // async function handleSubmit() {
  //   if (timeLeft <= 0) {
  //     internalNotify(InternalResponseType.TimeExpire, NotifType.Error);
  //     return;
  //   }
  //   const verificationCode = code.join("");
  //   setLoading(true);
  //   try {
  //     const response = await GetServerResult<boolean, LoginResultInfo>(
  //       MethodType.get,
  //       props.preInstaToken,
  //       "PreInstagramer/VerifyCode",
  //       null,
  //       [{ key: "verificationCode", value: verificationCode }]
  //     );
  //     if (response.statusCode !== 200) {
  //       setCode(new Array(6).fill(""));
  //       notify(response.info.responseType, NotifType.Error);
  //     } else {
  //       await update({
  //         ...session,
  //         user: {
  //           ...session?.user,
  //           instagramerIds: response.value.role.instagramerIds,
  //           accessToken: response.value.token,
  //           socketAccessToken: response.value.socketAccessToken,
  //           currentIndex: response.value.role.instagramerIds.length - 1,
  //         },
  //       });
  //       router.push("/");
  //     }
  //   } catch (error) {
  //     internalNotify(InternalResponseType.Network, NotifType.Error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  return (
    <>
      {/* <div className={styles.popupsignup} style={{ alignItems: "flex-start" }}>
        <img
          onClick={props.backToInstaId}
          className={styles.backbtn}
          src="/back-blue.svg"
          alt="Back"
        />

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.welcometext1}>
            Enter your verification code
            <div className={styles.welcometext2}>
              please insert your number to get free account
            </div>
          </div>
          {loading && <RingLoader />}
          {!loading && (
            <>
              {props.data.map((v, i) => (
                <div key={i} className={`${styles.groupWrapper} translate`}>
                  <div className={styles.profile}>
                    <img
                      title="◰ resize the picture"
                      className={styles.imageProfile}
                      loading="lazy"
                      alt="instagram profile picture"
                      src={basePictureUrl + v.profileUrl}
                      onClick={() =>
                        handleImageClick(
                          basePictureUrl + v.profileUrl,
                          v.username
                        )
                      }
                    />

                    <img
                      title="🔗 Reply message"
                      className={styles.replyicon}
                      alt="Reply message icon"
                      src="/icon-reply.svg"
                    />
                  </div>
                  <div className={styles.optionwrapper}>
                    <div className={styles.profileuser}>
                      <div className={styles.username} title={v.username}>
                        {v.username}
                      </div>
                      <div className={styles.ticket} title="ℹ️ message type">
                        {entryTypeToStr(v.entryType)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </form>
      </div> */}
    </>
  );
}
